import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from "next-auth/jwt";
declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    customAccessToken: string;
    sessionToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      username?: string;
      isAdmin?: boolean;
      emailVerified?: Date | null;
    };
    error?: "RefreshAccessTokenError";
  }

  interface Account {
    customAccessToken: string;
    userData?: {
      id: string;
      name: string;
      email: string;
      username?: string;
      isAdmin?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    customAccessToken: string;
    accessToken: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    userId?: string;
    userName?: string;
    userEmail?: string;
    username?: string;
    isAdmin?: boolean;
    error?: "RefreshAccessTokenError";
  }
}

// Function to get current user data from /login endpoint using Bearer token
async function getCurrentUser(bearerToken: string) {
  try {
    const response = await fetch(`${process.env.API_BASE_URL}/login`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch current user: ${response.statusText}`);
    }

    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

// Function to refresh the access token
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    if (!token.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID!,
        client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
        scope: process.env.AZURE_AD_SCOPE || 'openid profile email offline_access',
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      customAccessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
    error: "/login", // Redirect errors to login page
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    MicrosoftEntraID({
      authorization: {
        params: {
          scope: process.env.AZURE_AD_SCOPE || "openid profile email offline_access",
        },
        url: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID}/oauth2/v2.0/authorize`,
      },
      token: {
        url: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID}/oauth2/v2.0/token`,
      },
      userinfo: {
        url: "https://graph.microsoft.com/oidc/userinfo",
      },
      clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      issuer: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID}/v2.0`,
    }),
  ],
  callbacks: {
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth;
    },
    signIn: async ({ account }) => {
      
      // Check for access_token or id_token
      const token = account?.access_token || account?.id_token;
      
      if (token) {
        account.customAccessToken = token;
        
        // Try to get user data from /login endpoint using the EntraID token
        try {
          const userData = await getCurrentUser(token);
          if (userData) {
            account.userData = userData;
          } else {
            // If backend call fails, we'll use fallback data in JWT callback
            console.warn('Could not fetch user data from backend, will use token data');
          }
        } catch (error) {
          console.warn('Backend user fetch failed, will use token data:', error);
        }
      }
      return true;
    },
    async jwt({ token, account, user }) {
      // Initial sign-in
      if (account && user) {
        const accessToken = account.access_token || account.id_token || account.customAccessToken;
        
        if (accessToken) {
          token.customAccessToken = accessToken;
          token.accessToken = accessToken;
          token.refreshToken = account.refresh_token;
          // Set expiry time (default to 1 hour if not provided)
          token.accessTokenExpires = account.expires_at 
            ? account.expires_at * 1000 
            : Date.now() + 60 * 60 * 1000;
        }
        
        // Store user data from /login endpoint if available
        if (account.userData) {
          token.userId = account.userData.id;
          token.userName = account.userData.name;
          token.userEmail = account.userData.email;
          token.username = account.userData.username;
          token.isAdmin = account.userData.isAdmin;
        } else if (user) {
          // Fallback to EntraID user data if backend call failed
          token.userId = user.id;
          token.userName = user.name || '';
          token.userEmail = user.email || '';
          token.username = user.email?.split('@')[0];
          token.isAdmin = false;
        }
      }

      // Check if token is expired and needs refresh
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        // Token is still valid
        return token;
      }

      // Token has expired, try to refresh it
      console.log('Access token expired, attempting refresh...');
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      // Handle token refresh errors
      if (token.error === "RefreshAccessTokenError") {
        // Force sign out
        session.error = "RefreshAccessTokenError";
        return session;
      }

      // Expose the token to the client session
      if (token?.customAccessToken) {
        session.customAccessToken = token.customAccessToken;
        session.sessionToken = token.accessToken;
        
        // Add user data to session
        session.user = {
          id: token.userId || '',
          name: token.userName || '',
          email: token.userEmail || '',
          username: token.username,
          isAdmin: token.isAdmin || false,
          emailVerified: null,
        };
      }

      return session;
    },
  },
});