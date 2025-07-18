// app/api/anythingllm/auth-token/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/app/auth";

const API_BASE_URL = process.env.API_BASE_URL;

const getAuthHeaders = async () => {
  const session = await auth();
  return {
    "Content-Type": "application/json",
    Authorization: session?.sessionToken
      ? `Bearer ${session.sessionToken}`
      : "",
  };
};

export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Call your backend API to get AnythingLLM SSO token
    const response = await fetch(`${API_BASE_URL}/users/${userId}/ssotoken`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', errorText);
      
      if (response.status === 404) {
        return NextResponse.json({ 
          error: 'User not found or not configured for AnythingLLM access.' 
        }, { status: 404 });
      }
      
      return NextResponse.json({ 
        error: `Failed to get AnythingLLM token: ${response.statusText}` 
      }, { status: response.status });
    }

    const tokenData = await response.json();
    
    // Return the token and construct full redirect URL
    const anythingLLMBaseUrl = process.env.ANYTHINGLLM_BASE_URL || "http://localhost:3001";
    return NextResponse.json({
      token: tokenData.token,
      redirectUrl: `${anythingLLMBaseUrl}${tokenData.loginPath}`
    });

  } catch (err) {
    console.error('Error getting AnythingLLM auth token:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}