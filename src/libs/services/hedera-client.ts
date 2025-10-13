/**
 * Secure Hedera Client Service
 * Calls Supabase Edge Functions for secure blockchain operations
 * No private keys or sensitive operations on the client side
 */

import { createClient } from "@/libs/supabase/client";

export interface CreateHederaAccountResponse {
  success: boolean;
  accountId: string;
  message: string;
}

export interface CreateEventTokenResponse {
  success: boolean;
  tokenId: string;
  eventId: string;
  totalSupply: number;
  maxSupply: number;
  name: string;
  symbol: string;
}

export interface MintTicketResponse {
  success: boolean;
  ticket: {
    id: string;
    serialNumber: number;
    tokenId: string;
    eventId: string;
    ownerId: string;
    metadata: {
      eventName: string;
      eventDate: string;
      seatNumber?: string;
      tier: string;
    };
  };
}

export class HederaClientService {
  private supabase = createClient();

  /**
   * Create a Hedera account for the current user
   * This calls the secure Edge Function
   */
  async createHederaAccount(): Promise<CreateHederaAccountResponse> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const response = await this.supabase.functions.invoke(
      "create-hedera-account",
      {
        body: {
          userId: user.id,
          email: user.email,
        },
      }
    );

    if (response.error) {
      throw new Error(
        response.error.message || "Failed to create Hedera account"
      );
    }

    return response.data;
  }

  /**
   * Create an NFT token for an event
   * This calls the secure Edge Function
   */
  async createEventToken(
    eventId: string,
    eventName: string,
    maxTickets: number
  ): Promise<CreateEventTokenResponse> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const response = await this.supabase.functions.invoke(
      "create-event-token",
      {
        body: {
          eventId,
          eventName,
          maxTickets,
          organizerId: user.id,
        },
      }
    );

    if (response.error) {
      throw new Error(response.error.message || "Failed to create event token");
    }

    return response.data;
  }

  /**
   * Mint a ticket NFT for the current user
   * This calls the secure Edge Function
   */
  async mintTicket(
    eventId: string,
    metadata: {
      eventName: string;
      eventDate: string;
      seatNumber?: string;
      tier: string;
    }
  ): Promise<MintTicketResponse> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const response = await this.supabase.functions.invoke("mint-ticket", {
      body: {
        eventId,
        buyerId: user.id,
        metadata,
      },
    });

    if (response.error) {
      throw new Error(response.error.message || "Failed to mint ticket");
    }

    return response.data;
  }

  /**
   * Check if user has completed Hedera setup
   */
  async hasHederaAccount(): Promise<boolean> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data, error } = await this.supabase
      .from("users")
      .select("hedera_setup_completed, hedera_account_id")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      return false;
    }

    return data.hedera_setup_completed && !!data.hedera_account_id;
  }

  /**
   * Get user's Hedera account ID
   */
  async getHederaAccountId(): Promise<string | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await this.supabase
      .from("users")
      .select("hedera_account_id")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      return null;
    }

    return data.hedera_account_id;
  }
}

// Export singleton instance
export const hederaClientService = new HederaClientService();
