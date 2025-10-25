// src/app/events/[id]/PurchaseButton.tsx

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
  maxPerUser?: number | null;
  userCurrentTickets?: number;
}

export default function PurchaseButton({ 
  eventId, 
  tierId, 
  tierName, 
  price, 
  soldOut,
  maxPerUser,
  userCurrentTickets = 0
}: Props) {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  // Calculate max allowed to purchase
  // const remainingAllowed = maxPerUser !== null && maxPerUser !== undefined
  //   ? maxPerUser 
  //   : 10; // Default max 10 if no limit

  // Don't allow purchase if user has reached limit
  // const hasReachedLimit = maxPerUser !== null && userCurrentTickets >= maxPerUser;
const limit = maxPerUser ?? 10; // Use 10 if null or undefined
const remainingAllowed = limit;
const hasReachedLimit = userCurrentTickets >= limit;

  async function handlePurchase() {
    const totalPrice = price * quantity;
    
    if (!confirm(
      `Purchase ${quantity} ${tierName} ticket${quantity > 1 ? 's' : ''} for $${totalPrice}?\n\n` +
      'This will be recorded on Hedera blockchain.'
    )) {
      return;
    }

    setLoading(true);

    try {
      console.log('Initiating purchase...');
      const result = await purchaseTicket(eventId, tierId, quantity);

      if (result.error) {
        alert('❌ Purchase Failed\n\n' + result.error);
        return;
      }

      // Success with blockchain proof!
      const message = quantity > 1
        ? `✅ ${quantity} Tickets Purchased Successfully!\n\n`
        : '✅ Ticket Purchased Successfully!\n\n';

      const viewOnBlockchain = confirm(
        message +
        `Blockchain Transaction ID:\n${result.transactionId}\n\n` +
        'Your purchase is permanently recorded on Hedera blockchain.\n\n' +
        'View transaction on Hedera Explorer?'
      );

      if (viewOnBlockchain && result.explorerUrl) {
        window.open(result.explorerUrl, '_blank');
      }
      
      router.push('/my-tickets');
      router.refresh();

    } catch (error) {
      console.error('Purchase error:', error);
      alert('❌ Purchase failed. Please try again.');
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

  if (hasReachedLimit) {
    return (
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg px-6 py-3">
        <p className="text-orange-800 dark:text-orange-200 text-sm text-center">
          You`ve reached the purchase limit for this event ({maxPerUser} tickets)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quantity Selector - only show if user can buy more than 1 */}
      {remainingAllowed > 1 && (
        <div className="flex items-center gap-4 justify-center bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
          <label className="text-sm font-medium">Quantity:</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              −
            </button>
            <span className="w-12 text-center font-bold">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(remainingAllowed, quantity + 1))}
              disabled={quantity >= remainingAllowed}
              className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Show remaining tickets info */}
      {maxPerUser !== null && maxPerUser !== undefined && remainingAllowed > 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          You can purchase up to {remainingAllowed} more ticket{remainingAllowed !== 1 ? 's' : ''}
        </p>
      )}

      {/* Purchase Button */}
      <button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition font-semibold"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            Processing on Hedera Blockchain...
          </span>
        ) : (
          <>
            <span className="block">
              Buy {quantity > 1 ? `${quantity} ` : ''}{tierName} Ticket{quantity > 1 ? 's' : ''}
            </span>
            <span className="block text-lg font-bold">
              ${(price * quantity).toLocaleString()}
            </span>
            <span className="block text-xs opacity-80">Verified on Hedera Blockchain</span>
          </>
        )}
      </button>
    </div>
  );
}