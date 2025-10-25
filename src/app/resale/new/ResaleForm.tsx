"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { listTicketForResale } from '@/app/actions/events';

export default function ResaleForm({ ticketId, initialPrice }: { ticketId: string; initialPrice?: number }) {
  const [price, setPrice] = useState<number | undefined>(initialPrice);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!price || price <= 0) {
      alert('Please enter a valid price');
      return;
    }
    if (!confirm(`List ticket for resale at $${price}?`)) return;

    setLoading(true);
    try {
      type ResaleResult = { error?: string } & Record<string, unknown>;
      const result: ResaleResult = await listTicketForResale(ticketId, price);
      if (typeof result?.error === 'string') {
        alert(' ' + result.error);
        return;
      }
      alert(' Ticket listed for resale');
      router.push('/marketplace');
    } catch (err) {
      console.error(err);
      alert('Failed to list ticket');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Ticket ID</label>
        <input readOnly value={ticketId} className="w-full px-3 py-2 border rounded" />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Resale Price (USD)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={price ?? ''}
          onChange={(e) => setPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
          {loading ? 'Listing...' : 'List for Resale'}
        </button>
      </div>
    </form>
  );
}
