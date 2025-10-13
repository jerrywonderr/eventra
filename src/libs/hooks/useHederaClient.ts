/**
 * Secure React Query hooks for Hedera operations
 * Uses Supabase Edge Functions for secure server-side blockchain operations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { hederaClientService } from "../services/hedera-client";

// Query keys for React Query
export const HEDERA_CLIENT_QUERY_KEYS = {
  hasHederaAccount: "hedera-client-has-account",
  hederaAccountId: "hedera-client-account-id",
} as const;

/**
 * Hook to create a Hedera account for the current user
 */
export function useCreateHederaAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => hederaClientService.createHederaAccount(),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: [HEDERA_CLIENT_QUERY_KEYS.hasHederaAccount],
      });
      queryClient.invalidateQueries({
        queryKey: [HEDERA_CLIENT_QUERY_KEYS.hederaAccountId],
      });
      console.log("Hedera account created:", data.accountId);
    },
    onError: (error) => {
      console.error("Failed to create Hedera account:", error);
    },
  });
}

/**
 * Hook to create an NFT token for an event
 */
export function useCreateEventToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      eventName,
      maxTickets,
    }: {
      eventId: string;
      eventName: string;
      maxTickets: number;
    }) => hederaClientService.createEventToken(eventId, eventName, maxTickets),
    onSuccess: (data) => {
      // Invalidate events queries
      queryClient.invalidateQueries({
        queryKey: ["supabase", "events"],
      });
      console.log("Event token created:", data.tokenId);
    },
    onError: (error) => {
      console.error("Failed to create event token:", error);
    },
  });
}

/**
 * Hook to mint a ticket NFT
 */
export function useMintTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      metadata,
    }: {
      eventId: string;
      metadata: {
        eventName: string;
        eventDate: string;
        seatNumber?: string;
        tier: string;
      };
    }) => hederaClientService.mintTicket(eventId, metadata),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["supabase", "tickets"],
      });
      queryClient.invalidateQueries({
        queryKey: ["supabase", "events"],
      });
      console.log("Ticket NFT minted:", data.ticket.serialNumber);
    },
    onError: (error) => {
      console.error("Failed to mint ticket NFT:", error);
    },
  });
}

/**
 * Hook to check if user has a Hedera account
 */
export function useHasHederaAccount() {
  return useQuery({
    queryKey: [HEDERA_CLIENT_QUERY_KEYS.hasHederaAccount],
    queryFn: () => hederaClientService.hasHederaAccount(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get user's Hedera account ID
 */
export function useHederaAccountId() {
  return useQuery({
    queryKey: [HEDERA_CLIENT_QUERY_KEYS.hederaAccountId],
    queryFn: () => hederaClientService.getHederaAccountId(),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
