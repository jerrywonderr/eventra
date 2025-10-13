# Environment Variables Guide

## 📋 Quick Reference

### Where Variables Go

```
┌─────────────────────────────────────────────────────────────────┐
│                      EVENTRA PROJECT                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📁 .env.local (Root Directory)                                 │
│  ├── NEXT_PUBLIC_SUPABASE_URL                                   │
│  ├── NEXT_PUBLIC_SUPABASE_ANON_KEY                              │
│  ├── NEXT_PUBLIC_APP_URL                                        │
│  ├── NEXT_PUBLIC_HEDERA_NETWORK                                 │
│  └── NEXT_PUBLIC_HEDERA_MIRROR_NODE                             │
│                                                                  │
│  🔐 Supabase Secrets (Dashboard/CLI)                            │
│  ├── HEDERA_NETWORK                                             │
│  ├── HEDERA_ACCOUNT_ID                                          │
│  └── HEDERA_PRIVATE_KEY                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Next.js Application Variables

These go in your **`.env.local`** file at the project root.

### Required Variables

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbGciOiJIUzI1NiIs...` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_APP_URL` | Your app's URL | `http://localhost:3000` | Local: `localhost:3000`<br>Production: Your domain |
| `NEXT_PUBLIC_HEDERA_NETWORK` | Hedera network name | `testnet` | Use: `testnet`, `mainnet`, or `previewnet` |
| `NEXT_PUBLIC_HEDERA_MIRROR_NODE` | Mirror node API URL | `https://testnet.mirrornode.hedera.com` | See table below |

### Hedera Mirror Node URLs

| Network | URL |
|---------|-----|
| Testnet | `https://testnet.mirrornode.hedera.com` |
| Mainnet | `https://mainnet-public.mirrornode.hedera.com` |
| Previewnet | `https://previewnet.mirrornode.hedera.com` |

### Why These Are Public (`NEXT_PUBLIC_*`)

- These variables are **embedded in the browser bundle**
- They are **visible to anyone** who inspects your site
- They contain **no sensitive information**
- They are used for:
  - Connecting to Supabase (with public anon key)
  - Displaying network information
  - Generating explorer links
  - **NOT** for blockchain operations

---

## 🔒 Edge Functions Secrets

These are set in **Supabase** (not in your `.env.local` file).

### Required Secrets

| Secret | Description | Example | Security Level |
|--------|-------------|---------|----------------|
| `HEDERA_NETWORK` | Hedera network | `testnet` | 🟡 Low (but keep private) |
| `HEDERA_ACCOUNT_ID` | Operator account ID | `0.0.123456` | 🟠 Medium (semi-sensitive) |
| `HEDERA_PRIVATE_KEY` | Operator private key | `302e020100300506...` | 🔴 **CRITICAL** (never expose!) |

### How to Set Edge Function Secrets

#### Option 1: Supabase CLI (Recommended)

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set HEDERA_NETWORK=testnet
supabase secrets set HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
supabase secrets set HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY

# Verify secrets are set
supabase secrets list
```

#### Option 2: Supabase Dashboard

1. Go to your Supabase project
2. Navigate to **Project Settings** → **Edge Functions**
3. Click **Manage Secrets**
4. Add each secret with its value
5. Save changes

### Auto-Injected Variables

These are **automatically available** in Edge Functions (no setup needed):

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (full access)
- `SUPABASE_ANON_KEY` - Anonymous key

### Why These Are Secrets

- Edge Function secrets are **only accessible server-side**
- They **never reach the browser**
- They are used for:
  - Creating Hedera accounts
  - Minting NFT tickets
  - All blockchain transactions
  - Operations requiring your operator private key

---

## 🔄 Data Flow

### Client-Side (Next.js)

```
User Browser
    ↓
Next.js App (.env.local variables)
    ↓
Displays UI, shows network info
    ↓
Calls Edge Functions (no private keys!)
```

### Server-Side (Edge Functions)

```
Edge Function Request
    ↓
Authenticates user (JWT token)
    ↓
Accesses Supabase Secrets
    ↓
Performs blockchain operations
    ↓
Returns result to client
```

---

## 🛡️ Security Best Practices

### ✅ DO

- Store **private keys** only in Supabase Secrets
- Use `.env.local` for Next.js public variables
- Keep `.env.local` in `.gitignore`
- Use different accounts for testnet vs mainnet
- Rotate keys regularly
- Use environment-specific credentials

### ❌ DON'T

- Put private keys in `.env.local`
- Commit `.env.local` to git
- Use `NEXT_PUBLIC_` prefix for sensitive data
- Share your operator private key
- Use production keys in development
- Hardcode credentials in code

---

## 📝 Setup Checklist

### For Next.js App

- [ ] Copy `.env.example` to `.env.local`
- [ ] Add Supabase URL
- [ ] Add Supabase anon key
- [ ] Set app URL (`localhost:3000` for dev)
- [ ] Set Hedera network (`testnet` for dev)
- [ ] Set Hedera mirror node URL

### For Edge Functions

- [ ] Install Supabase CLI (`npm install -g supabase`)
- [ ] Login to Supabase (`supabase login`)
- [ ] Link project (`supabase link --project-ref YOUR_REF`)
- [ ] Set `HEDERA_NETWORK` secret
- [ ] Set `HEDERA_ACCOUNT_ID` secret
- [ ] Set `HEDERA_PRIVATE_KEY` secret
- [ ] Deploy functions (`supabase functions deploy`)
- [ ] Test functions work

---

## 🚀 Quick Start Commands

```bash
# 1. Setup Next.js environment
cp .env.example .env.local
# Edit .env.local with your values

# 2. Setup Edge Functions
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set HEDERA_NETWORK=testnet
supabase secrets set HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
supabase secrets set HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY

# 3. Deploy Edge Functions
supabase functions deploy

# 4. Start development server
npm run dev
```

---

## ❓ FAQ

### Q: Why do I need to set HEDERA_NETWORK twice?

**A:** They serve different purposes:
- `NEXT_PUBLIC_HEDERA_NETWORK` (client): For display (showing "Testnet" in UI)
- `HEDERA_NETWORK` (server): For actual blockchain operations

### Q: Can I see Edge Function secrets in my browser?

**A:** No! That's the point. Edge Function secrets are **only accessible server-side** and never sent to the browser.

### Q: What happens if I put my private key in .env.local?

**A:** 🚨 **DANGEROUS!** Your private key would be:
- Embedded in the browser bundle
- Visible to anyone inspecting your site
- Potentially committed to git
- **NEVER do this!**

### Q: How do I use different keys for development and production?

**A:** Set different Supabase secrets for each environment:
- Dev: Use testnet account with limited funds
- Prod: Use mainnet account with proper security

### Q: Can I test Edge Functions locally?

**A:** Yes! Use Supabase CLI:
```bash
supabase functions serve
```
Then set local environment variables in `supabase/.env.local`

---

## 📚 Related Documentation

- [Environment Setup Guide](./ENVIRONMENT_SETUP.md)
- [Edge Functions Setup](./EDGE_FUNCTIONS_SETUP.md)
- [Private Key Management](./PRIVATE_KEY_MANAGEMENT.md)
- [Hedera Integration](./HEDERA_INTEGRATION.md)

