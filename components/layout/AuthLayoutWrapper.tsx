// components/layout/AuthLayoutWrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSession } from 'next-auth/react';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AuthLayoutWrapperProps {
  children: React.ReactNode;
}

export const AuthLayoutWrapper = ({ children }: AuthLayoutWrapperProps) => {
  const pathname = usePathname();
  const session = useSession()
  
  // Don't show the authenticated layout on the login page
  const isLoginPage = pathname === '/login';

    if (session.status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // For login page or when not authenticated, show simple layout
  if (isLoginPage || session.status !== 'authenticated') {
    return <>{children}</>;
  }
  
  // For authenticated pages, show full layout with sidebar
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};