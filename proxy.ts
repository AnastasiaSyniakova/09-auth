import type { AxiosResponse } from 'axios';
import { parseSetCookie } from 'cookie';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { checkSession } from '@/lib/api/serverApi';

const privateRoutes = ['/notes', '/profile'];
const publicRoutes = ['/sign-in', '/sign-up'];

type CookieStore = Awaited<ReturnType<typeof cookies>>;

function updateSessionCookies(
  cookieStore: CookieStore,
  sessionResponse: AxiosResponse,
): void {
  const setCookie = sessionResponse.headers['set-cookie'];
  const cookieArray = Array.isArray(setCookie)
    ? setCookie
    : setCookie
      ? [setCookie]
      : [];

  for (const cookieString of cookieArray) {
    const parsedCookie = parseSetCookie(cookieString);

    if (parsedCookie.value) {
      cookieStore.set(parsedCookie.name, parsedCookie.value, parsedCookie);
    }
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken');
  const refreshToken = cookieStore.get('refreshToken');
  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (!accessToken && refreshToken) {
    try {
      const sessionResponse = await checkSession();
      updateSessionCookies(cookieStore, sessionResponse);

      return isPublicRoute
        ? NextResponse.redirect(new URL('/', request.url))
        : NextResponse.next();
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
  matcher: [
    '/notes/:path*',
    '/profile/:path*',
    '/sign-in/:path*',
    '/sign-up/:path*',
  ],
};
