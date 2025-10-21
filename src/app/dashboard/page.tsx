// src/app/dashboard/page.tsx

import { createClient } from "@/libs/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user's events
  const { data: myEvents } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch user's tickets
  const { data: myTickets } = await supabase
    .from('tickets')
    .select(`
      *,
      event:events (
        title,
        event_date,
        location
      )
    `)
    .eq('buyer_id', user?.id)
    .order('purchase_date', { ascending: false })
    .limit(5);

  // Count upcoming events
  const { count: upcomingCount } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('buyer_id', user?.id)
    .gte('event.event_date', new Date().toISOString());

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "there"}! 👋
        </h1>
        <p className="text-blue-100 text-lg">
          Ready to discover your next amazing event?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/create-event"
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition text-center group"
        >
          <div className="text-4xl mb-2 group-hover:scale-110 transition">🎉</div>
          <div className="font-bold text-slate-900 dark:text-white mb-1">Create Event</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Start selling tickets</div>
        </Link>

        <Link
          href="/events"
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition text-center group"
        >
          <div className="text-4xl mb-2 group-hover:scale-110 transition">🔍</div>
          <div className="font-bold text-slate-900 dark:text-white mb-1">Browse Events</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Find events</div>
        </Link>

        <Link
          href="/my-tickets"
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition text-center group"
        >
          <div className="text-4xl mb-2 group-hover:scale-110 transition">🎫</div>
          <div className="font-bold text-slate-900 dark:text-white mb-1">My Tickets</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">View tickets</div>
        </Link>

        <Link
          href="/marketplace"
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition text-center group"
        >
          <div className="text-4xl mb-2 group-hover:scale-110 transition">💰</div>
          <div className="font-bold text-slate-900 dark:text-white mb-1">Marketplace</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Resell tickets</div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="text-3xl mb-2">🎫</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {myTickets?.length || 0}
          </div>
          <div className="text-slate-600 dark:text-slate-400">
            My Tickets
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="text-3xl mb-2">🎉</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {myEvents?.length || 0}
          </div>
          <div className="text-slate-600 dark:text-slate-400">
            Events Created
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {upcomingCount || 0}
          </div>
          <div className="text-slate-600 dark:text-slate-400">Upcoming</div>
        </div>
      </div>

      {/* My Events Section */}
      {myEvents && myEvents.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              My Events
            </h2>
            <Link href="/create-event" className="text-blue-600 hover:underline text-sm">
              Create New →
            </Link>
          </div>
          <div className="space-y-3">
            {myEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {event.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  📍 {event.location} • 📅 {new Date(event.event_date).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* My Tickets Section */}
      {myTickets && myTickets.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              My Tickets
            </h2>
            <Link href="/my-tickets" className="text-blue-600 hover:underline text-sm">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {myTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {ticket.event?.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  📅 {new Date(ticket.event?.event_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State - Show when no events or tickets */}
      {(!myEvents || myEvents.length === 0) && (!myTickets || myTickets.length === 0) && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Get Started
          </h2>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Welcome to EventChain!
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
              Start by creating an event or browsing available tickets
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/create-event"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Create Event
              </Link>
              <Link
                href="/events"
                className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition font-semibold"
              >
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}