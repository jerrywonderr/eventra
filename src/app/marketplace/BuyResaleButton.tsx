// src/app/marketplace/BuyResaleButton.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  listingId: string;
  ticketId: string;
  price: number;
  eventTitle: string;
}

export default function BuyResaleButton({
  listingId,
  ticketId,
  price,
  eventTitle,
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handlePurchase() {
    if (!confirm(`Buy resale ticket for ${eventTitle} at $${price}?`)) {
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please log in first");
        return;
      }

      // Update listing status
      const { error: listingError } = await supabase
        .from("resale_listings")
        .update({
          status: "sold",
          sold_at: new Date().toISOString(),
        })
        .eq("id", listingId);

      if (listingError) throw listingError;

      // Transfer ticket ownership
      const { error: ticketError } = await supabase
        .from("tickets")
        .update({
          buyer_id: user.id,
          purchase_date: new Date().toISOString(),
        })
        .eq("id", ticketId);

      if (ticketError) throw ticketError;

      alert("✅ Ticket purchased successfully from resale market!");
      router.push("/my-tickets");
      router.refresh();
    } catch (error) {
      alert("Purchase failed: " + (error as Error).message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-semibold"
    >
      {loading ? "Processing..." : `Buy Now - $${price}`}
    </button>
  );
}
