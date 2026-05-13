import { NextResponse } from "next/server";
import { lookupInstagramProfile } from "../../../lib/instagram-lookup";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string };

  try {
    const profile = await lookupInstagramProfile(body.username ?? "");
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Instagram kullanıcı adı okunamadı." },
      { status: 400 },
    );
  }
}
