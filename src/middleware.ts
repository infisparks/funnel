import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = (request.headers.get('host') || '').toLowerCase();

  // Root domains that serve the main CRM platform
  const isVercelDomain = hostname.includes('vercel.app');
  const isLocalhost = hostname.includes('localhost');
  const isMainRootDomain = hostname === 'firstoption.cloud' || hostname === 'www.firstoption.cloud';

  // If visiting CRM main app directly, proceed normally to CRM Dashboard
  if (isVercelDomain || isLocalhost || isMainRootDomain) {
    return NextResponse.next();
  }

  // Extract subdomain for firstoption.cloud (e.g. mkmods.firstoption.cloud -> mkmods)
  if (hostname.endsWith('.firstoption.cloud')) {
    const subdomain = hostname.replace('.firstoption.cloud', '');
    if (subdomain && subdomain !== 'www') {
      url.pathname = `/landing`;
      url.searchParams.set('subdomain', subdomain);
      return NextResponse.rewrite(url);
    }
  }

  // Custom Domain Fallback (e.g. leads.customclient.com -> /landing)
  url.pathname = `/landing`;
  url.searchParams.set('domain', hostname);
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
