// src/app/events/[id]/page.tsx

import { createClient } from '@/libs/supabase/server';
import { notFound } from 'next/navigation';
import PurchaseButton from './PurchaseButton';

export default async function EventDetailsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const supabase = await createClient();
  
  // Fetch event with tiers
  const { data: event } = await supabase
    .from('events')
    .select(`
      *,
      organizer:profiles!events_organizer_id_fkey (
        full_name,
        email,
        verification_badge
      ),
      ticket_tiers (
        *
      )
    `)
    .eq('id', params.id)
    .single();

  if (!event) {
    notFound();
  }

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Event Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
        <div className="flex flex-wrap gap-4 text-blue-100">
          <span>📍 {event.location}</span>
          <span>📅 {new Date(event.event_date).toLocaleDateString()}</span>
          <span>🕒 {new Date(event.event_date).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Event Description */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 mb-8">
        <h2 className="text-2xl font-bold mb-4">About This Event</h2>
        <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
          {event.description || 'No description provided.'}
        </p>
      </div>

      {/* Organizer Info */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 mb-8">
        <h2 className="text-xl font-bold mb-4">Organizer</h2>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {event.organizer?.full_name?.[0] || event.organizer?.email?.[0] || 'O'}
          </div>
          <div>
            <p className="font-semibold flex items-center gap-2">
              {event.organizer?.full_name || event.organizer?.email}
              {event.organizer?.verification_badge && (
                <span className="text-blue-600" title="Verified">✓</span>
              )}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Event Organizer</p>
          </div>
        </div>
      </div>

      {/* Ticket Tiers */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold mb-6">Select Your Ticket</h2>
        
        <div className="space-y-4">
          {event.ticket_tiers?.map((tier: { id: string; tier_name: string; price: number; quantity_total: number; quantity_sold: number; benefits?: string[] }) => {
            const available = tier.quantity_total - tier.quantity_sold;
            const soldOut = available <= 0;
            
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
                    {tier.benefits.map((benefit: string, idx: number) => (
                      <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                )}

                {user ? (
                  <PurchaseButton
                    eventId={event.id}
                    tierId={tier.id}
                    tierName={tier.tier_name}
                    price={tier.price}
                    soldOut={soldOut}
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