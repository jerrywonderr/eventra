# Supabase Edge Functions Setup Guide

This guide explains how to deploy and configure the Supabase Edge Functions for secure Hedera blockchain operations.

## 🔒 Security Overview

The Edge Functions provide a secure way to handle blockchain operations:

- **No Private Keys on Client**: All sensitive operations happen server-side
- **Authentication Required**: All functions verify user identity
- **Secure Environment**: Private keys stored in Supabase secrets
- **CORS Protection**: Proper CORS headers for web requests

## 📁 Edge Functions Structure

```
supabase/functions/
├── create-hedera-account/
│   └── index.ts
├── create-event-token/
│   └── index.ts
└── mint-ticket/
    └── index.ts
```

## 🚀 Deployment

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link Your Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 4. Deploy Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individual functions
supabase functions deploy create-hedera-account
supabase functions deploy create-event-token
supabase functions deploy mint-ticket
```

### 5. Set Environment Variables

Set the following secrets in your Supabase project:

```bash
# Required for Hedera operations
supabase secrets set HEDERA_NETWORK=testnet
supabase secrets set HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
supabase secrets set HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY

# These are automatically available
# SUPABASE_URL (auto-injected)
# SUPABASE_SERVICE_ROLE_KEY (auto-injected)
```

## 🔧 Configuration

### Environment Variables

| Variable             | Description                      | Example                               |
| -------------------- | -------------------------------- | ------------------------------------- |
| `HEDERA_NETWORK`     | Hedera network to use            | `testnet`, `mainnet`, `previewnet`    |
| `HEDERA_ACCOUNT_ID`  | Your Hedera operator account ID  | `0.0.123456`                          |
| `HEDERA_PRIVATE_KEY` | Your Hedera operator private key | `302e020100300506032b657004220420...` |

### Function Endpoints

After deployment, your functions will be available at:

```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/
├── create-hedera-account
├── create-event-token
└── mint-ticket
```

## 📋 Function Details

### 1. create-hedera-account

**Purpose**: Creates a new Hedera account for a user

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

**Security**:

- Verifies user authentication
- Ensures user can only create account for themselves
- Checks if account already exists
- Stores only account ID (not private key)

### 2. create-event-token

**Purpose**: Creates an NFT token for an event

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

**Security**:

- Verifies user is the event organizer
- Checks if event already has a token
- Creates token on Hedera blockchain
- Updates database with token ID

### 3. mint-ticket

**Purpose**: Mints a ticket NFT for a user

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

**Security**:

- Verifies user is buying ticket for themselves
- Checks event exists and has token
- Verifies tickets are available
- Associates token with buyer's account
- Mints NFT on blockchain
- Updates database records

## 🧪 Testing

### Test Function Deployment

```bash
# Test with curl
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-hedera-account' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"userId":"user-id","email":"user@example.com"}'
```

### Test from Frontend

```typescript
import { createClient } from "@/libs/supabase/client";

const supabase = createClient();

// Test account creation
const response = await supabase.functions.invoke("create-hedera-account", {
  body: {
    userId: "user-id",
    email: "user@example.com",
  },
});

console.log(response.data);
```

## 🔍 Monitoring

### View Function Logs

```bash
# View logs for all functions
supabase functions logs

# View logs for specific function
supabase functions logs create-hedera-account
```

### Monitor in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to "Edge Functions"
3. View function metrics and logs
4. Monitor error rates and performance

## 🛡️ Security Best Practices

### 1. Environment Variables

- Never commit private keys to version control
- Use Supabase secrets for sensitive data
- Rotate keys regularly
- Use different accounts for development/production

### 2. Authentication

- Always verify user authentication
- Check user permissions for operations
- Validate input data
- Handle errors gracefully

### 3. Database Security

- Use Row Level Security (RLS) policies
- Validate user ownership of resources
- Sanitize all inputs
- Use parameterized queries

### 4. CORS Configuration

- Configure proper CORS headers
- Restrict origins in production
- Handle preflight requests
- Validate request methods

## 🚨 Troubleshooting

### Common Issues

1. **Function Not Found**

   - Check function deployment status
   - Verify function name in URL
   - Ensure project is linked correctly

2. **Authentication Errors**

   - Verify JWT token is valid
   - Check user authentication status
   - Ensure proper Authorization header

3. **Hedera Connection Errors**

   - Verify network configuration
   - Check account ID and private key
   - Ensure sufficient HBAR balance

4. **Database Errors**
   - Check RLS policies
   - Verify table permissions
   - Validate data constraints

### Debug Mode

Enable debug logging by setting:

```bash
supabase secrets set DEBUG=true
```

## 📚 Additional Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Hedera SDK Documentation](https://docs.hedera.com/hedera/sdks-and-apis/sdks)
- [TypeScript Deno Runtime](https://deno.land/manual/typescript/overview)

## 🔄 Updates and Maintenance

### Update Functions

```bash
# Deploy updated functions
supabase functions deploy

# Deploy specific function
supabase functions deploy create-hedera-account
```

### Monitor Performance

- Check function execution times
- Monitor memory usage
- Track error rates
- Review logs regularly

---

**Your Edge Functions are now securely deployed and ready to handle blockchain operations! 🚀**
