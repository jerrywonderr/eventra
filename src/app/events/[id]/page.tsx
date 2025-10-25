// src/app/events/[id]/page.tsx

import { createClient } from '@/libs/supabase/server';
import { notFound } from 'next/navigation';
import PurchaseButton from './PurchaseButton';
import type { EventComplete } from '@/libs/types/index';


export default async function EventDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const supabase = await createClient();
  const { id } = await params;

  
  // Fetch event with tiers
  const { data: event } = await supabase
    .from('events')
    .select(`
      *,
      organizer:profiles!events_organizer_id_fkey (
        id,

        full_name,
        email,
        verification_badge
      ),
      ticket_tiers (
        id,
        event_id,
        tier_name,
        price,
        quantity_total,
        quantity_sold,
        benefits
      )
    `)
    .eq('id', id)

    .single();

  if (!event) {
    notFound();
  }

  // Type assertion for the fetched event
  const typedEvent = event as unknown as EventComplete;

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  
  // Check if current user is the organizer
  const isOrganizer = user?.id === typedEvent.organizer_id;

  // Get user's current ticket count for this event (for purchase limits)
  let userTicketCount = 0;
  if (user && !isOrganizer) {
    const { count } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id)
      .eq('buyer_id', user.id);
    
    userTicketCount = count || 0;
  }


  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Event Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-8">

        <h1 className="text-4xl font-bold mb-4">{typedEvent.title}</h1>
        <div className="flex flex-wrap gap-4 text-blue-100">
          <span>📍 {typedEvent.location}</span>
          <span>📅 {new Date(typedEvent.event_date).toLocaleDateString()}</span>
          <span>🕒 {new Date(typedEvent.event_date).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Message for organizers */}
      {isOrganizer && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <span className="text-xl">👤</span>
            <span>
              <strong>You are the organizer of this event.</strong> You have full access and don`t need to purchase tickets.
            </span>
          </p>
        </div>
      )}


      {/* Event Description */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 mb-8">
        <h2 className="text-2xl font-bold mb-4">About This Event</h2>
        <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">

          {typedEvent.description || 'No description provided.'}

        </p>
      </div>

      {/* Organizer Info */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 mb-8">
        <h2 className="text-xl font-bold mb-4">Organizer</h2>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">

            {typedEvent.organizer?.full_name?.[0] || typedEvent.organizer?.email?.[0] || 'O'}
          </div>
          <div>
            <p className="font-semibold flex items-center gap-2">
              {typedEvent.organizer?.full_name || typedEvent.organizer?.email}
              {typedEvent.organizer?.verification_badge && (

                <span className="text-blue-600" title="Verified">✓</span>
              )}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Event Organizer</p>
          </div>
        </div>
      </div>

      {/* Ticket Tiers */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold mb-6">
          {isOrganizer ? 'Your Ticket Tiers' : 'Select Your Ticket'}
        </h2>

        {/* Show purchase limit info if set */}
        {!isOrganizer && typedEvent.max_tickets_per_user && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
            <p className="text-orange-800 dark:text-orange-200 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>
                <strong>Purchase Limit:</strong> Maximum {typedEvent.max_tickets_per_user} ticket(s) per person for this event.
                {userTicketCount > 0 && ` You have already purchased ${userTicketCount} ticket(s).`}
              </span>
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          {typedEvent.ticket_tiers?.map((tier) => {
            const available = tier.quantity_total - tier.quantity_sold;
            const soldOut = available <= 0;
            
            // Calculate remaining tickets user can buy
            const remainingAllowed = typedEvent.max_tickets_per_user 
              ? typedEvent.max_tickets_per_user - userTicketCount 
              : null;
            

            return (
              <div
                key={tier.id}
                className={`border rounded-lg p-6 ${
                  soldOut 
                    ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 opacity-60' 
                    : 'border-blue-200 dark:border-blue-800 hover:shadow-lg transition'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{tier.tier_name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {available} / {tier.quantity_total} available
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      ${tier.price}
                    </p>
                  </div>
                </div>

                {tier.benefits && tier.benefits.length > 0 && (
                  <ul className="space-y-1 mb-4">

                    {tier.benefits.map((benefit, idx) => (

                      <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                )}


                {/* Updated purchase button logic */}
                {isOrganizer ? (
                  <div className="bg-slate-100 dark:bg-slate-700 px-6 py-3 rounded-lg text-center">
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      You`re the organizer - you have automatic access
                    </p>
                  </div>
                ) : user ? (
                  <PurchaseButton
                    eventId={typedEvent.id}

                    tierId={tier.id}
                    tierName={tier.tier_name}
                    price={tier.price}
                    soldOut={soldOut}

                    maxPerUser={remainingAllowed}
                    userCurrentTickets={userTicketCount}

                  />
                ) : (
                  <a
                    href="/login"
                    className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Login to Purchase
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}