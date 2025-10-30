// src/app/dashboard/layout.tsx

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
// Fallback inline DashboardNav component to avoid missing module error
function DashboardNav({ user }: { user?: User | null }) {
  return (
    <nav className="bg-white shadow mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="text-lg font-semibold">Eventra</div>
        <div className="text-sm text-gray-600">{user?.email ?? "Guest"}</div>
      </div>
    </nav>
  );
}

// Inline fallback AccountSetup component to avoid missing module error
function AccountSetup() {
  return (
    <div className="mb-6">
      {/* Simple placeholder UI for account setup */}
      <p className="text-sm text-gray-600">Complete your account setup</p>
    </div>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ✅ USE CORRECT COMPONENT NAME */}
        <AccountSetup />
        {children}
      </main>
    </div>
  );
}
