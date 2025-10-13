/**
 * Hedera Utility Functions
 * Helper functions for interacting with Hedera blockchain
 */

import { HEDERA_CONFIG } from "../constants";

/**
 * Get Hedera network configuration
 */
export const getHederaNetwork = () => {
  return HEDERA_CONFIG.network;
};

/**
 * Format Hedera Account ID
 * @param accountId - Raw account ID
 * @returns Formatted account ID (0.0.xxxxx)
 */
export const formatAccountId = (accountId: string): string => {
  if (!accountId) return "";
  return accountId.startsWith("0.0.") ? accountId : `0.0.${accountId}`;
};

/**
 * Validate Hedera Account ID
 * @param accountId - Account ID to validate
 * @returns Boolean indicating if account ID is valid
 */
export const isValidAccountId = (accountId: string): boolean => {
  const regex = /^0\.0\.\d+$/;
  return regex.test(accountId);
};

/**
 * Format Hedera Transaction ID
 * @param transactionId - Raw transaction ID
 * @returns Formatted transaction ID
 */
export const formatTransactionId = (transactionId: string): string => {
  return transactionId;
};

/**
 * Convert HBAR to Tinybar
 * @param hbar - Amount in HBAR
 * @returns Amount in Tinybar
 */
export const hbarToTinybar = (hbar: number): number => {
  return Math.floor(hbar * 100_000_000);
};

/**
 * Convert Tinybar to HBAR
 * @param tinybar - Amount in Tinybar
 * @returns Amount in HBAR
 */
export const tinybarToHbar = (tinybar: number): number => {
  return tinybar / 100_000_000;
};

/**
 * Get Hedera Explorer URL for a transaction
 * @param transactionId - Transaction ID
 * @returns URL to view transaction on Hedera explorer
 */
export const getExplorerUrl = (transactionId: string): string => {
  const baseUrl =
    HEDERA_CONFIG.network === "mainnet"
      ? "https://hashscan.io/mainnet"
      : "https://hashscan.io/testnet";
  return `${baseUrl}/transaction/${transactionId}`;
};

/**
 * Get Hedera Mirror Node API URL
 * @returns Mirror node API URL
 */
export const getMirrorNodeUrl = (): string => {
  return HEDERA_CONFIG.mirrorNode;
};
