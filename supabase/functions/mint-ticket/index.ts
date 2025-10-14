/**
 * Supabase Edge Function: Mint Ticket NFT
 * Securely mints a ticket NFT for a user on Hedera
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  AccountId,
  Client,
  PrivateKey,
  TokenAssociateTransaction,
  TokenId,
  TokenMintTransaction,
} from "https://esm.sh/@hashgraph/sdk@2.19.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MintTicketRequest {
  eventId: string;
  buyerId: string;
  metadata: {
    eventName: string;
    eventDate: string;
    seatNumber?: string;
    tier: string;
  };
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
    const { eventId, buyerId, metadata }: MintTicketRequest = await req.json();

    // Verify the user is buying the ticket for themselves
    if (user.id !== buyerId) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized: Can only buy tickets for yourself",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get event details
    const { data: event, error: eventError } = await supabaseClient
      .from("events")
      .select("token_id, available_tickets, total_tickets, title")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!event.token_id) {
      return new Response(
        JSON.stringify({ error: "Event does not have a token" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (event.available_tickets <= 0) {
      return new Response(JSON.stringify({ error: "No tickets available" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get buyer's Hedera account
    const { data: buyer, error: buyerError } = await supabaseClient
      .from("users")
      .select("hedera_account_id")
      .eq("id", buyerId)
      .single();

    if (buyerError || !buyer?.hedera_account_id) {
      return new Response(
        JSON.stringify({ error: "Buyer does not have a Hedera account" }),
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

    // Associate token with buyer's account (if not already associated)
    try {
      const associateTx = new TokenAssociateTransaction()
        .setAccountId(AccountId.fromString(buyer.hedera_account_id))
        .setTokenIds([TokenId.fromString(event.token_id)]);

      await associateTx.execute(client);
    } catch {
      // Token might already be associated, continue
      console.log("Token association may have failed or already exists");
    }

    // Create metadata for the NFT
    const nftMetadata = new Map();
    nftMetadata.set("eventId", eventId);
    nftMetadata.set("eventName", metadata.eventName);
    nftMetadata.set("eventDate", metadata.eventDate);
    nftMetadata.set("tier", metadata.tier);
    if (metadata.seatNumber) {
      nftMetadata.set("seatNumber", metadata.seatNumber);
    }

    // Mint the NFT
    const tokenMintTx = new TokenMintTransaction()
      .setTokenId(TokenId.fromString(event.token_id))
      .setMetadata([
        new TextEncoder().encode(
          JSON.stringify(Object.fromEntries(nftMetadata))
        ),
      ]);

    const tokenMintResponse = await tokenMintTx.execute(client);
    const tokenMintReceipt = await tokenMintResponse.getReceipt(client);

    const serialNumber = tokenMintReceipt.serials[0].toNumber();

    // Create ticket record in Supabase
    const { data: ticket, error: ticketError } = await supabaseClient
      .from("tickets")
      .insert({
        event_id: eventId,
        owner_id: buyerId,
        token_id: event.token_id,
        serial_number: serialNumber,
        price: 0, // Price will be set by the application logic
        status: "active",
        purchase_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (ticketError) {
      console.error("Error creating ticket record:", ticketError);
      return new Response(
        JSON.stringify({ error: "Failed to create ticket record" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update event's available tickets
    const { error: updateError } = await supabaseClient
      .from("events")
      .update({
        available_tickets: event.available_tickets - 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId);

    if (updateError) {
      console.error("Error updating event tickets:", updateError);
    }

    // Create transaction record
    await supabaseClient.from("transactions").insert({
      event_id: eventId,
      buyer_id: buyerId,
      amount: 0, // Price will be set by application logic
      currency: "USD",
      transaction_hash: event.token_id, // Use token ID as reference
      status: "confirmed",
      timestamp: new Date().toISOString(),
    });

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        ticket: {
          id: ticket.id,
          serialNumber,
          tokenId: event.token_id,
          eventId,
          ownerId: buyerId,
          metadata,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error minting ticket:", error);
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
