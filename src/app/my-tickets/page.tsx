// src/app/my-tickets/page.tsx

import { createClient } from "@/libs/supabase/server";
import Link from "next/link";

export default async function MyTicketsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in</div>;
  }

  const { data: tickets } = await supabase
    .from('tickets')
    .select(`
      *,
      event:events (
        title,
        event_date,
        location,
        image_url
      ),
      tier:ticket_tiers (
        tier_name,
        price
      )
    `)
    .eq('buyer_id', user.id)
    .order('purchase_date', { ascending: false });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">My Tickets</h1>
      
      {!tickets || tickets.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <div className="text-6xl mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 mb-4 text-lg">
            You don`t have any tickets yet
          </p>
          <Link
            href="/events"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition"
            >
              <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-6xl">
                
              </div>
              
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 text-slate-900 dark:text-white">
                  {ticket.event?.title}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                     {ticket.event?.location}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                     {new Date(ticket.event?.event_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                     {ticket.tier?.tier_name || 'Standard'}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Transaction ID
                  </p>
                  <p className="text-sm font-mono text-slate-900 dark:text-white">
                    {ticket.transaction_hash?.substring(0, 30)}...
                  </p>
                </div>

                {/* QR Code Placeholder */}
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg p-8 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="text-5xl mb-2"></div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Scan at entrance</p>
                  </div>
                </div>

                <Link
                  href={`/marketplace/list?ticket=${ticket.id}`}
                  className="block w-full text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition font-semibold"
                >
                  List for Resale
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}