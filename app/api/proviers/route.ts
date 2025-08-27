// app/api/providers/route.ts
import { NextRequest, NextResponse } from "next/server";
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
    const response = await fetch(`${API_BASE_URL}/providers`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch providers: ${response.statusText}`);
    }

    const providers = await response.json();
    return NextResponse.json(providers);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const response = await fetch(`${API_BASE_URL}/providers`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to create provider: ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}