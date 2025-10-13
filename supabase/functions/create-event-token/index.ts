/**
 * Supabase Edge Function: Create Event Token
 * Securely creates an NFT token for an event on Hedera
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  AccountId,
  Client,
  PrivateKey,
  TokenCreateTransaction,
  TokenSupplyType,
  TokenType,
} from "https://esm.sh/@hashgraph/sdk@2.19.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateEventTokenRequest {
  eventId: string;
  eventName: string;
  maxTickets: number;
  organizerId: string;
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
    const {
      eventId,
      eventName,
      maxTickets,
      organizerId,
    }: CreateEventTokenRequest = await req.json();

    // Verify the user is the organizer
    if (user.id !== organizerId) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized: Only event organizer can create token",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if event already has a token
    const { data: existingEvent } = await supabaseClient
      .from("events")
      .select("token_id")
      .eq("id", eventId)
      .single();

    if (existingEvent?.token_id) {
      return new Response(
        JSON.stringify({ error: "Event already has a token" }),
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

    // Create NFT token for the event
    const tokenCreateTx = new TokenCreateTransaction()
      .setTokenName(`${eventName} Ticket`)
      .setTokenSymbol(`TICKET-${eventId.slice(-4).toUpperCase()}`)
      .setTokenType(TokenType.NonFungibleUnique)
      .setInitialSupply(0)
      .setMaxSupply(maxTickets)
      .setTreasuryAccountId(AccountId.fromString(operatorAccountId))
      .setSupplyType(TokenSupplyType.Finite);

    const tokenCreateResponse = await tokenCreateTx.execute(client);
    const tokenCreateReceipt = await tokenCreateResponse.getReceipt(client);

    const tokenId = tokenCreateReceipt.tokenId!.toString();

    // Update event record in Supabase
    const { error: updateError } = await supabaseClient
      .from("events")
      .update({
        token_id: tokenId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId);

    if (updateError) {
      console.error("Error updating event with token:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update event with token" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        tokenId,
        eventId,
        totalSupply: 0,
        maxSupply: maxTickets,
        name: `${eventName} Ticket`,
        symbol: `TICKET-${eventId.slice(-4).toUpperCase()}`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating event token:", error);
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
