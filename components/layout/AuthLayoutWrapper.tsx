// components/layout/AuthLayoutWrapper.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AuthLayoutWrapperProps {
  children: React.ReactNode;
}

export const AuthLayoutWrapper = ({ children }: AuthLayoutWrapperProps) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  // Don't show the authenticated layout on the login page
  const isLoginPage = pathname === '/login';
  
  // Define admin-only routes
  const isAdminRoute = pathname === '/' || // Dashboard
                       pathname.startsWith('/users') || // User management
                       (pathname.startsWith('/projects') && !pathname.startsWith('/projects/') && pathname !== '/my-projects'); // Project listing, not details
  
  // Check if user has necessary permissions
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // If trying to access admin route but not admin, redirect
      if (isAdminRoute && !isAdmin) {
        router.push('/my-projects');
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, isAdminRoute, pathname, router]);
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // For login page, show simple layout without sidebar
  if (isLoginPage || !isAuthenticated) {
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