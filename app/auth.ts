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
  }

  interface Account {
    customAccessToken: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    customAccessToken: string;
    accessToken: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
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
    signIn: async ({ account, user, profile }) => {
      
      // Check for access_token or id_token
      const token = account?.access_token || account?.id_token;
      
      if (token) {
        account.customAccessToken = token;
        account.userId = "25";// TODO remove later and implement getUserId
      }
      return true;
    },
    async jwt({ token, account, user, trigger }) {
      console.log("JWT callback - trigger:", trigger, "account exists:", !!account);
      console.log("JWT callback - token before:", { 
        hasCustomAccessToken: !!token.customAccessToken, 
        hasAccessToken: !!token.accessToken 
      });
      
      // On initial sign-in, account will be present
      if (account) {
        const accountToken = account.access_token || account.id_token || account.customAccessToken;
        
        if (accountToken) {
          token.customAccessToken = accountToken;
          token.accessToken = accountToken;
        }
      }
      // On subsequent requests, just return the existing token (preserve tokens)
      
      console.log("JWT callback - token after:", { 
        hasCustomAccessToken: !!token.customAccessToken, 
        hasAccessToken: !!token.accessToken 
      });
      
      return token;
    },
    async session({ session, token }) {
      // Expose the token to the client session
      console.log("Session callback - token:", !!token?.customAccessToken);
      if (token?.customAccessToken) {
        session.customAccessToken = token.customAccessToken;
        session.sessionToken = token.accessToken;
        session.user.id = "25";
        console.log("Session callback - session tokens set successfully");
      }

      return session;
    },
  },
});