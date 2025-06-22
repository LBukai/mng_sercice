// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper function to decode JWT
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decoding JWT:', e);
    return null;
  }
}

// Check if token is expired
function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeJWT(token);
    if (!decoded) return true;
    
    // Get current time in seconds
    const now = Math.floor(Date.now() / 1000);
    
    // Check if token is expired (with 30 seconds buffer)
    return decoded.exp <= now + 30;
  } catch (e) {
    return true;
  }
}

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Check if the path is a protected route
  const isProtectedRoute = !path.startsWith('/login') && 
                          !path.startsWith('/_next') && 
                          !path.startsWith('/api/') && 
                          !path.startsWith('/favicon.ico');
                          
  // Admin-only routes
  const isAdminRoute = path === '/' || // Dashboard
                       path.startsWith('/users') || // User management
                       (path.startsWith('/projects') && !path.startsWith('/projects/') && path !== '/my-projects'); // Project management (except specific project details)
                       
  // User project route (this is where we redirect non-admins after login)
  const isUserProjectRoute = path === '/my-projects';

  // Get the tokens from the cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // If it's a protected route and no token exists, redirect to login
  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    
    // Add the current path as a "from" param to redirect back after login
    loginUrl.searchParams.set('from', path);
    
    return NextResponse.redirect(loginUrl);
  }

  // If we have a token but it's expired, redirect to login
  // Client-side code will handle token refresh when possible
  if (isProtectedRoute && accessToken && isTokenExpired(accessToken) && !refreshToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', path);
    loginUrl.searchParams.set('session_expired', 'true');
    
    const response = NextResponse.redirect(loginUrl);
    
    // Clear invalid tokens
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    
    return response;
  }

  // If we have a valid token, check roles for certain routes
  if (accessToken && isAdminRoute) {
    try {
      // Attempt to get user info from token
      const decoded = decodeJWT(accessToken);
      
      if (!decoded) {
        throw new Error('Invalid token');
      }
      
      // Get the user ID from token
      const userId = decoded.sub;
      
      // We need to check if this user is an admin
      // For this middleware, we can make a request to the API
      const response = await fetch(`${request.nextUrl.origin}/api/check-admin?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify user role');
      }
      
      const data = await response.json();
      
      // If user is not an admin, redirect to my-projects
      if (!data.isAdmin) {
        return NextResponse.redirect(new URL('/my-projects', request.url));
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      
      // If there's an error, redirect to my-projects as default
      // This is safer than potentially exposing admin pages
      return NextResponse.redirect(new URL('/my-projects', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which paths should be checked by the middleware
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};