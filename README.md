This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Currently, for the frontend to work with the backend, you need to run the browser without CORS.
Follow these steps to run the chrome browser without CORS (on Windows):

1. press <kbd>Win</kbd> + <kbd>R</kbd> to open windows run dialog
2. paste in the following: 
```
chrome.exe --disable-web-security --user-data-dir="C:\chrome-dev-session"
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Single Sing-On (SSO)

For using SSO in the dev environment you need to have an account in the M365 DEV Tenant. If you don't have an account yet, you can reach out to Floran Heidinger or Andreas Weber asking for an account with your EDAG ID (ab12345).
After successfully activating your DEV account, you should be able to login into the application using that account.

For SSO to work, the frontend must necessarily run locally on port `3000`, since this port is specified in the callback URL in Microsoft Entra ID.
If the callback URL needs to be changed, reach out to Florian Heidinger or Andreas Weber.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js).
