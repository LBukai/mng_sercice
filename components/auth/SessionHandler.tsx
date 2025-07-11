'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useAlert } from '@/contexts/AlertContext';

interface SessionHandlerProps {
  children: React.ReactNode;
}

export const SessionHandler = ({ children }: SessionHandlerProps) => {
  const { data: session, status } = useSession();
  const { showAlert } = useAlert();

  useEffect(() => {
    // Check for token refresh errors
    if (session?.error === "RefreshAccessTokenError") {
      console.warn('Token refresh failed, signing out user');
      showAlert('error', 'Your session has expired. Please sign in again.');
      
      // Clear session and redirect to login
      signOut({ 
        callbackUrl: '/login',
        redirect: true 
      });
    }
  }, [session, showAlert]);

  // Handle loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};