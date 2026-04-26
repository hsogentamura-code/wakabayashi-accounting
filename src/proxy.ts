import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Skip public files and specific routes
    if (path.startsWith('/_next') || path.startsWith('/api') || path === '/admin/login' || path === '/favicon.ico') {
        return NextResponse.next();
    }

    const session = request.cookies.get('admin_session')?.value;

    // Require at least a viewer session for all pages
    if (session !== 'admin' && session !== 'viewer') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Require admin session for restricted routes
    const adminOnlyRoutes = [
        '/transactions/new',
        '/transactions/edit',
    ];

    if (adminOnlyRoutes.some(r => path.startsWith(r))) {
        if (session !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url)); // Redirect viewers away from admin pages
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
