interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  ref?: string;
  currency?: string;
  metadata?: Record<string, unknown>;
  onSuccess: (response: PaystackResponse) => void;
  onClose: () => void;
}

interface PaystackResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  trxref: string;
  message: string;
}

interface PaystackPop {
  setup(options: PaystackOptions): void;
  openIframe(): void;
}

interface Window {
  PaystackPop: {
    setup(options: PaystackOptions): PaystackPop;
  };
}
