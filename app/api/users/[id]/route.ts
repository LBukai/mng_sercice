import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";

const API_BASE_URL = "http://localhost:8080";

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
    console.log('GET user by ID:', id);
    
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
    
    console.log('PUT user update:', { id, body });
    
    // Check authentication
    const session = await auth();
    if (!session || !session.user?.isAdmin) {
      console.log('Unauthorized user update attempt');
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: await getAuthHeaders(),
      body: JSON.stringify(body),
    });

    console.log('Backend response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error:', errorData);
      throw new Error(`Failed to update user: ${response.statusText}`);
    }

    const updatedUser = await response.json();
    console.log('User updated successfully:', updatedUser);
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
    console.log('DELETE user:', id);
    
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