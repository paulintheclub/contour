import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Если пользователь на странице входа и уже авторизован
    if (path === '/login' && token) {
      if (token.isSuperAdmin) {
        return NextResponse.redirect(new URL('/super-admin', req.url));
      }
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Защита роутов суперадмина
    if (path.startsWith('/super-admin')) {
      if (!token?.isSuperAdmin) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    // Защита роутов организации
    if (
      path.startsWith('/dashboard') ||
      path.startsWith('/tours') ||
      path.startsWith('/schedule') ||
      path.startsWith('/reports') ||
      path.startsWith('/booking-mails') ||
      path.startsWith('/no-shows') ||
      path.startsWith('/settings') ||
      path.startsWith('/account')
    ) {
      // Суперадмин не может заходить в панель организаций
      if (token?.isSuperAdmin) {
        return NextResponse.redirect(new URL('/super-admin', req.url));
      }
      
      // Проверяем, что у пользователя есть организация
      if (!token?.organizationId) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Публичные маршруты
        if (path === '/' || path === '/login') {
          return true;
        }
        
        // Все остальные маршруты требуют авторизации
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tours/:path*',
    '/schedule/:path*',
    '/reports/:path*',
    '/booking-mails/:path*',
    '/no-shows/:path*',
    '/settings/:path*',
    '/account/:path*',
    '/super-admin/:path*',
    '/login',
  ],
};

