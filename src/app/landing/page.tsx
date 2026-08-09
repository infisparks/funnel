import React, { Suspense } from 'react';
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

// Server Component: Performs zero-delay server-side fetch from Supabase with no-store cache
async function fetchSupabaseWorkspaceOnServer(subdomain?: string, domain?: string) {
  try {
    let targetSub = subdomain || domain || '';
    if (targetSub.endsWith('.firstoption.cloud')) {
      targetSub = targetSub.replace('.firstoption.cloud', '');
    }

    let url = `${SUPABASE_URL}/rest/v1/funnel_workspaces?select=*`;

    if (targetSub) {
      url += `&or=(subdomain.eq.${encodeURIComponent(targetSub)},custom_domain.ilike.%${encodeURIComponent(targetSub)}%)`;
    } else {
      url += `&order=updated_at.desc&limit=1`;
    }

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      cache: 'no-store', // Always fetch fresh saved HTML from Supabase with ZERO caching delay
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data[0];
      }
    }

    // Fallback: Fetch latest workspace row if specific subdomain query had no match
    const fallbackRes = await fetch(`${SUPABASE_URL}/rest/v1/funnel_workspaces?select=*&order=updated_at.desc&limit=1`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      cache: 'no-store',
    });

    if (fallbackRes.ok) {
      const fallbackData = await fallbackRes.json();
      if (Array.isArray(fallbackData) && fallbackData.length > 0) {
        return fallbackData[0];
      }
    }
  } catch (err) {
    console.error('[Server Fetch Error] Failed to fetch workspace on server:', err);
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

  // Perform zero-delay server-side fetch from Supabase
  let serverWorkspace: any = null;
  if (isPublicView) {
    serverWorkspace = await fetchSupabaseWorkspaceOnServer(subdomainName, resolvedParams.domain);
  }

  const initialHtml = serverWorkspace?.landing_html || DEFAULT_LANDING_HTML;

  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8146F0] font-bold">Loading Landing Page...</div>}>
      <LandingPageClient
        initialHtmlCode={initialHtml}
        initialWorkspace={serverWorkspace}
        isPublicView={isPublicView}
        subdomainName={subdomainName}
      />
    </Suspense>
  );
}
