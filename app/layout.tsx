// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthLayoutWrapper } from '@/components/layout/AuthLayoutWrapper';
import { AlertProvider } from '@/contexts/AlertContext';
import { SessionProvider } from 'next-auth/react';
import { SessionHandler } from '@/components/auth/SessionHandler';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Open EDAG Management Service',
  description: 'A management service for open edag management service',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <AlertProvider>
            <SessionHandler>
              <AuthLayoutWrapper>
                {children}
              </AuthLayoutWrapper>
            </SessionHandler>
          </AlertProvider>
        </SessionProvider>
      </body>
    </html>
  );
}