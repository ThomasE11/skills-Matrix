import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Allow access to auth pages
    if (pathname.startsWith('/auth/')) {
      return NextResponse.next();
    }

    // Redirect authenticated users from root to their dashboard
    if (pathname === '/' && token) {
      if (token.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      } else if (token.role === 'STUDENT') {
        return NextResponse.redirect(new URL('/student/dashboard', req.url));
      } else if (token.role === 'LECTURER') {
        // Check if lecturer is in student view mode
        const viewMode = token.viewMode || 'lecturer';
        if (viewMode === 'student') {
          return NextResponse.redirect(new URL('/student/dashboard', req.url));
        }
        return NextResponse.redirect(new URL('/lecturer/dashboard', req.url));
      }
    }

    // Protect student routes
    if (pathname.startsWith('/student/')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
      // Allow access if user is a student OR if user is a lecturer in student view mode OR if user is admin
      if (token.role !== 'STUDENT' && !(token.role === 'LECTURER' && token.viewMode === 'student') && token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }

    // Protect lecturer routes
    if (pathname.startsWith('/lecturer/')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
      // Allow lecturers AND admins to access lecturer routes
      if (token.role !== 'LECTURER' && token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
      // If lecturer is in student view mode, redirect them to student dashboard (but not admins)
      if (token.viewMode === 'student' && token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/student/dashboard', req.url));
      }
    }

    // Protect admin routes
    if (pathname.startsWith('/admin/')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
      // Only allow admins to access admin routes
      if (token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to public pages
        if (pathname === '/' || pathname.startsWith('/auth/')) {
          return true;
        }
        
        // Require authentication for protected routes
        if (pathname.startsWith('/student/') || pathname.startsWith('/lecturer/') || pathname.startsWith('/admin/')) {
          return !!token;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    // Match all routes except API routes, static files, and other Next.js internals
    '/((?!api|_next/static|_next/image|favicon.ico|design-bg-video.mp4|.*\\..*$).*)',
  ],
};
