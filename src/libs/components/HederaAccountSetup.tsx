// src/libs/components/AccountSetup.tsx

"use client";

import {
  useCreateHederaAccount,
  useHasHederaAccount,
} from "@/libs/hooks/useHederaClient";
import { useState } from "react";
import { Button } from "./Button";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AccountSetupProps {
  onSetupComplete?: () => void;
}

export function AccountSetup({ onSetupComplete }: AccountSetupProps) {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createHederaAccount = useCreateHederaAccount();
  const { data: hasAccount, isLoading } = useHasHederaAccount();

  const handleSetup = async () => {
    setIsSettingUp(true);
    setError(null);
    
    try {
      // First verify user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Please log in first');
        setIsSettingUp(false);
        return;
      }

      // Try to create Hedera account
      await createHederaAccount.mutateAsync();
      
      // Success!
      onSetupComplete?.();
      
    } catch (err) {
      console.error("Failed to set up Hedera account:", err);
      setError((err as Error).message || 'Setup failed. Please try again.');
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleSkip = async () => {
    // Auto-create a fake Hedera account and skip
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fakeAccountId = `0.0.${Math.floor(Math.random() * 9999999)}`;
      
      await supabase
        .from('profiles')
        .update({ hedera_account_id: fakeAccountId })
        .eq('id', user.id);

      console.log('✅ Skipped setup with fake account:', fakeAccountId);
      
      // Refresh the page to update hasAccount status
      window.location.reload();
      
    } catch (err) {
      console.error('Skip failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (hasAccount) {
    return (
      <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-green-600 dark:text-green-400"
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
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              Account Setup Complete
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your account is fully set up and ready to use all features
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 mb-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
          <svg
            className="w-6 h-6 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Complete Your Account Setup
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
            Finish setting up your account to access all Eventra features. This
            creates your secure blockchain account for ticket management.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Secure account creation
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Digital ticket ownership
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Instant access to all features
            </div>
          </div>
          
          <div className="mt-4 flex gap-3">
            <Button
              onClick={handleSetup}
              disabled={createHederaAccount.isPending || isSettingUp}
              variant="primary"
              size="sm"
            >
              {createHederaAccount.isPending || isSettingUp ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Setting Up Account...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
            
            {/* ADD SKIP BUTTON FOR HACKATHON */}
            <Button
              onClick={handleSkip}
              disabled={isSettingUp}
              variant="secondary"
              size="sm"
            >
              Skip for Now
            </Button>
          </div>
          
          {(createHederaAccount.error || error) && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                {error || createHederaAccount.error?.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}