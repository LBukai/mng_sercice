// utils/apiErrorHandler.ts
import { signOut } from 'next-auth/react';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = async (response: Response, defaultMessage = 'An error occurred') => {
  // Handle authentication errors
  if (response.status === 401 || response.status === 403) {
    console.warn('Authentication failed, signing out user');
    
    // Sign out the user and redirect to login
    await signOut({ 
      callbackUrl: '/login',
      redirect: true 
    });
    
    throw new ApiError(
      'Your session has expired. Please sign in again.',
      response.status,
      response.statusText
    );
  }

  // Handle other errors
  let errorMessage = defaultMessage;
  try {
    const errorData = await response.json();
    errorMessage = errorData.error || errorData.message || defaultMessage;
  } catch {
    // If response is not JSON, use status text
    errorMessage = response.statusText || defaultMessage;
  }

  throw new ApiError(errorMessage, response.status, response.statusText);
};

export const createAuthenticatedFetch = () => {
  return async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return response;
  };
};