// src/app/dashboard/events/[id]/analytics/page.tsx

import { createClient } from '@/libs/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import PrintReportButton from '@/components/PrintReportButton';


export default async function EventAnalyticsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const supabase = await createClient();
  const { id: eventId } = await params;
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  // Fetch event details
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (!event) {
    notFound();
  }

  // Verify user is the organizer
  if (event.organizer_id !== user.id) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-red-600 text-lg">⛔ Access Denied</p>
        <p className="text-slate-600 mt-2">Only event organizers can view analytics</p>
      </div>
    );
  }

  // Fetch ticket tiers with sales
  const { data: tiers } = await supabase
    .from('ticket_tiers')
    .select('*')
    .eq('event_id', eventId)
    .order('price', { ascending: false });

  // Fetch all tickets
  const { data: tickets } = await supabase
    .from('tickets')
    .select('*, buyer:profiles(full_name, email)')
    .eq('event_id', eventId)
    .order('purchase_date', { ascending: false });

  // Fetch certificates
  const { data: certificates } = await supabase
    .from('certificates')
    .select('*')
    .eq('event_id', eventId);

  // Calculate analytics
  const totalTicketsSold = tickets?.length || 0;
  const totalRevenue = tickets?.reduce((sum, t) => sum + t.purchase_price, 0) || 0;
  const totalCapacity = tiers?.reduce((sum, t) => sum + t.quantity_total, 0) || 0;
  const certificatesMinted = certificates?.length || 0;
  
  const selloutPercentage = totalCapacity > 0 
    ? ((totalTicketsSold / totalCapacity) * 100).toFixed(1)
    : '0';

  // Revenue by tier
  const revenueByTier = tiers?.map(tier => {
    const tierTickets = tickets?.filter(t => t.tier_id === tier.id) || [];
    const tierRevenue = tierTickets.reduce((sum, t) => sum + t.purchase_price, 0);
    return {
      ...tier,
      sold: tierTickets.length,
      revenue: tierRevenue,
    };
  }) || [];

  // Sales over time (last 7 days)
  const salesByDay = tickets?.reduce((acc: Record<string, number>, ticket) => {
    const date = new Date(ticket.purchase_date).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const eventDate = new Date(event.event_date);
  const daysUntilEvent = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isUpcoming = daysUntilEvent > 0;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link 
            href="/dashboard"
            className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            ← Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <span>📍 {event.location}</span>
          <span>📅 {eventDate.toLocaleDateString()}</span>
          {isUpcoming && (
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-semibold">
              {daysUntilEvent} days until event
            </span>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🎫</span>
            <span className="text-sm opacity-80">{selloutPercentage}% sold</span>
          </div>
          <p className="text-4xl font-bold mb-1">{totalTicketsSold}</p>
          <p className="text-sm opacity-90">Tickets Sold</p>
          <p className="text-xs opacity-75 mt-1">of {totalCapacity} total</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">💰</div>
          <p className="text-4xl font-bold mb-1">${totalRevenue.toFixed(2)}</p>
          <p className="text-sm opacity-90">Total Revenue</p>
          <p className="text-xs opacity-75 mt-1">Gross earnings</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-4xl font-bold mb-1">${(totalRevenue / (totalTicketsSold || 1)).toFixed(2)}</p>
          <p className="text-sm opacity-90">Avg Ticket Price</p>
          <p className="text-xs opacity-75 mt-1">Per ticket sold</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">🎓</div>
          <p className="text-4xl font-bold mb-1">{certificatesMinted}</p>
          <p className="text-sm opacity-90">Certificates</p>
          <p className="text-xs opacity-75 mt-1">
            {event.certificate_token_id ? 'Minted' : 'Not created'}
          </p>
        </div>
      </div>

      {/* Revenue by Tier */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold">Revenue by Ticket Tier</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Tier Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Sold / Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {revenueByTier.map((tier) => {
                const percentageSold = ((tier.sold / tier.quantity_total) * 100).toFixed(0);
                const isSoldOut = tier.sold >= tier.quantity_total;

                return (
                  <tr key={tier.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {tier.tier_name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      ${tier.price}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {tier.sold} / {tier.quantity_total}
                      <span className="text-xs ml-2">({percentageSold}%)</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600 dark:text-green-400">
                      ${tier.revenue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {isSoldOut ? (
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-semibold">
                          Sold Out
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                          Available
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold">Recent Ticket Sales</h2>
        </div>
        <div className="overflow-x-auto">
          {tickets && tickets.length > 0 ? (
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Purchase Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Transaction
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {tickets.slice(0, 10).map((ticket) => {
                  const buyer = Array.isArray(ticket.buyer) ? ticket.buyer[0] : ticket.buyer;
                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-4 text-slate-900 dark:text-white">
                        {buyer?.full_name || buyer?.email?.split('@')[0] || 'Anonymous'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {new Date(ticket.purchase_date).toLocaleDateString()} {' '}
                        {new Date(ticket.purchase_date).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        ${ticket.purchase_price}
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`https://hashscan.io/${process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet'}/transaction/${ticket.transaction_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-mono"
                        >
                          {ticket.transaction_hash?.substring(0, 20)}...
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              No tickets sold yet
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link
          href={`/events/${eventId}`}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition text-center group"
        >
          <div className="text-4xl mb-3 group-hover:scale-110 transition">👁️</div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">View Event</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">See public event page</p>
        </Link>

        <Link
          href={`/dashboard/events/${eventId}/certificates`}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition text-center group"
        >
          <div className="text-4xl mb-3 group-hover:scale-110 transition">🎓</div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">Certificates</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Mint participation NFTs</p>
        </Link>

        <PrintReportButton eventId={eventId} />

      </div>
    </div>
  );
}