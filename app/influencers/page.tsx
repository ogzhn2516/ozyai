import { listInfluencers } from "../lib/influencer-store";
import { InfluencerListClient } from "./influencer-list-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function InfluencersPage() {
  const influencers = await listInfluencers();

  return <InfluencerListClient initialInfluencers={influencers} />;
}
