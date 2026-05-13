import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type InfluencerStatus =
  | "Aday"
  | "İlk mesaj atıldı"
  | "Cevap bekleniyor"
  | "Anlaşma yapıldı"
  | "Ürün gönderildi"
  | "İçerik bekleniyor"
  | "Paylaşıldı"
  | "Tamamlandı"
  | "Pasif";

export type Influencer = {
  id: string;
  fullName: string;
  platform: string;
  username: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  followerCount: string;
  niche: string;
  status: InfluencerStatus;
  collaborationType: string;
  rate: string;
  lastContactDate: string;
  profileUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  couponCode: string;
  shippingCompany: string;
  trackingNumber: string;
  shippingDate: string;
  deliveryStatus: string;
  sentProducts: string;
  productSentDate: string;
  contentUrl: string;
  views: string;
  likes: string;
  comments: string;
  saves: string;
  salesCount: string;
  revenue: string;
  reminderDate: string;
  reminderNote: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type InfluencerInput = Omit<Influencer, "id" | "createdAt" | "updatedAt">;

type InfluencerDocument = {
  influencers: Influencer[];
};

const kvKey = "figyfun:influencers";
const localDataPath = path.join(process.cwd(), "data", "influencers.json");

function hasKv() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function kvCommand<T>(command: unknown[]) {
  const response = await fetch(process.env.KV_REST_API_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Vercel KV bağlantısı başarısız oldu.");
  }

  return (await response.json()) as { result: T };
}

async function readDocument(): Promise<InfluencerDocument> {
  if (hasKv()) {
    const { result } = await kvCommand<string | null>(["GET", kvKey]);
    return result ? (JSON.parse(result) as InfluencerDocument) : { influencers: [] };
  }

  try {
    const file = await readFile(localDataPath, "utf8");
    return JSON.parse(file) as InfluencerDocument;
  } catch {
    return { influencers: [] };
  }
}

async function writeDocument(document: InfluencerDocument) {
  if (hasKv()) {
    await kvCommand(["SET", kvKey, JSON.stringify(document)]);
    return;
  }

  await mkdir(path.dirname(localDataPath), { recursive: true });
  await writeFile(localDataPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
}

function cleanInput(input: Partial<InfluencerInput>): InfluencerInput {
  return {
    fullName: input.fullName?.trim() || "İsimsiz influencer",
    platform: input.platform?.trim() || "Instagram",
    username: input.username?.trim() || "",
    phone: input.phone?.trim() || "",
    email: input.email?.trim() || "",
    city: input.city?.trim() || "",
    address: input.address?.trim() || "",
    followerCount: input.followerCount?.trim() || "",
    niche: input.niche?.trim() || "",
    status: normalizeStatus(input.status),
    collaborationType: input.collaborationType?.trim() || "",
    rate: input.rate?.trim() || "",
    lastContactDate: input.lastContactDate?.trim() || "",
    profileUrl: input.profileUrl?.trim() || "",
    instagramUrl: input.instagramUrl?.trim() || "",
    tiktokUrl: input.tiktokUrl?.trim() || "",
    youtubeUrl: input.youtubeUrl?.trim() || "",
    couponCode: input.couponCode?.trim() || "",
    shippingCompany: input.shippingCompany?.trim() || "",
    trackingNumber: input.trackingNumber?.trim() || "",
    shippingDate: input.shippingDate?.trim() || "",
    deliveryStatus: input.deliveryStatus?.trim() || "",
    sentProducts: input.sentProducts?.trim() || "",
    productSentDate: input.productSentDate?.trim() || "",
    contentUrl: input.contentUrl?.trim() || "",
    views: input.views?.trim() || "",
    likes: input.likes?.trim() || "",
    comments: input.comments?.trim() || "",
    saves: input.saves?.trim() || "",
    salesCount: input.salesCount?.trim() || "",
    revenue: input.revenue?.trim() || "",
    reminderDate: input.reminderDate?.trim() || "",
    reminderNote: input.reminderNote?.trim() || "",
    notes: input.notes?.trim() || "",
  };
}

function normalizeStatus(status: string | undefined): InfluencerStatus {
  if (status === "Yeni" || status === "Görüşülüyor") return "Aday";
  if (status === "Anlaşma") return "Anlaşma yapıldı";
  if (status === "İçerik Bekleniyor") return "İçerik bekleniyor";

  const statuses: InfluencerStatus[] = [
    "Aday",
    "İlk mesaj atıldı",
    "Cevap bekleniyor",
    "Anlaşma yapıldı",
    "Ürün gönderildi",
    "İçerik bekleniyor",
    "Paylaşıldı",
    "Tamamlandı",
    "Pasif",
  ];

  return statuses.includes(status as InfluencerStatus) ? (status as InfluencerStatus) : "Aday";
}

function normalizeInfluencer(influencer: Partial<Influencer> & { id: string; createdAt: string; updatedAt: string }): Influencer {
  return {
    id: influencer.id,
    ...cleanInput(influencer),
    createdAt: influencer.createdAt,
    updatedAt: influencer.updatedAt,
  };
}

export async function listInfluencers() {
  const document = await readDocument();
  return document.influencers.map(normalizeInfluencer).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createInfluencer(input: Partial<InfluencerInput>) {
  const document = await readDocument();
  const now = new Date().toISOString();
  const influencer: Influencer = {
    id: randomBytes(10).toString("hex"),
    ...cleanInput(input),
    createdAt: now,
    updatedAt: now,
  };

  document.influencers.unshift(influencer);
  await writeDocument(document);

  return influencer;
}

export async function updateInfluencer(id: string, input: Partial<InfluencerInput>) {
  const document = await readDocument();
  const index = document.influencers.findIndex((item) => item.id === id);

  if (index === -1) return null;

  const updated: Influencer = {
    ...normalizeInfluencer(document.influencers[index]),
    ...cleanInput(input),
    id,
    createdAt: document.influencers[index].createdAt,
    updatedAt: new Date().toISOString(),
  };

  document.influencers[index] = updated;
  await writeDocument(document);

  return updated;
}

export async function deleteInfluencer(id: string) {
  const document = await readDocument();
  const next = document.influencers.filter((item) => item.id !== id);

  if (next.length === document.influencers.length) return false;

  await writeDocument({ influencers: next });
  return true;
}
