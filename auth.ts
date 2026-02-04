/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role:
        | 'admin'
        | 'editor'
        | 'moderator'
        | 'support'
        | 'super_admin'
        | 'content_owner';
      full_name: string;
      email: string;
      is_active: boolean;
      last_logged_at: string;
      created_at: string;
    };
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      credentials: {},
      async authorize({ username, password }: any) {
        try {
          if (!process.env.FILMORA_DOMAIN) {
            console.error('FILMORA_DOMAIN environment variable is not set');
            throw new Error(
              'Server configuration error: API endpoint not configured',
            );
          }

          const formData = new FormData();
          formData.append('username', username.toLowerCase());
          formData.append('password', password);

          const apiUrl = `${process.env.FILMORA_DOMAIN}/auth/employee-login`;

          const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
            cache: 'no-store',
          });

          const body: any = await response.json();

          if (!response.ok || !body?.status) {
            const errorMessage =
              body?.detail?.[0]?.msg ||
              body?.error ||
              (body as any)?.message ||
              (typeof body?.detail === 'string' ? body?.detail : undefined) ||
              `Authentication failed with status ${response.status}`;

            console.error('Login API error:', {
              status: response.status,
              statusText: response.statusText,
              body,
              errorMessage,
            });

            throw new Error(errorMessage);
          }

          if (body.access_token) {
            const res = await fetch(
              `${process.env.FILMORA_DOMAIN}/current-employee`,
              {
                headers: {
                  Authorization: `Bearer ${body.access_token}`,
                },
                cache: 'no-store',
              },
            );

            const userBody = await res.json();

            if (!res.ok || !userBody?.status) {
              console.error('Failed to fetch user:', {
                status: res.status,
                statusText: res.statusText,
                body: userBody,
              });
              throw new Error(
                userBody?.error || 'Failed to fetch user information',
              );
            }

            const user = userBody.data;

            if (!user) {
              console.error('User data is missing from response');
              throw new Error('User information not found');
            }

            return {
              access_token: body.access_token,
              refresh_token: body.refresh_token,
              expires_at: getExpDateFromJWT(body.access_token),
              id: user.id || body.access_token,
              role: user.role,
              full_name: user.full_name,
            } as any;
          }

          console.error('No access token in response:', body);
          return null;
        } catch (error) {
          console.error('Authorization error:', error);
          // Re-throw to let NextAuth handle it
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    authorized({ auth: sessionAuth, request }) {
      const { pathname } = request.nextUrl;
      const isAssets =
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.startsWith('/fonts') ||
        pathname.startsWith('/images') ||
        /\.[\w]+$/.test(pathname);

      // Always allow Next.js internals and static assets
      if (isAssets) return true;
      if (pathname.startsWith('/api/auth')) return true;
      // Public routes (unauthenticated users can access)
      const publicExact = new Set(['/login', '/logout']);
      if (publicExact.has(pathname)) return true;

      return !!sessionAuth;
    },
    async jwt({ token, user, trigger, session }: any) {
      // Initial sign-in
      if (user) {
        const accessToken = user.access_token;
        const refreshToken = user.refresh_token ?? null;
        const accessTokenExpires: number =
          typeof user.accessTokenExpires === 'number'
            ? user.accessTokenExpires
            : getExpMsFromJWT(accessToken);

        return {
          ...token,
          id: user.id || token.sub,
          exp: accessTokenExpires,
          access_token: accessToken,
          role: user.role,
          full_name: user.full_name,
          refresh_token: refreshToken,
          accessTokenExpires,
          refreshAttempts: 0,
        };
      }

      if (trigger === 'update' && session?.user) {
        return { ...token, ...session.user };
      }

      if (
        typeof token.accessTokenExpires === 'number' &&
        Date.now() < token.accessTokenExpires - 30_000
      ) {
        return token;
      }

      return await refreshAccessToken(token);
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user = {
          ...session.user,
          id: token.id || token.sub,
          role: token.role,
          full_name: token.full_name,
          access_token: token.access_token ?? null,
          refresh_token: token.refresh_token ?? null,
          refreshAttempts: token.refreshAttempts,
          error: token.error,
        } as any;
      }
      session.expires = token.accessTokenExpires
        ? new Date(token.accessTokenExpires).toISOString()
        : undefined;
      return session;
    },
  },
});

async function refreshAccessToken(token: any) {
  try {
    const refreshToken = token.refresh_token;
    if (!refreshToken) throw new Error('Missing refresh_token');

    const refreshAttempts = token.refreshAttempts || 0;
    if (refreshAttempts > 3) throw new Error('Max refresh attempts exceeded');

    const response = await fetch(
      `${process.env.FILMORA_DOMAIN || 'http://localhost:3000/api/v1/dashboard'}/auth/employee-refresh-token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: 'no-store',
      },
    );

    const body: any = await response.json();
    if (!response.ok || body?.status !== 'success') {
      throw new Error(body?.error || body?.message || 'Failed to refresh');
    }

    const newAccess = body?.access_token as string;
    const newRefresh = (body?.refresh_token as string) ?? token.refresh_token;

    const accessTokenExpires = getExpMsFromJWT(newAccess);

    return {
      ...token,
      access_token: newAccess,
      refresh_token: newRefresh,
      accessTokenExpires,
      refreshAttempts: 0,
      error: undefined,
    };
  } catch (error) {
    console.error('Error refreshing access_token', error);
    const maxAttemptsReached = (token.refreshAttempts || 0) >= 3;

    if (maxAttemptsReached) return null;

    return {
      ...token,
      refreshAttempts: (token.refreshAttempts || 0) + 1,
      error: 'RefreshAccessTokenError',
    };
  }
}

function getExpDateFromJWT(token: string): Date {
  const fallbackDate = new Date();
  fallbackDate.setDate(fallbackDate.getDate() + 1);

  if (!token) return fallbackDate;

  try {
    const jsonPayload = extractJWT(token);
    if (!jsonPayload.exp) return fallbackDate;

    const expDate = new Date(jsonPayload.exp * 1000);
    if (isNaN(expDate.getTime()) || expDate < new Date()) {
      return fallbackDate;
    }
    return expDate;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return fallbackDate;
  }
}

function extractJWT(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

  return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
}

function getExpMsFromJWT(token: string | undefined): number {
  if (!token) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.getTime();
  }
  try {
    const jsonPayload = extractJWT(token);
    if (!jsonPayload.exp) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.getTime();
    }
    const expMs = jsonPayload.exp * 1000;
    // If exp is in the past or invalid, set fallback +1d
    if (!Number.isFinite(expMs) || expMs < Date.now()) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.getTime();
    }
    return expMs;
  } catch (_) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.getTime();
  }
}
