# How Authentication Works in Eventra

A comprehensive guide to understanding the auth flow from start to finish.

---

## 📚 Table of Contents

1. [The Big Picture](#the-big-picture)
2. [How Supabase + Next.js Work Together](#how-supabase--nextjs-work-together)
3. [Understanding the Callback Route](#understanding-the-callback-route)
4. [The Complete Auth Flow](#the-complete-auth-flow)
5. [File-by-File Explanation](#file-by-file-explanation)
6. [Common Patterns](#common-patterns)

---

## The Big Picture

Think of the authentication system as having **three main layers**:

```
┌─────────────────────────────────────────┐
│         USER INTERFACE (UI)             │
│  (Login forms, signup forms, buttons)   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      APPLICATION LAYER (Next.js)        │
│  (Pages, components, middleware)        │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      BACKEND SERVICE (Supabase)         │
│  (Authentication, database, storage)    │
└─────────────────────────────────────────┘
```

### What Each Layer Does

**1. User Interface (UI)**

- Forms where users enter email/password
- Buttons to trigger actions
- Visual feedback (loading, errors)

**2. Application Layer (Next.js)**

- Routes that show different pages
- Logic that decides who can see what
- Manages user session/state
- Talks to Supabase

**3. Backend Service (Supabase)**

- Actually stores user accounts
- Verifies passwords
- Sends emails
- Creates secure sessions

---

## How Supabase + Next.js Work Together

### The Challenge

In a regular backend (like Express.js), everything runs on the server. But Next.js is **hybrid**:

- Some code runs on the **server** (during page load, API routes)
- Some code runs in the **browser** (client components, interactions)

Supabase needs to work in **both** places!

### The Solution: Multiple Clients

We create **different Supabase clients** for different contexts:

#### 1. **Browser Client** (`src/libs/supabase/client.ts`)

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**When to use:**

- Client components (marked with `"use client"`)
- User interactions (button clicks, form submissions)
- Real-time features

**Example:**

```typescript
"use client";

import { createClient } from "@/libs/supabase/client";

export function LoginButton() {
  const handleLogin = async () => {
    const supabase = createClient(); // Browser client
    await supabase.auth.signInWithPassword({ email, password });
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

#### 2. **Server Client** (`src/libs/supabase/server.ts`)

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component - middleware will handle
          }
        },
      },
    }
  );
}
```

**When to use:**

- Server components (default in Next.js 15)
- Page loads
- Checking authentication before rendering
- API routes

**Example:**

```typescript
// Server component (no "use client")
import { createClient } from "@/libs/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient(); // Server client
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <div>Welcome {user?.email}</div>;
}
```

#### 3. **Middleware Client** (`src/libs/supabase/middleware.ts`)

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Special client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies on response
        },
      },
    }
  );

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect if needed
  if (!user && protectedRoute) {
    return NextResponse.redirect("/auth/login");
  }

  return response;
}
```

**When to use:**

- Runs before every request
- Route protection
- Session refresh
- Automatic redirects

### Why So Many Clients?

Each environment in Next.js handles cookies differently:

| Environment      | Cookie Access            | Client Type       |
| ---------------- | ------------------------ | ----------------- |
| Browser          | `document.cookie`        | Browser Client    |
| Server Component | `cookies()` from Next.js | Server Client     |
| Middleware       | `request.cookies`        | Middleware Client |

---

## Understanding the Callback Route

### What is `/auth/callback/route.ts`?

```typescript
// src/app/auth/callback/route.ts
import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
```

### Why Do We Need It?

When Supabase sends an email (confirmation or password reset), the link looks like this:

```
http://localhost:3000/auth/callback?code=abc123xyz&next=/dashboard
```

This route:

1. **Receives the code** from the email link
2. **Exchanges the code** for a real session
3. **Redirects the user** to their destination

### The Flow

```
User clicks email link
       ↓
Goes to /auth/callback?code=abc123
       ↓
Callback route extracts the code
       ↓
Exchanges code with Supabase for session
       ↓
Sets session cookie
       ↓
Redirects to /dashboard
```

### Types of Callbacks Handled

**1. Email Confirmation (Sign Up)**

```
User signs up → Email sent → User clicks link → Callback confirms email
```

**2. Password Reset**

```
User requests reset → Email sent → User clicks link → Callback verifies
```

**3. OAuth Sign In (Google, GitHub, etc.)**

```
User clicks "Sign in with Google" → Google auth → Returns to callback
```

### Why Not Just Use a Regular Page?

A **route handler** (`.ts` file) is better than a page (`.tsx`) because:

- ✅ No UI needed - it just processes and redirects
- ✅ Faster - no React rendering
- ✅ Cleaner - keeps logic separate from UI
- ✅ Server-only - code never exposed to browser

---

## The Complete Auth Flow

Let me walk you through what happens step-by-step in different scenarios.

### 📝 Scenario 1: User Signs Up

**Step 1: User Fills Form**

User is at: `/auth/signup`

```typescript
// src/app/auth/signup/page.tsx
export default function SignupPage() {
  return <SignupForm />; // Shows the form
}
```

**Step 2: Form Submission**

```typescript
// src/libs/components/auth/SignupForm.tsx
"use client"; // Runs in browser

const handleSubmit = async (e) => {
  const supabase = createClient(); // Browser client

  // Call Supabase to create account
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};
```

**What happens:**

- Form data sent to Supabase
- Supabase creates user account (unconfirmed)
- Supabase sends confirmation email
- Form shows "Check your email" message

**Step 3: Email Sent**

Email contains link like:

```
http://localhost:3000/auth/callback?code=abc123&type=signup
```

**Step 4: User Clicks Link**

Browser goes to: `/auth/callback?code=abc123`

**Step 5: Callback Processes**

```typescript
// src/app/auth/callback/route.ts
export async function GET(request: Request) {
  const code = searchParams.get("code"); // "abc123"

  const supabase = await createClient(); // Server client

  // Exchange code for session
  await supabase.auth.exchangeCodeForSession(code);

  // Redirect to dashboard
  return NextResponse.redirect(`${origin}/dashboard`);
}
```

**What happens:**

- Code is verified with Supabase
- Session cookie is set
- User is redirected to dashboard
- Email is now confirmed!

**Step 6: Dashboard Loads**

```typescript
// src/app/dashboard/layout.tsx (Server Component)
export default async function DashboardLayout({ children }) {
  const supabase = await createClient(); // Server client
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login"); // Not authenticated
  }

  return (
    <div>
      <DashboardNav user={user} />
      {children}
    </div>
  );
}
```

**What happens:**

- Server checks if user is authenticated
- Reads session from cookie
- If authenticated, shows dashboard
- If not, redirects to login

---

### 🔐 Scenario 2: User Logs In

**Step 1: User at Login Page**

User is at: `/auth/login`

**Step 2: Enters Credentials**

```typescript
// src/libs/components/auth/LoginForm.tsx
"use client";

const handleSubmit = async (e) => {
  const supabase = createClient(); // Browser client

  // Sign in directly (no email needed)
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!error) {
    router.push("/dashboard"); // Navigate to dashboard
    router.refresh(); // Refresh server components
  }
};
```

**What happens:**

- Credentials sent to Supabase
- Supabase validates password
- Session cookie set automatically
- User redirected to dashboard

**No Callback Needed!**

For password login, the session is created immediately. Callback is only needed for email links.

---

### 🛡️ Scenario 3: Protected Route Access

**User tries to access `/dashboard` without logging in**

**Step 1: Middleware Runs First**

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(...); // Middleware client

  const { data: { user } } = await supabase.auth.getUser();

  // Check if accessing protected route
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    // Redirect to login
    return NextResponse.redirect("/auth/login");
  }

  return response;
}
```

**What happens:**

- Middleware checks every request
- Reads session cookie
- If no session + protected route → redirect to login
- If session exists → allow access

**Step 2: Layout Confirms**

Even if middleware passes, the layout double-checks:

```typescript
// src/app/dashboard/layout.tsx
export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login"); // Extra safety
  }

  return <>{children}</>;
}
```

**Defense in Depth:**

- Middleware = First line of defense
- Layout = Second confirmation
- Both check authentication

---

### 🚪 Scenario 4: User Signs Out

```typescript
// src/app/dashboard/components/DashboardNav.tsx
"use client";

const handleSignOut = async () => {
  const supabase = createClient(); // Browser client

  await supabase.auth.signOut(); // Clear session

  router.push("/"); // Go to home
  router.refresh(); // Refresh to clear state
};
```

**What happens:**

- Supabase clears session
- Cookie is deleted
- User redirected to home
- Middleware now blocks dashboard access

---

## File-by-File Explanation

### Authentication Files

#### 1. **`src/libs/supabase/client.ts`**

**Purpose:** Create Supabase client for browser use

**When it's used:**

- User clicks a button
- Form submission
- Any client component action

**Example:**

```typescript
"use client";
import { createClient } from "@/libs/supabase/client";

// This runs in the browser
const supabase = createClient();
await supabase.auth.signIn({ email, password });
```

---

#### 2. **`src/libs/supabase/server.ts`**

**Purpose:** Create Supabase client for server use

**When it's used:**

- Page loads (server components)
- Checking auth before rendering
- Server-side data fetching

**Example:**

```typescript
// Server component (no "use client")
import { createClient } from "@/libs/supabase/server";

// This runs on the server
const supabase = await createClient();
const {
  data: { user },
} = await supabase.auth.getUser();
```

---

#### 3. **`src/libs/supabase/middleware.ts`**

**Purpose:** Handle session refresh in middleware

**When it's used:**

- Before every request
- Automatically by Next.js
- You don't call this directly

**What it does:**

- Refreshes expired sessions
- Checks authentication
- Enables route protection

---

#### 4. **`middleware.ts`** (Root level)

**Purpose:** Protect routes and manage sessions

**When it runs:**

- **Every single request**
- Before pages load
- Before API routes run

**What it does:**

```typescript
middleware.ts
  ↓
Check if user is authenticated
  ↓
Is route protected?
  ↓
YES: Not authenticated? → Redirect to /auth/login
NO: Continue to route
```

**Protects:**

- `/dashboard/*` - All dashboard pages

**Allows:**

- `/` - Home page
- `/auth/*` - Login/signup pages

---

#### 5. **`src/libs/store/auth-store.ts`**

**Purpose:** Global state management with Zustand

**What it stores:**

```typescript
{
  user: User | null,      // Current user data
  isLoading: boolean,     // Loading state
  setUser: () => void,    // Update user
  signOut: () => void,    // Clear user
}
```

**Why we need it:**

- Server components can't share state with client components directly
- This store lets any client component access user data
- Updates automatically when auth state changes

**Example:**

```typescript
"use client";
import { useAuthStore } from "@/libs/store";

export function UserProfile() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <div>Loading...</div>;

  return <div>{user?.email}</div>;
}
```

---

#### 6. **`src/libs/providers/auth-provider.tsx`**

**Purpose:** Sync auth state with Zustand store

**What it does:**

```typescript
AuthProvider
  ↓
On mount: Get current session
  ↓
Listen for auth changes (login, logout)
  ↓
Update Zustand store
  ↓
All components see updated state
```

**Where it's used:**

```typescript
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {" "}
          {/* Wraps entire app */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

---

## Common Patterns

### Pattern 1: Check Auth in Server Component

```typescript
import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <div>Protected content for {user.email}</div>;
}
```

### Pattern 2: Check Auth in Client Component

```typescript
"use client";
import { useAuthStore } from "@/libs/store";

export function ProtectedComponent() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <Spinner />;
  if (!user) return <div>Please log in</div>;

  return <div>Welcome {user.email}</div>;
}
```

### Pattern 3: Perform Auth Action

```typescript
"use client";
import { createClient } from "@/libs/supabase/client";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();

  const handleLogin = async () => {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      router.push("/dashboard");
      router.refresh(); // Important! Refreshes server components
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

---

## Key Takeaways

### 1. **Three Types of Clients**

- **Browser**: For user interactions (`createClient` from `client.ts`)
- **Server**: For page loads (`createClient` from `server.ts`)
- **Middleware**: For route protection (special middleware client)

### 2. **Callback is for Email Links**

- Confirms email addresses
- Resets passwords
- Handles OAuth returns
- Exchanges codes for sessions

### 3. **Multiple Layers of Protection**

- **Middleware**: First check, redirects immediately
- **Layout**: Second check, server-side verification
- **Components**: Third check, UI-level protection

### 4. **State Flows Both Ways**

```
Supabase Session
     ↓
Auth Provider (detects changes)
     ↓
Zustand Store (updates)
     ↓
React Components (re-render)
```

### 5. **Why `router.refresh()`?**

After auth actions, call `router.refresh()` to:

- Reload server components
- Update protected route access
- Sync server and client state

---

## Visual Summary

```
┌─────────────────────────────────────────────────────────┐
│                   USER JOURNEY                          │
└─────────────────────────────────────────────────────────┘

Sign Up
  ↓
Fill form → [Browser Client] → Supabase creates account
  ↓
Email sent with callback link
  ↓
Click link → /auth/callback → [Server Client] → Verify code
  ↓
Set session cookie
  ↓
Redirect to /dashboard
  ↓
[Middleware] checks session ✓
  ↓
[Layout] verifies auth ✓
  ↓
Dashboard loads!


Subsequent Visits
  ↓
Browser has session cookie
  ↓
[Middleware] validates session ✓
  ↓
Direct to dashboard (no login needed)
```

---

## Need More Help?

Still confused? Here are the key concepts:

1. **Supabase = Backend** - Handles actual authentication
2. **Next.js = Frontend + Server** - Shows UI and protects routes
3. **Callbacks = Email Link Handler** - Confirms actions from emails
4. **Clients = Different Ways to Talk to Supabase** - Browser vs Server
5. **Cookies = How Sessions are Stored** - Automatic, secure
6. **Middleware = Gatekeeper** - Runs before every request

The beauty of this setup is that once configured, most of it works automatically! You just need to remember:

- Use **browser client** in client components
- Use **server client** in server components
- Let **middleware** handle protection
- Use **callback** for email links

That's it! 🎉
