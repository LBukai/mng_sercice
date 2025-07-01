import { removeUserFromProject, updateUserRole } from "@/services/projectApi";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string, userId: string }> }
) {
  try {
    const { id, userId } = await params;
    const body = await req.json();
    const updatedProject = await updateUserRole(
      id,
      userId,
      body.role
    );
    return NextResponse.json(updatedProject);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string, userId: string }> }
) {
  try {
    const { id, userId } = await params;
    await removeUserFromProject(id, userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}