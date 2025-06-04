"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { LogIn, LogOut, User as UserIcon, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error.message);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
        <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-900/20 border border-green-800 rounded-lg">
          <UserIcon className="h-4 w-4 text-green-400" />
          <span className="text-sm text-green-400">
            {user.email || 'Anonymous User'}
          </span>
        </div>
        <button
          onClick={signOut}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link 
        href="/signin"
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <LogIn className="h-4 w-4" />
        Sign In
      </Link>
      <Link 
        href="/signup"
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <UserPlus className="h-4 w-4" />
        Sign Up
      </Link>
    </div>
  );
} 