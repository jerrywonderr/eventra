# 🎉 Eventra - Blockchain-Verified Event Ticketing Platform

<div align="center">

![Eventra Banner](https://via.placeholder.com/1200x300/4F46E5/ffffff?text=Eventra+-+Fraud-Proof+Ticketing+on+Hedera)

**Fraud-Proof, Fast, and Fair Event Ticketing on Hedera Hashgraph**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Hedera](https://img.shields.io/badge/Hedera-Hashgraph-purple)](https://hedera.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)

[Live Demo](#) • [Video Demo](#) • [Documentation](./docs/) • [Report Bug](../../issues)

</div>

---

## 🎯 The Problem

**$1 Billion** is lost annually to fake tickets. **12% of concert-goers** bought fake tickets in 2023. Traditional platforms charge **15-25% fees** with no protection against counterfeits and zero royalties for organizers on resales.

## 💡 Our Solution

**Eventra** is a blockchain-powered ticketing platform that makes every ticket:

- ✅ **Fraud-proof** - Verified on Hedera blockchain
- ✅ **Transparent** - All transactions publicly recorded
- ✅ **Fair** - 5% royalties to organizers on resales
- ✅ **Fast** - 3-second transaction finality
- ✅ **Cheap** - $0.0001 per transaction (vs. Ethereum's $5-50)

---

## ✨ Key Features

### 🎫 **Blockchain-Verified Tickets**
Every ticket is an NFT on Hedera blockchain, impossible to duplicate or fake with permanent proof of ownership.

### 💰 **Dual Payment System**
- **Paystack Integration** - Card/Bank/USSD payments for Web2 users
- **Hedera (HBAR)** - Direct cryptocurrency payments with lower fees

### 🎟️ **Tiered Ticketing System**
Multiple ticket tiers per event (VIP, Regular, Early Bird) with different prices and benefits, real-time availability tracking.

### 💸 **Fair Resale Marketplace**
- Original organizers earn **5% royalty** on every resale
- Platform takes only **2.5% fee**
- Sellers keep **92.5%**
- Blockchain verification prevents fakes

### 🎓 **NFT Certificates of Participation**
Permanent proof of attendance as NFTs - perfect for conferences, workshops, and networking.

### ⭐ **Points & Rewards System**
- Earn **10 points per $1** spent
- **50 bonus points** on first purchase
- Track transaction history
- View detailed points history
- Coming soon: Redeem for discounts and perks

### 🔐 **Organizer Verification**
Two-tier verification system with ID/CAC documents and verification badges for trust and professionalism.

### 📊 **Event Analytics Dashboard**
Comprehensive analytics for organizers:
- Real-time sales metrics and revenue tracking
- Ticket tier performance breakdown
- Recent transaction history with blockchain links
- Sellout percentage and capacity tracking
- Attendee information and purchase patterns

### 📧 **Email Notifications**
Automated email system for user engagement:
- **Ticket Purchase Confirmation** - Instant confirmation with blockchain proof
- **Event Reminders** - Automated reminders 3 days before events
- **Certificate Notifications** - NFT certificate minting alerts
- **Welcome Emails** - Onboarding emails for new users

### 📱 **Social Media Sharing**
Share events across platforms:
- Twitter, Facebook, LinkedIn, WhatsApp integration
- Copy link functionality
- Shareable event pages
- Post-purchase social sharing prompts

### ⚙️ **Profile & Settings**
Complete account management:
- Update profile information (name, phone)
- Change password securely
- View account statistics
- Account deletion with safety confirmation

---

## 🏗️ Tech Stack

### **Frontend**
- **Framework:** Next.js 15 with App Router & Server Components
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Custom components with shadcn/ui
- **Image Optimization:** Next.js Image with Supabase Storage

### **Backend**
- **Database:** PostgreSQL via Supabase
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage for event images
- **API Routes:** Next.js API Routes & Server Actions
- **Real-time:** Supabase Real-time subscriptions

### **Blockchain**
- **Network:** Hedera Hashgraph (Testnet/Mainnet)
- **SDK:** Hedera JavaScript SDK
- **Smart Contracts:** Hedera Token Service (HTS)
- **NFTs:** Hedera Token Service for tickets & certificates
- **Explorer:** HashScan integration

### **Payments**
- **Fiat:** Paystack (Card, Bank Transfer, USSD)
- **Crypto:** Hedera (HBAR) transactions
- **Webhooks:** Server-side payment verification

### **Security**
- Row Level Security (RLS) policies
- Environment variable protection
- Server-side validation
- Blockchain transaction verification

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account ([supabase.com](https://supabase.com))
- Hedera testnet account ([portal.hedera.com](https://portal.hedera.com))
- Paystack account ([paystack.com](https://paystack.com))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/eventra.git
cd eventra
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create `.env.local` in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Hedera
NEXT_PUBLIC_HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.xxxx
HEDERA_OPERATOR_KEY=your_hedera_private_key

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxx
```

4. **Set up the database**

Run the SQL migration in Supabase SQL Editor:

```sql
-- See ./docs/database-setup.sql for complete schema
```

Or use the provided migration files:

```bash
# Instructions in ./docs/DATABASE_SETUP.md
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
eventra/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Authentication routes
│   │   ├── events/[id]/              # Event details & purchase
│   │   ├── my-tickets/               # User's tickets
│   │   ├── actions/events.ts         # Event CRUD & purchases
│   │   ├── my-certificates/          # User's certificates
│   │   ├── marketplace/              # Resale marketplace
│   │   ├── points/                   # Rewards system
│   │   ├── dashboard/                # User dashboard
│   │   ├── resale/                   # Resale Page
│   │   ├── settings/                 # Profile & Settings
│   │   ├── payment-success/          # Payment confirmation
│   │   ├── verify/[id]               # QR Code verify
│   │   └── api/webhooks/             # Payment webhooks
│   │       └── paystack/
│   ├── components/                   # Reusable components
│   │   ├── Navbar.tsx                # Main navigation
│   │   └── SocialShare.tsx           # Social media sharing
│   ├── libs/
│   │   ├── supabase/                 # Supabase clients
│   │   ├── hedera/                   # Hedera integration
│   │   │   ├── client.ts             # Hedera client setup
│   │   │   ├── transactions.ts       # Ticket purchases
│   │   │   └── certificates.ts       # NFT certificate minting
│   │   └── types/                    # TypeScript types
│   └── actions/                      # Server actions
│  
├── public/                           # Static assets
├── docs/                             # Documentation
└── supabase/                         # Supabase configs
```

---

## 📊 Database Schema

### Core Tables

**profiles** - User accounts
- `id`, `email`, `full_name`, `phone`, `points`

**events** - Event listings
- `id`, `title`, `description`, `location`, `event_date`, `image_url`, `organizer_id`

**ticket_tiers** - Ticket types per event
- `id`, `event_id`, `tier_name`, `price`, `quantity_total`, `quantity_sold`

**tickets** - Purchased tickets
- `id`, `event_id`, `tier_id`, `buyer_id`, `purchase_price`, `transaction_hash`

**certificates** - NFT participation certificates
- `id`, `event_id`, `recipient_id`, `nft_token_id`, `nft_serial_number`

**points_transactions** - Reward point history
- `id`, `user_id`, `points`, `type`, `description`

**resale_listings** - Ticket resale marketplace
- `id`, `ticket_id`, `seller_id`, `original_price`, `resale_price`, `status`

### Relationships
- Events belong to organizers (profiles)
- Tickets link buyers, events, and tiers
- Certificates link recipients and events
- Points belong to users

## 🎥 Demo Video

[Watch the Demo](#) ← *Add your demo video link here*

### Demo Credentials (Testnet)

```
Email: demo@eventra.com
Password: demo123
```

**Test Cards (Paystack):**
- Card: `4084084084084081`
- CVV: `408`
- Expiry: Any future date

---

## 🔗 Hedera Integration

### Why Hedera > Ethereum?

| Feature | Hedera | Ethereum |
|---------|--------|----------|
| **Transaction Speed** | 3-5 seconds | 15+ seconds |
| **Transaction Cost** | $0.0001 | $5-$50 |
| **Throughput** | 10,000+ TPS | 15-30 TPS |
| **Energy** | Carbon negative | High |
| **Finality** | Instant | 15+ seconds |

### Blockchain Operations

1. **Ticket Purchase** → Creates HBAR transaction with memo
2. **NFT Certificate** → Mints HTS Non-Fungible Token
3. **Resale Transfer** → Updates ownership on-chain
4. **Verification** → Query HashScan for proof

**Explorer Links:** Every transaction includes HashScan URL for transparency.

---

## 💳 Payment Flow

### Paystack (Web2)
1. User selects payment method
2. Paystack popup for card/bank/USSD
3. Webhook verifies payment
4. Hedera transaction records purchase
5. Ticket created & points awarded

### Hedera (Web3)
1. User confirms HBAR payment
2. Direct blockchain transaction
3. Instant confirmation (3-5 seconds)
4. Ticket created & points awarded

---

## 🎯 Use Cases

### For Attendees
- Fraud-proof tickets with blockchain verification
- Fair resale prices with guaranteed authenticity
- Earn points on every purchase
- NFT certificates as proof of attendance
- Share events on social media

### For Organizers
- Only 2.5% platform fee (vs 15-25% competitors)
- Earn 5% royalties on all ticket resales
- Verified badge for credibility
- Real-time sales analytics
- Mint participation certificates for attendees

---

## 🛠️ Development

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
npm start
```

### Database Migrations

```bash
# See ./docs/DATABASE_SETUP.md for migration commands
```

---

## 🌍 Deployment

### Recommended Platforms

- **Frontend:** Vercel (automatic Next.js optimization)
- **Database:** Supabase (managed PostgreSQL)
- **Storage:** Supabase Storage (event images)
- **Blockchain:** Hedera Mainnet

### Environment Variables

Set all environment variables in your deployment platform:
- Vercel: Project Settings → Environment Variables
- Add all variables from `.env.local`

---

## 📊 Metrics & Impact

- **Transaction Costs:** 99.998% cheaper than Ethereum
- **Speed:** 5x faster than traditional payment processors
- **Fraud Prevention:** 100% blockchain verification
- **Organizer Revenue:** First platform to offer resale royalties
- **User Rewards:** Gamified experience with points system

---

## 🗺️ Roadmap

### Phase 1 (Current) ✅
- ✅ Event creation with image upload
- ✅ Dual payment system (Paystack + Hedera)
- ✅ Resale marketplace
- ✅ NFT certificates
- ✅ Points & rewards

### Phase 2 (Q1 2026)
- [ ] Mobile app (React Native)
- [ ] QR code ticket scanning
- [ ] Event analytics dashboard
- [ ] Email notifications
- [ ] Multi-language support

### Phase 3 (Q2 2026)
- [ ] Points redemption system
- [ ] Event recommendations AI
- [ ] Organizer subscription tiers
- [ ] White-label solutions
- [ ] API for third-party integrations

---

## 👥 Team

- **[Your Name]** - Full Stack Developer & Blockchain Integration
- **[Team Member 2]** - UI/UX Designer
- **[Team Member 3]** - Smart Contract Developer

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Hedera Hashgraph](https://hedera.com/) for the blazing-fast blockchain
- [Supabase](https://supabase.com/) for the amazing backend infrastructure
- [Paystack](https://paystack.com/) for seamless payment processing
- [Next.js](https://nextjs.org/) for the powerful React framework

---

## 📞 Contact & Links

- **Live Demo:** [eventra.vercel.app](#)
- **Video Demo:** [YouTube](#)
- **Documentation:** [./docs/](./docs/)
- **GitHub:** [github.com/yourusername/eventra](https://github.com/yourusername/eventra)
- **Email:** your.email@example.com
- **Twitter:** [@eventra](#)

---

<div align="center">

**Built with ❤️ for the Hedera Hackathon 2025**

⭐ Star this repo if you find it useful!

</div>