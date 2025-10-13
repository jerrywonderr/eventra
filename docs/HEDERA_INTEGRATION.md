# Hedera Integration Guide

This guide explains how to use the **secure** Hedera blockchain integration in Eventra for NFT-based event tickets using Supabase Edge Functions.

## 📚 Table of Contents

1. [Overview](#overview)
2. [Security Architecture](#security-architecture)
3. [Setup](#setup)
4. [Database Schema](#database-schema)
5. [Edge Functions](#edge-functions)
6. [Client Services](#client-services)
7. [React Query Hooks](#react-query-hooks)
8. [Usage Examples](#usage-examples)
9. [API Reference](#api-reference)
10. [Testing](#testing)

---

## Overview

Eventra integrates with Hedera Hashgraph to provide:

- **NFT Tickets**: Each event ticket is a unique NFT on Hedera
- **Secure Ownership**: Blockchain-verified ticket ownership
- **Server-Side Security**: All blockchain operations via Edge Functions
- **No Private Key Exposure**: Private keys never leave the server
- **Optional Setup**: Hedera account setup after signup
- **Fast & Low-Cost**: Leverage Hedera's high throughput and low fees

## Security Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │ Supabase Edge   │    │    Hedera       │
│                 │    │    Functions    │    │                 │
│ • UI Components │◄──►│                 │◄──►│ • NFT Tokens    │
│ • Secure API    │    │ • Private Keys  │    │ • Transactions  │
│ • No Sensitive  │    │ • Blockchain    │    │ • Account Mgmt  │
│   Data          │    │   Operations    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔒 Security Features

- **Server-Side Operations**: All blockchain operations happen in Edge Functions
- **No Private Key Storage**: Private keys stored securely in Supabase secrets
- **No Client-Side Keys**: User private keys are never stored in the database
- **Authentication Required**: All operations require valid JWT tokens
- **User Authorization**: Users can only operate on their own data
- **Required Account Setup**: Users are reminded to complete account setup for full access

### ⚠️ Important: Private Key Management

**We do NOT store user private keys in the database** for security reasons. This means:

- ✅ **Maximum Security**: No private key exposure
- ✅ **Server-Controlled**: All operations via Edge Functions
- ❌ **Limited User Control**: Users can't sign transactions directly
- ❌ **No Wallet Integration**: Can't connect HashPack/other wallets

### 📋 User Flow

1. **Signup**: Users sign up normally (no blockchain required)
2. **Dashboard Access**: Users can access dashboard immediately
3. **Persistent Reminder**: Users see setup reminder on all dashboard pages
4. **Account Setup**: Users complete setup in Settings when ready
5. **Full Access**: After setup, users can access all platform features

For more details, see [Private Key Management Guide](PRIVATE_KEY_MANAGEMENT.md).

---

## Setup

### 1. Install Dependencies

The Hedera SDK is already installed:

```bash
npm install @hashgraph/sdk
```

### 2. Environment Variables

**Client-side** (`.env.local`):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Server-side** (Supabase secrets):

```bash
# Set these in Supabase project secrets
supabase secrets set HEDERA_NETWORK=testnet
supabase secrets set HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
supabase secrets set HEDERA_PRIVATE_KEY=your_private_key_here
```

### 3. Database Setup

Run the SQL schema in your Supabase SQL editor:

```bash
# Copy the contents of supabase-schema.sql and run in Supabase
```

### 4. Deploy Edge Functions

```bash
# Deploy all Edge Functions
supabase functions deploy

# Or deploy individually
supabase functions deploy create-hedera-account
supabase functions deploy create-event-token
supabase functions deploy mint-ticket
```

### 5. Test the Integration

1. Sign up for a new account
2. Go to `/dashboard/settings`
3. Click "Create Blockchain Account" to set up Hedera
4. Create events and purchase tickets

---

## Database Schema

### Tables Created

1. **`users`** - User profiles with Hedera account IDs
2. **`events`** - Events with associated NFT token IDs
3. **`tickets`** - NFT tickets with serial numbers
4. **`transactions`** - Blockchain transaction records

### Key Relationships

```
users (1) ──► (many) events (as organizer)
users (1) ──► (many) tickets (as owner)
events (1) ──► (many) tickets
events (1) ──► (many) transactions
```

### Row Level Security

All tables have RLS enabled with appropriate policies:

- Users can only access their own data
- Events are publicly readable
- Tickets are private to owners
- Transactions are private to buyers

---

## Edge Functions

The secure server-side blockchain operations are handled by Supabase Edge Functions:

### 1. create-hedera-account

**Purpose**: Creates a new Hedera account for a user

**Location**: `supabase/functions/create-hedera-account/`

**Request**:

```typescript
{
  userId: string;
  email: string;
}
```

**Response**:

```typescript
{
  success: boolean;
  accountId: string;
  message: string;
}
```

### 2. create-event-token

**Purpose**: Creates an NFT token for an event

**Location**: `supabase/functions/create-event-token/`

**Request**:

```typescript
{
  eventId: string;
  eventName: string;
  maxTickets: number;
  organizerId: string;
}
```

**Response**:

```typescript
{
  success: boolean;
  tokenId: string;
  eventId: string;
  totalSupply: number;
  maxSupply: number;
  name: string;
  symbol: string;
}
```

### 3. mint-ticket

**Purpose**: Mints a ticket NFT for a user

**Location**: `supabase/functions/mint-ticket/`

**Request**:

```typescript
{
  eventId: string;
  buyerId: string;
  metadata: {
    eventName: string;
    eventDate: string;
    seatNumber?: string;
    tier: string;
  };
}
```

**Response**:

```typescript
{
  success: boolean;
  ticket: {
    id: string;
    serialNumber: number;
    tokenId: string;
    eventId: string;
    ownerId: string;
    metadata: object;
  }
}
```

---

## Client Services

### HederaClientService

Secure client-side service that calls Edge Functions:

```typescript
import { hederaClientService } from "@/libs/services";

// Create Hedera account (calls Edge Function)
const account = await hederaClientService.createHederaAccount();

// Create event token (calls Edge Function)
const token = await hederaClientService.createEventToken(
  "event-123",
  "Concert",
  100
);

// Mint ticket NFT (calls Edge Function)
const ticket = await hederaClientService.mintTicket("event-123", {
  eventName: "Concert",
  eventDate: "2025-07-15",
  tier: "VIP",
});

// Check if user has Hedera account
const hasAccount = await hederaClientService.hasHederaAccount();

// Get user's Hedera account ID
const accountId = await hederaClientService.getHederaAccountId();
```

---

## React Query Hooks

### Secure Hedera Hooks

```typescript
import {
  useCreateHederaAccountSecure,
  useCreateEventTokenSecure,
  useMintTicketSecure,
  useHasHederaAccount,
  useHederaAccountId,
} from "@/libs/hooks";

function HederaAccountSetup() {
  const createAccount = useCreateHederaAccountSecure();
  const { data: hasAccount } = useHasHederaAccount();
  const { data: accountId } = useHederaAccountId();

  const handleCreateAccount = () => {
    createAccount.mutate();
  };

  if (hasAccount) {
    return <div>Account ready: {accountId}</div>;
  }

  return (
    <button onClick={handleCreateAccount}>Create Blockchain Account</button>
  );
}
```

### Supabase Hooks

```typescript
import {
  useCreateEvent,
  usePurchaseTicket,
  useUserTickets,
  useUserEvents,
} from "@/libs/hooks";

function EventManager() {
  const createEvent = useCreateEvent();
  const userEvents = useUserEvents(userId);
  const userTickets = useUserTickets(userId);

  // Component logic...
}
```

---

## Usage Examples

### 1. User Signs Up (No Blockchain Required)

```typescript
// Normal Supabase auth signup - no blockchain required
function SignupForm() {
  const handleSignup = async (userData) => {
    // Standard Supabase signup
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    // User can access dashboard immediately
    // Will see persistent reminder to complete account setup
  };
}
```

### 2. Set Up Hedera Account (Optional)

```typescript
import { useCreateHederaAccountSecure } from "@/libs/hooks";

function HederaSetup() {
  const createAccount = useCreateHederaAccountSecure();

  const handleSetup = async () => {
    // This securely creates a Hedera account via Edge Function
    // No private keys exposed to client
    await createAccount.mutateAsync();
  };

  return <button onClick={handleSetup}>Create Blockchain Account</button>;
}
```

### 3. Create an Event

```typescript
import { useCreateEvent, useCreateEventTokenSecure } from "@/libs/hooks";

function CreateEventForm() {
  const createEvent = useCreateEvent();
  const createToken = useCreateEventTokenSecure();

  const handleCreateEvent = async (eventData) => {
    // 1. Create event in database
    const event = await createEvent.mutateAsync({
      title: "Summer Festival",
      description: "Amazing music festival",
      date: "2025-07-15T18:00:00Z",
      location: "Central Park",
      price: 99.99,
      currency: "USD",
      category: "Music",
      maxTickets: 1000,
      organizerId: userId,
    });

    // 2. Create Hedera NFT token (secure Edge Function call)
    await createToken.mutateAsync({
      eventId: event.id,
      eventName: event.title,
      maxTickets: event.maxTickets,
    });
  };
}
```

### 4. Purchase a Ticket

```typescript
import { useMintTicketSecure } from "@/libs/hooks";

function EventCard({ event }) {
  const mintTicket = useMintTicketSecure();

  const handlePurchase = async () => {
    // This securely mints NFT via Edge Function:
    // 1. Associates token with buyer's account
    // 2. Mints NFT ticket on Hedera
    // 3. Creates ticket record in database
    // 4. Updates event availability
    // 5. Records transaction
    await mintTicket.mutateAsync({
      eventId: event.id,
      metadata: {
        eventName: event.title,
        eventDate: event.date,
        tier: "General",
      },
    });
  };

  return (
    <div>
      <h3>{event.title}</h3>
      <p>${event.price}</p>
      <button onClick={handlePurchase}>Buy Ticket (Creates NFT)</button>
    </div>
  );
}
```

### 4. View User's Tickets

```typescript
import { useUserTickets } from "@/libs/hooks";

function MyTickets() {
  const { data: tickets, isLoading } = useUserTickets(userId);

  if (isLoading) return <div>Loading tickets...</div>;

  return (
    <div>
      <h2>My NFT Tickets</h2>
      {tickets?.map((ticket) => (
        <div key={ticket.id}>
          <h3>Ticket #{ticket.serialNumber}</h3>
          <p>Token ID: {ticket.tokenId}</p>
          <p>Status: {ticket.status}</p>
          <p>Event: {ticket.eventId}</p>
        </div>
      ))}
    </div>
  );
}
```

### 5. Transfer a Ticket

```typescript
import { useTransferTicket } from "@/libs/hooks";

function TicketTransfer({ ticketId, fromUserId, toUserId }) {
  const transferTicket = useTransferTicket();

  const handleTransfer = async () => {
    // This automatically:
    // 1. Transfers NFT on Hedera
    // 2. Updates ownership in database
    // 3. Updates ticket status
    await transferTicket.mutateAsync({
      ticketId,
      fromUserId,
      toUserId,
    });
  };

  return <button onClick={handleTransfer}>Transfer Ticket</button>;
}
```

---

## API Reference

### HederaService Methods

| Method                        | Description                  | Parameters                                                | Returns             |
| ----------------------------- | ---------------------------- | --------------------------------------------------------- | ------------------- |
| `createUserAccount()`         | Create new Hedera account    | None                                                      | `HederaAccount`     |
| `createEventToken()`          | Create NFT token for event   | `eventId`, `eventName`, `maxTickets`                      | `EventToken`        |
| `mintTicketNFT()`             | Mint ticket NFT              | `tokenId`, `eventId`, `buyerAccountId`, `metadata`        | `TicketNFT`         |
| `transferTicket()`            | Transfer ticket NFT          | `tokenId`, `serialNumber`, `fromAccountId`, `toAccountId` | `HederaTransaction` |
| `getAccountBalance()`         | Get account balance          | `accountId`                                               | `{hbar, tokens[]}`  |
| `getTokenInfo()`              | Get token information        | `tokenId`                                                 | `TokenInfo`         |
| `associateTokenWithAccount()` | Associate token with account | `tokenId`, `accountId`, `privateKey`                      | `HederaTransaction` |
| `fundAccount()`               | Fund account with HBAR       | `accountId`, `amount`                                     | `HederaTransaction` |

### SupabaseService Methods

| Method                          | Description                     | Parameters                           | Returns         |
| ------------------------------- | ------------------------------- | ------------------------------------ | --------------- |
| `createUserWithHederaAccount()` | Create user with Hedera account | `CreateUserData`                     | `User`          |
| `getUser()`                     | Get user by ID                  | `userId`                             | `User \| null`  |
| `createEventWithToken()`        | Create event with NFT token     | `CreateEventData`                    | `Event`         |
| `getEvents()`                   | Get events with pagination      | `page`, `limit`                      | `Event[]`       |
| `getEvent()`                    | Get event by ID                 | `eventId`                            | `Event \| null` |
| `purchaseTicket()`              | Purchase ticket (creates NFT)   | `CreateTicketData`                   | `Ticket`        |
| `getUserTickets()`              | Get user's tickets              | `userId`                             | `Ticket[]`      |
| `getUserEvents()`               | Get user's events               | `userId`                             | `Event[]`       |
| `transferTicket()`              | Transfer ticket to another user | `ticketId`, `fromUserId`, `toUserId` | `void`          |

### React Query Hooks

#### Hedera Hooks

| Hook                       | Description           | Parameters                                            | Returns                        |
| -------------------------- | --------------------- | ----------------------------------------------------- | ------------------------------ |
| `useCreateHederaAccount()` | Create Hedera account | None                                                  | `Mutation`                     |
| `useCreateEventToken()`    | Create event token    | `{eventId, eventName, maxTickets}`                    | `Mutation`                     |
| `useMintTicketNFT()`       | Mint ticket NFT       | `{tokenId, eventId, buyerAccountId, metadata}`        | `Mutation`                     |
| `useTransferTicket()`      | Transfer ticket       | `{tokenId, serialNumber, fromAccountId, toAccountId}` | `Mutation`                     |
| `useAccountBalance()`      | Get account balance   | `accountId`                                           | `Query`                        |
| `useTokenInfo()`           | Get token info        | `tokenId`                                             | `Query`                        |
| `useAssociateToken()`      | Associate token       | `{tokenId, accountId, privateKey}`                    | `Mutation`                     |
| `useFundAccount()`         | Fund account          | `{toAccountId, amount}`                               | `Mutation`                     |
| `useHederaNetwork()`       | Get network info      | None                                                  | `{network, operatorAccountId}` |

#### Supabase Hooks

| Hook                        | Description             | Parameters                         | Returns    |
| --------------------------- | ----------------------- | ---------------------------------- | ---------- |
| `useCreateUserWithHedera()` | Create user with Hedera | `CreateUserData`                   | `Mutation` |
| `useUser()`                 | Get user                | `userId`                           | `Query`    |
| `useCreateEvent()`          | Create event            | `CreateEventData`                  | `Mutation` |
| `useEvents()`               | Get events              | `page`, `limit`                    | `Query`    |
| `useEvent()`                | Get event               | `eventId`                          | `Query`    |
| `usePurchaseTicket()`       | Purchase ticket         | `CreateTicketData`                 | `Mutation` |
| `useUserTickets()`          | Get user tickets        | `userId`                           | `Query`    |
| `useUserEvents()`           | Get user events         | `userId`                           | `Query`    |
| `useTransferTicket()`       | Transfer ticket         | `{ticketId, fromUserId, toUserId}` | `Mutation` |

---

## Testing

### 1. Test Account Creation

```typescript
// Test creating a Hedera account
const account = await hederaService.createUserAccount();
console.log("Account created:", account.accountId);
```

### 2. Test Event Token Creation

```typescript
// Test creating an event token
const token = await hederaService.createEventToken(
  "test-event-123",
  "Test Concert",
  100
);
console.log("Token created:", token.tokenId);
```

### 3. Test Ticket Minting

```typescript
// Test minting a ticket NFT
const ticket = await hederaService.mintTicketNFT(
  token.tokenId,
  "test-event-123",
  account.accountId,
  {
    eventName: "Test Concert",
    eventDate: "2025-07-15",
    tier: "VIP",
  }
);
console.log("Ticket minted:", ticket.serialNumber);
```

### 4. Test Database Integration

```typescript
// Test creating user with Hedera account
const user = await supabaseService.createUserWithHederaAccount({
  id: "test-user-123",
  email: "test@example.com",
  fullName: "Test User",
});
console.log("User created with Hedera account:", user.hederaAccountId);
```

### 5. Test Complete Flow

```typescript
// Test complete event creation and ticket purchase flow
const user = await supabaseService.createUserWithHederaAccount({
  id: "test-user-123",
  email: "test@example.com",
  fullName: "Test User",
});

const event = await supabaseService.createEventWithToken({
  title: "Test Concert",
  description: "A test concert",
  date: "2025-07-15T18:00:00Z",
  location: "Test Venue",
  price: 99.99,
  currency: "USD",
  category: "Music",
  maxTickets: 100,
  organizerId: user.id,
});

const ticket = await supabaseService.purchaseTicket({
  eventId: event.id,
  ownerId: user.id,
  price: event.price,
  metadata: {
    eventName: event.title,
    eventDate: event.date,
    tier: "General",
  },
});

console.log("Complete flow successful!");
console.log("Event:", event.title);
console.log("Ticket:", ticket.serialNumber);
```

---

## Troubleshooting

### Common Issues

1. **"Invalid Account ID" Error**

   - Verify your account ID format: `0.0.xxxxx`
   - Ensure the account exists on the correct network
   - Check that you've selected the right network (testnet/mainnet)

2. **"Insufficient Balance" Error**

   - Fund your testnet account using the faucet
   - Wait a few seconds for the transaction to process
   - Verify balance on HashScan

3. **"Token Association Failed" Error**

   - The token might already be associated
   - Check if the account has enough HBAR for fees
   - Verify the token ID is correct

4. **"Transaction Failed" Error**
   - Check the transaction on HashScan
   - Verify all parameters are correct
   - Ensure the account has sufficient HBAR

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
```

This will log all Hedera operations to the console.

---

## Security Considerations

1. **Private Key Storage**

   - Never store private keys in plain text
   - Use encryption for production storage
   - Consider using Hedera wallet integration

2. **Environment Variables**

   - Keep private keys in server-side environment variables
   - Use different accounts for development and production
   - Rotate keys regularly

3. **Access Control**

   - Implement proper RLS policies
   - Validate user permissions before operations
   - Use HTTPS in production

4. **Error Handling**
   - Never expose sensitive error messages
   - Log errors securely
   - Implement proper fallbacks

---

## Next Steps

1. **Implement Wallet Integration**

   - Connect with HashPack wallet
   - Support multiple wallet providers
   - Implement wallet-based authentication

2. **Add Advanced Features**

   - Ticket resale marketplace
   - Event analytics
   - Revenue sharing
   - Multi-signature transactions

3. **Optimize Performance**

   - Implement caching strategies
   - Use batch operations
   - Optimize database queries

4. **Enhance Security**
   - Implement proper key management
   - Add audit logging
   - Implement rate limiting

---

## Resources

- [Hedera Documentation](https://docs.hedera.com)
- [Hedera SDK Reference](https://docs.hedera.com/hedera/sdks-and-apis/sdks)
- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)

---

**Happy building with Hedera! 🚀**
