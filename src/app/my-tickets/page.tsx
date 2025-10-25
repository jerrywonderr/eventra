// src/app/my-tickets/page.tsx

import { createClient } from "@/libs/supabase/server";
import Link from "next/link";

function ListForResaleButton({ ticketId, ticketPrice }: { ticketId: string | number; ticketPrice?: number }) {
  const href = `/resale/new?ticketId=${encodeURIComponent(String(ticketId))}${ticketPrice !== undefined ? `&price=${encodeURIComponent(String(ticketPrice))}` : ''}`;
  return (
    <Link
      href={href}
      className="inline-block px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-semibold"
    >
      List for Resale
    </Link>
  );
}

export default async function MyTicketsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-lg mb-4">Please log in to view your tickets</p>
        <Link href="/login" className="text-blue-600 hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }

  // Fetch user's tickets with event and tier details
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">My Tickets</h1>
        <Link 
          href="/events"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Browse Events
        </Link>
      </div>
      
      {!tickets || tickets.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <div className="text-6xl mb-4">🎫</div>
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
              {/* Ticket Header */}
              <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-6xl">
                🎫
              </div>
              
              <div className="p-6">
                {/* Event Info */}
                <h3 className="font-bold text-xl mb-2 text-slate-900 dark:text-white">
                  {ticket.event?.title}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    📍 {ticket.event?.location}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    📅 {new Date(ticket.event?.event_date).toLocaleDateString()} at {new Date(ticket.event?.event_date).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    🎟️ {ticket.tier?.tier_name || 'Standard Ticket'}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    💵 ${ticket.purchase_price}
                  </p>
                </div>

                {/* Transaction Info */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Transaction ID
                  </p>
                  <p className="text-xs font-mono text-slate-900 dark:text-white break-all">
                    {ticket.transaction_hash}
                  </p>
{ticket.metadata?.explorerUrl && (
  <a
    href={ticket.metadata.explorerUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold mt-4"
  >
    🔗 View on Hedera Explorer
  </a>
)}

{ticket.nft_token_id && (
                    <>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 mt-2">
                        NFT Token ID
                      </p>
                      <p className="text-xs font-mono text-slate-900 dark:text-white">
                        {ticket.nft_token_id}
                      </p>
                    </>
                  )}
                </div>

                {/* QR Code Placeholder */}
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg p-8 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="text-5xl mb-2">📱</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Show this at entrance
                    </p>
                  </div>
                </div>

                {/* Resale Button */}
                <ListForResaleButton 
                  ticketId={ticket.id}
                  ticketPrice={ticket.purchase_price}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}