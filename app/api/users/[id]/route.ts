import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";

const API_BASE_URL = process.env.API_BASE_URL;//"http://localhost:8080";

const getAuthHeaders = async () => {
  const session = await auth();
  return {
    "Content-Type": "application/json",
    Authorization: session?.sessionToken
      ? `Bearer ${session.sessionToken}`
      : "",
  };
};

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    const user = await response.json();
    return NextResponse.json(user);
  } catch (err) {
    console.error('Error getting user:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 404 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Check authentication
    const session = await auth();
    if (!session || !session.user?.isAdmin) {
      console.log('Unauthorized user update attempt');
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    
    // Try PATCH method first, then fallback to PUT if needed
    let response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify(body),
    });

    // If PATCH fails with 405, try PUT
    if (!response.ok && response.status === 405) {
      console.log('PATCH failed with 405, trying PUT...');
      response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "PUT",
        headers: await getAuthHeaders(),
        body: JSON.stringify(body),
      });
    }

    // If both fail with 405, try POST
    if (!response.ok && response.status === 405) {
      console.log('PUT failed with 405, trying POST...');
      response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify(body),
      });
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error:', errorData);
      throw new Error(`Failed to update user: ${response.statusText}`);
    }

    const updatedUser = await response.json();
    console.log('User updated successfully:');
    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    console.log('PATCH user update:', { id, body });
    
    // Check authentication
    const session = await auth();
    if (!session || !session.user?.isAdmin) {
      console.log('Unauthorized user update attempt');
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error:', errorData);
      throw new Error(`Failed to update user: ${response.statusText}`);
    }

    const updatedUser = await response.json();
    console.log('User updated successfully:');
    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const session = await auth();
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting user:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}