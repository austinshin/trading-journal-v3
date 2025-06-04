import { supabase } from './supabase';

export interface SavedWatchlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  items?: SavedWatchlistItem[];
}

export interface SavedWatchlistItem {
  id: string;
  watchlist_id: string;
  symbol: string;
  added_at: string;
}

export interface CreateWatchlistData {
  name: string;
  description?: string;
  symbols: string[];
}

export class SavedWatchlistsAPI {
  // Get all saved watchlists for the current user, sorted by date (newest first)
  static async getUserWatchlists(): Promise<SavedWatchlist[]> {
    const { data, error } = await supabase
      .from('saved_watchlists')
      .select(`
        *,
        saved_watchlist_items (
          id,
          symbol,
          added_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved watchlists:', error);
      throw new Error('Failed to fetch saved watchlists');
    }

    return data.map(watchlist => ({
      ...watchlist,
      items: watchlist.saved_watchlist_items || []
    })) as SavedWatchlist[];
  }

  // Get a specific watchlist by ID
  static async getWatchlistById(id: string): Promise<SavedWatchlist | null> {
    const { data, error } = await supabase
      .from('saved_watchlists')
      .select(`
        *,
        saved_watchlist_items (
          id,
          symbol,
          added_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching watchlist:', error);
      return null;
    }

    return {
      ...data,
      items: data.saved_watchlist_items || []
    } as SavedWatchlist;
  }

  // Create a new saved watchlist
  static async createWatchlist(watchlistData: CreateWatchlistData): Promise<SavedWatchlist> {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // First, create the watchlist
    const { data: watchlist, error: watchlistError } = await supabase
      .from('saved_watchlists')
      .insert({
        name: watchlistData.name,
        description: watchlistData.description,
        user_id: user.id  // Explicitly set the user_id
      })
      .select()
      .single();

    if (watchlistError) {
      console.error('Error creating watchlist:', watchlistError);
      throw new Error('Failed to create watchlist');
    }

    // Then, add the symbols
    if (watchlistData.symbols.length > 0) {
      const items = watchlistData.symbols.map(symbol => ({
        watchlist_id: watchlist.id,
        symbol: symbol.toUpperCase()
      }));

      const { error: itemsError } = await supabase
        .from('saved_watchlist_items')
        .insert(items);

      if (itemsError) {
        console.error('Error adding watchlist items:', itemsError);
        // Clean up the watchlist if items failed
        await supabase.from('saved_watchlists').delete().eq('id', watchlist.id);
        throw new Error('Failed to add watchlist items');
      }
    }

    // Return the complete watchlist
    return this.getWatchlistById(watchlist.id) as Promise<SavedWatchlist>;
  }

  // Update a watchlist's metadata
  static async updateWatchlist(id: string, updates: { name?: string; description?: string }): Promise<void> {
    const { error } = await supabase
      .from('saved_watchlists')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating watchlist:', error);
      throw new Error('Failed to update watchlist');
    }
  }

  // Delete a saved watchlist (cascades to items)
  static async deleteWatchlist(id: string): Promise<void> {
    const { error } = await supabase
      .from('saved_watchlists')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting watchlist:', error);
      throw new Error('Failed to delete watchlist');
    }
  }

  // Add a symbol to a watchlist
  static async addSymbolToWatchlist(watchlistId: string, symbol: string): Promise<void> {
    const { error } = await supabase
      .from('saved_watchlist_items')
      .insert({
        watchlist_id: watchlistId,
        symbol: symbol.toUpperCase()
      });

    if (error) {
      console.error('Error adding symbol to watchlist:', error);
      throw new Error('Failed to add symbol to watchlist');
    }
  }

  // Remove a symbol from a watchlist
  static async removeSymbolFromWatchlist(watchlistId: string, symbol: string): Promise<void> {
    const { error } = await supabase
      .from('saved_watchlist_items')
      .delete()
      .eq('watchlist_id', watchlistId)
      .eq('symbol', symbol.toUpperCase());

    if (error) {
      console.error('Error removing symbol from watchlist:', error);
      throw new Error('Failed to remove symbol from watchlist');
    }
  }

  // Load a saved watchlist into the current watchlist (returns ticker string)
  static async loadWatchlistTickers(id: string): Promise<string> {
    const watchlist = await this.getWatchlistById(id);
    if (!watchlist || !watchlist.items) {
      return '';
    }

    return watchlist.items.map(item => item.symbol).join(',');
  }
} 