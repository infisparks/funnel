import React, { Suspense } from 'react';
import { headers } from 'next/headers';
import { StandaloneMeetingClient } from './StandaloneMeetingClient';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://seeaubtexmusuccgdvkk.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

interface SearchParamsProps {
  subdomain?: string;
  domain?: string;
  funnel_id?: string;
}

async function fetchWorkspaceForMeeting(subdomain?: string, domain?: string, funnel_id?: string) {
  try {
    let url = `${SUPABASE_URL}/rest/v1/funnel_workspaces?select=*`;

    if (funnel_id) {
      url += `&id=eq.${encodeURIComponent(funnel_id)}`;
    } else if (subdomain) {
      url += `&or=(subdomain.eq.${encodeURIComponent(subdomain)},custom_domain.ilike.%${encodeURIComponent(subdomain)}%)`;
    } else if (domain) {
      url += `&custom_domain=eq.${encodeURIComponent(domain)}`;
    } else {
      url += `&order=updated_at.desc&limit=1`;
    }

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data[0];
      }
    }
  } catch (err) {
    console.error('Error fetching workspace for meeting:', err);
  }
  return null;
}

export default async function MeetingPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsProps>;
}) {
  const resolvedParams = await searchParams;
  const headersList = await headers();
  const host = (headersList.get('host') || '').toLowerCase();

  let subdomainName = resolvedParams.subdomain || resolvedParams.domain || '';
  if (!subdomainName && host.endsWith('.firstoption.cloud')) {
    subdomainName = host.replace('.firstoption.cloud', '');
  }

  const workspace = await fetchWorkspaceForMeeting(subdomainName, resolvedParams.domain, resolvedParams.funnel_id);

  return (
    <Suspense fallback={<div className="p-8 text-center text-amber-500 font-bold bg-[#0B0F17] min-h-screen">Loading Meeting Booking...</div>}>
      <StandaloneMeetingClient workspace={workspace} />
    </Suspense>
  );
}
