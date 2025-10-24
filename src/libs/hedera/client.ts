// src/libs/hedera/client.ts

import { Client, PrivateKey, AccountId, Hbar } from '@hashgraph/sdk';

// Validate environment variables
if (!process.env.HEDERA_OPERATOR_ID) {
  throw new Error('HEDERA_OPERATOR_ID environment variable is required');
}

if (!process.env.HEDERA_OPERATOR_KEY) {
  throw new Error('HEDERA_OPERATOR_KEY environment variable is required');
}

// Parse operator account ID and private key
export const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
export const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY);

// Create and configure Hedera client
export const client = 
  process.env.NEXT_PUBLIC_HEDERA_NETWORK === 'mainnet'
    ? Client.forMainnet()
    : Client.forTestnet();

// Set operator (the account that pays for transactions)
client.setOperator(operatorId, operatorKey);

// Set default transaction fee using Hbar object
client.setDefaultMaxTransactionFee(new Hbar(100));

// Optional: Set default query payment
client.setDefaultMaxQueryPayment(new Hbar(50));

// Default export
export default client;