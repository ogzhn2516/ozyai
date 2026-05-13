"use client";

import {
  Bell,
  CalendarDays,
  Download,
  Edit3,
  ExternalLink,
  Loader2,
  LogOut,
  MapPin,
  PackageCheck,
  Phone,
  Plus,
  Search,
  TicketPercent,
  Trash2,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type InfluencerStatus =
  | "Aday"
  | "İlk mesaj atıldı"
  | "Cevap bekleniyor"
  | "Anlaşma yapıldı"
  | "Ürün gönderildi"
  | "İçerik bekleniyor"
  | "Paylaşıldı"
  | "Tamamlandı"
  | "Pasif";

type Influencer = {
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

type FormState = Omit<Influencer, "id" | "createdAt" | "updatedAt">;

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

const emptyForm: FormState = {
  fullName: "",
  platform: "Instagram",
  username: "",
  phone: "",
  email: "",
  city: "",
  address: "",
  followerCount: "",
  niche: "",
  status: "Aday",
  collaborationType: "",
  rate: "",
  lastContactDate: "",
  profileUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  youtubeUrl: "",
  couponCode: "",
  shippingCompany: "",
  trackingNumber: "",
  shippingDate: "",
  deliveryStatus: "",
  sentProducts: "",
  productSentDate: "",
  contentUrl: "",
  views: "",
  likes: "",
  comments: "",
  saves: "",
  salesCount: "",
  revenue: "",
  reminderDate: "",
  reminderNote: "",
  notes: "",
};

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("tr-TR").format(new Date(value));
}

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function socialLinks(influencer: Influencer) {
  return [
    ["Profil", influencer.profileUrl],
    ["Instagram", influencer.instagramUrl],
    ["TikTok", influencer.tiktokUrl],
    ["YouTube", influencer.youtubeUrl],
    ["İçerik", influencer.contentUrl],
  ].filter((link): link is [string, string] => Boolean(link[1]));
}

export default function PanelPage() {
  const router = useRouter();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tümü");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredInfluencers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return influencers.filter((influencer) => {
      const matchesStatus = statusFilter === "Tümü" || influencer.status === statusFilter;
      const searchable = [
        influencer.fullName,
        influencer.platform,
        influencer.username,
        influencer.phone,
        influencer.email,
        influencer.city,
        influencer.address,
        influencer.niche,
        influencer.notes,
        influencer.couponCode,
        influencer.shippingCompany,
        influencer.trackingNumber,
        influencer.sentProducts,
        influencer.reminderNote,
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [influencers, query, statusFilter]);

  const activeDeals = influencers.filter((item) =>
    ["İlk mesaj atıldı", "Cevap bekleniyor", "Anlaşma yapıldı", "Ürün gönderildi", "İçerik bekleniyor"].includes(item.status),
  ).length;
  const shippedDeals = influencers.filter((item) => item.status === "Ürün gönderildi" || item.trackingNumber).length;
  const reminderCount = influencers.filter((item) => item.reminderDate).length;

  async function loadInfluencers() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/influencers", { cache: "no-store" });
      const data = (await response.json()) as { influencers?: Influencer[]; error?: string };

      if (!response.ok) throw new Error(data.error ?? "Liste alınamadı.");

      setInfluencers(data.influencers ?? []);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadInfluencers();
  }, []);

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startEdit(influencer: Influencer) {
    const nextForm: FormState = {
      fullName: influencer.fullName,
      platform: influencer.platform,
      username: influencer.username,
      phone: influencer.phone,
      email: influencer.email,
      city: influencer.city,
      address: influencer.address,
      followerCount: influencer.followerCount,
      niche: influencer.niche,
      status: influencer.status,
      collaborationType: influencer.collaborationType,
      rate: influencer.rate,
      lastContactDate: influencer.lastContactDate,
      profileUrl: influencer.profileUrl,
      instagramUrl: influencer.instagramUrl,
      tiktokUrl: influencer.tiktokUrl,
      youtubeUrl: influencer.youtubeUrl,
      couponCode: influencer.couponCode,
      shippingCompany: influencer.shippingCompany,
      trackingNumber: influencer.trackingNumber,
      shippingDate: influencer.shippingDate,
      deliveryStatus: influencer.deliveryStatus,
      sentProducts: influencer.sentProducts,
      productSentDate: influencer.productSentDate,
      contentUrl: influencer.contentUrl,
      views: influencer.views,
      likes: influencer.likes,
      comments: influencer.comments,
      saves: influencer.saves,
      salesCount: influencer.salesCount,
      revenue: influencer.revenue,
      reminderDate: influencer.reminderDate,
      reminderNote: influencer.reminderNote,
      notes: influencer.notes,
    };
    setForm(nextForm);
    setEditingId(influencer.id);
    setMessage("Kayıt düzenleme modunda.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(editingId ? `/api/influencers/${editingId}` : "/api/influencers", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { influencer?: Influencer; error?: string };

      if (!response.ok || !data.influencer) throw new Error(data.error ?? "Kayıt kaydedilemedi.");

      setInfluencers((current) =>
        editingId ? current.map((item) => (item.id === editingId ? data.influencer! : item)) : [data.influencer!, ...current],
      );
      setMessage(editingId ? "Influencer kaydı güncellendi." : "Influencer kaydı eklendi.");
      resetForm();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteItem(id: string) {
    const shouldDelete = window.confirm("Bu influencer kaydını silmek istiyor musun?");
    if (!shouldDelete) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/influencers/${id}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) throw new Error(data.error ?? "Kayıt silinemedi.");

      setInfluencers((current) => current.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
      setMessage("Kayıt silindi.");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Beklenmeyen bir hata oluştu.");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  function exportCsv() {
    const headers = [
      "Ad",
      "Platform",
      "Kullanıcı Adı",
      "Telefon",
      "E-posta",
      "Şehir",
      "Adres",
      "Takipçi",
      "Kategori",
      "Pipeline",
      "İşbirliği",
      "Ücret",
      "Profil Linki",
      "Instagram",
      "TikTok",
      "YouTube",
      "Kupon",
      "Kargo",
      "Takip No",
      "Gönderim",
      "Teslim Durumu",
      "Ürünler",
      "İçerik Linki",
      "Görüntülenme",
      "Beğeni",
      "Yorum",
      "Kaydetme",
      "Satış",
      "Ciro",
      "Hatırlatma",
      "Hatırlatma Notu",
      "Not",
    ];
    const rows = filteredInfluencers.map((item) => [
      item.fullName,
      item.platform,
      item.username,
      item.phone,
      item.email,
      item.city,
      item.address,
      item.followerCount,
      item.niche,
      item.status,
      item.collaborationType,
      item.rate,
      item.profileUrl,
      item.instagramUrl,
      item.tiktokUrl,
      item.youtubeUrl,
      item.couponCode,
      item.shippingCompany,
      item.trackingNumber,
      item.shippingDate,
      item.deliveryStatus,
      item.sentProducts,
      item.contentUrl,
      item.views,
      item.likes,
      item.comments,
      item.saves,
      item.salesCount,
      item.revenue,
      item.reminderDate,
      item.reminderNote,
      item.notes,
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "figyfun-influencer-listesi.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-77px)] max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-fig-ink p-6 text-fig-cream shadow-panel sm:p-8">
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-fig-sand">figyfun partnership desk</p>
            <h1 className="mt-4 max-w-3xl font-display text-5xl font-black leading-none sm:text-6xl">Influencer iş takip paneli</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-fig-sand">
              Pipeline, kargo, ürün geçmişi, sosyal link, kupon, performans ve hatırlatmaları tek panelde tut.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/influencers" className="btn-soft border-white/20 bg-white/10 text-fig-cream hover:bg-white/20">
              <UsersRound className="h-4 w-4" /> Tüm influencerlar
            </Link>
            <button type="button" onClick={exportCsv} className="btn-soft border-white/20 bg-white/10 text-fig-cream hover:bg-white/20">
              <Download className="h-4 w-4" /> CSV indir
            </button>
            <button type="button" onClick={logout} className="btn-soft border-white/20 bg-white/10 text-fig-cream hover:bg-white/20">
              <LogOut className="h-4 w-4" /> Çıkış
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        {[
          { label: "Toplam kişi", value: influencers.length, icon: UsersRound },
          { label: "Aktif süreç", value: activeDeals, icon: CalendarDays },
          { label: "Kargoda", value: shippedDeals, icon: PackageCheck },
          { label: "Hatırlatma", value: reminderCount, icon: Bell },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} className="rounded-[1.5rem] border border-white/70 bg-white/65 p-5 shadow-card backdrop-blur">
              <Icon className="h-6 w-6 text-fig-moss" />
              <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-stone-500">{stat.label}</p>
              <p className="mt-2 font-display text-4xl font-black text-fig-ink">{stat.value}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/70 bg-white/72 p-5 shadow-card backdrop-blur sm:p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-black text-fig-ink">{editingId ? "Kaydı düzenle" : "Yeni influencer"}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">Temel bilgi, süreç, kargo ve performans alanlarını doldur.</p>
            </div>
            {editingId ? (
              <button type="button" onClick={resetForm} className="btn-soft px-3 py-2">
                Vazgeç
              </button>
            ) : null}
          </div>

          <div className="grid gap-5">
            <FormBlock title="Temel bilgi">
              <label className="grid gap-2 sm:col-span-2">
                <span className="label">Ad Soyad / Marka adı</span>
                <input value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} className="field" placeholder="Örn. Ayşe Yılmaz" />
              </label>
              <label className="grid gap-2">
                <span className="label">Platform</span>
                <select value={form.platform} onChange={(event) => updateField("platform", event.target.value)} className="field">
                  {["Instagram", "TikTok", "YouTube", "X / Twitter", "Twitch", "Blog", "Diğer"].map((platform) => (
                    <option key={platform}>{platform}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="label">Kullanıcı adı</span>
                <input value={form.username} onChange={(event) => updateField("username", event.target.value)} className="field" placeholder="@kullanici" />
              </label>
              <label className="grid gap-2">
                <span className="label">Telefon</span>
                <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className="field" placeholder="05xx xxx xx xx" />
              </label>
              <label className="grid gap-2">
                <span className="label">E-posta</span>
                <input value={form.email} onChange={(event) => updateField("email", event.target.value)} className="field" placeholder="mail@ornek.com" />
              </label>
              <label className="grid gap-2">
                <span className="label">Şehir</span>
                <input value={form.city} onChange={(event) => updateField("city", event.target.value)} className="field" placeholder="İstanbul" />
              </label>
              <label className="grid gap-2">
                <span className="label">Takipçi</span>
                <input value={form.followerCount} onChange={(event) => updateField("followerCount", event.target.value)} className="field" placeholder="125K" />
              </label>
              <label className="grid gap-2 sm:col-span-2">
                <span className="label">Açık adres</span>
                <textarea value={form.address} onChange={(event) => updateField("address", event.target.value)} className="field min-h-24 resize-y" placeholder="Kargo gönderimi için açık adres" />
              </label>
            </FormBlock>

            <FormBlock title="Pipeline ve anlaşma">
              <label className="grid gap-2">
                <span className="label">Pipeline</span>
                <select value={form.status} onChange={(event) => updateField("status", event.target.value as InfluencerStatus)} className="field">
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="label">Kategori</span>
                <input value={form.niche} onChange={(event) => updateField("niche", event.target.value)} className="field" placeholder="Anne-bebek, lifestyle..." />
              </label>
              <label className="grid gap-2">
                <span className="label">İşbirliği tipi</span>
                <input value={form.collaborationType} onChange={(event) => updateField("collaborationType", event.target.value)} className="field" placeholder="Story, Reels, barter..." />
              </label>
              <label className="grid gap-2">
                <span className="label">Ücret / teklif</span>
                <input value={form.rate} onChange={(event) => updateField("rate", event.target.value)} className="field" placeholder="5000 TL veya barter" />
              </label>
              <label className="grid gap-2">
                <span className="label">Kupon kodu</span>
                <input value={form.couponCode} onChange={(event) => updateField("couponCode", event.target.value)} className="field" placeholder="AYSE10" />
              </label>
              <label className="grid gap-2">
                <span className="label">Son görüşme</span>
                <input type="date" value={form.lastContactDate} onChange={(event) => updateField("lastContactDate", event.target.value)} className="field" />
              </label>
            </FormBlock>

            <FormBlock title="Sosyal linkler">
              <label className="grid gap-2 sm:col-span-2">
                <span className="label">Ana profil linki</span>
                <input value={form.profileUrl} onChange={(event) => updateField("profileUrl", event.target.value)} className="field" placeholder="https://..." />
              </label>
              <label className="grid gap-2">
                <span className="label">Instagram</span>
                <input value={form.instagramUrl} onChange={(event) => updateField("instagramUrl", event.target.value)} className="field" placeholder="https://instagram.com/..." />
              </label>
              <label className="grid gap-2">
                <span className="label">TikTok</span>
                <input value={form.tiktokUrl} onChange={(event) => updateField("tiktokUrl", event.target.value)} className="field" placeholder="https://tiktok.com/@..." />
              </label>
              <label className="grid gap-2">
                <span className="label">YouTube</span>
                <input value={form.youtubeUrl} onChange={(event) => updateField("youtubeUrl", event.target.value)} className="field" placeholder="https://youtube.com/..." />
              </label>
              <label className="grid gap-2">
                <span className="label">İçerik linki</span>
                <input value={form.contentUrl} onChange={(event) => updateField("contentUrl", event.target.value)} className="field" placeholder="Yayınlanan paylaşım linki" />
              </label>
            </FormBlock>

            <FormBlock title="Kargo ve ürün">
              <label className="grid gap-2">
                <span className="label">Kargo firması</span>
                <input value={form.shippingCompany} onChange={(event) => updateField("shippingCompany", event.target.value)} className="field" placeholder="Yurtiçi, MNG..." />
              </label>
              <label className="grid gap-2">
                <span className="label">Takip no</span>
                <input value={form.trackingNumber} onChange={(event) => updateField("trackingNumber", event.target.value)} className="field" placeholder="Kargo takip numarası" />
              </label>
              <label className="grid gap-2">
                <span className="label">Gönderim tarihi</span>
                <input type="date" value={form.shippingDate} onChange={(event) => updateField("shippingDate", event.target.value)} className="field" />
              </label>
              <label className="grid gap-2">
                <span className="label">Teslim durumu</span>
                <select value={form.deliveryStatus} onChange={(event) => updateField("deliveryStatus", event.target.value)} className="field">
                  {["", "Hazırlanıyor", "Kargoya verildi", "Teslim edildi", "Sorun var"].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="label">Ürün gönderim tarihi</span>
                <input type="date" value={form.productSentDate} onChange={(event) => updateField("productSentDate", event.target.value)} className="field" />
              </label>
              <label className="grid gap-2 sm:col-span-2">
                <span className="label">Gönderilen ürünler</span>
                <textarea value={form.sentProducts} onChange={(event) => updateField("sentProducts", event.target.value)} className="field min-h-24 resize-y" placeholder="Ürün adı, adet, beden/renk, paket notu..." />
              </label>
            </FormBlock>

            <FormBlock title="Performans">
              {[
                ["Görüntülenme", "views"],
                ["Beğeni", "likes"],
                ["Yorum", "comments"],
                ["Kaydetme", "saves"],
                ["Satış adedi", "salesCount"],
                ["Ciro", "revenue"],
              ].map(([label, key]) => (
                <label key={key} className="grid gap-2">
                  <span className="label">{label}</span>
                  <input value={form[key as keyof FormState]} onChange={(event) => updateField(key as keyof FormState, event.target.value)} className="field" placeholder={label} />
                </label>
              ))}
            </FormBlock>

            <FormBlock title="Hatırlatma ve not">
              <label className="grid gap-2">
                <span className="label">Hatırlatma tarihi</span>
                <input type="date" value={form.reminderDate} onChange={(event) => updateField("reminderDate", event.target.value)} className="field" />
              </label>
              <label className="grid gap-2">
                <span className="label">Hatırlatma notu</span>
                <input value={form.reminderNote} onChange={(event) => updateField("reminderNote", event.target.value)} className="field" placeholder="3 gün sonra tekrar yaz" />
              </label>
              <label className="grid gap-2 sm:col-span-2">
                <span className="label">Detaylı notlar</span>
                <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} className="field min-h-28 resize-y" placeholder="Anlaşma şartları, özel bilgiler, konuşma özeti..." />
              </label>
            </FormBlock>
          </div>

          {message ? <div className="mt-5 rounded-2xl border border-fig-leaf/30 bg-fig-leaf/15 px-4 py-3 text-sm font-black text-fig-moss">{message}</div> : null}
          {error ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">{error}</div> : null}

          <button type="submit" disabled={isSaving} className="btn-primary mt-6 w-full">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {editingId ? "Kaydı güncelle" : "Influencer ekle"}
          </button>
        </form>

        <section className="rounded-[2rem] border border-white/70 bg-white/55 p-5 shadow-card backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="font-display text-3xl font-black text-fig-ink">Liste</h2>
              <p className="mt-2 text-sm text-stone-600">{filteredInfluencers.length} kayıt gösteriliyor.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="field pl-11" placeholder="Ara: ad, tel, kupon..." />
              </label>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="field min-w-44">
                {["Tümü", ...statuses].map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {isLoading ? (
              <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-fig-sand bg-white/45 text-sm font-black text-fig-moss">
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Liste yükleniyor...
              </div>
            ) : filteredInfluencers.length === 0 ? (
              <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-fig-sand bg-white/45 px-8 text-center text-sm font-bold leading-6 text-stone-500">
                Henüz kayıt yok. İlk influencer bilgisini soldaki formdan ekleyelim.
              </div>
            ) : (
              filteredInfluencers.map((influencer) => (
                <article key={influencer.id} className="rounded-3xl border border-fig-sand/70 bg-white/80 p-4 shadow-card">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-2xl font-black text-fig-ink">{influencer.fullName}</h3>
                        <span className="rounded-full bg-fig-moss px-3 py-1 text-xs font-black text-fig-cream">{influencer.status}</span>
                        {influencer.couponCode ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-fig-clay px-3 py-1 text-xs font-black text-white">
                            <TicketPercent className="h-3 w-3" /> {influencer.couponCode}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm font-black text-fig-clay">
                        {influencer.platform} {influencer.username ? `• ${influencer.username}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => startEdit(influencer)} className="btn-soft px-3 py-2" title="Düzenle">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => void deleteItem(influencer.id)} className="btn-soft px-3 py-2 text-red-700" title="Sil">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-stone-700 md:grid-cols-2">
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-fig-moss" /> {influencer.phone || "Telefon yok"}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-fig-moss" /> {influencer.city || "Şehir yok"}
                    </p>
                    <p>
                      <span className="font-black text-fig-ink">Takipçi:</span> {influencer.followerCount || "-"}
                    </p>
                    <p>
                      <span className="font-black text-fig-ink">Ücret:</span> {influencer.rate || "-"}
                    </p>
                    <p>
                      <span className="font-black text-fig-ink">Kargo:</span> {influencer.shippingCompany || "-"} {influencer.trackingNumber ? `• ${influencer.trackingNumber}` : ""}
                    </p>
                    <p>
                      <span className="font-black text-fig-ink">Teslim:</span> {influencer.deliveryStatus || "-"}
                    </p>
                  </div>

                  {socialLinks(influencer).length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {socialLinks(influencer).map(([label, url]) => (
                        <a key={label} href={url} target="_blank" rel="noreferrer" className="btn-soft px-3 py-2">
                          <ExternalLink className="h-4 w-4" /> {label}
                        </a>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {influencer.sentProducts ? (
                      <InfoBox icon={PackageCheck} title="Ürün geçmişi" text={influencer.sentProducts} meta={influencer.productSentDate ? formatDate(influencer.productSentDate) : ""} />
                    ) : null}
                    {influencer.views || influencer.likes || influencer.salesCount || influencer.revenue ? (
                      <InfoBox
                        icon={TrendingUp}
                        title="Performans"
                        text={`Görüntülenme: ${influencer.views || "-"} • Beğeni: ${influencer.likes || "-"} • Yorum: ${influencer.comments || "-"} • Kaydetme: ${influencer.saves || "-"} • Satış: ${influencer.salesCount || "-"} • Ciro: ${influencer.revenue || "-"}`}
                      />
                    ) : null}
                    {influencer.reminderDate || influencer.reminderNote ? (
                      <InfoBox icon={Bell} title="Hatırlatma" text={influencer.reminderNote || "Takip edilecek"} meta={influencer.reminderDate ? formatDate(influencer.reminderDate) : ""} />
                    ) : null}
                    {influencer.address ? <InfoBox icon={MapPin} title="Adres" text={influencer.address} /> : null}
                  </div>

                  {influencer.notes ? (
                    <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-stone-700">
                      <span className="font-black text-fig-ink">Not:</span> {influencer.notes}
                    </p>
                  ) : null}
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-stone-400">Güncelleme: {formatDate(influencer.updatedAt)}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function FormBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-fig-sand/70 bg-white/45 p-4">
      <h3 className="mb-4 font-display text-2xl font-black text-fig-ink">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function InfoBox({ icon: Icon, title, text, meta }: { icon: LucideIcon; title: string; text: string; meta?: string }) {
  return (
    <div className="rounded-2xl bg-fig-cream px-4 py-3 text-sm leading-6 text-stone-700">
      <p className="mb-1 flex items-center gap-2 font-black text-fig-ink">
        <Icon className="h-4 w-4 text-fig-moss" /> {title} {meta ? <span className="text-xs text-stone-500">• {meta}</span> : null}
      </p>
      <p>{text}</p>
    </div>
  );
}
