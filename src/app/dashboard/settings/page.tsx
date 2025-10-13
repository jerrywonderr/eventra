import { AccountSetup } from "@/libs/components";
import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage your account settings and blockchain preferences
          </p>
        </div>

        <div className="space-y-8">
          {/* Account Setup Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Complete Your Account
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Finish setting up your account to access all Eventra features
              </p>
            </div>

            <AccountSetup />
          </div>

          {/* Account Information Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Account Information
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Your account details and preferences
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                  <p className="text-slate-900 dark:text-white">{user.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Account ID
                </label>
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                  <p className="text-slate-900 dark:text-white font-mono text-sm">
                    {user.id}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Member Since
                </label>
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                  <p className="text-slate-900 dark:text-white">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Security Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Privacy & Security
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Manage your privacy and security settings
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Enable
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Change Password
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Update your account password
                  </p>
                </div>
                <button className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
                  Change
                </button>
              </div>
            </div>
          </div>

          {/* Help & Support Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Help & Support
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Get help and contact support
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Documentation
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Learn how to use Eventra's features
                  </p>
                </div>
                <a
                  href="/docs"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Docs
                </a>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Contact Support
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Get help from our support team
                  </p>
                </div>
                <button className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
