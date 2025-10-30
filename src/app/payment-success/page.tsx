// src/app/payment-success/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import SocialShare from "@/components/SocialShare";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);

  const paymentReference = searchParams.get("ref");
  const paymentMethod = searchParams.get("method") || "paystack";

  useEffect(() => {
    // Countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      // Only redirect when countdown reaches 0
      router.push("/my-tickets");
    }
  }, [countdown, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center border border-slate-200 dark:border-slate-700">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-10 h-10 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Thank you for your purchase
          </p>

          {/* Payment Details */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  Payment Method:
                </span>
                <span className="font-semibold text-slate-900 dark:text-white capitalize">
                  {paymentMethod === "paystack" ? "💳 Card/Bank" : "🔗 HBAR"}
                </span>
              </div>
              {paymentReference && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Reference:
                  </span>
                  <span className="font-mono text-xs text-slate-900 dark:text-white">
                    {paymentReference.substring(0, 20)}...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Processing Status */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Creating your ticket on blockchain...
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              This usually takes 10-20 seconds
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/my-tickets"
              className="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold"
            >
              View My Tickets
            </Link>
            <div className="mt-6">
              <SocialShare
                title={`Just got tickets on Eventra! 🎉`}
                description="Check out this amazing platform for blockchain-verified event tickets"
                url={
                  typeof window !== "undefined"
                    ? window.location.origin
                    : "https://eventra.com"
                }
                hashtags={["Eventra", "EventTickets", "Blockchain", "Hedera"]}
              />
            </div>

            <Link
              href="/events"
              className="block w-full px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition font-semibold"
            >
              Browse More Events
            </Link>
          </div>

          {/* Auto Redirect Info */}
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-6">
            Auto-redirecting to My Tickets in {countdown} seconds...
          </p>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Don`t see your ticket? Wait a few seconds and refresh the page.
          </p>
        </div>
      </div>
    </div>
  );
}
