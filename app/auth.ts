import authApiService from "@/services/authApi";
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
  providers: [
    MicrosoftEntraID({
      authorization: {
        params: {
          scope: process.env.AZURE_AD_SCOPE,
        },
        url: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID}/oauth2/v2.0/authorize`,
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
      // FIXME: remove when backend implemented oAuth logic
      /**
       * Assuming there exists a user with username and password set to "systemadmin"
       * Loggs the user in with credentials and grabs the token to validate against the API
       * Should be removed once the backend is using the token provided by MicrosoftEntraID
       */

      // Fetch custom token from backend
      const tokens = await authApiService.login("systemadmin", "systemadmin");

      if (account && tokens?.access_token) {
        account.customAccessToken = tokens.access_token;
      }
      return true;
    },
    async jwt({ token, account }) {
      // This is called after signIn
      if (account?.customAccessToken && account.access_token) {
        token.customAccessToken = account.customAccessToken;
        token.accessToken = account.access_token
      }
      return token;
    },
    async session({ session, token }) {
      // Expose the token to the client session
      if (token?.customAccessToken) {
        session.customAccessToken = token.customAccessToken;
        session.sessionToken = token.accessToken
      }

      return session;
    },
  },
});
