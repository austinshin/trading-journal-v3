"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SupabaseTest() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // Try to select from a table to test the connection
        const { error } = await supabase
          .from('trades')
          .select('count')
          .limit(1);

        if (error) throw error;
        
        setStatus('connected');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-4 rounded-lg border border-gray-800/60 bg-gray-900/50">
      <h2 className="text-lg font-semibold mb-2">Supabase Connection Status</h2>
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            status === 'loading'
              ? 'bg-yellow-500'
              : status === 'connected'
              ? 'bg-green-500'
              : 'bg-red-500'
          }`}
        />
        <span className="text-sm">
          {status === 'loading'
            ? 'Testing connection...'
            : status === 'connected'
            ? 'Connected to Supabase'
            : 'Connection error'}
        </span>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
} 