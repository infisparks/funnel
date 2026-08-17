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
    let targetSub = (subdomain || domain || '').toLowerCase().trim();
    if (targetSub.endsWith('.firstoption.cloud')) {
      targetSub = targetSub.replace('.firstoption.cloud', '');
    }

    if (!targetSub) {
      return null;
    }

    const { data, error } = await supabase
      .from('funnel_workspaces')
      .select('*')
      .or(`subdomain.eq.${targetSub},custom_domain.ilike.%${targetSub}%`)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return data;
    }
    if (error) {
      console.error('[Public Server Fetch Error]:', error);
    }
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
