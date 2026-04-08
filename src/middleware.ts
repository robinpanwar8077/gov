import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose';
import { Role } from '@/lib/types';

const SECRET_KEY = process.env.JWT_SECRET || "default_development_secret_key_123";
const key = new TextEncoder().encode(SECRET_KEY);

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define public paths that don't require authentication
    const publicPaths = ['/', '/login', '/signup', '/signup/verify', '/verify', '/unauthorized', '/forgot-password', '/reset-password', '/blog', '/resources'];
    const authPages = ['/login', '/signup', '/forgot-password', '/reset-password'];

    const session = request.cookies.get('session')?.value;

    if (authPages.includes(path) && session) {
        try {
            const { payload } = await jwtVerify(session, key);
            const role = payload.role as Role;
            let target = '/';
            if (role === Role.VENDOR) target = '/vendor/dashboard';
            else if (role === Role.OEM) target = '/oem/dashboard';
            else if (role === Role.CONSULTANT) target = '/consultant/dashboard';
            else if (role === Role.ADMIN) target = '/admin/dashboard';

            return NextResponse.redirect(new URL(target, request.url));
        } catch (e) {
            // Invalid token, allow access to auth pages
        }
    }

    if (
        publicPaths.includes(path) ||
        path.startsWith('/api') ||
        path.startsWith('/_next') ||
        path.startsWith('/static') ||
        path.includes('.') ||
        path.startsWith('/blog') ||
        path.startsWith('/resources')
    ) {
        return NextResponse.next();
    }


    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const { payload } = await jwtVerify(session, key);
        const role = payload.role as Role;

        // Role based protection
        if (path.startsWith('/vendor') && role !== Role.VENDOR) {
            if (role !== Role.ADMIN) {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }
        }
        if (path.startsWith('/oem') && role !== Role.OEM) {
            if (role !== Role.ADMIN) {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }
        }
        if (path.startsWith('/consultant') && role !== Role.CONSULTANT) {
            if (role !== Role.ADMIN) {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }
        }
        if (path.startsWith('/admin') && role !== Role.ADMIN) {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }

        const response = NextResponse.next();
        response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
        return response;

    } catch {
        // Session invalid
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
