// src/libs/types/event.ts

export interface Profile {
  id: string;
  full_name?: string | null;
  email?: string | null;
  verification_badge?: boolean;
}

export interface TicketTier {
  id: string;
  event_id: string;
  tier_name: string;
  price: number;
  quantity_total: number;
  quantity_sold: number;
  benefits?: string[];
  created_at?: string;
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description?: string | null;
  event_date: string;
  location: string;
  image_url?: string | null;
  is_paid: boolean;
  is_active: boolean;
  max_tickets_per_user?: number | null;
  created_at?: string;
  updated_at?: string;
  organizer?: Profile;
  ticket_tiers?: TicketTier[];
}

export interface EventWithOrganizer extends Event {
  organizer: Profile;
}

export interface EventWithTiers extends Event {
  ticket_tiers: TicketTier[];
}

export interface EventComplete extends Event {
  organizer: Profile;
  ticket_tiers: TicketTier[];
}

export interface Ticket {
  id: string;
  event_id: string;
  tier_id?: string | null;
  buyer_id: string;
  transaction_hash?: string | null;
  nft_token_id?: string | null;
  purchase_price: number;
  image_url?: string | null;
  purchase_date?: string;
  is_used?: boolean;
  metadata?: TicketMetadata;
}

export interface TicketMetadata {
  blockchain?: string;
  network?: string;
  explorerUrl?: string;
  batchNumber?: number;
  totalInBatch?: number;
}

export interface ResaleListing {
  id: string;
  ticket_id: string;
  seller_id: string;
  original_price: number;
  resale_price: number;
  status: "active" | "sold" | "cancelled";
  listed_at?: string;
  sold_at?: string | null;
}
