"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axiosInstance';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:28471';
const APP_ROLE = 'SUPERADMIN';

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === APP_ROLE) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await api.post('/auth/login', { identifier, password });
      const body = res.data;

      const { user: userData } = body.data;

      if (userData.role !== APP_ROLE) {
        throw new Error(`Access denied: this portal is for ${APP_ROLE} accounts only.`);
      }

      login(userData);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="flex min-h-screen bg-white font-sans text-zinc-900">

      {/* LEFT SIDE - BRANDING & PRODUCT SHOWCASE (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-zinc-50 border-r border-zinc-200 p-16 select-none relative overflow-hidden">

        {/* Top Logo */}
        <div className="flex items-center gap-2.5 z-10">
          <svg className="w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-zinc-900">Donezo</span>
        </div>

        {/* Text Area */}
        <div className="my-auto z-10 max-w-lg">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-6 border border-emerald-100">
            Welcome Back {APP_ROLE}! 👋
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-zinc-900 leading-tight mb-4">
            Sign in to continue managing your <span className="text-emerald-600">projects</span>
          </h2>
          <p className="text-zinc-500 text-base leading-relaxed mb-10">
            Access your dashboard, collaborate with your team, and get things done efficiently.
          </p>

          {/* Dashboard Preview Placeholder Box (80% width) */}
          {/* Dashboard Preview Image (80% width) */}
          <div className="relative w-full max-w-[100%] aspect-[16/10] rounded-2xl overflow-hidden border border-zinc-300 bg-zinc-50 shadow-sm mx-auto">
            <Image
              src="/dashboard-preview.png"
              alt="Dashboard preview"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

        </div>

        {/* Footer info text */}
        <div className="flex items-center gap-2 text-zinc-400 text-xs mt-auto">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Your data is secure with enterprise-grade security</span>
        </div>

      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 md:p-12 lg:p-16 min-h-screen bg-white">

        {/* Mobile Logo */}
        <div className="flex items-center gap-2.5 lg:hidden mb-12">
          <svg className="w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-zinc-900">Donezo</span>
        </div>

        {/* Main form card container */}
        <div className="my-auto max-w-md w-full mx-auto">

          <div className="mb-8 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 mb-2">Welcome Back</h1>
            <p className="text-zinc-500 text-sm">Please sign in to your account to continue</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100 flex gap-2 mb-6" role="alert">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Input Email/Mobile */}
            <div className="space-y-2">
              <label htmlFor="identifier" className="text-zinc-700 text-sm font-semibold block">Email or Mobile Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v2a3 3 0 003 3s1.233-1.397 1.233-3.486c0-2.39-2.113-5.264-5.233-5.264-3.38 0-6.19 2.756-6.19 6.188 0 3.393 2.766 6.148 6.19 6.148 1.639 0 3.125-.565 4.307-1.507" />
                  </svg>
                </div>
                <input
                  id="identifier"
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your email or mobile"
                  aria-label="Email or Mobile Address"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-zinc-200 outline-none text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm bg-white"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-zinc-700 text-sm font-semibold block">Password</label>
                <a href="#forgot" className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold transition-colors">Forgot?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  aria-label="Password"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-zinc-200 outline-none text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm bg-white"
                />
              </div>
            </div>


            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-12 rounded-lg transition-all focus:ring-4 focus:ring-emerald-100 flex items-center justify-center gap-2 disabled:bg-emerald-400 disabled:cursor-not-allowed text-sm shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>

          </form>

        </div>

        {/* Footer info lock icon (Mobile) */}
        <div className="flex items-center justify-center gap-2 text-zinc-400 text-xs mt-12 lg:hidden text-center">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Your data is secure with enterprise-grade security</span>
        </div>

      </div>

    </div>
  );
}
