import { addUsersToProject, getProjectUsers } from "@/services/projectApi";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectUsers = await getProjectUsers(params.id);
    return NextResponse.json(projectUsers);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { id } = context.params;
    console.log("Hello routes", id, body);

    const newUsers = await addUsersToProject(id, body);
    return NextResponse.json(newUsers, { status: 201 });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
