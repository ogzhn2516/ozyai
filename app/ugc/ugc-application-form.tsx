"use client";

import { CheckCircle2, Instagram, Loader2, Send } from "lucide-react";
import { FormEvent, useState } from "react";

const emptyForm = {
  fullName: "",
  phone: "",
  province: "",
  district: "",
  address: "",
  instagram: "",
  followerCount: "",
};

export function UgcApplicationForm() {
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(key: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/ugc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Başvuru kaydedilemedi.");
      }

      setForm(emptyForm);
      setMessage("Başvurun alındı. Teşekkür ederiz.");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-77px)] max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/60 bg-fig-ink p-6 text-fig-cream shadow-panel sm:p-8">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-fig-sand">figyfun ugc başvuru formu</p>
          <h1 className="mt-4 font-display text-5xl font-black leading-none sm:text-6xl">UGC işbirliği başvurusu</h1>
          <p className="mt-4 text-sm leading-6 text-fig-sand">
            Bilgilerini gönder, figyfun ekibi başvurunu panelde görüntülesin ve uygun işbirlikleri için sana ulaşsın.
          </p>
        </div>
      </section>

      <form onSubmit={submitApplication} className="mt-6 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-card backdrop-blur sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-fig-moss text-fig-cream">
            <Instagram className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-3xl font-black text-fig-ink">Bilgilerini gir</h2>
            <p className="mt-1 text-sm text-stone-600">Zorunlu alanları doldurman yeterli.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 sm:col-span-2">
            <span className="label">İsim soy isim</span>
            <input
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              className="field"
              placeholder="Ad Soyad"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="label">Telefon no</span>
            <input
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className="field"
              placeholder="05xx xxx xx xx"
              inputMode="tel"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="label">Instagram adresi</span>
            <input
              value={form.instagram}
              onChange={(event) => updateField("instagram", event.target.value)}
              className="field"
              placeholder="@kullanici veya profil linki"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="label">İl</span>
            <input
              value={form.province}
              onChange={(event) => updateField("province", event.target.value)}
              className="field"
              placeholder="İstanbul"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="label">İlçe</span>
            <input
              value={form.district}
              onChange={(event) => updateField("district", event.target.value)}
              className="field"
              placeholder="Kadıköy"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="label">Takipçi sayısı</span>
            <input
              value={form.followerCount}
              onChange={(event) => updateField("followerCount", event.target.value)}
              className="field"
              placeholder="Örn. 12.500 veya 12K"
              inputMode="text"
            />
          </label>

          <label className="grid gap-2 sm:col-span-2">
            <span className="label">Açık adres</span>
            <textarea
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              className="field min-h-28 resize-y"
              placeholder="Kargo gönderimi için açık adres"
              required
            />
          </label>
        </div>

        {message ? (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-fig-leaf/30 bg-fig-leaf/15 px-4 py-3 text-sm font-black text-fig-moss">
            <CheckCircle2 className="h-4 w-4" /> {message}
          </div>
        ) : null}
        {error ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">{error}</div> : null}

        <button type="submit" disabled={isSaving} className="btn-primary mt-6 w-full">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Başvuruyu gönder
        </button>
      </form>
    </main>
  );
}
