/**
 * Supabase Edge Function: Create Hedera Account
 * Securely creates a Hedera account for a user on the server side
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  AccountCreateTransaction,
  AccountId,
  Client,
  Hbar,
  PrivateKey,
} from "https://esm.sh/@hashgraph/sdk@2.19.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateAccountRequest {
  userId: string;
  email: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get authorization header
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");

    // Verify the user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { userId }: CreateAccountRequest = await req.json();

    // Verify the user is creating account for themselves
    if (user.id !== userId) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized: Can only create account for yourself",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if user already has a Hedera account
    const { data: existingUser } = await supabaseClient
      .from("users")
      .select("hedera_account_id")
      .eq("id", userId)
      .single();

    if (existingUser?.hedera_account_id) {
      return new Response(
        JSON.stringify({ error: "User already has a Hedera account" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Hedera client
    const network = Deno.env.get("HEDERA_NETWORK") || "testnet";
    const operatorAccountId = Deno.env.get("HEDERA_ACCOUNT_ID")!;
    const operatorPrivateKey = Deno.env.get("HEDERA_PRIVATE_KEY")!;

    let client: Client;
    switch (network) {
      case "testnet":
        client = Client.forTestnet();
        break;
      case "mainnet":
        client = Client.forMainnet();
        break;
      case "previewnet":
        client = Client.forPreviewnet();
        break;
      default:
        throw new Error(`Unsupported Hedera network: ${network}`);
    }

    // Set operator
    client.setOperator(
      AccountId.fromString(operatorAccountId),
      PrivateKey.fromString(operatorPrivateKey)
    );

    // Generate new key pair for user
    const userPrivateKey = PrivateKey.generateED25519();
    const userPublicKey = userPrivateKey.publicKey;

    // Create Hedera account
    const accountCreateTx = new AccountCreateTransaction()
      .setKey(userPublicKey)
      .setInitialBalance(new Hbar(10)); // 10 HBAR initial balance

    const accountCreateResponse = await accountCreateTx.execute(client);
    const accountCreateReceipt = await accountCreateResponse.getReceipt(client);

    const userAccountId = accountCreateReceipt.accountId!.toString();

    // Update user record in Supabase (store account ID, but NOT private key)
    const { error: updateError } = await supabaseClient
      .from("users")
      .update({
        hedera_account_id: userAccountId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user with Hedera account:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update user account" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Return success response (DO NOT include private key)
    return new Response(
      JSON.stringify({
        success: true,
        accountId: userAccountId,
        message: "Hedera account created successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating Hedera account:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
