"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserPlus, Mail, Lock, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const signUpWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match');
      setAuthLoading(false);
      return;
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long');
      setAuthLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      // Show success message for email confirmation
      setAuthError('Check your email for the confirmation link!');
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const signInAnonymously = async () => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      
      // Redirect to dashboard on success
      router.push('/');
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Sign Up</h1>
          <p className="text-gray-400">Create your trading journal account</p>
        </div>

        <form onSubmit={signUpWithEmail} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>
          </div>

          {authError && (
            <div className={`p-3 rounded-lg text-sm ${
              authError.includes('Check your email') 
                ? 'bg-green-900/20 border border-green-800 text-green-400'
                : 'bg-red-900/20 border border-red-800 text-red-400'
            }`}>
              {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {authLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Sign Up
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="text-center mb-4">
            <span className="text-gray-400 text-sm">Already have an account?</span>
            <Link 
              href="/signin"
              className="ml-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">Or</span>
            </div>
          </div>

          <button
            onClick={signInAnonymously}
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <UserIcon className="h-5 w-5" />
            Continue as Guest
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link 
            href="/"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
} 