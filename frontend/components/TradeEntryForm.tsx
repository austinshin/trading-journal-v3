"use client";

import { useState, useEffect } from 'react';
import { TradeSide, Tag } from '@/lib/supabase';
import { TradesAPI, CreateTradeData } from '@/lib/trades';
import { Upload, X, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AuthButton from './AuthButton';

const initialTrade: CreateTradeData = {
  symbol: '',
  side: 'LONG',
  quantity: 0,
  entry_price: 0,
  exit_price: 0,
  commission: 0,
  screenshots: [],
};

export default function TradeEntryForm() {
  const [trade, setTrade] = useState<CreateTradeData>(initialTrade);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setMessage({ type: 'error', text: 'Please sign in to add trades.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // Upload screenshots to Supabase Storage if any
      const screenshotUrls: string[] = [];
      for (const file of files) {
        const { data, error } = await supabase.storage
          .from('screenshots')
          .upload(`${Date.now()}-${file.name}`, file);
        
        if (error) throw error;
        if (data) screenshotUrls.push(data.path);
      }

      // Prepare trade data
      const tradeData: CreateTradeData = {
        ...trade,
        screenshots: screenshotUrls,
      };

      // Use TradesAPI to create the trade
      const newTrade = await TradesAPI.createTrade(tradeData, selectedTags.map(tag => tag.id));

      setMessage({ type: 'success', text: 'Trade saved successfully!' });
      
      // Reset form after success
      setTrade(initialTrade);
      setFiles([]);
      setSelectedTags([]);
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
      
    } catch (error: any) {
      console.error('Error saving trade:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to save trade. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    if (!user) {
      setMessage({ type: 'error', text: 'Please sign in to add tags.' });
      return;
    }

    try {
      // First check if tag exists
      const { data: existingTags, error: searchError } = await supabase
        .from('tags')
        .select()
        .eq('name', newTag.trim())
        .single();

      if (searchError && searchError.code !== 'PGRST116') {
        throw searchError;
      }

      if (existingTags) {
        if (!selectedTags.find(t => t.id === existingTags.id)) {
          setSelectedTags([...selectedTags, existingTags]);
        }
      } else {
        // Create new tag
        const { data: newTagData, error: insertError } = await supabase
          .from('tags')
          .insert({ 
            name: newTag.trim(),
            user_id: user.id 
          })
          .select()
          .single();

        if (insertError) throw insertError;
        if (newTagData) {
          setSelectedTags([...selectedTags, newTagData]);
        }
      }

      setNewTag('');
    } catch (error: any) {
      console.error('Error adding tag:', error);
      setMessage({ type: 'error', text: 'Failed to add tag. Please try again.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Authentication Status */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Trade Entry</h2>
        <AuthButton />
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-900/20 border-green-800 text-green-400' 
            : 'bg-red-900/20 border-red-800 text-red-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {!user && (
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-400">
            ⚠️ You need to sign in to add trades. Click "Sign In to Add Trades" above.
          </p>
        </div>
      )}

    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Trade Info */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-300">Date</label>
          <input
            type="date"
              value={trade.date || new Date().toISOString().split('T')[0]}
            onChange={(e) => setTrade({ ...trade, date: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-800/60 bg-gray-900/50 px-4 py-2.5 text-gray-100 placeholder:text-gray-500 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Symbol</label>
          <input
            type="text"
            value={trade.symbol || ''}
            onChange={(e) => setTrade({ ...trade, symbol: e.target.value.toUpperCase() })}
            className="mt-1 block w-full rounded-lg border border-gray-800/60 bg-gray-900/50 px-4 py-2.5 text-gray-100 placeholder:text-gray-500 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
            placeholder="AAPL"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Side</label>
          <select
            value={trade.side}
              onChange={(e) => setTrade({ ...trade, side: e.target.value as TradeSide })}
            className="mt-1 block w-full rounded-lg border border-gray-800/60 bg-gray-900/50 px-4 py-2.5 text-gray-100 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
          >
            <option value="LONG">Long</option>
            <option value="SHORT">Short</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Quantity</label>
          <input
            type="number"
            value={trade.quantity || ''}
              onChange={(e) => setTrade({ ...trade, quantity: parseFloat(e.target.value) || 0 })}
            className="mt-1 block w-full rounded-lg border border-gray-800/60 bg-gray-900/50 px-4 py-2.5 text-gray-100 placeholder:text-gray-500 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
            required
              min="1"
          />
        </div>
      </div>

      {/* Price Info */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-300">Entry Price</label>
          <input
            type="number"
            step="0.01"
            value={trade.entry_price || ''}
              onChange={(e) => setTrade({ ...trade, entry_price: parseFloat(e.target.value) || 0 })}
            className="mt-1 block w-full rounded-lg border border-gray-800/60 bg-gray-900/50 px-4 py-2.5 text-gray-100 placeholder:text-gray-500 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
            required
              min="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Exit Price</label>
          <input
            type="number"
            step="0.01"
            value={trade.exit_price || ''}
              onChange={(e) => setTrade({ ...trade, exit_price: parseFloat(e.target.value) || 0 })}
            className="mt-1 block w-full rounded-lg border border-gray-800/60 bg-gray-900/50 px-4 py-2.5 text-gray-100 placeholder:text-gray-500 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
            required
              min="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Commission</label>
          <input
            type="number"
            step="0.01"
            value={trade.commission || ''}
              onChange={(e) => setTrade({ ...trade, commission: parseFloat(e.target.value) || 0 })}
            className="mt-1 block w-full rounded-lg border border-gray-800/60 bg-gray-900/50 px-4 py-2.5 text-gray-100 placeholder:text-gray-500 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
              min="0"
          />
        </div>
      </div>

      {/* Trade Management */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-300">Stop Loss</label>
          <input
            type="number"
            step="0.01"
            value={trade.stop_loss || ''}
              onChange={(e) => setTrade({ ...trade, stop_loss: parseFloat(e.target.value) || undefined })}
            className="mt-1 block w-full rounded-lg border border-gray-800/60 bg-gray-900/50 px-4 py-2.5 text-gray-100 placeholder:text-gray-500 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
              min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Target</label>
          <input
            type="number"
            step="0.01"
            value={trade.target || ''}
              onChange={(e) => setTrade({ ...trade, target: parseFloat(e.target.value) || undefined })}
            className="mt-1 block w-full rounded-lg border border-gray-800/60 bg-gray-900/50 px-4 py-2.5 text-gray-100 placeholder:text-gray-500 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
              min="0"
          />
        </div>
      </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedTags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400"
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() => setSelectedTags(selectedTags.filter(t => t.id !== tag.id))}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              className="flex-1 rounded-lg border border-gray-800/60 bg-gray-900/50 px-4 py-2 text-gray-100 placeholder:text-gray-500 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              disabled={!user}
            />
            <button
              type="button"
              onClick={handleAddTag}
              disabled={!user}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-800/60 bg-gray-900/50 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>

      {/* Analysis */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Setup</label>
          <textarea
            value={trade.setup || ''}
            onChange={(e) => setTrade({ ...trade, setup: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-800/60 bg-gray-900/50 px-4 py-2.5 text-gray-100 placeholder:text-gray-500 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
            rows={3}
            placeholder="Describe your trade setup..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Mistakes</label>
          <textarea
            value={trade.mistakes || ''}
            onChange={(e) => setTrade({ ...trade, mistakes: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-800/60 bg-gray-900/50 px-4 py-2.5 text-gray-100 placeholder:text-gray-500 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
            rows={2}
            placeholder="What mistakes did you make?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Lessons Learned</label>
          <textarea
            value={trade.lessons || ''}
            onChange={(e) => setTrade({ ...trade, lessons: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-800/60 bg-gray-900/50 px-4 py-2.5 text-gray-100 placeholder:text-gray-500 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
            rows={2}
            placeholder="What did you learn from this trade?"
          />
        </div>
      </div>

        {/* Market Context */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300">Market Conditions</label>
            <textarea
              value={trade.market_conditions || ''}
              onChange={(e) => setTrade({ ...trade, market_conditions: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-800/60 bg-gray-900/50 px-4 py-2.5 text-gray-100 placeholder:text-gray-500 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
              rows={2}
              placeholder="Describe overall market conditions..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Sector Momentum</label>
            <textarea
              value={trade.sector_momentum || ''}
              onChange={(e) => setTrade({ ...trade, sector_momentum: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-800/60 bg-gray-900/50 px-4 py-2.5 text-gray-100 placeholder:text-gray-500 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
              rows={2}
              placeholder="Describe sector momentum..."
            />
          </div>
        </div>

      {/* Screenshots */}
      <div>
        <label className="block text-sm font-medium text-gray-300">Screenshots</label>
        <div className="mt-1 flex justify-center rounded-lg border border-dashed border-gray-800/60 px-6 py-10">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4 flex text-sm leading-6 text-gray-400">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md font-semibold text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
              >
                <span>Upload files</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files || []);
                    setFiles([...files, ...newFiles]);
                  }}
                    disabled={!user}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-gray-400">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
        {files.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="group relative rounded-lg border border-gray-800/60 p-2"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Screenshot ${index + 1}`}
                  className="h-24 w-full rounded object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((_, i) => i !== index))}
                  className="absolute -right-2 -top-2 hidden rounded-full bg-red-500 p-1 text-white group-hover:block"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
            disabled={isSubmitting || !user}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Save Trade'}
        </button>
      </div>
    </form>
    </div>
  );
} 