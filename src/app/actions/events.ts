// src/app/actions/events.ts

'use server';

import { createClient } from '@/libs/supabase/server';
import { revalidatePath } from 'next/cache';
import { processTicketPurchaseTransaction } from '@/libs/hedera/transactions';

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  
  // Check authentication 
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Extract form data
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const event_date = formData.get('event_date') as string;
  const location = formData.get('location') as string;
  const image_url = formData.get('image_url') as string;
  const max_tickets_per_user = formData.get('max_tickets_per_user') as string | null;
  
  type Tier = {
    tier_name: string;
    price: number;
    quantity_total: number;
    benefits?: string[];
  };

  // Parse tiers from form data
  const tiersJson = formData.get('tiers') as string;
  const tiers = JSON.parse(tiersJson) as Tier[];

  try {
    // Insert event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        organizer_id: user.id,
        title,
        description,
        event_date,
        location,
        image_url,
        is_paid: tiers.some((t: Tier) => t.price > 0),
        is_active: true,
        max_tickets_per_user: max_tickets_per_user ? parseInt(max_tickets_per_user) : null,
      })
      .select()
      .single();

    if (eventError) {
      console.error('Event creation error:', eventError);
      return { error: eventError.message };
    }

    // Insert ticket tiers
    const tiersToInsert = tiers.map((tier: Tier) => ({
      event_id: event.id,
      tier_name: tier.tier_name,
      price: tier.price,
      quantity_total: tier.quantity_total,
      quantity_sold: 0,
      benefits: tier.benefits || [],
    }));

    const { error: tiersError } = await supabase
      .from('ticket_tiers')
      .insert(tiersToInsert);

    if (tiersError) {
      console.error('Tiers creation error:', tiersError);
      return { error: tiersError.message };
    }

    // Revalidate cached pages
    revalidatePath('/dashboard');
    revalidatePath('/events');
    
    console.log('✅ Event created successfully:', event.id);
    
    // Success - return event ID
    return { success: true, eventId: event.id };

  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Failed to create event' };
  }
}

export async function purchaseTicket(
  eventId: string, 
  tierId: string,
  quantity: number = 1
) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'Not authenticated' };
  }

  try {
    // Get tier info with event details
    const { data: tier } = await supabase
      .from('ticket_tiers')
      .select('*, event:events(*)')
      .eq('id', tierId)
      .single();

    if (!tier) {
      return { error: 'Ticket tier not found' };
    }

    // ✅ PROTECTION 1: Check if user is the event organizer
    if (tier.event.organizer_id === user.id) {
      return { 
        error: 'Event organizers cannot purchase tickets for their own events. You already have access as the organizer.' 
      };
    }

    // ✅ PROTECTION 2: Check purchase limit per user
    if (tier.event.max_tickets_per_user !== null) {
      // Count existing tickets for this user for this event
      const { count: existingTickets } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('buyer_id', user.id);

      const totalAfterPurchase = (existingTickets || 0) + quantity;

      if (totalAfterPurchase > tier.event.max_tickets_per_user) {
        const remaining = tier.event.max_tickets_per_user - (existingTickets || 0);
        return { 
          error: `Purchase limit exceeded. This event allows a maximum of ${tier.event.max_tickets_per_user} ticket(s) per person. You already have ${existingTickets} ticket(s). You can only purchase ${remaining} more.` 
        };
      }
    }

    // Check availability
    if (tier.quantity_sold + quantity > tier.quantity_total) {
      const available = tier.quantity_total - tier.quantity_sold;
      return { 
        error: `Not enough tickets available! Only ${available} ticket(s) remaining.` 
      };
    }

    console.log('🎫 Processing ticket purchase...');
    console.log('Event:', tier.event.title);
    console.log('Quantity:', quantity);
    console.log('Price per ticket:', tier.price);
    console.log('Total:', tier.price * quantity);
    console.log('Buyer:', user.email);

    // 🚀 REAL HEDERA BLOCKCHAIN TRANSACTION
    let hederaResult;
    try {
      hederaResult = await processTicketPurchaseTransaction(
        tier.price * quantity, // Total price
        eventId,
        user.email || 'unknown'
      );
      
      console.log('✅ Blockchain transaction successful!');
      console.log('Transaction ID:', hederaResult.transactionId);
      console.log('Explorer URL:', hederaResult.explorerUrl);
      
    } catch (hederaError) {
      console.error('❌ Hedera transaction failed:', hederaError);
      return { 
        error: `Blockchain transaction failed: ${(hederaError as Error).message}. Please try again.` 
      };
    }

    // Create ticket records (one for each quantity)
    const ticketsToCreate = Array.from({ length: quantity }, (_, i) => ({
      event_id: eventId,
      tier_id: tierId,
      buyer_id: user.id,
      transaction_hash: hederaResult.transactionId,
      purchase_price: tier.price,
      nft_token_id: `HEDERA-${Date.now()}-${i}`,
      metadata: {
        blockchain: 'Hedera',
        network: process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet',
        explorerUrl: hederaResult.explorerUrl,
        batchNumber: i + 1,
        totalInBatch: quantity,
      }
    }));

    const { data: tickets, error: ticketError } = await supabase
      .from('tickets')
      .insert(ticketsToCreate)
      .select();

    if (ticketError) {
      console.error('Failed to save tickets:', ticketError);
      return { error: ticketError.message };
    }

    // Update quantity sold
    await supabase
      .from('ticket_tiers')
      .update({ quantity_sold: tier.quantity_sold + quantity })
      .eq('id', tierId);

    revalidatePath('/my-tickets');
    revalidatePath('/dashboard');
    revalidatePath(`/events/${eventId}`);
    
    console.log(`✅ ${quantity} ticket(s) purchased successfully!`);
    
    return { 
      success: true, 
      tickets,
      ticket: tickets[0], // For backward compatibility
      quantity,
      explorerUrl: hederaResult.explorerUrl,
      transactionId: hederaResult.transactionId,
      message: quantity > 1 
        ? `Successfully purchased ${quantity} tickets!` 
        : 'Ticket purchased successfully!'
    };

  } catch (error) {
    console.error('Purchase error:', error);
    return { error: 'Failed to purchase ticket: ' + (error as Error).message };
  }
}

export async function listTicketForResale(ticketId: string, resalePrice: number) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'Not authenticated' };
  }

  try {
    // Get ticket info
    const { data: ticket } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('buyer_id', user.id)
      .single();

    if (!ticket) {
      return { error: 'Ticket not found or not owned by you' };
    }

    // Check if already listed
    const { data: existingListing } = await supabase
      .from('resale_listings')
      .select('id')
      .eq('ticket_id', ticketId)
      .eq('status', 'active')
      .single();

    if (existingListing) {
      return { error: 'This ticket is already listed for resale' };
    }

    // Validate resale price
    if (resalePrice <= 0) {
      return { error: 'Resale price must be greater than zero' };
    }

    // Create listing
    const { error } = await supabase
      .from('resale_listings')
      .insert({
        ticket_id: ticketId,
        seller_id: user.id,
        original_price: ticket.purchase_price,
        resale_price: resalePrice,
        status: 'active',
      });

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/marketplace');
    revalidatePath('/my-tickets');
    
    console.log('✅ Ticket listed for resale:', ticketId);
    
    return { success: true };

  } catch (error) {
    console.error('Listing error:', error);
    return { error: 'Failed to list ticket' };
  }
}