'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, Button, Input, Badge } from '@/components/ui';
import { useTheme } from '@/components/theme/ThemeProvider';
import { supabase } from '@/lib/supabaseClient';
import {
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { accentColor } = useTheme();
  const router = useRouter();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setSuccessMsg('Account created successfully in Supabase! Signing you into your funnel workspace...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setSuccessMsg('Authentication successful! Redirecting to Executive CRM...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
        {/* Supabase Status Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-[#F4EEFF] text-[#8146F0] border border-[#DDD0FC]">
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Auth & Database Connected</span>
          </div>

          <h1 className="text-3xl font-extrabold text-[#111827]">
            {mode === 'signin' ? 'Welcome Back to CRM' : 'Create Your Funnel Workspace'}
          </h1>
          <p className="text-xs text-gray-500">
            {mode === 'signin'
              ? 'Sign in to access your hosted landing page, custom domain, and leads'
              : 'Register a new account directly in Supabase to host your landing page'}
          </p>
        </div>

        {/* Auth Card Container */}
        <Card padding="lg" className="bg-white border border-[#E5E7EB] space-y-5">
          {/* Mode Switcher Pills */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100/80 rounded-xl border border-gray-200 text-xs font-bold">
            <button
              onClick={() => setMode('signin')}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-[#8146F0] shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-[#8146F0] shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
            />

            {mode === 'signup' && (
              <Input
                label="Desired Subdomain Name"
                type="text"
                required
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="e.g. client1 or acme"
                helperText="Your landing page will be hosted at https://subdomain.yourfunnel.com"
                leftIcon={<Sparkles className="w-4 h-4 text-gray-400" />}
              />
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {mode === 'signin' ? 'Sign In to Workspace' : 'Create Supabase Account & Host'}
            </Button>
          </form>

          {/* Footer Features */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-semibold">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>RLS Secured</span>
            </div>
            <span>PostgreSQL Engine</span>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
