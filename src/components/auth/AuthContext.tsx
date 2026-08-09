'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';
import { usePathname, useRouter } from 'next/navigation';

export interface UserWorkspace {
  id?: string;
  user_id: string;
  subdomain: string;
  custom_domain?: string;
  landing_html: string;
  survey_questions?: any[];
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  workspace: UserWorkspace | null;
  saveWorkspaceConfig: (config: Partial<UserWorkspace>) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [workspace, setWorkspace] = useState<UserWorkspace | null>(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  // Load user session & workspace record on mount
  useEffect(() => {
    async function loadUserSession() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          await fetchUserWorkspace(currentSession.user.id);
        }
      } catch (err) {
        console.error('Error fetching session:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserSession();

    // Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.user) {
        await fetchUserWorkspace(currentSession.user.id);
      } else {
        setWorkspace(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch the 1 workspace row for the logged-in user
  async function fetchUserWorkspace(userId: string) {
    try {
      const { data, error } = await supabase
        .from('funnel_workspaces')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (data) {
        setWorkspace(data);
      } else {
        setWorkspace(null);
      }
    } catch (err) {
      console.log('No existing workspace row found yet for user.');
    }
  }

  // Upsert (Insert or Update) the 1 workspace row for the user
  const saveWorkspaceConfig = async (config: Partial<UserWorkspace>): Promise<boolean> => {
    if (!user) {
      alert('Please sign in to save your funnel workspace configuration!');
      router.push('/login');
      return false;
    }

    try {
      const defaultSubdomain = config.subdomain || workspace?.subdomain || `client-${user.id.substring(0, 6)}`;
      const payload = {
        user_id: user.id,
        subdomain: defaultSubdomain,
        custom_domain: config.custom_domain !== undefined ? config.custom_domain : (workspace?.custom_domain || null),
        landing_html: config.landing_html || workspace?.landing_html || '<h1>My Funnel</h1>',
        survey_questions: config.survey_questions || workspace?.survey_questions || [],
        updated_at: new Date().toISOString(),
      };

      // Perform upsert on unique user_id
      const { data, error } = await supabase
        .from('funnel_workspaces')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('Supabase Upsert Error:', error);
        // Fallback: Check if record exists
        const { data: existing } = await supabase
          .from('funnel_workspaces')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing) {
          const { data: updated, error: updateError } = await supabase
            .from('funnel_workspaces')
            .update(payload)
            .eq('user_id', user.id)
            .select()
            .single();
          if (updateError) throw updateError;
          if (updated) setWorkspace(updated);
        } else {
          const { data: inserted, error: insertError } = await supabase
            .from('funnel_workspaces')
            .insert(payload)
            .select()
            .single();
          if (insertError) throw insertError;
          if (inserted) setWorkspace(inserted);
        }
      } else if (data) {
        setWorkspace(data);
      }

      return true;
    } catch (err: any) {
      console.error('Error saving workspace configuration to Supabase:', err);
      alert(`Supabase Error: ${err.message || 'Failed to save workspace'}`);
      return false;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setWorkspace(null);
    router.push('/login');
  };

  // Auth Guard: Auto-redirect unauthenticated users to /login
  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [loading, user, pathname, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        workspace,
        saveWorkspaceConfig,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
