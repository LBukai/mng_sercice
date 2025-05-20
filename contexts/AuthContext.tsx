// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAlert } from './AlertContext';
import authApiService from '@/services/authApi';
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
  getUserId: () => string | null;
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
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { showAlert } = useAlert();

  const fetchUserData = async () => {
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
    // Check if user is logged in
    const isLoggedIn = authApiService.isAuthenticated();
    
    if (isLoggedIn) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
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
    // Clear tokens and user
    authApiService.clearTokens();
    setUser(null);
    setUserProjects([]);
    
    // Redirect to login page
    router.push('/login');
    showAlert('info', 'You have been logged out');
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
        getUserId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};