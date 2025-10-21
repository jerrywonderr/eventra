import { Client, AccountId, PrivateKey } from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

export const hederaClient = () => {
  const client = Client.forTestnet();
  client.setOperator(
    AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!),
    PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY!)
  );
  return client;
};
