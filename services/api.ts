// services/api.ts
import { User } from '@/types/user';
import { UserProject } from '@/types/userProject';
import authApiService from './authApi';

// This will need to be set from your AuthContext
let isLoggingOut = false;

// Function to update the logging out state
export const setApiLoggingOutState = (state: boolean) => {
  isLoggingOut = state;
};

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = authApiService.getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Wrapper function to prevent API calls during logout
const safeApiCall = async <T>(apiCall: () => Promise<T>): Promise<T> => {
  if (isLoggingOut) {
    // If logging out, reject the request
    return Promise.reject(new Error('API call aborted: User is logging out'));
  }
  return apiCall();
};

export const apiService = {
  // User related API calls
  getUsers: async (): Promise<User[]> => {
    return safeApiCall(async () => {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      return response.json();
    });
  },

  getUserById: async (id: string): Promise<User> => {
    return safeApiCall(async () => {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }
      return response.json();
    });
  },

  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    return safeApiCall(async () => {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.statusText}`);
      }

      return response.json();
    });
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    return safeApiCall(async () => {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      return response.json();
    });
  },

  deleteUser: async (id: string): Promise<void> => {
    return safeApiCall(async () => {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
      }
    });
  },

  // Get projects for a specific user
  getUserProjects: async (userId: string): Promise<UserProject[]> => {
    return safeApiCall(async () => {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/projects`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user projects: ${response.statusText}`);
      }

      return response.json();
    });
  },
  
  // Get current user details (based on token)
  getCurrentUser: async (): Promise<User> => {
    return safeApiCall(async () => {
      const userId = authApiService.getUserIdFromToken();
      
      if (!userId) {
        throw new Error('No user ID found in token');
      }
      
      return apiService.getUserById(userId);
    });
  }
};