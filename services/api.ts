// services/api.ts
import { User } from '@/types/user';
import { UserProject } from '@/types/userProject';
import authApiService from './authApi';
import refreshService from './refresh';

const API_BASE_URL = 'http://localhost:8080';

// Helper function to handle automatic token refresh and authentication
const fetchWithTokenRefresh = async (url: string, options: RequestInit): Promise<Response> => {
  let response = await fetch(url, options);
  
  // If the response is 401 Unauthorized, try to refresh the token
  if (response.status === 401) {
    try {
      // Attempt to refresh the token
      const refreshResult = await refreshService.refreshAuthToken();
      
      if (!refreshResult.success) {
        throw new Error('Token refresh failed');
      }
      
      // Update the Authorization header with the new token
      const newToken = authApiService.getAccessToken();
      if (newToken) {
        const newHeaders = {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`
        };
        
        // Retry the original request with the new token
        response = await fetch(url, {
          ...options,
          headers: newHeaders
        });
      }
      
      // If still unauthorized after refresh, we need to logout
      if (response.status === 401) {
        // This will be handled by the calling code, which should redirect to login
        throw new Error('Authentication failed after token refresh');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Clear auth state and throw error to be handled by the caller
      authApiService.clearTokens();
      throw new Error('Authentication failed. Please login again.');
    }
  }
  
  return response;
};

const getAuthHeaders = () => {
  const token = authApiService.getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const apiService = {
  // User related API calls
  getUsers: async (): Promise<User[]> => {
    const response = await fetchWithTokenRefresh(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    return response.json();
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await fetchWithTokenRefresh(`${API_BASE_URL}/users/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    return response.json();
  },

  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    const response = await fetchWithTokenRefresh(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }

    return response.json();
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await fetchWithTokenRefresh(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.statusText}`);
    }

    return response.json();
  },

  deleteUser: async (id: string): Promise<void> => {
    const response = await fetchWithTokenRefresh(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }
  },

  // Get projects for a specific user
  getUserProjects: async (userId: string): Promise<UserProject[]> => {
    const response = await fetchWithTokenRefresh(`${API_BASE_URL}/users/${userId}/projects`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user projects: ${response.statusText}`);
    }

    return response.json();
  },
  
  // Get current user details (based on token)
  getCurrentUser: async (): Promise<User> => {
    const userId = authApiService.getUserIdFromToken();
    
    if (!userId) {
      throw new Error('No user ID found in token');
    }
    
    return apiService.getUserById(userId);
  }
};