// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthLayoutWrapper } from '@/components/layout/AuthLayoutWrapper';
import { AlertProvider } from '@/contexts/AlertContext';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Management Service',
  description: 'A management service for your application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AlertProvider>
            <AuthLayoutWrapper>
              {children}
            </AuthLayoutWrapper>
          </AlertProvider>
        </AuthProvider>
      </body>
    </html>
  );
}