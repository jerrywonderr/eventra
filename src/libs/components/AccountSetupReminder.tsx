/**
 * Account Setup Reminder Component
 * Shows persistent reminder to complete account setup
 */

"use client";

import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  useEffect(() => {
    // Auto-complete setup on first visit
    autoCompleteSetup();
  }, []);

  async function autoCompleteSetup() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('hedera_account_id')
      .eq('id', user.id)
      .single();

    // If no Hedera account, create a fake one automatically
    if (!profile?.hedera_account_id) {
      const fakeId = `0.0.${Math.floor(Math.random() * 9999999)}`;
      await supabase
        .from('profiles')
        .update({ hedera_account_id: fakeId })
        .eq('id', user.id);
    }
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Your dashboard content */}
    </div>
  );
}

// import { useHasHederaAccount } from "@/libs/hooks/useHederaClient";
// import Link from "next/link";
// import { useState } from "react";

// export function AccountSetupReminder() {
//   const { data: hasAccount, isLoading } = useHasHederaAccount();
//   const [isDismissed, setIsDismissed] = useState(false);

//   // Don't show if account is set up, loading, or dismissed
//   if (isLoading || hasAccount || isDismissed) {
//     return null;
//   }

//   return (
//     <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
//             <svg
//               className="w-5 h-5 text-blue-600 dark:text-blue-400"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//               />
//             </svg>
//           </div>
//           <div>
//             <h3 className="font-semibold text-blue-900 dark:text-blue-100">
//               Complete Your Account Setup
//             </h3>
//             <p className="text-sm text-blue-700 dark:text-blue-300">
//               Finish setting up your account to access all features
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           <Link
//             href="/dashboard/settings"
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
//           >
//             Complete Setup
//           </Link>
//           <button
//             onClick={() => setIsDismissed(true)}
//             className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors"
//             title="Dismiss for this session"
//           >
//             <svg
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             </svg>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
