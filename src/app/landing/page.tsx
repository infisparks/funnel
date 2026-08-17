import React from 'react';
import { headers } from 'next/headers';
import { LandingPageClient } from './LandingPageClient';
import { DEFAULT_LANDING_HTML } from '@/lib/defaultLandingHtml';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://seeaubtexmusuccgdvkk.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

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

    const url = `${SUPABASE_URL}/rest/v1/funnel_workspaces?select=*&or=(subdomain.eq.${encodeURIComponent(targetSub)},custom_domain.ilike.%${encodeURIComponent(targetSub)}%)&limit=1`;

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      next: { revalidate: 10 }, // 10s edge cache for public visitors
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data[0];
      }
    }
  } catch (err) {
    console.error('[Public Server Fetch Error] Failed to fetch public workspace:', err);
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
