// services/refresh.ts
import authApiService from './authApi';
import { useRouter } from 'next/navigation';

interface RefreshResponse {
  success: boolean;
  redirectToLogin: boolean;
}

const API_BASE_URL = 'http://localhost:8080';

export const refreshService = {
  /**
   * Refreshes the auth token using the refresh token
   * @returns {Promise<RefreshResponse>} Result of the refresh operation
   */
  refreshAuthToken: async (): Promise<RefreshResponse> => {
    try {
      const refreshToken = authApiService.getRefreshToken();
      
      if (!refreshToken) {
        console.error('No refresh token available');
        return { success: false, redirectToLogin: true };
      }
      
      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        console.error('Token refresh failed:', response.statusText);
        return { success: false, redirectToLogin: true };
      }

      const data = await response.json();
      
      // Store the new tokens
      authApiService.storeTokens(data);
      
      return { success: true, redirectToLogin: false };
    } catch (error) {
      console.error('Error during token refresh:', error);
      return { success: false, redirectToLogin: true };
    }
  },

  /**
   * Utility hook for components to handle auth refresh
   * @returns Functions for handling token refresh
   */
  useRefreshToken: () => {
    const router = useRouter();
    
    /**
     * Attempts to refresh the token and redirects to login if it fails
     */
    const refreshTokenOrRedirect = async (): Promise<boolean> => {
      const result = await refreshService.refreshAuthToken();
      
      if (!result.success && result.redirectToLogin) {
        // Clear tokens before redirecting
        authApiService.clearTokens();
        router.push('/login');
        return false;
      }
      
      return result.success;
    };
    
    return { refreshTokenOrRedirect };
  }
};

export default refreshService;