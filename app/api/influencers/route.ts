import { NextResponse } from "next/server";
import { createInfluencer, listInfluencers } from "../../lib/influencer-store";

export const runtime = "nodejs";

export async function GET() {
  const influencers = await listInfluencers();
  return NextResponse.json({ influencers });
}

export async function POST(request: Request) {
  const body = await request.json();
  const influencer = await createInfluencer(body);

  return NextResponse.json({ influencer }, { status: 201 });
}
