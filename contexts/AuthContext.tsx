// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAlert } from './AlertContext';
import authApiService from '@/services/authApi';
import refreshService from '@/services/refresh';
import { apiService } from '@/services/api';
import { User } from '@/types/user';
import { UserProject } from '@/types/userProject';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  userProjects: UserProject[];
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  getUserId: () => string | null;
  checkAndRefreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAdmin: false,
  userProjects: [],
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  isLoggingOut: false,
  getUserId: () => null,
  checkAndRefreshToken: async () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { showAlert } = useAlert();

  // Check and refresh token if needed
  const checkAndRefreshToken = async (): Promise<boolean> => {
    try {
      const token = authApiService.getAccessToken();
      
      // If no token, we're not authenticated
      if (!token) {
        return false;
      }
      
      // Check if token is expired or about to expire
      if (authApiService.isTokenExpired(token)) {
        // Try to refresh the token
        const refreshResult = await refreshService.refreshAuthToken();
        return refreshResult.success;
      }
      
      // Token is valid
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Failed to refresh, so logout
      logout();
      return false;
    }
  };

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      // First check token validity
      const isTokenValid = await checkAndRefreshToken();
      if (!isTokenValid) {
        setUser(null);
        setUserProjects([]);
        return;
      }
      
      const userId = authApiService.getUserIdFromToken();
      
      if (!userId) {
        setUser(null);
        setUserProjects([]);
        return;
      }
      
      // Fetch user details
      const userData = await apiService.getUserById(userId);
      setUser(userData);
      
      // Fetch user projects
      const projects = await apiService.getUserProjects(userId);
      setUserProjects(projects);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If we can't fetch user data, log out
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = authApiService.isAuthenticated();
    
    if (isLoggedIn) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
    
    // Setup token refresh interval
    const tokenCheckInterval = setInterval(() => {
      if (authApiService.isAuthenticated()) {
        checkAndRefreshToken();
      }
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Call the login API
      const tokens = await authApiService.login(username, password);
      
      // Store tokens
      authApiService.storeTokens(tokens);
      
      // Fetch user data
      await fetchUserData();
      
      showAlert('success', 'Login successful!');
      
      // All users are redirected to my-projects by default
      router.push('/my-projects');
    } catch (err) {
      authApiService.clearTokens();
      setUser(null);
      setUserProjects([]);
      throw err; // Re-throw to handle in the component
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Set logging out flag to prevent API calls during logout
    setIsLoggingOut(true);
    
    // First, navigate to login page
    router.push('/login');
    
    // After navigation is started, clear tokens and user state after a short delay
    // This ensures API calls are blocked before tokens are removed
    setTimeout(() => {
      // Clear tokens and user data
      authApiService.clearTokens();
      setUser(null);
      setUserProjects([]);
      
      // Show notification
      showAlert('info', 'You have been logged out');
      
      // Reset logging out flag after a slightly longer delay
      // This ensures navigation completes before flag is reset
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 500);
    }, 100);
  };

  const getUserId = () => {
    return authApiService.getUserIdFromToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.isAdmin || false,
        userProjects,
        login,
        logout,
        isAuthenticated: !!user && authApiService.isAuthenticated(),
        isLoggingOut,
        getUserId,
        checkAndRefreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};