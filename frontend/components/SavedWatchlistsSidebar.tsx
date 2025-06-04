"use client";

import { useState, useEffect } from 'react';
import { SavedWatchlist, SavedWatchlistsAPI, CreateWatchlistData } from '@/lib/saved-watchlists';
import { 
  Plus, 
  FolderOpen, 
  Trash2, 
  Edit3, 
  Calendar,
  ChevronDown,
  ChevronRight,
  Save,
  X
} from 'lucide-react';

interface SavedWatchlistsSidebarProps {
  onLoadWatchlist: (tickers: string) => void;
  currentTickers: string;
}

export default function SavedWatchlistsSidebar({ 
  onLoadWatchlist, 
  currentTickers 
}: SavedWatchlistsSidebarProps) {
  const [watchlists, setWatchlists] = useState<SavedWatchlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Create form state
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [newWatchlistDescription, setNewWatchlistDescription] = useState('');
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    loadWatchlists();
  }, []);

  const loadWatchlists = async () => {
    try {
      setIsLoading(true);
      const data = await SavedWatchlistsAPI.getUserWatchlists();
      setWatchlists(data);
    } catch (error) {
      console.error('Failed to load watchlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWatchlist = async () => {
    if (!newWatchlistName.trim()) return;

    try {
      const symbols = currentTickers
        .split(',')
        .map(t => t.trim().toUpperCase())
        .filter(Boolean);

      const watchlistData: CreateWatchlistData = {
        name: newWatchlistName.trim(),
        description: newWatchlistDescription.trim() || undefined,
        symbols
      };

      await SavedWatchlistsAPI.createWatchlist(watchlistData);
      
      // Reset form and reload
      setNewWatchlistName('');
      setNewWatchlistDescription('');
      setShowCreateForm(false);
      loadWatchlists();
    } catch (error) {
      console.error('Failed to create watchlist:', error);
    }
  };

  const handleUpdateWatchlist = async (id: string) => {
    if (!editName.trim()) return;

    try {
      await SavedWatchlistsAPI.updateWatchlist(id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined
      });
      
      setEditingId(null);
      loadWatchlists();
    } catch (error) {
      console.error('Failed to update watchlist:', error);
    }
  };

  const handleDeleteWatchlist = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await SavedWatchlistsAPI.deleteWatchlist(id);
      loadWatchlists();
    } catch (error) {
      console.error('Failed to delete watchlist:', error);
    }
  };

  const handleLoadWatchlist = async (id: string) => {
    try {
      const tickers = await SavedWatchlistsAPI.loadWatchlistTickers(id);
      onLoadWatchlist(tickers);
    } catch (error) {
      console.error('Failed to load watchlist:', error);
    }
  };

  const startEditing = (watchlist: SavedWatchlist) => {
    setEditingId(watchlist.id);
    setEditName(watchlist.name);
    setEditDescription(watchlist.description || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-64 bg-gray-900/50 backdrop-blur-sm border-l border-gray-800/60 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800/60">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-lg font-semibold text-gray-100 hover:text-white transition-colors w-full"
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
          Saved Watchlists
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="flex-1 flex flex-col">
          {/* Create Button */}
          <div className="p-4 border-b border-gray-800/60">
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Save Current Watchlist
            </button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <div className="p-4 border-b border-gray-800/60 bg-gray-800/30">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Watchlist Name
                  </label>
                  <input
                    type="text"
                    value={newWatchlistName}
                    onChange={(e) => setNewWatchlistName(e.target.value)}
                    placeholder="e.g., Small Cap Shorts"
                    className="w-full px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newWatchlistDescription}
                    onChange={(e) => setNewWatchlistDescription(e.target.value)}
                    placeholder="Notes about this watchlist..."
                    className="w-full px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateWatchlist}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Save className="h-3 w-3" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewWatchlistName('');
                      setNewWatchlistDescription('');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Watchlists List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">
                Loading watchlists...
              </div>
            ) : watchlists.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No saved watchlists yet</p>
                <p className="text-xs mt-1">Create your first one above</p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {watchlists.map((watchlist) => (
                  <div
                    key={watchlist.id}
                    className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800/70 transition-colors"
                  >
                    {editingId === watchlist.id ? (
                      // Edit Form
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2 py-1 text-sm bg-gray-900 border border-gray-700 rounded text-gray-100 focus:outline-none focus:border-blue-500"
                        />
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-2 py-1 text-sm bg-gray-900 border border-gray-700 rounded text-gray-100 focus:outline-none focus:border-blue-500 resize-none"
                          rows={2}
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleUpdateWatchlist(watchlist.id)}
                            className="flex-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="flex-1 px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-100 truncate">
                              {watchlist.name}
                            </h4>
                            {watchlist.description && (
                              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                {watchlist.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <Calendar className="h-3 w-3" />
                          {formatDate(watchlist.created_at)}
                          <span className="text-gray-600">•</span>
                          <span>{watchlist.items?.length || 0} stocks</span>
                        </div>

                        {/* Ticker Preview */}
                        {watchlist.items && watchlist.items.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {watchlist.items.slice(0, 4).map((item) => (
                                <span
                                  key={item.id}
                                  className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded"
                                >
                                  {item.symbol}
                                </span>
                              ))}
                              {watchlist.items.length > 4 && (
                                <span className="px-2 py-1 text-xs bg-gray-700/50 text-gray-400 rounded">
                                  +{watchlist.items.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleLoadWatchlist(watchlist.id)}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          >
                            <FolderOpen className="h-3 w-3" />
                            Load
                          </button>
                          <button
                            onClick={() => startEditing(watchlist)}
                            className="flex items-center justify-center px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteWatchlist(watchlist.id, watchlist.name)}
                            className="flex items-center justify-center px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 