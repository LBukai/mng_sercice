
// app/api/models/default/route.ts
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
    const response = await fetch(`${API_BASE_URL}/models/default`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch default model: ${response.statusText}`);
    }

    const defaultModel = await response.json();
    return NextResponse.json(defaultModel);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const response = await fetch(`${API_BASE_URL}/models/default`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to set default model: ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}