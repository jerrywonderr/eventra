// src/libs/hedera/test.ts

import { client, operatorId } from "./client";
import { AccountBalanceQuery } from "@hashgraph/sdk";

export async function testHederaConnection() {
  try {
    console.log("Testing Hedera connection...");
    console.log("Operator ID:", operatorId.toString());

    // Query account balance
    const balance = await new AccountBalanceQuery()
      .setAccountId(operatorId)
      .execute(client);

    console.log("Account balance:", balance.hbars.toString());
    console.log(" Hedera connection successful!");

    return true;
  } catch (error) {
    console.error(" Hedera connection failed:", error);
    return false;
  }
}

// Run test
testHederaConnection();
