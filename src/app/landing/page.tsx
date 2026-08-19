import React from 'react';
import { headers } from 'next/headers';
import { LandingPageClient } from './LandingPageClient';
import { DEFAULT_LANDING_HTML } from '@/lib/defaultLandingHtml';

import { supabase } from '@/lib/supabaseClient';

interface SearchParamsProps {
  subdomain?: string;
  domain?: string;
  isPublic?: string;
}

// Server Component: Performs rapid fetch for PUBLIC published landing page view only
async function fetchPublicSubdomainWorkspace(subdomain?: string, domain?: string) {
  try {
    const rawDomain = (domain || subdomain || '').toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    const subPart = rawDomain.includes('.') ? rawDomain.split('.')[0] : rawDomain;

    if (!rawDomain && !subPart) {
      return null;
    }

    // 1. Try finding workspace by exact custom_domain or subdomain
    const { data } = await supabase
      .from('funnel_workspaces')
      .select('*')
      .or(`custom_domain.eq.${rawDomain},subdomain.eq.${subPart},custom_domain.ilike.%${subPart}%,subdomain.ilike.%${subPart}%`)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      return data;
    }

    // 2. Fallback: match by custom_domain contains
    const { data: fallbackMatch } = await supabase
      .from('funnel_workspaces')
      .select('*')
      .ilike('custom_domain', `%${rawDomain}%`)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fallbackMatch) {
      return fallbackMatch;
    }

    // 3. Fallback: Return the most recent active workspace
    const { data: defaultWs } = await supabase
      .from('funnel_workspaces')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return defaultWs || null;
  } catch (err) {
    console.error('[Public Server Fetch Exception]:', err);
  }
  return null;
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsProps>;
}) {
  const resolvedParams = await searchParams;
  const headersList = await headers();
  const host = (headersList.get('host') || '').toLowerCase();

  const isSubdomainHost =
    host.includes('.') &&
    !host.includes('localhost') &&
    !host.includes('vercel.app') &&
    host !== 'firstoption.cloud' &&
    host !== 'www.firstoption.cloud';

  let subdomainName = resolvedParams.subdomain || resolvedParams.domain || '';
  if (!subdomainName && host.endsWith('.firstoption.cloud')) {
    subdomainName = host.replace('.firstoption.cloud', '');
  }

  const isPublicView =
    resolvedParams.isPublic === 'true' ||
    !!resolvedParams.subdomain ||
    !!resolvedParams.domain ||
    isSubdomainHost;

  // If in CRM Admin mode, do NOT fetch random public workspace from server.
  // The client will securely load only the authenticated user's workspace via AuthContext.
  if (!isPublicView) {
    return (
      <LandingPageClient
        initialHtmlCode=""
        initialWorkspace={null}
        isPublicView={false}
        subdomainName=""
      />
    );
  }

  // PUBLIC VISITOR MODE: Fetch the specific published workspace by subdomain/domain
  const publicWorkspace = await fetchPublicSubdomainWorkspace(subdomainName, resolvedParams.domain);
  const initialHtml = publicWorkspace?.landing_html || DEFAULT_LANDING_HTML;

  return (
    <LandingPageClient
      initialHtmlCode={initialHtml}
      initialWorkspace={publicWorkspace}
      isPublicView={true}
      subdomainName={subdomainName}
    />
  );
}
