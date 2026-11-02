import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenRole } from '@/lib/auth';

export function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Skip public files and specific routes
    if (path.startsWith('/_next') || path.startsWith('/api') || path === '/admin/login' || path === '/favicon.ico') {
        return NextResponse.next();
    }

    const sessionCookie = request.cookies.get('admin_session')?.value;
    const role = sessionCookie ? verifyTokenRole(sessionCookie) : null;

    // Require at least a viewer session for all pages
    if (!role) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Require admin session for restricted routes
    const adminOnlyRoutes = [
        '/transactions/new',
        '/transactions/edit',
        '/transactions/duplicate',
    ];

    if (adminOnlyRoutes.some(r => path.startsWith(r))) {
        if (role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url)); // Redirect viewers away from admin pages
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
