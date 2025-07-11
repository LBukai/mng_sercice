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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const body = await req.json();
    
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to update file: ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { fileId } = await params;
    
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove file: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}