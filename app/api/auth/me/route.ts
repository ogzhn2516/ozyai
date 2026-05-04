import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/user-store";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  return NextResponse.json({ status: "authenticated", user });
}
