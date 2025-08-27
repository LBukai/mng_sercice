'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AuthLayoutWrapperProps {
  children: React.ReactNode;
}

export const AuthLayoutWrapper = ({ children }: AuthLayoutWrapperProps) => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const isAdmin = session?.user?.isAdmin || false;
  
  // Don't show the authenticated layout on the login page
  const isLoginPage = pathname === '/login';
  
  // Define admin-only routes
  const adminOnlyRoutes = [
    '/', // Dashboard
    '/users', // User management
    '/projects', // Project listing (not individual project pages)
    '/models', // Model and provider management
  ];
  
  // Check if current path is an admin-only route
  const isAdminRoute = adminOnlyRoutes.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    if (route === '/projects') {
      return pathname === '/projects'; // Exact match for projects listing
    }
    return pathname.startsWith(route);
  });
  
  // Handle admin access control
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // If trying to access admin route but not admin, redirect to my-projects
      if (isAdminRoute && !isAdmin) {
        router.push('/my-projects');
        return;
      }
      
      // If non-admin user is on root path, redirect to my-projects
      if (pathname === '/' && !isAdmin) {
        router.push('/my-projects');
        return;
      }
      
      // If admin user accesses my-projects, optionally redirect to dashboard
      // (Remove this if you want admins to also access my-projects)
      if (pathname === '/my-projects' && isAdmin) {
        // Optionally redirect admins to dashboard, or let them access my-projects
        // Uncomment the line below if you want to redirect admins away from my-projects
        // router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, isAdminRoute, pathname, router]);
  
  // Show loading while session is loading
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // For login page or unauthenticated users, show simple layout without sidebar
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