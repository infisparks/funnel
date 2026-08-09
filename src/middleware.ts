import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = (request.headers.get('host') || '').toLowerCase();

  // Root domains that serve the main CRM admin workspace
  const isVercelDomain = hostname.includes('vercel.app');
  const isLocalhost = hostname.includes('localhost');
  const isMainRootDomain = hostname === 'firstoption.cloud' || hostname === 'www.firstoption.cloud';

  // If visiting main CRM admin domain or localhost directly (and not a rewritten subdomain), proceed normally
  if ((isVercelDomain || isLocalhost || isMainRootDomain) && !url.searchParams.has('isPublic')) {
    return NextResponse.next();
  }

  // Tenant Subdomain Access (e.g. mudassirs3s.firstoption.cloud, mudassir.firstoption.cloud, etc.)
  if (hostname.endsWith('.firstoption.cloud')) {
    const subdomain = hostname.replace('.firstoption.cloud', '');
    if (subdomain && subdomain !== 'www') {
      url.pathname = `/landing`;
      url.searchParams.set('subdomain', subdomain);
      url.searchParams.set('isPublic', 'true');
      return NextResponse.rewrite(url);
    }
  }

  // External Custom Domain Access (e.g. leads.clientbrand.com)
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
