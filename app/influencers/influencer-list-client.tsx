"use client";

import { ExternalLink, Instagram, Loader2, Plus, Trash2, UsersRound } from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import type { Influencer } from "../lib/influencer-store";

type InstagramLookupProfile = {
  username: string;
  fullName: string;
  profileUrl: string;
  followerCount: string;
  found: boolean;
  warning?: string;
};

function cleanUsername(value: string) {
  return value.trim().replace(/^@+/, "").replace(/\/+$/, "");
}

function instagramHref(username: string, instagramUrl: string, profileUrl: string) {
  if (instagramUrl) return instagramUrl;
  if (profileUrl.includes("instagram.com")) return profileUrl;

  const clean = cleanUsername(username);
  return clean ? `https://www.instagram.com/${clean}/` : "";
}

export function InfluencerListClient({ initialInfluencers }: { initialInfluencers: Influencer[] }) {
  const [influencers, setInfluencers] = useState(initialInfluencers);
  const [username, setUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const existingUsernames = useMemo(
    () => new Set(influencers.map((item) => cleanUsername(item.username).toLowerCase()).filter(Boolean)),
    [influencers],
  );

  async function addByUsername(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    const clean = cleanUsername(username);

    if (!clean) {
      setError("Instagram kullanıcı adı yaz.");
      setIsSaving(false);
      return;
    }

    if (existingUsernames.has(clean.toLowerCase())) {
      setError("Bu kullanıcı adı zaten listede var.");
      setIsSaving(false);
      return;
    }

    try {
      const lookupResponse = await fetch("/api/instagram/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: clean }),
      });
      const lookupData = (await lookupResponse.json()) as { profile?: InstagramLookupProfile; error?: string };

      if (!lookupResponse.ok || !lookupData.profile) {
        throw new Error(lookupData.error ?? "Instagram bilgisi alınamadı.");
      }

      const profile = lookupData.profile;
      const createResponse = await fetch("/api/influencers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: profile.fullName,
          platform: "Instagram",
          username: profile.username,
          followerCount: profile.followerCount,
          instagramUrl: profile.profileUrl,
          profileUrl: profile.profileUrl,
          status: "Aday",
        }),
      });
      const createData = (await createResponse.json()) as { influencer?: Influencer; error?: string };

      if (!createResponse.ok || !createData.influencer) {
        throw new Error(createData.error ?? "Influencer eklenemedi.");
      }

      setInfluencers((current) => [createData.influencer!, ...current]);
      setUsername("");
      setMessage(profile.warning ?? `${profile.username} eklendi.`);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteInfluencer(id: string, usernameLabel: string) {
    const shouldDelete = window.confirm(`${usernameLabel} kaydını silmek istiyor musun?`);
    if (!shouldDelete) return;

    setDeletingId(id);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/influencers/${id}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Influencer silinemedi.");
      }

      setInfluencers((current) => current.filter((item) => item.id !== id));
      setMessage(`${usernameLabel} silindi.`);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-77px)] max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/60 bg-fig-ink p-6 text-fig-cream shadow-panel sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-fig-sand">figyfun influencer listesi</p>
            <h1 className="mt-4 font-display text-5xl font-black leading-none">Tüm influencerlar</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-fig-sand">
              Kullanıcı adını yaz, sistem Instagram profilini ve takipçi sayısını otomatik yakalamayı denesin.
            </p>
          </div>
          <Link href="/panel" className="btn-soft border-white/20 bg-white/10 text-fig-cream hover:bg-white/20">
            Panele dön
          </Link>
        </div>
      </section>

      <form onSubmit={addByUsername} className="mt-6 rounded-[2rem] border border-white/70 bg-white/70 p-4 shadow-card backdrop-blur sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="grid gap-2">
            <span className="label">Instagram kullanıcı adı</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="field"
              placeholder="oguzhankaba veya @oguzhankaba"
              autoComplete="off"
            />
          </label>
          <button type="submit" disabled={isSaving} className="btn-primary self-end">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Ekle
          </button>
        </div>

        {message ? <div className="mt-4 rounded-2xl border border-fig-leaf/30 bg-fig-leaf/15 px-4 py-3 text-sm font-black text-fig-moss">{message}</div> : null}
        {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">{error}</div> : null}
      </form>

      <section className="mt-6 rounded-[2rem] border border-white/70 bg-white/65 p-4 shadow-card backdrop-blur sm:p-5">
        <div className="mb-4 flex items-center gap-3 px-2">
          <UsersRound className="h-5 w-5 text-fig-moss" />
          <p className="text-sm font-black uppercase tracking-[0.18em] text-stone-500">{influencers.length} kayıt</p>
        </div>

        {influencers.length === 0 ? (
          <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-fig-sand bg-white/45 px-8 text-center text-sm font-bold leading-6 text-stone-500">
            Henüz influencer kaydı yok. Yukarıdan Instagram kullanıcı adıyla ekleyebilirsin.
          </div>
        ) : (
          <div className="divide-y divide-fig-sand/70 overflow-hidden rounded-3xl border border-fig-sand/70 bg-white/75">
            {influencers.map((influencer) => {
              const href = instagramHref(influencer.username, influencer.instagramUrl, influencer.profileUrl);
              const displayUsername = influencer.username || influencer.fullName || "Kullanıcı adı yok";

              return (
                <article key={influencer.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex max-w-full items-center gap-2 text-lg font-black text-fig-ink transition hover:text-fig-clay"
                      >
                        <Instagram className="h-5 w-5 shrink-0 text-fig-moss" />
                        <span className="truncate">{displayUsername}</span>
                        <ExternalLink className="h-4 w-4 shrink-0" />
                      </a>
                    ) : (
                      <p className="inline-flex max-w-full items-center gap-2 text-lg font-black text-fig-ink">
                        <Instagram className="h-5 w-5 shrink-0 text-fig-moss" />
                        <span className="truncate">{displayUsername}</span>
                      </p>
                    )}
                    <p className="mt-1 text-sm font-bold text-stone-500">{influencer.fullName || influencer.platform}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <div className="rounded-full bg-fig-cream px-4 py-2 text-sm font-black text-fig-moss">
                      {influencer.followerCount ? `${influencer.followerCount} takipçi` : "Takipçi yok"}
                    </div>
                    <button
                      type="button"
                      onClick={() => void deleteInfluencer(influencer.id, displayUsername)}
                      disabled={deletingId === influencer.id}
                      className="btn-soft px-3 py-2 text-red-700"
                      title="Sil"
                    >
                      {deletingId === influencer.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
