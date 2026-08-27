import type { AxiosResponse } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { checkSession } from '@/lib/api/serverApi';

const privateRoutes = ['/notes', '/profile'];
const publicRoutes = ['/sign-in', '/sign-up'];

function copySessionCookies(
  response: NextResponse,
  sessionResponse: AxiosResponse,
): NextResponse {
  const setCookie = sessionResponse.headers['set-cookie'];

  if (Array.isArray(setCookie)) {
    setCookie.forEach((cookie) =>
      response.headers.append('set-cookie', cookie),
    );
  } else if (setCookie) {
    response.headers.set('set-cookie', setCookie);
  }

  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken');
  const refreshToken = request.cookies.get('refreshToken');
  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isPublicRoute = publicRoutes.includes(pathname);

  if (!accessToken && refreshToken) {
    try {
      const sessionResponse = await checkSession();
      const response = isPublicRoute
        ? NextResponse.redirect(new URL('/', request.url))
        : NextResponse.next();

      return copySessionCookies(response, sessionResponse);
    } catch {
      if (isPrivateRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  if (!accessToken && isPrivateRoute) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (accessToken && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/notes/:path*', '/profile/:path*', '/sign-in', '/sign-up'],
};
