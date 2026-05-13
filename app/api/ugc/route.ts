import { NextResponse } from "next/server";
import { createInfluencer } from "../../lib/influencer-store";

export const runtime = "nodejs";

type UgcApplication = {
  fullName?: string;
  phone?: string;
  province?: string;
  district?: string;
  address?: string;
  instagram?: string;
  followerCount?: string;
};

function clean(value: string | undefined) {
  return value?.trim() ?? "";
}

function normalizeInstagram(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return { username: "", url: "" };

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      const username = url.pathname.split("/").filter(Boolean)[0] ?? "";
      return {
        username: username ? `@${username}` : trimmed,
        url: trimmed,
      };
    } catch {
      return { username: trimmed, url: "" };
    }
  }

  const username = trimmed.replace(/^@+/, "");
  return {
    username: username ? `@${username}` : "",
    url: username ? `https://www.instagram.com/${username}/` : "",
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as UgcApplication;
  const fullName = clean(body.fullName);
  const phone = clean(body.phone);
  const province = clean(body.province);
  const district = clean(body.district);
  const address = clean(body.address);
  const followerCount = clean(body.followerCount);
  const instagram = normalizeInstagram(clean(body.instagram));

  if (!fullName || !phone || !province || !district || !address || !instagram.username) {
    return NextResponse.json({ error: "Lütfen zorunlu alanları doldurun." }, { status: 400 });
  }

  const influencer = await createInfluencer({
    fullName,
    platform: "Instagram",
    username: instagram.username,
    phone,
    city: `${province} / ${district}`,
    address,
    followerCount,
    niche: "UGC",
    status: "Aday",
    collaborationType: "UGC başvurusu",
    profileUrl: instagram.url,
    instagramUrl: instagram.url,
    notes: "UGC başvuru formundan geldi.",
  });

  return NextResponse.json({ influencer }, { status: 201 });
}
