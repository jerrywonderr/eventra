// src/app/actions/events.ts

'use server';

import { createClient } from '@/libs/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  
  // Check authentication (backend check)
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
    // Insert event (backend operation)
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
      })
      .select()
      .single();

    if (eventError) {
      console.error('Event creation error:', eventError);
      return { error: eventError.message };
    }

    // Insert ticket tiers (backend operation)
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
    
    // Success - return event ID
    return { success: true, eventId: event.id };

  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Failed to create event' };
  }
}

export async function purchaseTicket(eventId: string, tierId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'Not authenticated' };
  }

  try {
    // Get tier info
    const { data: tier } = await supabase
      .from('ticket_tiers')
      .select('*, event:events(*)')
      .eq('id', tierId)
      .single();

    if (!tier) {
      return { error: 'Ticket tier not found' };
    }

    // Check availability
    if (tier.quantity_sold >= tier.quantity_total) {
      return { error: 'Sold out!' };
    }

    // Create ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        event_id: eventId,
        tier_id: tierId,
        buyer_id: user.id,
        transaction_hash: `0x${Date.now()}${Math.random().toString(16).substr(2, 8)}`,
        purchase_price: tier.price,
        nft_token_id: `NFT-${Date.now()}`,
      })
      .select()
      .single();

    if (ticketError) {
      return { error: ticketError.message };
    }

    // Update quantity sold
    await supabase
      .from('ticket_tiers')
      .update({ quantity_sold: tier.quantity_sold + 1 })
      .eq('id', tierId);

    revalidatePath('/my-tickets');
    revalidatePath('/dashboard');
    
    return { success: true, ticket };

  } catch (error) {
    console.error('Purchase error:', error);
    return { error: 'Failed to purchase ticket' };
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
    
    return { success: true };

  } catch (error) {
    console.error('Listing error:', error);
    return { error: 'Failed to list ticket' };
  }
}