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

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Check if the path is a protected route
  const isProtectedRoute = !path.startsWith('/login') && 
                          !path.startsWith('/_next') && 
                          !path.startsWith('/api') &&
                          !path.startsWith('/favicon.ico');
                          
  // Admin-only routes
  const isAdminRoute = path === '/' || // Dashboard
                       path.startsWith('/users') || // User management
                       (path.startsWith('/projects') && !path.startsWith('/projects/') && path !== '/my-projects'); // Project management (except specific project details)
                       
  // User project route (this is where we redirect non-admins after login)
  const isUserProjectRoute = path === '/my-projects';

  // Get the token from the cookies
  const token = request.cookies.get('access_token')?.value;

  // If it's a protected route and no token exists, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    
    // Add the current path as a "from" param to redirect back after login
    loginUrl.searchParams.set('from', path);
    
    return NextResponse.redirect(loginUrl);
  }

  // If we have a token, check roles for certain routes
  if (token && isAdminRoute) {
    try {
      // Attempt to get user info from token
      // In real production code, you'd verify the token signature here
      const decoded = decodeJWT(token);
      
      if (!decoded) {
        throw new Error('Invalid token');
      }
      
      // Get the user ID from token
      const userId = decoded.sub;
      
      // We need to check if this user is an admin
      // For this middleware, we can make a request to the API
      const response = await fetch(`${request.nextUrl.origin}/api/check-admin?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
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