// src/app/points/page.tsx

import { createClient } from "@/libs/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PointsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user profile with points
  const { data: profile } = await supabase
    .from("profiles")
    .select("points, full_name, email")
    .eq("id", user.id)
    .single();

  // Fetch points transactions
  const { data: transactions } = await supabase
    .from("points_transactions")
    .select(
      `
      *,
      event:events(title)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const totalPoints = profile?.points || 0;
  const totalEarned =
    transactions
      ?.filter((t) => t.type === "earned" || t.type === "bonus")
      .reduce((sum, t) => sum + t.points, 0) || 0;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Rewards & Points</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Earn points with every ticket purchase
        </p>
      </div>

      {/* Points Summary */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">⭐</div>
            <div>
              <p className="text-sm text-yellow-100">Total Points</p>
              <p className="text-4xl font-bold">
                {totalPoints.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl mb-2">📈</div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
            Total Earned
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalEarned.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl mb-2">🎯</div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
            Transactions
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {transactions?.length || 0}
          </p>
        </div>
      </div>

      {/* How to Earn Points */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          How to Earn Points
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🎫</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Buy Tickets
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Earn 10 points for every $1 spent
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🎁</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                First Purchase Bonus
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Get 50 bonus points on your first ticket
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions History */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold">Points History</h2>
        </div>

        {!transactions || transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">⭐</div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              No points earned yet
            </p>
            <Link
              href="/events"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Browse Events to Earn Points
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {transactions.map((transaction) => {
              const isPositive = transaction.points > 0;
              const eventTitle = Array.isArray(transaction.event)
                ? transaction.event[0]?.title
                : transaction.event?.title;

              return (
                <div
                  key={transaction.id}
                  className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          transaction.type === "bonus"
                            ? "bg-green-100 dark:bg-green-900/30"
                            : transaction.type === "earned"
                            ? "bg-blue-100 dark:bg-blue-900/30"
                            : "bg-slate-100 dark:bg-slate-700"
                        }`}
                      >
                        <span className="text-2xl">
                          {transaction.type === "bonus"
                            ? "🎁"
                            : transaction.type === "earned"
                            ? "⭐"
                            : "💫"}
                        </span>
                      </div>

                      {/* Details */}
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                          {transaction.description}
                        </h3>
                        {eventTitle && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                            Event: {eventTitle}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {new Date(transaction.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Points */}
                    <div
                      className={`text-right ${
                        isPositive
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      <p className="text-2xl font-bold">
                        {isPositive ? "+" : ""}
                        {transaction.points}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        {transaction.type}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Coming Soon - Redemption */}
      {totalPoints >= 100 && (
        <div className="mt-8 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎉</div>
            <div>
              <h3 className="text-lg font-bold text-purple-900 dark:text-purple-200 mb-2">
                Coming Soon: Redeem Your Points!
              </h3>
              <p className="text-sm text-purple-800 dark:text-purple-300">
                Soon you`ll be able to redeem points for discounts, exclusive
                perks, and special event access. Stay tuned!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
