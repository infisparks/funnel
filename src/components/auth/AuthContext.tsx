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
  trigger_buttons?: string[];
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
        console.error('Error fetching auth session:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserSession();

    // Listen to Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession?.user) {
        await fetchUserWorkspace(newSession.user.id);
      } else {
        setWorkspace(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch single workspace record for logged in user
  const fetchUserWorkspace = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('funnel_workspaces')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching workspace:', error);
      } else if (data) {
        setWorkspace(data);
      }
    } catch (err) {
      console.error('Error fetching user workspace:', err);
    }
  };

  // Upsert user workspace configuration (Single Row per user_id)
  const saveWorkspaceConfig = async (config: Partial<UserWorkspace>): Promise<boolean> => {
    if (!user) {
      alert('User is not authenticated');
      return false;
    }

    try {
      const payload: Partial<UserWorkspace> = {
        user_id: user.id,
        subdomain: config.subdomain || workspace?.subdomain || 'client1',
        custom_domain: config.custom_domain || workspace?.custom_domain || 'firstoption.cloud',
        landing_html: config.landing_html !== undefined ? config.landing_html : workspace?.landing_html || '<h1>My Funnel</h1>',
        survey_questions: config.survey_questions !== undefined ? config.survey_questions : workspace?.survey_questions || [],
        trigger_buttons: config.trigger_buttons !== undefined ? config.trigger_buttons : workspace?.trigger_buttons || [],
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
