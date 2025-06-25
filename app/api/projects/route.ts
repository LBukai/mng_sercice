import { createProject, getProjects } from "@/services/projectApi";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const projects = await getProjects();
    return NextResponse.json(projects);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newProject = await createProject(body);
    return NextResponse.json(newProject, { status: 201 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
