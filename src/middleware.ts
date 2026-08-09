import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = (request.headers.get('host') || '').toLowerCase();

  // Main admin platform domains
  const isVercelDomain = hostname.includes('vercel.app');
  const isLocalhost = hostname.includes('localhost');
  const isMainRootDomain = hostname === 'firstoption.cloud' || hostname === 'www.firstoption.cloud';

  // Admin access on main domain/localhost proceeds directly to CRM
  if ((isVercelDomain || isLocalhost || isMainRootDomain) && !url.searchParams.has('subdomain')) {
    return NextResponse.next();
  }

  // Extract subdomain for firstoption.cloud (e.g. mudassirs3.firstoption.cloud -> mudassirs3)
  if (hostname.endsWith('.firstoption.cloud')) {
    const subdomain = hostname.replace('.firstoption.cloud', '');
    if (subdomain && subdomain !== 'www') {
      url.pathname = `/landing`;
      url.searchParams.set('subdomain', subdomain);
      url.searchParams.set('isPublic', 'true');
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files & API routes
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
