import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Get main root domain from env or default
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

  // Extract subdomain (e.g. client1.yourdomain.com -> client1)
  let currentHost = hostname.replace(`.${rootDomain}`, '');

  // If visiting main domain or localhost directly, proceed normally
  if (
    hostname === rootDomain ||
    hostname.includes('localhost') ||
    hostname.includes('vercel.app') ||
    currentHost === hostname
  ) {
    return NextResponse.next();
  }

  // Rewrite request for subdomain (e.g., client1 -> /landing?subdomain=client1)
  if (currentHost && currentHost !== 'www') {
    url.pathname = `/landing`;
    url.searchParams.set('subdomain', currentHost);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
