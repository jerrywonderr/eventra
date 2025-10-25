// src/libs/hedera/client.ts

import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';

let client: Client | null = null;

export function getHederaClient(): Client {
  if (client) {
    return client;
  }

  // Validate environment variables
  if (!process.env.HEDERA_OPERATOR_ID || !process.env.HEDERA_OPERATOR_KEY) {
    throw new Error('Hedera credentials not configured. Please set HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY in .env.local');
  }

  // Create client based on network
  client = process.env.NEXT_PUBLIC_HEDERA_NETWORK === 'mainnet'
    ? Client.forMainnet()
    : Client.forTestnet();

  // Set operator (your platform account that pays for transactions)
  const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
  const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY);

  client.setOperator(operatorId, operatorKey);

  return client;
}

export function getOperatorAccountId(): string {
  if (!process.env.HEDERA_OPERATOR_ID) {
    throw new Error('HEDERA_OPERATOR_ID not configured');
  }
  return process.env.HEDERA_OPERATOR_ID;
}

export function getHederaNetwork(): string {
  return process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
}