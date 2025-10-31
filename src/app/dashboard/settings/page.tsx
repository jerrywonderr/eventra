// src/app/settings/page.tsx

import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import PasswordForm from "./PasswordForm";
import DeleteAccount from "./DeleteAccount";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Profile Information
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Update your personal information
            </p>
          </div>
          <div className="p-6">
            <ProfileForm 
              userId={user.id}
              email={user.email || ''}
              fullName={profile?.full_name || ''}
              phone={profile?.phone || ''}
            />
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Change Password
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Update your password to keep your account secure
            </p>
          </div>
          <div className="p-6">
            <PasswordForm />
          </div>
        </div>

        {/* Account Statistics */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Account Statistics
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Points</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {profile?.points || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">Member Since</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">Account Status</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                Active
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 overflow-hidden">
          <div className="p-6 border-b border-red-200 dark:border-red-800">
            <h2 className="text-xl font-bold text-red-900 dark:text-red-200">
              Danger Zone
            </h2>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Irreversible actions
            </p>
          </div>
          <div className="p-6">
            <DeleteAccount userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
}