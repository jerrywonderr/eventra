import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { processTicketPurchaseTransaction } from "@/libs/hedera/transactions";
import { sendTicketPurchaseEmail } from "@/libs/email/resend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.error("Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    console.log(" Webhook received:", event.event);

    // Handle successful charge
    if (event.event === "charge.success") {
      const { reference, metadata } = event.data;
      const { eventId, tierId, quantity, userId } = metadata;

      console.log(" Processing payment:", reference);

      const supabase = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );

      // Check if already processed
      const { data: existingTickets } = await supabase
        .from("tickets")
        .select("id")
        .eq("payment_reference", reference)
        .limit(1);

      if (existingTickets && existingTickets.length > 0) {
        console.log("Already processed:", reference);
        return NextResponse.json({ message: "Already processed" });
      }

      // Get tier info
      const { data: tier } = await supabase
        .from("ticket_tiers")
        .select("*, event:events(*)")
        .eq("id", tierId)
        .single();

      if (!tier) {
        console.error("Tier not found");
        return NextResponse.json({ error: "Tier not found" }, { status: 404 });
      }

      // Check availability
      if (tier.quantity_sold + quantity > tier.quantity_total) {
        console.error("Sold out");
        return NextResponse.json({ error: "Sold out" }, { status: 400 });
      }

      console.log("🚀 Creating blockchain transaction...");

      // Process Hedera transaction
      const hederaResult = await processTicketPurchaseTransaction(
        tier.price * quantity,
        eventId,
        userId
      );

      console.log(" Blockchain transaction:", hederaResult.transactionId);

      // Create tickets
      const ticketsToCreate = Array.from({ length: quantity }, (_, i) => ({
        event_id: eventId,
        tier_id: tierId,
        buyer_id: userId,
        transaction_hash: hederaResult.transactionId,
        purchase_price: tier.price,
        nft_token_id: `HEDERA-${Date.now()}-${i}`,
        payment_reference: reference,
        metadata: {
          blockchain: "Hedera",
          network: process.env.NEXT_PUBLIC_HEDERA_NETWORK || "testnet",
          explorerUrl: hederaResult.explorerUrl,
          batchNumber: i + 1,
          totalInBatch: quantity,
          paymentReference: reference,
        },
      }));

      const { error: ticketError } = await supabase
        .from("tickets")
        .insert(ticketsToCreate);

      if (ticketError) {
        console.error("Failed to create tickets:", ticketError);
        return NextResponse.json(
          { error: "Failed to create tickets" },
          { status: 500 }
        );
      }

      // Update quantity sold
      await supabase
        .from("ticket_tiers")
        .update({ quantity_sold: tier.quantity_sold + quantity })
        .eq("id", tierId);

      console.log(`✅ ${quantity} ticket(s) created successfully!`);
      // Send email notification
      try {
        await sendTicketPurchaseEmail(
          userId, // buyer's email
          {
            userName: "Customer", // Get from profile
            eventTitle: tier.event.title,
            eventDate: new Date(tier.event.event_date).toLocaleDateString(),
            eventLocation: tier.event.location,
            ticketCount: quantity,
            totalPrice: tier.price * quantity,
            transactionId: hederaResult.transactionId,
            explorerUrl: hederaResult.explorerUrl,
          }
        );
      } catch (emailError) {
        console.error("Email send failed:", emailError);
      }

      // ✨ Award points for purchase
      const totalSpent = tier.price * quantity;
      const pointsEarned = Math.floor(totalSpent * 10); // 10 points per $1

      console.log(`🎁 Awarding ${pointsEarned} points to user ${userId}`);

      // Check if this is user's first purchase
      const { count: previousPurchases } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .eq("buyer_id", userId);

      const isFirstPurchase = previousPurchases === quantity; // Only these tickets exist
      const bonusPoints = isFirstPurchase ? 50 : 0;
      const totalPoints = pointsEarned + bonusPoints;

      // Get user's current points
      const { data: profile } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", userId)
        .single();

      const currentPoints = profile?.points || 0;
      const newPoints = currentPoints + totalPoints;

      // Update user's total points
      const { error: pointsUpdateError } = await supabase
        .from("profiles")
        .update({ points: newPoints })
        .eq("id", userId);

      if (pointsUpdateError) {
        console.error("Failed to update points:", pointsUpdateError);
      }

      // Record points transaction
      const transactions = [];

      // Main purchase points
      transactions.push({
        user_id: userId,
        points: pointsEarned,
        type: "earned",
        description: `Purchased ${quantity} ticket(s) for ${tier.event.title}`,
        ticket_id: ticketsToCreate[0].event_id, // First ticket as reference
        event_id: eventId,
      });

      // First purchase bonus
      if (bonusPoints > 0) {
        transactions.push({
          user_id: userId,
          points: bonusPoints,
          type: "bonus",
          description: "First purchase bonus! 🎉",
          event_id: eventId,
        });
      }

      await supabase.from("points_transactions").insert(transactions);

      console.log(
        `✅ Awarded ${totalPoints} total points (${pointsEarned} + ${bonusPoints} bonus)`
      );

      return NextResponse.json({
        message: "Tickets created successfully",
        pointsAwarded: totalPoints,
      });
    }

    return NextResponse.json({ message: "Event received" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
