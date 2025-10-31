// src/app/my-tickets/ListForResaleButton.tsx

"use client";

import { useState } from "react";
import { listTicketForResale } from "@/app/actions/events";
import { useRouter } from "next/navigation";

interface Props {
  ticketId: string;
  ticketPrice: number;
}

export default function ListForResaleButton({ ticketId, ticketPrice }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [resalePrice, setResalePrice] = useState(ticketPrice);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleList() {
    if (resalePrice <= 0) {
      alert("Please enter a valid price");
      return;
    }

    if (!confirm(`List ticket for resale at $${resalePrice}?`)) {
      return;
    }

    setLoading(true);

    try {
      const result = await listTicketForResale(ticketId, resalePrice);

      if (result.error) {
        alert("❌ " + result.error);
        return;
      }

      alert("✅ Ticket listed for resale successfully!");
      setShowForm(false);
      router.refresh();
    } catch (error) {
      alert("Failed to list ticket");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition font-semibold"
      >
        List for Resale
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-2">Resale Price</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={resalePrice}
          onChange={(e) => setResalePrice(parseFloat(e.target.value))}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
          placeholder="Enter price"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Original price: ${ticketPrice}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleList}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-semibold"
        >
          {loading ? "Listing..." : "Confirm"}
        </button>
        <button
          onClick={() => setShowForm(false)}
          disabled={loading}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
