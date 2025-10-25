// src/libs/hedera/client.ts
import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';

let client: Client | null = null;

export function getHederaClient(): Client {
  if (client) return client;

  if (!process.env.HEDERA_OPERATOR_ID || !process.env.HEDERA_OPERATOR_KEY) {
    throw new Error('Hedera credentials not configured.');
  }

  client = process.env.NEXT_PUBLIC_HEDERA_NETWORK === 'mainnet'
    ? Client.forMainnet()
    : Client.forTestnet();

  const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
  const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY);

  client.setOperator(operatorId, operatorKey);

  return client;
}

export const operatorId = process.env.HEDERA_OPERATOR_ID
  ? AccountId.fromString(process.env.HEDERA_OPERATOR_ID)
  : null;

export const operatorKey = process.env.HEDERA_OPERATOR_KEY
  ? PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY)
  : null;

export function getOperatorAccountId(): string {
  if (!process.env.HEDERA_OPERATOR_ID) throw new Error('HEDERA_OPERATOR_ID not configured');
  return process.env.HEDERA_OPERATOR_ID;
}

export function getHederaNetwork(): string {
  return process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
}
