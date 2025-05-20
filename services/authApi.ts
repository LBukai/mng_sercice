// services/authApi.ts
interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

interface DecodedToken {
  sub: string;
  exp: number;
  iat: number;
  iss: string;
  [key: string]: any;
}

// Helper function to decode JWT tokens without self-reference
function decodeJWT(token: string | null): DecodedToken | null {
  if (!token) return null;
  
  try {
    // JWT tokens are three base64-encoded parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (middle part)
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

// Auth service object with all methods
const authApiService = {
  login: async (username: string, password: string): Promise<AuthTokens> => {
    // Create the basic auth header
    const basicAuth = btoa(`${username}:${password}`);
    
    const response = await fetch('http://localhost:8080/login', {
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

  // Store tokens in localStorage and cookies
  storeTokens: (tokens: AuthTokens) => {
    // Store in localStorage for JavaScript access
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    
    // Store in cookies for middleware access
    // Set the cookie to expire in 24 hours
    const expires = new Date();
    expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000);
    
    document.cookie = `access_token=${tokens.access_token}; expires=${expires.toUTCString()}; path=/`;
    document.cookie = `refresh_token=${tokens.refresh_token}; expires=${expires.toUTCString()}; path=/`;
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
    // Remove from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Remove from cookies
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  },

  // Check if user is logged in
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },

  // Decode the JWT token to get user ID and other claims
  decodeToken: (token: string | null): DecodedToken | null => {
    return decodeJWT(token);
  },
  
  // Get the current user ID from the token
  getUserIdFromToken: (): string | null => {
    const token = localStorage.getItem('access_token');
    const decoded = decodeJWT(token);
    console.log(decoded?.sub);
    return decoded?.sub || null;
  }
};

export default authApiService;