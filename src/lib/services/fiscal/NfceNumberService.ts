import { SupabaseClient } from '@supabase/supabase-js';

export class NfceNumberService {
  /**
   * Safely retrieves and increments the next sequence number for NFC-e.
   * Invokes the PostgreSQL lock-based RPC function to avoid duplicate allocations.
   * 
   * @param supabaseClient Server-side Supabase client with database permissions
   */
  async getNextNumber(supabaseClient: SupabaseClient): Promise<number> {
    const { data, error } = await supabaseClient.rpc('get_and_increment_nfce_number');

    if (error) {
      console.error('[NfceNumberService] Failed to fetch atomic sequence number:', error);
      throw new Error(`Erro na numeração fiscal sequencial: ${error.message}`);
    }

    return data as number;
  }
}
