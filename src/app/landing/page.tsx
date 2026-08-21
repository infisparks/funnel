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

// Server Component: Performs rapid fetch for PUBLIC published landing page view
async function fetchPublicSubdomainWorkspace(subdomain?: string, domain?: string, hostHeader?: string) {
  try {
    const rawHost = (hostHeader || '').toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, '').split(':')[0];
    const rawDomain = (domain || subdomain || rawHost || '').toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, '').split(':')[0];
    const subPart = rawDomain.includes('.') ? rawDomain.split('.')[0] : rawDomain;

    if (!rawDomain && !subPart && !rawHost) {
      return null;
    }

    // 1. Exact custom_domain, subdomain, or host match
    const { data: exactMatch } = await supabase
      .from('funnel_workspaces')
      .select('*')
      .or(`custom_domain.eq.${rawHost},custom_domain.eq.${rawDomain},subdomain.eq.${subPart},subdomain.eq.${rawDomain},subdomain.eq.${rawHost}`)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (exactMatch) {
      return exactMatch;
    }

    // 2. Partial custom_domain match (e.g. testing.infispark.in -> testing)
    const { data: partialMatch } = await supabase
      .from('funnel_workspaces')
      .select('*')
      .or(`custom_domain.ilike.%${rawHost}%,custom_domain.ilike.%${subPart}%,subdomain.ilike.%${subPart}%`)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (partialMatch) {
      return partialMatch;
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
  const rawHost = (headersList.get('x-forwarded-host') || headersList.get('host') || '').toLowerCase().trim().split(':')[0];

  const isSubdomainHost =
    rawHost.includes('.') &&
    !rawHost.includes('localhost') &&
    rawHost !== 'firstoption.cloud' &&
    rawHost !== 'www.firstoption.cloud';

  let subdomainName = resolvedParams.subdomain || resolvedParams.domain || '';
  if (!subdomainName && rawHost.endsWith('.firstoption.cloud')) {
    subdomainName = rawHost.replace('.firstoption.cloud', '');
  } else if (!subdomainName && isSubdomainHost) {
    subdomainName = rawHost;
  }

  const isPublicView =
    resolvedParams.isPublic === 'true' ||
    !!resolvedParams.subdomain ||
    !!resolvedParams.domain ||
    isSubdomainHost;

  // If in CRM Admin mode (on firstoption.cloud), load only auth workspace
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

  // PUBLIC VISITOR MODE: Fetch the specific published workspace by subdomain/custom domain/host
  const publicWorkspace = await fetchPublicSubdomainWorkspace(subdomainName, resolvedParams.domain, rawHost);
  const initialHtml = publicWorkspace?.landing_html || DEFAULT_LANDING_HTML;

  return (
    <LandingPageClient
      initialHtmlCode={initialHtml}
      initialWorkspace={publicWorkspace}
      isPublicView={true}
      subdomainName={subdomainName || rawHost}
    />
  );
}
