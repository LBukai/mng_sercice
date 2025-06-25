import { removeUserFromProject, updateUserRole } from "@/services/projectApi";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string, userId: string } }
) {
  try {
    const body = await req.json();
    const updatedProject = await updateUserRole(
      params.id,
      params.userId,
      body
    );
    return NextResponse.json(updatedProject);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string, userId: string } }
) {
  try {
    await removeUserFromProject(params.id, params.userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
