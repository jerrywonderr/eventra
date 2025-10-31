// src/libs/hedera/certificates.ts

import {
  TokenCreateTransaction,
  TokenType,
  TokenMintTransaction,
  TokenSupplyType,
  Hbar,
} from "@hashgraph/sdk";
import { getHederaClient, operatorId, operatorKey } from "@/libs/hedera/client";

// Initialize the Hedera client once
const client = getHederaClient();

// Define metadata interface
interface CertificateMetadata {
  eventName: string;
  recipientName: string;
  role: string;
  date: string;
  eventId?: string;
}

/**
 * Create an NFT collection for event certificates
 */
export async function createCertificateCollection(
  eventId: string,
  eventName: string
): Promise<string> {
  try {
    const transaction = await new TokenCreateTransaction()
      .setTokenName(`${eventName} Certificate`)
      .setTokenSymbol("CERT")
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(operatorId!)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(1000)
      .setSupplyKey(operatorKey!)
      .setAdminKey(operatorKey!)
      .setMaxTransactionFee(new Hbar(50))
      .freezeWith(client)
      .sign(operatorKey!);

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);

    if (!receipt.tokenId) {
      throw new Error("Token creation failed - no tokenId received");
    }

    return receipt.tokenId.toString();
  } catch (error) {
    console.error("Error creating certificate collection:", error);
    throw error;
  }
}

export async function mintCertificate(
  tokenId: string,
  recipientId: string,
  metadata: CertificateMetadata
): Promise<string> {
  try {
    const metadataString = JSON.stringify(metadata);
    const metadataBytes = Buffer.from(metadataString, "utf-8");

    if (metadataBytes.length > 100) {
      console.warn(
        `Metadata too long (${metadataBytes.length} bytes). Truncating to 100 bytes.`
      );
    }

    const safeMetadata =
      metadataBytes.length > 100
        ? metadataBytes.subarray(0, 100)
        : metadataBytes;

    const mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .addMetadata(safeMetadata)
      .setMaxTransactionFee(new Hbar(20))
      .freezeWith(client)
      .sign(operatorKey!);

    const txResponse = await mintTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    if (!receipt.serials || receipt.serials.length === 0) {
      throw new Error("Minting failed - no serial number received");
    }

    console.log(" Certificate minted successfully:", {
      serialNumber: receipt.serials[0].toString(),
      metadataLength: safeMetadata.length,
    });

    return receipt.serials[0].toString();
  } catch (error) {
    console.error("Error minting certificate:", error);
    throw error;
  }
}

// Export the interface so other files can use it
export type { CertificateMetadata };
