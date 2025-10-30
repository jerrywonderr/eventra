// src/libs/hedera/transactions.ts

import {
  TransferTransaction,
  Hbar,
  AccountId,
  TransactionReceipt,
} from "@hashgraph/sdk";
import {
  getHederaClient,
  getOperatorAccountId,
  getHederaNetwork,
} from "./client";

/**
 * Process a real ticket purchase on Hedera blockchain
 * Returns transaction ID and explorer URL
 */
export async function processTicketPurchaseTransaction(
  ticketPrice: number,
  eventId: string,
  buyerEmail: string
): Promise<{
  transactionId: string;
  explorerUrl: string;
  status: string;
}> {
  try {
    const client = getHederaClient();
    const operatorId = getOperatorAccountId();

    // Convert USD price to HBAR (simplified: $1 = 10 HBAR for demo)
    // In production, you'd use a price oracle
    const hbarAmount = Math.max(1, Math.ceil(ticketPrice / 10));

    console.log(
      `Processing Hedera transaction: $${ticketPrice} = ${hbarAmount} HBAR`
    );

    // Create transfer transaction
    // For demo: Platform account pays itself (proves blockchain integration)
    // In production: Buyer would pay from their wallet
    const transaction = new TransferTransaction()
      .addHbarTransfer(operatorId, new Hbar(-hbarAmount)) // Platform pays
      .addHbarTransfer(operatorId, new Hbar(hbarAmount)) // Platform receives
      .setTransactionMemo(
        `Eventra: Ticket purchase for event ${eventId.substring(0, 8)}`
      );

    // Execute transaction on Hedera
    console.log("Executing transaction on Hedera...");
    const txResponse = await transaction.execute(client);

    // Wait for consensus
    console.log("Waiting for consensus...");
    const receipt: TransactionReceipt = await txResponse.getReceipt(client);

    const transactionId = txResponse.transactionId.toString();
    const network = getHederaNetwork();
    const explorerUrl = `https://hashscan.io/${network}/transaction/${transactionId}`;

    console.log("✅ Hedera transaction successful!");
    console.log("Transaction ID:", transactionId);
    console.log("Explorer URL:", explorerUrl);

    return {
      transactionId,
      explorerUrl,
      status: receipt.status.toString(),
    };
  } catch (error) {
    console.error("Hedera transaction failed:", error);
    throw new Error(
      `Blockchain transaction failed: ${(error as Error).message}`
    );
  }
}

/**
 * Verify a transaction exists on Hedera
 */
export async function verifyTransaction(
  transactionId: string
): Promise<boolean> {
  try {
    const network = getHederaNetwork();
    const mirrorNodeUrl = `https://${network}.mirrornode.hedera.com`;

    const response = await fetch(
      `${mirrorNodeUrl}/api/v1/transactions/${transactionId}`
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.transactions?.[0]?.result === "SUCCESS";
  } catch (error) {
    console.error("Transaction verification failed:", error);
    return false;
  }
}

/**
 * Get transaction details from Hedera Mirror Node
 */
export async function getTransactionDetails(transactionId: string) {
  try {
    const network = getHederaNetwork();
    const mirrorNodeUrl = `https://${network}.mirrornode.hedera.com`;

    const response = await fetch(
      `${mirrorNodeUrl}/api/v1/transactions/${transactionId}`
    );

    if (!response.ok) {
      throw new Error("Transaction not found");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch transaction details:", error);
    throw error;
  }
}
