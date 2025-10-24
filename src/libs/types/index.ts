// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  currency: string;
  category: string;
  imageUrl?: string;
  organizerId: string;
  totalTickets: number;
  availableTickets: number;
  tokenId?: string; // Hedera Token ID for NFT tickets
  createdAt: string;
  updatedAt: string;
}

// Ticket Types
export interface Ticket {
  id: string;
  eventId: string;
  ownerId: string;
  tokenId: string; // Hedera NFT Token ID
  serialNumber: number;
  purchaseDate: string;
  price: number;
  status: "active" | "used" | "transferred" | "cancelled";
}

// User Types
export interface User {
  id: string;
  walletAddress: string;
  hederaAccountId: string;
  name?: string;
  email?: string;
  createdAt: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  eventId: string;
  buyerId: string;
  amount: number;
  currency: string;
  transactionHash: string; // Hedera transaction ID
  status: "pending" | "confirmed" | "failed";
  timestamp: string;
}

export interface TicketTier {
  id: string;
  event_id: string;
  tier_name: 'Regular' | 'VIP' | 'Early Bird';
  price: number;
  quantity_total: number;
  quantity_sold: number;
  benefits: string[];
  color_code: string;
}