// src/libs/hedera/certificates.ts

import { 
  TokenCreateTransaction, 
  TokenType, 
  TokenMintTransaction,
  TokenSupplyType,
  Hbar
} from '@hashgraph/sdk';
import client, { operatorId, operatorKey } from '@/libs/hedera/client';

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
      .setTreasuryAccountId(operatorId)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(1000)
      .setSupplyKey(operatorKey)
      .setAdminKey(operatorKey)
      .setMaxTransactionFee(new Hbar(50))
      .freezeWith(client)
      .sign(operatorKey);

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    
    if (!receipt.tokenId) {
      throw new Error('Token creation failed - no tokenId received');
    }

    return receipt.tokenId.toString();
  } catch (error) {
    console.error('Error creating certificate collection:', error);
    throw error;
  }
}

/**
 * Mint a certificate NFT for an attendee
 */
export async function mintCertificate(
  tokenId: string, 
  recipientId: string,
  metadata: CertificateMetadata
): Promise<string> {
  try {
    const metadataString = JSON.stringify(metadata);
    const metadataBytes = Buffer.from(metadataString, 'utf-8');
    
    const mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .addMetadata(metadataBytes)
      .setMaxTransactionFee(new Hbar(20))
      .freezeWith(client)
      .sign(operatorKey);
    
    const txResponse = await mintTx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    
    if (!receipt.serials || receipt.serials.length === 0) {
      throw new Error('Minting failed - no serial number received');
    }

    return receipt.serials[0].toString();
  } catch (error) {
    console.error('Error minting certificate:', error);
    throw error;
  }
}

// Export the interface so other files can use it
export type { CertificateMetadata };