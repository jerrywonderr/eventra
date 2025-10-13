# Environment Setup Guide

This guide will help you set up the required environment variables for Eventra.

## Environment Variables

Eventra requires specific environment variables to connect to the Hedera network and configure the application.

### Creating Your Environment File

1. Create a `.env.local` file in the root directory of your project:

   ```bash
   touch .env.local
   ```

2. Add the following variables to your `.env.local` file:

```bash
# Supabase Configuration (Required for Authentication)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Hedera Network Configuration
# Options: 'testnet', 'mainnet', 'previewnet'
NEXT_PUBLIC_HEDERA_NETWORK=testnet

# Your Hedera Account ID (format: 0.0.xxxxx)
NEXT_PUBLIC_HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID

# Your Hedera Private Key (keep this secret!)
# DO NOT commit this to version control
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Hedera Mirror Node API (for querying historical data)
NEXT_PUBLIC_HEDERA_MIRROR_NODE=https://testnet.mirrornode.hedera.com

# Optional: WalletConnect Project ID (for wallet integration)
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

## Getting Supabase Credentials

### 1. Create a Supabase Project

1. Visit [Supabase](https://supabase.com) and sign up for a free account
2. Click "New Project" to create a new project
3. Fill in your project details:
   - **Name**: eventra (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
4. Wait for the project to be provisioned (this may take a few minutes)
5. Once ready, navigate to **Settings** → **API**
6. Copy your **Project URL** and **anon/public key**:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your project URL (e.g., `https://xxxxx.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon/public API key

### 2. Configure Supabase Authentication

1. In your Supabase project, go to **Authentication** → **URL Configuration**
2. Add your site URL:
   - **Site URL**: `http://localhost:3000` (for development)
   - For production, use your deployed domain
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - Add your production URLs when deploying
4. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation and password reset emails

### 3. Enable Email Provider

1. Go to **Authentication** → **Providers**
2. Email provider should be enabled by default
3. You can also enable additional providers:
   - Google
   - GitHub
   - Discord
   - And more...

## Getting Hedera Credentials

### 1. Create a Hedera Testnet Account

#### Option A: Using Hedera Portal (Recommended)

1. Visit [Hedera Portal](https://portal.hedera.com/)
2. Sign up for a free account
3. Navigate to the testnet section
4. Create a new testnet account
5. Copy your Account ID and Private Key

#### Option B: Using HashPack Wallet

1. Install [HashPack Wallet](https://www.hashpack.app/)
2. Create a new wallet
3. Switch to testnet
4. Your account will be created automatically
5. Export your account details

#### Option C: Using Hedera SDK (Programmatic)

```bash
npm install @hashgraph/sdk
```

```javascript
const {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  Hbar,
} = require("@hashgraph/sdk");

async function createAccount() {
  const client = Client.forTestnet();

  // Generate a new key pair
  const privateKey = PrivateKey.generateED25519();
  const publicKey = privateKey.publicKey;

  // Create account
  const transaction = await new AccountCreateTransaction()
    .setKey(publicKey)
    .setInitialBalance(new Hbar(10))
    .execute(client);

  const receipt = await transaction.getReceipt(client);
  const accountId = receipt.accountId;

  console.log("Account ID:", accountId.toString());
  console.log("Private Key:", privateKey.toString());
}

createAccount();
```

### 2. Fund Your Testnet Account

Get free testnet HBAR from the faucet:

1. Visit [Hedera Faucet](https://portal.hedera.com/faucet)
2. Enter your testnet account ID
3. Request testnet HBAR (up to 10,000 HBAR per day)

## Environment Variable Details

### `NEXT_PUBLIC_SUPABASE_URL`

- **Type**: String
- **Description**: Your Supabase project URL
- **Example**: `https://xxxxxxxxxxxxx.supabase.co`
- **Required**: Yes
- **Note**: Find this in your Supabase project settings under API

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- **Type**: String
- **Description**: Your Supabase anonymous/public API key
- **Example**: Long base64 encoded string
- **Required**: Yes
- **Note**: This key is safe to use in the browser as it enforces Row Level Security (RLS)
- **Security**: While this is a public key, always use RLS policies to protect your data

### `NEXT_PUBLIC_HEDERA_NETWORK`

- **Type**: String
- **Options**: `testnet`, `mainnet`, `previewnet`
- **Default**: `testnet`
- **Description**: The Hedera network to connect to
- **Note**: Always use `testnet` for development

### `NEXT_PUBLIC_HEDERA_ACCOUNT_ID`

- **Type**: String
- **Format**: `0.0.xxxxx`
- **Description**: Your Hedera account ID
- **Example**: `0.0.1234567`
- **Note**: This is your operator account for transactions

### `HEDERA_PRIVATE_KEY`

- **Type**: String
- **Format**: Hexadecimal string (64 characters) or DER encoded
- **Description**: Private key for your Hedera account
- **Security**: ⚠️ NEVER commit this to version control!
- **Note**: Prefix with `HEDERA_` (not `NEXT_PUBLIC_`) to keep it server-side only

### `NEXT_PUBLIC_APP_URL`

- **Type**: String
- **Description**: Your application's base URL
- **Development**: `http://localhost:3000`
- **Production**: Your deployed domain

### `NEXT_PUBLIC_HEDERA_MIRROR_NODE`

- **Type**: String
- **Description**: Hedera Mirror Node API endpoint
- **Testnet**: `https://testnet.mirrornode.hedera.com`
- **Mainnet**: `https://mainnet-public.mirrornode.hedera.com`
- **Note**: Used for querying transaction history and account data

## Security Best Practices

### ✅ DO:

- Keep private keys in `.env.local` (not tracked by git)
- Use different accounts for development and production
- Rotate keys regularly
- Use testnet for all development
- Store production keys in secure environment variable services
- Use environment variables for all sensitive data

### ❌ DON'T:

- Commit `.env.local` or private keys to version control
- Share your private keys
- Use mainnet during development
- Hard-code sensitive values in your code
- Expose private keys in client-side code

## Verifying Your Setup

After setting up your environment variables, verify the configuration:

```bash
npm run dev
```

Check the console for any configuration errors. You should see:

- Next.js starting successfully
- No environment variable warnings
- Application running on http://localhost:3000

## Troubleshooting

### "Invalid Account ID" Error

- Verify your account ID format: `0.0.xxxxx`
- Ensure the account exists on the correct network
- Check that you've selected the right network (testnet/mainnet)

### "Invalid Private Key" Error

- Verify the private key format
- Ensure there are no extra spaces or characters
- Try regenerating the key pair

### "Insufficient Balance" Error

- Fund your testnet account using the faucet
- Wait a few seconds for the transaction to process
- Verify balance on [HashScan](https://hashscan.io/testnet)

### Environment Variables Not Loading

- Ensure file is named `.env.local` (not `.env`)
- Restart the development server after changing variables
- Variables starting with `NEXT_PUBLIC_` are accessible in the browser
- Other variables are server-side only

## Production Deployment

For production deployments:

1. **Never use testnet credentials**
2. Create mainnet accounts
3. Store credentials in your hosting platform's environment variables:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Build & Deploy → Environment
   - AWS: AWS Secrets Manager or Parameter Store
4. Use different keys for different environments
5. Enable all security features
6. Monitor your account balance

## Additional Resources

- [Hedera Documentation](https://docs.hedera.com)
- [Hedera SDK Documentation](https://docs.hedera.com/hedera/sdks-and-apis)
- [Hedera Portal](https://portal.hedera.com/)
- [HashScan Explorer](https://hashscan.io/)
- [Hedera Discord Community](https://hedera.com/discord)

## Need Help?

If you encounter issues:

1. Check the [Hedera documentation](https://docs.hedera.com)
2. Search existing issues on GitHub
3. Ask in the Hedera Discord community
4. Create a new issue with details about your problem
