// src/libs/services/hedera-client-mock.ts

import { createClient } from '@supabase/supabase-js';

class HederaClientServiceMock {
  // Create supabase client inside methods, not at class level
  private getSupabase() {
    if (typeof window === 'undefined') {
      // Server-side: use service role key
      return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
    } else {
      // Client-side: use anon key
      return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
  }

  /**
   * Check if user has a Hedera account
   */
  async hasHederaAccount(): Promise<boolean> {
    const supabase = this.getSupabase();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('hedera_account_id')
      .eq('id', user.id)
      .single();
    
    return !!profile?.hedera_account_id;
  }

  /**
   * Get user's Hedera account ID
   */
  async getHederaAccountId(): Promise<string | null> {
    const supabase = this.getSupabase();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('hedera_account_id')
      .eq('id', user.id)
      .single();
    
    return profile?.hedera_account_id || null;
  }

  /**
   * Create Hedera account for user (MOCKED)
   */
  async createHederaAccount(): Promise<{ accountId: string }> {
    const supabase = this.getSupabase();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated. Please log in first.');
    }

    // Generate fake account ID for demo
    const fakeAccountId = `0.0.${Math.floor(Math.random() * 9999999)}`;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update profile with fake account
    const { error } = await supabase
      .from('profiles')
      .update({
        hedera_account_id: fakeAccountId,
      })
      .eq('id', user.id);
    
    if (error) {
      console.error('Profile update error:', error);
      throw new Error('Failed to update profile: ' + error.message);
    }

    console.log('✅ Mock Hedera account created:', fakeAccountId);
    
    return { accountId: fakeAccountId };
  }

  /**
   * Create event token (MOCKED)
   */
  async createEventToken(
    eventId: string,
    eventName: string,
    maxTickets: number
  ): Promise<{ tokenId: string }> {
    const supabase = this.getSupabase();
    
    // Generate fake token ID
    const fakeTokenId = `0.0.${Math.floor(Math.random() * 9999999)}`;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update event with token ID
    const { error } = await supabase
      .from('events')
      .update({
        token_id: fakeTokenId,
      })
      .eq('id', eventId);
    
    if (error) {
      console.error('Event update error:', error);
      throw new Error('Failed to update event: ' + error.message);
    }

    console.log('✅ Mock event token created:', fakeTokenId);
    
    return { tokenId: fakeTokenId };
  }

  /**
   * Mint ticket NFT (MOCKED)
   */
  async mintTicket(
    eventId: string,
    metadata: {
      eventName: string;
      eventDate: string;
      seatNumber?: string;
      tier: string;
    }
  ): Promise<{
    ticket: {
      tokenId: string;
      serialNumber: string;
      transactionId: string;
    }
  }> {
    const supabase = this.getSupabase();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Generate fake NFT data
    const fakeTokenId = `0.0.${Math.floor(Math.random() * 9999999)}`;
    const fakeSerialNumber = `${Math.floor(Math.random() * 10000)}`;
    const fakeTransactionId = `0.0.${Math.floor(Math.random() * 9999999)}@${Date.now()}`;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get event info
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();
    
    if (!event) {
      throw new Error('Event not found');
    }

    // Create ticket record
    const { error } = await supabase
      .from('tickets')
      .insert({
        event_id: eventId,
        buyer_id: user.id,
        nft_token_id: fakeTokenId,
        nft_serial_number: fakeSerialNumber,
        transaction_hash: fakeTransactionId,
        purchase_price: 0,
        metadata: metadata,
      });
    
    if (error) {
      console.error('Ticket creation error:', error);
      throw new Error('Failed to create ticket record: ' + error.message);
    }

    console.log('✅ Mock ticket NFT minted:', fakeSerialNumber);
    
    return {
      ticket: {
        tokenId: fakeTokenId,
        serialNumber: fakeSerialNumber,
        transactionId: fakeTransactionId,
      }
    };
  }
}

// Export singleton instance
export const hederaClientService = new HederaClientServiceMock();