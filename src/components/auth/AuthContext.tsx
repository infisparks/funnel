'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';
import { usePathname, useRouter } from 'next/navigation';
import { DEFAULT_LANDING_HTML } from '@/lib/defaultLandingHtml';

export interface PopupThemeConfig {
  primaryColor?: string;
  bgColor?: string;
  badgeText?: string;
  step1Title?: string;
  step1Subtitle?: string;
  step1ButtonText?: string;
  step2Title?: string;
  step2Subtitle?: string;
  step2ButtonText?: string;
  step3Title?: string;
  step3Subtitle?: string;
  step3ButtonText?: string;
  step4Title?: string;
  step4Subtitle?: string;
}

export interface UserWorkspace {
  id?: string;
  user_id: string;
  subdomain: string;
  custom_domain?: string;
  landing_html: string;
  survey_questions?: any[];
  trigger_buttons?: string[];
  popup_theme?: PopupThemeConfig;
  whatsapp_config?: any;
  pipeline_stages?: any[];
  google_meet_url?: string;
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
          await fetchUserWorkspace(currentSession.user.id, currentSession.user);
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
        await fetchUserWorkspace(newSession.user.id, newSession.user);
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
  const fetchUserWorkspace = async (userId: string, userObj?: User) => {
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
      } else {
        // Automatically create a private isolated workspace for new user
        const emailPrefix = userObj?.email?.split('@')[0] || `user${Math.floor(1000 + Math.random() * 9000)}`;
        const cleanSub = emailPrefix.toLowerCase().replace(/[^a-z0-9-]/g, '');

        const { data: createdWs, error: createError } = await supabase
          .from('funnel_workspaces')
          .insert({
            user_id: userId,
            subdomain: cleanSub || `user${Math.floor(1000 + Math.random() * 9000)}`,
            custom_domain: `${cleanSub || 'user'}.firstoption.cloud`,
            landing_html: DEFAULT_LANDING_HTML,
            trigger_buttons: ['Claim Free Strategy Session', 'Get Started Free'],
            popup_theme: { primaryColor: '#8146F0', themeMode: 'dark' },
            survey_questions: [
              {
                id: 'q1',
                label: 'Select Your Primary Industry',
                options: ['Service Business', 'E-commerce', 'Consulting / Agency', 'Doctor / Clinic'],
                allowMultiple: false,
              },
            ],
          })
          .select()
          .single();

        if (!createError && createdWs) {
          setWorkspace(createdWs);
        }
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
      const updatePayload: any = {
        updated_at: new Date().toISOString(),
      };

      if (config.landing_html !== undefined) updatePayload.landing_html = config.landing_html;
      if (config.trigger_buttons !== undefined) updatePayload.trigger_buttons = config.trigger_buttons;
      if (config.popup_theme !== undefined) updatePayload.popup_theme = config.popup_theme;
      if (config.survey_questions !== undefined) updatePayload.survey_questions = config.survey_questions;
      if (config.subdomain !== undefined) updatePayload.subdomain = config.subdomain;
      if (config.custom_domain !== undefined) updatePayload.custom_domain = config.custom_domain;

      // 1. Update existing workspace row for this user_id
      const { data: updated, error: updateError } = await supabase
        .from('funnel_workspaces')
        .update(updatePayload)
        .eq('user_id', user.id)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error('Supabase Update Error:', updateError);
        throw updateError;
      }

      if (updated) {
        setWorkspace(updated);
        return true;
      }

      // 2. If row does not exist yet for this user_id, insert a new record
      const defaultSub = (user.email?.split('@')[0] || `user${Math.floor(1000 + Math.random() * 9000)}`)
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '');

      const insertPayload = {
        user_id: user.id,
        subdomain: config.subdomain || defaultSub,
        custom_domain: config.custom_domain || `${config.subdomain || defaultSub}.firstoption.cloud`,
        landing_html: config.landing_html !== undefined ? config.landing_html : DEFAULT_LANDING_HTML,
        trigger_buttons: config.trigger_buttons !== undefined ? config.trigger_buttons : ['Claim Free Strategy Session'],
        popup_theme: config.popup_theme !== undefined ? config.popup_theme : { primaryColor: '#8146F0', themeMode: 'dark' },
        survey_questions: config.survey_questions !== undefined ? config.survey_questions : [],
        updated_at: new Date().toISOString(),
      };

      const { data: inserted, error: insertError } = await supabase
        .from('funnel_workspaces')
        .insert(insertPayload)
        .select()
        .single();

      if (insertError) throw insertError;
      if (inserted) setWorkspace(inserted);

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
