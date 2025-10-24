import {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  PrivateKey,
  Hbar,
} from "@hashgraph/sdk";
import { hederaClient } from "../client";

export async function mintTicketNFT(eventName: string, eventSymbol: string) {
  const client = hederaClient();

  const privateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY!);

  const tx = new TokenCreateTransaction()
    .setTokenName(eventName)
    .setTokenSymbol(eventSymbol)
    .setTokenType(TokenType.NonFungibleUnique)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(100)
    .setTreasuryAccountId(process.env.HEDERA_ACCOUNT_ID!)
    .setAdminKey(privateKey)
    .setSupplyKey(privateKey)
    .setInitialSupply(0)
    .setMaxTransactionFee(new Hbar(2));

  const signTx = await tx.freezeWith(client).sign(privateKey);
  const submitTx = await signTx.execute(client);
  const receipt = await submitTx.getReceipt(client);

  if (!receipt.tokenId) {
    throw new Error("Token ID is null in transaction receipt");
  }

  return receipt.tokenId.toString();
}
