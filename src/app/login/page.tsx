'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/auth/AuthContext';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Globe,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // If already logged in, redirect to /landing
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/landing');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        setSuccessMsg('Signed in successfully! Loading your workspace...');
        setTimeout(() => {
          router.push('/landing');
        }, 800);
      } else {
        // Sign Up Mode
        const cleanSub = (subdomain || email.split('@')[0])
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '')
          .trim();

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim() || email.split('@')[0],
              name: fullName.trim() || email.split('@')[0],
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Initialize user workspace in funnel_workspaces
          try {
            await supabase.from('funnel_workspaces').upsert(
              {
                user_id: data.user.id,
                subdomain: cleanSub || `user${Math.floor(1000 + Math.random() * 9000)}`,
                custom_domain: `${cleanSub || 'user'}.firstoption.cloud`,
                landing_html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>My Funnel</title></head><body style="font-family:sans-serif;padding:40px;text-align:center;"><h1>Welcome to My Funnel</h1><p>Start customizing your landing page in the studio.</p><button style="padding:12px 24px;background:#8146F0;color:#fff;border:none;border-radius:8px;font-size:16px;cursor:pointer;">Book Strategy Session</button></body></html>`,
                trigger_buttons: ['Book Strategy Session'],
                popup_theme: { primaryColor: '#8146F0', themeMode: 'dark' },
                survey_questions: [
                  {
                    id: 'q1',
                    label: 'Select Your Primary Industry',
                    options: ['Service Business', 'E-commerce', 'Consulting / Agency', 'Doctor / Clinic'],
                    allowMultiple: false,
                  },
                ],
              },
              { onConflict: 'user_id' }
            );
          } catch (wsErr) {
            console.warn('Workspace init notice:', wsErr);
          }

          setSuccessMsg('Account created successfully! Loading your private workspace...');
          setTimeout(() => {
            router.push('/landing');
          }, 1000);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#F5F6F8] p-4 font-sans text-[#111827]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Executive Funnel Platform</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
            {mode === 'signin' ? 'Sign In to Your Workspace' : 'Create Your Workspace'}
          </h1>
          <p className="text-xs text-[#6B7280]">
            {mode === 'signin'
              ? 'Enter your credentials to access your private landing page, leads, and calendar.'
              : 'Register your account to manage your isolated funnel and landing pages.'}
          </p>
        </div>

        {/* Auth Mode Switcher Tabs */}
        <div className="flex items-center p-1 bg-gray-200/80 rounded-2xl border border-gray-200">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-[#111827] shadow-2xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-[#111827] shadow-2xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Auth Card */}
        <Card padding="lg" className="bg-white border border-[#E5E7EB] shadow-md rounded-2xl space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <>
                <Input
                  label="Full Name *"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  leftIcon={<User className="w-4 h-4 text-gray-400" />}
                />

                <Input
                  label="Choose Subdomain Name *"
                  type="text"
                  required
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  placeholder="e.g. mybusiness"
                  leftIcon={<Globe className="w-4 h-4 text-gray-400" />}
                />
              </>
            )}

            <Input
              label="Work Email Address *"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
            />

            <Input
              label="Password *"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 font-bold shadow-xs cursor-pointer"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {mode === 'signin' ? 'Sign In to Workspace 🚀' : 'Create & Launch Workspace ✨'}
            </Button>
          </form>

          {/* Footer Security Badges */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-semibold">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>RLS Row-Level Data Security</span>
            </div>
            <span>Private Tenant Storage</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
