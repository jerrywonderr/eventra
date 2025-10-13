// Hedera Network Configuration
export const HEDERA_CONFIG = {
  network: process.env.NEXT_PUBLIC_HEDERA_NETWORK || "testnet",
  accountId: process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID || "",
  mirrorNode:
    process.env.NEXT_PUBLIC_HEDERA_MIRROR_NODE ||
    "https://testnet.mirrornode.hedera.com",
} as const;

// Event Categories
export const EVENT_CATEGORIES = [
  "Music",
  "Conference",
  "Sports",
  "Food & Drink",
  "Art & Culture",
  "Technology",
  "Business",
  "Health & Wellness",
  "Charity",
  "Other",
] as const;

// App Configuration
export const APP_CONFIG = {
  name: "Eventra",
  description: "Decentralized Event Management Platform",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
} as const;
