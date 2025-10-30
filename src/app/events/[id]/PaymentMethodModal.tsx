// src/app/events/[id]/PaymentMethodModal.tsx

"use client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectPaystack: () => void;
  onSelectHedera: () => void;
  amount: number;
  tierName: string;
  quantity: number;
}

export default function PaymentMethodModal({
  isOpen,
  onClose,
  onSelectPaystack,
  onSelectHedera,
  amount,
  tierName,
  quantity,
}: Props) {
  if (!isOpen) return null;

  const amountNaira = amount * 1650;
  const amountHBAR = Math.ceil(amount / 10);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Choose Payment Method
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {quantity > 1 ? `${quantity} × ` : ""}
            {tierName} • ${amount}
          </p>
        </div>

        {/* Payment Options */}
        <div className="space-y-3 mb-6">
          {/* Paystack Option */}
          <button
            onClick={onSelectPaystack}
            className="w-full p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition group text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💳</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                  Card / Bank Transfer
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Pay with debit card, bank transfer, or USSD
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-medium">
                    Instant
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Powered by Paystack
                  </span>
                </div>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">
                  ₦{amountNaira.toLocaleString()}
                </p>
              </div>
            </div>
          </button>

          {/* Hedera Option */}
          <button
            onClick={onSelectHedera}
            className="w-full p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition group text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🔗</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                  Hedera (HBAR)
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Pay with HBAR from your Hedera wallet
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-medium">
                    Blockchain
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Lower fees
                  </span>
                </div>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {amountHBAR} HBAR
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          Cancel
        </button>

        {/* Info */}
        <p className="text-xs text-center text-slate-500 dark:text-slate-500 mt-4">
          All payments are secured and verified on blockchain
        </p>
      </div>
    </div>
  );
}
