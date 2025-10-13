import { createClient } from "@/libs/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Welcome back, {user?.user_metadata?.full_name || "there"}! 👋
        </h1>
        <p className="text-blue-100 text-lg">
          Ready to discover your next amazing event?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="text-3xl mb-2">🎫</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            0
          </div>
          <div className="text-slate-600 dark:text-slate-400">
            Upcoming Events
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="text-3xl mb-2">✓</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            0
          </div>
          <div className="text-slate-600 dark:text-slate-400">
            Events Attended
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            0
          </div>
          <div className="text-slate-600 dark:text-slate-400">Favorites</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            No activity yet
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Start booking events to see your activity here
          </p>
        </div>
      </div>

      {/* Recommended Events */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Recommended For You
        </h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Discover amazing events
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Browse events tailored to your interests
          </p>
        </div>
      </div>
    </div>
  );
}
