// src/app/dashboard/page.tsx

import { createClient } from "@/libs/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user profile with points
  const { data: profile } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", user?.id)
    .single();

  // Fetch user's events
  const { data: myEvents } = await supabase
    .from("events")
    .select("*")
    .eq("organizer_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch user's tickets
  const { data: myTickets } = await supabase
    .from("tickets")
    .select(
      `
      *,
      event:events (
        title,
        event_date,
        location
      )
    `
    )
    .eq("buyer_id", user?.id)
    .order("purchase_date", { ascending: false })
    .limit(5);

  // Count upcoming events
  const { count: upcomingCount } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("buyer_id", user?.id)
    .gte("event.event_date", new Date().toISOString());

  const userPoints = profile?.points || 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section with Points */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back,{" "}
              {user?.user_metadata?.full_name ||
                user?.email?.split("@")[0] ||
                "there"}
              ! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Ready to discover your next amazing event?
            </p>
          </div>

          {/* Points Badge */}
          <Link
            href="/points"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-4 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="text-4xl">⭐</div>
              <div className="text-right">
                <p className="text-sm text-blue-100">Your Points</p>
                <p className="text-3xl font-bold">
                  {userPoints.toLocaleString()}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Link
          href="/create-event"
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition text-center group"
        >
          <div className="text-4xl mb-2 group-hover:scale-110 transition">
            🎉
          </div>
          <div className="font-bold text-slate-900 dark:text-white mb-1">
            Create Event
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Start selling tickets
          </div>
        </Link>

        <Link
          href="/events"
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition text-center group"
        >
          <div className="text-4xl mb-2 group-hover:scale-110 transition">
            🔍
          </div>
          <div className="font-bold text-slate-900 dark:text-white mb-1">
            Browse Events
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Find events
          </div>
        </Link>

        <Link
          href="/my-tickets"
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition text-center group"
        >
          <div className="text-4xl mb-2 group-hover:scale-110 transition">
            🎫
          </div>
          <div className="font-bold text-slate-900 dark:text-white mb-1">
            My Tickets
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            View tickets
          </div>
        </Link>

        <Link
          href="/marketplace"
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition text-center group"
        >
          <div className="text-4xl mb-2 group-hover:scale-110 transition">
            💰
          </div>
          <div className="font-bold text-slate-900 dark:text-white mb-1">
            Marketplace
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Resell tickets
          </div>
        </Link>

        <Link
          href="/points"
          className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 border border-yellow-300 hover:shadow-lg transition text-center group"
        >
          <div className="text-4xl mb-2 group-hover:scale-110 transition">
            ⭐
          </div>
          <div className="font-bold text-white mb-1">Rewards</div>
          <div className="text-sm text-yellow-100">Earn points</div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="text-3xl mb-2">🎫</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {myTickets?.length || 0}
          </div>
          <div className="text-slate-600 dark:text-slate-400">My Tickets</div>
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

        <Link
          href="/points"
          className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition group"
        >
          <div className="text-3xl mb-2 group-hover:scale-110 transition">
            ⭐
          </div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400 mb-1">
            {userPoints.toLocaleString()}
          </div>
          <div className="text-yellow-600 dark:text-yellow-500">
            Reward Points
          </div>
        </Link>
      </div>

      {/* Points Info Banner */}
      {userPoints < 100 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎁</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-200 mb-2">
                Start Earning Rewards!
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                Earn 10 points for every $1 spent on tickets. Get 50 bonus
                points on your first purchase!
              </p>
              <Link
                href="/events"
                className="inline-block px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm font-semibold"
              >
                Browse Events & Earn Points
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* My Events Section */}
      {myEvents && myEvents.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              My Events
            </h2>
            <Link
              href="/create-event"
              className="text-blue-600 hover:underline text-sm"
            >
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
                  📍 {event.location} • 📅{" "}
                  {new Date(event.event_date).toLocaleDateString()}
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
            <Link
              href="/my-tickets"
              className="text-blue-600 hover:underline text-sm"
            >
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

      {/* Empty State */}
      {(!myEvents || myEvents.length === 0) &&
        (!myTickets || myTickets.length === 0) && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Get Started
            </h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Welcome to Eventra!
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
                Start by creating an event or browsing available tickets. Earn
                points with every purchase!
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
