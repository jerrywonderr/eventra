
'use client';

import { useState } from 'react';
import { purchaseTicket } from '@/app/actions/events';
import { useRouter } from 'next/navigation';

interface Props {
  eventId: string;
  tierId: string;
  tierName: string;
  price: number;
  soldOut: boolean;
}

export default function PurchaseButton({ 
  eventId, 
  tierId, 
  tierName, 
  price, 
  soldOut 
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handlePurchase() {
    if (!confirm(`Purchase ${tierName} ticket for $${price}?`)) {
      return;
    }

    setLoading(true);

    try {
      const result = await purchaseTicket(eventId, tierId);

      if (result.error) {
        alert('❌ ' + result.error);
        return;
      }

      alert(
        '✅ Ticket purchased successfully!\n\n' +
        'Transaction ID: ' + result.ticket.transaction_hash
      );
      
      router.push('/my-tickets');
      router.refresh();

    } catch (error) {
      alert('Failed to purchase ticket');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (soldOut) {
    return (
      <button
        disabled
        className="w-full px-6 py-3 bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 rounded-lg cursor-not-allowed font-semibold"
      >
        Sold Out
      </button>
    );
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition font-semibold"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin">⏳</span>
          Processing...
        </span>
      ) : (
        `Buy ${tierName} - $${price}`
      )}
    </button>
  );
}