import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = (request.headers.get('host') || '').toLowerCase().split(':')[0];

  // Skip static assets, internal next routes and APIs
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 1. Localhost development support:
  if (hostname.includes('localhost') || hostname === '127.0.0.1') {
    if (url.searchParams.has('subdomain') || url.searchParams.has('domain') || url.searchParams.has('isPublic')) {
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  // 2. Main Root Admin Domains (Serves the CRM admin workspace):
  const isRootAdmin =
    hostname === 'firstoption.cloud' ||
    hostname === 'www.firstoption.cloud' ||
    hostname === 'funnel-red-six.vercel.app';

  if (isRootAdmin && !url.searchParams.has('isPublic')) {
    return NextResponse.next();
  }

  // 3. Subdomain on firstoption.cloud (e.g. akils.firstoption.cloud, akil.firstoption.cloud, etc.)
  if (hostname.endsWith('.firstoption.cloud')) {
    const subdomain = hostname.replace('.firstoption.cloud', '');
    if (subdomain && subdomain !== 'www') {
      url.pathname = `/landing`;
      url.searchParams.set('subdomain', subdomain);
      url.searchParams.set('domain', hostname);
      url.searchParams.set('isPublic', 'true');
      return NextResponse.rewrite(url);
    }
  }

  // 4. Any other linked Vercel Subdomain or Branded Custom Domain (e.g. leads.client.com, promo.brand.com)
  url.pathname = `/landing`;
  url.searchParams.set('domain', hostname);
  url.searchParams.set('isPublic', 'true');
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files & API routes
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

