// services/authApi.ts
interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export const authApiService = {
  login: async (username: string, password: string): Promise<AuthTokens> => {
    // Create the basic auth header
    const basicAuth = btoa(`${username}:${password}`);
    
    const response = await fetch(`${process.env.API_BASE_URL}/login`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Handle different error cases
      if (response.status === 401) {
        throw new Error('Invalid username or password');
      } else {
        throw new Error(`Login failed: ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data;
  },

  // Store tokens in localStorage
  storeTokens: (tokens: AuthTokens) => {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  },

  // Get the current access token
  getAccessToken: (): string | null => {
    return localStorage.getItem('access_token');
  },

  // Get the current refresh token
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token');
  },

  // Clear all tokens (logout)
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  // Check if user is logged in
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  }
};

export default authApiService;