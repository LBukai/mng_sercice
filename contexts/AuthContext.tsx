// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAlert } from './AlertContext';
import authApiService from '@/services/authApi';
import { apiService } from '@/services/api';
import { User } from '@/types/user';
import { UserProject } from '@/types/userProject';
import { setApiLoggingOutState } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  userProjects: UserProject[];
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  getUserId: () => string | null;
  isLoggingOut: boolean; // New flag to track logout state
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAdmin: false,
  userProjects: [],
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  getUserId: () => null,
  isLoggingOut: false, // Default value for the new flag
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Add the new state
  const router = useRouter();
  const { showAlert } = useAlert();

  useEffect(() => {
    // Update the API service's logging out state whenever isLoggingOut changes
    setApiLoggingOutState(isLoggingOut);
  }, [isLoggingOut]);

  const fetchUserData = async () => {
    // Skip fetching if we're in the process of logging out
    if (isLoggingOut) return;
    
    try {
      setIsLoading(true);
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
      authApiService.clearTokens();
      setUser(null);
      setUserProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in, but skip if we're logging out
    if (!isLoggingOut) {
      const isLoggedIn = authApiService.isAuthenticated();
      
      if (isLoggedIn) {
        fetchUserData();
      } else {
        setIsLoading(false);
      }
    }
  }, [isLoggingOut]); // Add isLoggingOut as a dependency

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
    // Set the logging out flag to prevent further API calls
    setIsLoggingOut(true);
    
    // Clear tokens and user
    authApiService.clearTokens();
    setUser(null);
    setUserProjects([]);
    
    // Redirect to login page
    router.push('/login');
    showAlert('info', 'You have been logged out');
    
    // Reset the logging out flag after navigation (optional, depends on your needs)
    // You can either reset it immediately or after a short timeout
    setTimeout(() => {
      setIsLoggingOut(false);
    }, 500); // Small delay to ensure navigation has started
  };

  const getUserId = () => {
    // Skip if we're logging out
    if (isLoggingOut) return null;
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
        isAuthenticated: !!user && authApiService.isAuthenticated() && !isLoggingOut,
        getUserId,
        isLoggingOut, // Expose the flag to consumers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};