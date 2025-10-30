"use server";
import {
  createCertificateCollection,
  mintCertificate,
} from "@/libs/hedera/certificates";
import { createClient } from "@/libs/supabase/server";
import { revalidatePath } from "next/cache";
import { processTicketPurchaseTransaction } from "@/libs/hedera/transactions";
import { CertificateMetadata } from "@/libs/hedera/certificates";

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  // Check authentication

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Extract form data
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const event_date = formData.get("event_date") as string;
  const location = formData.get("location") as string;
  const image_url = formData.get("image_url") as string;
  const max_tickets_per_user = formData.get("max_tickets_per_user") as
    | string
    | null;

  type Tier = {
    tier_name: string;
    price: number;
    quantity_total: number;
    benefits?: string[];
  };

  // Parse tiers from form data
  const tiersJson = formData.get("tiers") as string;
  const tiers = JSON.parse(tiersJson) as Tier[];

  try {
    // Insert event

    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        organizer_id: user.id,
        title,
        description,
        event_date,
        location,
        image_url,
        is_paid: tiers.some((t: Tier) => t.price > 0),
        is_active: true,
        max_tickets_per_user: max_tickets_per_user
          ? parseInt(max_tickets_per_user)
          : null,
      })
      .select()
      .single();

    if (eventError) {
      console.error("Event creation error:", eventError);
      return { error: eventError.message };
    }

    // Insert ticket tiers
    const tiersToInsert = tiers.map((tier: Tier) => ({
      event_id: event.id,
      tier_name: tier.tier_name,
      price: tier.price,
      quantity_total: tier.quantity_total,
      quantity_sold: 0,
      benefits: tier.benefits || [],
    }));

    const { error: tiersError } = await supabase
      .from("ticket_tiers")
      .insert(tiersToInsert);

    if (tiersError) {
      console.error("Tiers creation error:", tiersError);
      return { error: tiersError.message };
    }

    // Revalidate cached pages
    revalidatePath("/dashboard");
    revalidatePath("/events");
    console.log(" Event created successfully:", event.id);

    // Success - return event ID
    return { success: true, eventId: event.id };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { error: "Failed to create event" };
  }
}

export async function purchaseTicket(
  eventId: string,
  tierId: string,
  quantity: number = 1,
  paymentReference?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    // Get tier info with event details

    const { data: tier } = await supabase
      .from("ticket_tiers")
      .select("*, event:events(*)")
      .eq("id", tierId)
      .single();

    if (!tier) {
      return { error: "Ticket tier not found" };
    }

    //  PROTECTION 1: Check if user is the event organizer
    if (tier.event.organizer_id === user.id) {
      return {
        error:
          "Event organizers cannot purchase tickets for their own events. You already have access as the organizer.",
      };
    }

    //  PROTECTION 2: Check purchase limit per user
    if (tier.event.max_tickets_per_user !== null) {
      // Count existing tickets for this user for this event
      const { count: existingTickets } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId)
        .eq("buyer_id", user.id);

      const totalAfterPurchase = (existingTickets || 0) + quantity;

      if (totalAfterPurchase > tier.event.max_tickets_per_user) {
        const remaining =
          tier.event.max_tickets_per_user - (existingTickets || 0);
        return {
          error: `Purchase limit exceeded. This event allows a maximum of ${tier.event.max_tickets_per_user} ticket(s) per person. You already have ${existingTickets} ticket(s). You can only purchase ${remaining} more.`,
        };
      }
    }

    // Check availability
    if (tier.quantity_sold + quantity > tier.quantity_total) {
      const available = tier.quantity_total - tier.quantity_sold;
      return {
        error: `Not enough tickets available! Only ${available} ticket(s) remaining.`,
      };
    }

    console.log(" Processing ticket purchase...");
    console.log("Event:", tier.event.title);
    console.log("Quantity:", quantity);
    console.log("Price per ticket:", tier.price);
    console.log("Total:", tier.price * quantity);
    console.log("Buyer:", user.email);
    // Verify Paystack payment if reference provided
    if (paymentReference) {
      const paystackVerification = await fetch(
        `https://api.paystack.co/transaction/verify/${paymentReference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const verificationData = await paystackVerification.json();

      if (
        !verificationData.status ||
        verificationData.data.status !== "success"
      ) {
        return {
          error: "Payment verification failed. Please contact support.",
        };
      }

      console.log("✅ Payment verified:", paymentReference);
    }

    //  HEDERA BLOCKCHAIN TRANSACTION
    let hederaResult;
    try {
      hederaResult = await processTicketPurchaseTransaction(
        tier.price * quantity, // Total price
        eventId,
        user.email || "unknown"
      );

      console.log(" Blockchain transaction successful!");
      console.log("Transaction ID:", hederaResult.transactionId);
      console.log("Explorer URL:", hederaResult.explorerUrl);
    } catch (hederaError) {
      console.error(" Hedera transaction failed:", hederaError);
      return {
        error: `Blockchain transaction failed: ${
          (hederaError as Error).message
        }. Please try again.`,
      };
    }

    // Create ticket records)
    const ticketsToCreate = Array.from({ length: quantity }, (_, i) => ({
      event_id: eventId,
      tier_id: tierId,
      buyer_id: user.id,
      transaction_hash: hederaResult.transactionId,
      purchase_price: tier.price,
      nft_token_id: `HEDERA-${Date.now()}-${i}`,
      metadata: {
        blockchain: "Hedera",
        network: process.env.NEXT_PUBLIC_HEDERA_NETWORK || "testnet",
        explorerUrl: hederaResult.explorerUrl,
        batchNumber: i + 1,
        totalInBatch: quantity,
      },
    }));

    const { data: tickets, error: ticketError } = await supabase
      .from("tickets")
      .insert(ticketsToCreate)
      .select();

    if (ticketError) {
      console.error("Failed to save tickets:", ticketError);

      return { error: ticketError.message };
    }

    // Update quantity sold
    await supabase
      .from("ticket_tiers")

      .update({ quantity_sold: tier.quantity_sold + quantity })

      .eq("id", tierId);

    revalidatePath("/my-tickets");
    revalidatePath("/dashboard");
    revalidatePath(`/events/${eventId}`);

    console.log(` ${quantity} ticket(s) purchased successfully!`);

    const totalSpent = tier.price * quantity;
    const pointsEarned = Math.floor(totalSpent * 10);

    console.log(`🎁 Awarding ${pointsEarned} points to user ${user.id}`);

    // Check if first purchase
    const { count: previousPurchases } = await supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("buyer_id", user.id);

    const isFirstPurchase = previousPurchases === quantity;
    const bonusPoints = isFirstPurchase ? 50 : 0;
    const totalPoints = pointsEarned + bonusPoints;

    // Update points
    const { data: profile } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", user.id)
      .single();

    const currentPoints = profile?.points || 0;

    await supabase
      .from("profiles")
      .update({ points: currentPoints + totalPoints })
      .eq("id", user.id);

    // Record transactions
    const pointsTransactions = [];

    pointsTransactions.push({
      user_id: user.id,
      points: pointsEarned,
      type: "earned",
      description: `Purchased ${quantity} ticket(s) for ${
        tier.event?.title || "event"
      }`,
      event_id: eventId,
    });

    if (bonusPoints > 0) {
      pointsTransactions.push({
        user_id: user.id,
        points: bonusPoints,
        type: "bonus",
        description: "First purchase bonus! 🎉",
        event_id: eventId,
      });
    }

    await supabase.from("points_transactions").insert(pointsTransactions);

    console.log(
      `✅ Awarded ${totalPoints} points (${pointsEarned} + ${bonusPoints} bonus)`
    );

    return {
      success: true,
      tickets,
      ticket: tickets[0], // For backward compatibility
      quantity,
      explorerUrl: hederaResult.explorerUrl,
      transactionId: hederaResult.transactionId,
      message:
        quantity > 1
          ? `Successfully purchased ${quantity} tickets!`
          : "Ticket purchased successfully!",
    };
  } catch (error) {
    console.error("Purchase error:", error);
    return { error: "Failed to purchase ticket: " + (error as Error).message };
  }
}

export async function listTicketForResale(
  ticketId: string,
  resalePrice: number
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    // Get ticket info
    const { data: ticket } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", ticketId)
      .eq("buyer_id", user.id)
      .single();

    if (!ticket) {
      return { error: "Ticket not found or not owned by you" };
    }

    // Check if already listed
    const { data: existingListing } = await supabase
      .from("resale_listings")
      .select("id")
      .eq("ticket_id", ticketId)
      .eq("status", "active")
      .single();

    if (existingListing) {
      return { error: "This ticket is already listed for resale" };
    }

    // Validate resale price
    if (resalePrice <= 0) {
      return { error: "Resale price must be greater than zero" };
    }

    // Create listing
    const { error } = await supabase.from("resale_listings").insert({
      ticket_id: ticketId,
      seller_id: user.id,
      original_price: ticket.purchase_price,
      resale_price: resalePrice,
      status: "active",
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/marketplace");

    revalidatePath("/my-tickets");

    console.log(" Ticket listed for resale:", ticketId);

    return { success: true };
  } catch (error) {
    console.error("Listing error:", error);
    return { error: "Failed to list ticket" };
  }
}

export async function createEventCertificateCollection(eventId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    // Verify user is the event organizer
    const { data: event } = await supabase
      .from("events")
      .select("id, title, organizer_id, certificate_token_id")
      .eq("id", eventId)
      .single();

    if (!event) {
      return { error: "Event not found" };
    }

    if (event.organizer_id !== user.id) {
      return {
        error: "Only event organizers can create certificate collections",
      };
    }

    if (event.certificate_token_id) {
      return {
        error: "Certificate collection already exists for this event",
        tokenId: event.certificate_token_id,
      };
    }

    console.log(" Creating NFT certificate collection for:", event.title);

    // Create the NFT collection on Hedera
    const tokenId = await createCertificateCollection(eventId, event.title);

    console.log(" Certificate collection created:", tokenId);

    const { error: updateError } = await supabase
      .from("events")
      .update({ certificate_token_id: tokenId })
      .eq("id", eventId);

    if (updateError) {
      console.error("Failed to save token ID:", updateError);
      return { error: "Failed to save certificate collection ID" };
    }

    revalidatePath(`/dashboard/events/${eventId}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      tokenId,
      message: "Certificate collection created successfully!",
    };
  } catch (error) {
    console.error("Certificate collection creation error:", error);
    return {
      error:
        "Failed to create certificate collection: " + (error as Error).message,
    };
  }
}

export async function mintCertificateForAttendee(
  eventId: string,
  attendeeId: string,
  attendeeRole: "attendee" | "speaker" | "volunteer" | "organizer" = "attendee"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  try {
    // Fetch event
    const { data: event } = await supabase
      .from("events")
      .select(
        "id, title, organizer_id, certificate_token_id, *, organizer:profiles!events_organizer_id_fkey(full_name, email)"
      )
      .eq("id", eventId)
      .single();
    console.log("Fetched event:", event);
    console.log("Token ID:", event.certificate_token_id);

    if (!event) return { error: "Event not found" };
    if (event.organizer_id !== user.id)
      return { error: "Only event organizers can mint certificates" };
    if (!event.certificate_token_id)
      return { error: "No certificate collection exists for this event." };

    // Fetch attendee
    const { data: attendee } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", attendeeId)
      .single();

    if (!attendee) return { error: "Attendee not found" };

    // Check for existing certificate
    const { data: existingCertificate } = await supabase
      .from("certificates")
      .select("id")
      .eq("event_id", eventId)
      .eq("recipient_id", attendeeId)
      .single();

    if (existingCertificate)
      return { error: "Certificate already minted for this attendee" };

    console.log(
      "Minting certificate for:",
      attendee.full_name || attendee.email
    );

    // ✅ Use CertificateMetadata type — trimmed values to stay under Hedera limit
    const metadata: CertificateMetadata = {
      eventName: event.title.slice(0, 25), // max 25 chars
      recipientName: (attendee.full_name || attendee.email).slice(0, 25),
      role: attendeeRole,
      date: new Date(event.event_date).toISOString().split("T")[0],
      eventId: eventId.slice(0, 8),
    };

    const jsonLength = JSON.stringify(metadata).length;
    if (jsonLength > 100) {
      console.warn(
        `⚠️ Metadata too long (${jsonLength} bytes). Consider shortening values.`
      );
    }

    // Mint on Hedera
    const serialNumber = await mintCertificate(
      event.certificate_token_id,
      attendeeId,
      metadata
    );

    console.log("Certificate minted! Serial:", serialNumber);

    // Save in Supabase
    const { data: certificate, error: certError } = await supabase
      .from("certificates")
      .insert({
        event_id: eventId,
        recipient_id: attendeeId,
        nft_token_id: event.certificate_token_id,
        nft_serial_number: serialNumber,
        role: attendeeRole,
        metadata,
        issued_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (certError) {
      console.error("Failed to save certificate:", certError);
      return { error: "Certificate minted but failed to save record" };
    }

    revalidatePath("/my-certificates");
    revalidatePath(`/dashboard/events/${eventId}`);

    return {
      success: true,
      certificate,
      serialNumber,
      message: `Certificate minted successfully for ${
        attendee.full_name || attendee.email
      }!`,
    };
  } catch (error) {
    console.error("Certificate minting error:", error);
    return { error: "Failed to mint certificate: " + (error as Error).message };
  }
}

export async function batchMintCertificates(
  eventId: string,
  role: "attendee" | "speaker" | "volunteer" = "attendee"
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    // Verify organizer
    const { data: event } = await supabase
      .from("events")
      .select("id, organizer_id, certificate_token_id, title")
      .eq("id", eventId)
      .single();

    if (!event) {
      return { error: "Event not found" };
    }

    if (event.organizer_id !== user.id) {
      return { error: "Only event organizers can mint certificates" };
    }

    if (!event.certificate_token_id) {
      return {
        error: "No certificate collection exists. Create one first.",
      };
    }

    const { data: tickets } = await supabase
      .from("tickets")
      .select("buyer_id")
      .eq("event_id", eventId);

    if (!tickets || tickets.length === 0) {
      return { error: "No attendees found for this event" };
    }

    const uniqueBuyerIds = [
      ...new Set(
        tickets.map((ticket: { buyer_id: string }) => ticket.buyer_id)
      ),
    ];

    const { data: attendees } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", uniqueBuyerIds);

    if (!attendees || attendees.length === 0) {
      return { error: "No attendee profiles found" };
    }

    const { data: existingCerts } = await supabase
      .from("certificates")
      .select("recipient_id")
      .eq("event_id", eventId);

    const existingRecipients = new Set(
      existingCerts?.map((c) => c.recipient_id) || []
    );

    const attendeesToMint = attendees.filter(
      (a) => !existingRecipients.has(a.id)
    );

    if (attendeesToMint.length === 0) {
      return {
        error: "All attendees already have certificates",
        alreadyMinted: existingRecipients.size,
      };
    }

    console.log(`Batch minting ${attendeesToMint.length} certificates...`);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Mint certificates
    for (const attendee of attendeesToMint) {
      try {
        const result = await mintCertificateForAttendee(
          eventId,
          attendee.id,
          role
        );

        if (result.success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push(
            `${attendee.full_name || attendee.email}: ${result.error}`
          );
        }
      } catch (error) {
        results.failed++;
        results.errors.push(
          `${attendee.full_name || attendee.email}: ${(error as Error).message}`
        );
      }
    }

    revalidatePath("/my-certificates");
    revalidatePath(`/dashboard/events/${eventId}`);

    return {
      success: true,
      results,
      message: `Minted ${results.success} certificate(s). ${results.failed} failed.`,
    };
  } catch (error) {
    console.error("Batch minting error:", error);
    return {
      error: "Failed to batch mint certificates: " + (error as Error).message,
    };
  }
}

/**
 * Initialize Paystack payment for ticket purchase
 */
export async function initializePayment(
  eventId: string,
  tierId: string,
  quantity: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    // Get tier and event info
    const { data: tier } = await supabase
      .from("ticket_tiers")
      .select("*, event:events(*)")
      .eq("id", tierId)
      .single();

    if (!tier) {
      return { error: "Ticket tier not found" };
    }

    if (tier.event.organizer_id === user.id) {
      return {
        error: "Event organizers cannot purchase tickets for their own events.",
      };
    }

    if (tier.event.max_tickets_per_user !== null) {
      const { count: existingTickets } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId)
        .eq("buyer_id", user.id);

      const totalAfterPurchase = (existingTickets || 0) + quantity;

      if (totalAfterPurchase > tier.event.max_tickets_per_user) {
        const remaining =
          tier.event.max_tickets_per_user - (existingTickets || 0);
        return {
          error: `Purchase limit exceeded. You can only purchase ${remaining} more ticket(s).`,
        };
      }
    }

    // Check availability
    if (tier.quantity_sold + quantity > tier.quantity_total) {
      const available = tier.quantity_total - tier.quantity_sold;
      return {
        error: `Not enough tickets available! Only ${available} ticket(s) remaining.`,
      };
    }

    const totalAmount = tier.price * quantity;

    return {
      success: true,
      amount: totalAmount * 100,
      email: user.email || "",
      eventTitle: tier.event.title,
      tierName: tier.tier_name,
      quantity,
      metadata: {
        eventId,
        tierId,
        quantity,
        userId: user.id,
      },
    };
  } catch (error) {
    console.error("Payment initialization error:", error);
    return { error: "Failed to initialize payment" };
  }
}
