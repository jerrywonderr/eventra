// src/app/marketplace/page.tsx

import { createClient } from "@/libs/supabase/server";
import Link from "next/link";

export default async function MarketplacePage() {
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from('resale_listings')
    .select(`
      *,
      ticket:tickets (
        id,
        event:events (
          title,
          event_date,
          location
        )
      ),
      seller:profiles (
        email
      )
    `)
    .eq('status', 'active')
    .order('listed_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Ticket Resale Marketplace</h1>
      
      {!listings || listings.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <div className="text-6xl mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            No tickets available for resale
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition"
            >
              <div className="h-32 bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white text-5xl">
                
              </div>
              
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">
                  {listing.ticket?.event?.title}
                </h3>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                   {listing.ticket?.event?.location}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                   {new Date(listing.ticket?.event?.event_date).toLocaleDateString()}
                </p>
                
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Resale Price</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${listing.resale_price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Original</p>
                      <p className="text-slate-600 dark:text-slate-400 line-through">
                        ${listing.original_price}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Link
                  href={`/marketplace/${listing.id}`}
                  className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Buy Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}