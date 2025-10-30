// src/app/events/[id]/PurchaseButton.tsx

"use client";

import { useState } from "react";
import { initializePayment, purchaseTicket } from "@/app/actions/events";
import { useRouter } from "next/navigation";
import PaymentMethodModal from "./PaymentMethodModal";

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
  userCurrentTickets = 0,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const router = useRouter();

  const limit = maxPerUser ?? 10;
  const remainingAllowed = limit - userCurrentTickets;
  const hasReachedLimit = userCurrentTickets >= limit;

  async function handlePaystackPayment() {
    setShowPaymentModal(false);
    setLoading(true);

    const totalPrice = price * quantity;

    try {
      console.log("Initializing Paystack payment...");
      const paymentInit = await initializePayment(eventId, tierId, quantity);

      if (paymentInit.error || !paymentInit.email || !paymentInit.amount) {
        alert("❌ " + (paymentInit.error || "Payment initialization failed"));
        setLoading(false);
        return;
      }

      const paymentReference = `${Date.now()}-${eventId.substring(0, 8)}`;

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: paymentInit.email,
        amount: paymentInit.amount,
        currency: "NGN",
        ref: paymentReference,
        metadata: paymentInit.metadata,

        onSuccess: () => {}, // Empty but required

        onClose: () => {}, // Empty but required
      });

      handler.openIframe();

      // Stop loading and redirect immediately after popup opens
      setTimeout(() => {
        setLoading(false);
        // Redirect to success page regardless of callback
        router.push(`/payment-success?ref=${paymentReference}&method=paystack`);
      }, 2000);
    } catch (error) {
      console.error("Paystack payment error:", error);
      alert("❌ Payment failed. Please try again.");
      setLoading(false);
    }
  }

  async function handleHederaPayment() {
    setShowPaymentModal(false);
    setLoading(true);

    const totalPrice = price * quantity;

    if (
      !confirm(
        `Purchase ${quantity} ${tierName} ticket${
          quantity > 1 ? "s" : ""
        } for $${totalPrice}?\n\n` +
          "This will be recorded on Hedera blockchain."
      )
    ) {
      setLoading(false);
      return;
    }

    try {
      console.log("Processing Hedera payment...");
      const result = await purchaseTicket(eventId, tierId, quantity);

      if (result.error) {
        alert("❌ Purchase Failed\n\n" + result.error);
        setLoading(false);
        return;
      }

      // Redirect to success page
      router.push(`/payment-success?ref=${result.transactionId}&method=hedera`);
    } catch (error) {
      console.error("Hedera payment error:", error);
      alert("❌ Purchase failed. Please try again.");
      setLoading(false);
    }
  }

  function handlePurchaseClick() {
    setShowPaymentModal(true);
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
          You`ve reached the purchase limit for this event ({maxPerUser}{" "}
          tickets)
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Quantity Selector */}
        {remainingAllowed > 1 && (
          <div className="flex items-center gap-4 justify-center bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
            <label className="text-sm font-medium">Quantity:</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || loading}
                className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                −
              </button>
              <span className="w-12 text-center font-bold">{quantity}</span>
              <button
                type="button"
                onClick={() =>
                  setQuantity(Math.min(remainingAllowed, quantity + 1))
                }
                disabled={quantity >= remainingAllowed || loading}
                className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Show remaining tickets info */}
        {maxPerUser !== null &&
          maxPerUser !== undefined &&
          remainingAllowed > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              You can purchase up to {remainingAllowed} more ticket
              {remainingAllowed !== 1 ? "s" : ""}
            </p>
          )}

        {/* Purchase Button */}
        <button
          onClick={handlePurchaseClick}
          disabled={loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition font-semibold"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Processing Payment...
            </span>
          ) : (
            <>
              <span className="block">Buy Ticket{quantity > 1 ? "s" : ""}</span>
              <span className="block text-lg font-bold">
                ${(price * quantity).toFixed(2)}
              </span>
              <span className="block text-xs opacity-80">
                {quantity > 1 ? `${quantity} × ` : ""}
                {tierName} • Choose Payment Method
              </span>
            </>
          )}
        </button>
      </div>

      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSelectPaystack={handlePaystackPayment}
        onSelectHedera={handleHederaPayment}
        amount={price * quantity}
        tierName={tierName}
        quantity={quantity}
      />
    </>
  );
}
