"use client";

import { ArrowRight, Loader2, LockKeyhole, Sprout } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const next = nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/panel";
  const [username, setUsername] = useState("oguzhan");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Giriş yapılamadı.");
      }

      router.replace(next);
      router.refresh();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative grid min-h-[calc(100vh-77px)] place-items-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute left-8 top-12 h-40 w-40 rounded-full bg-fig-leaf/30 blur-3xl" />
      <div className="absolute bottom-10 right-8 h-52 w-52 rounded-full bg-fig-clay/25 blur-3xl" />
      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/55 shadow-panel backdrop-blur-xl lg:grid-cols-[1fr_0.86fr]">
        <div className="hidden min-h-[620px] flex-col justify-between bg-fig-ink p-10 text-fig-cream lg:flex">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-fig-cream/20 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-fig-sand">
              <Sprout className="h-4 w-4" /> figyfun ortaklık hafızası
            </div>
            <h1 className="mt-10 max-w-sm font-display text-6xl font-black leading-[0.92]">
              Influencer datan tek kasada.
            </h1>
          </div>
          <div className="grid gap-3 text-sm text-fig-sand">
            <p>Telefon, kullanıcı adı, adres, ücret, durum ve notlar tek panelde tutulur.</p>
            <p>Vercel KV bağlandığında veriler domain üzerinden kalıcı şekilde saklanır.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-10">
          <div className="mb-8">
            <div className="mb-5 grid h-14 w-14 place-items-center rounded-3xl bg-fig-moss text-fig-cream shadow-card">
              <LockKeyhole className="h-7 w-7" />
            </div>
            <h2 className="font-display text-4xl font-black text-fig-ink">Giriş</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              figyfun influencer işbirliği paneline erişmek için kullanıcı adı ve şifre gir.
            </p>
          </div>

          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="label">Kullanıcı adı</span>
              <input value={username} onChange={(event) => setUsername(event.target.value)} className="field" autoComplete="username" />
            </label>
            <label className="grid gap-2">
              <span className="label">Şifre</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field"
                autoComplete="current-password"
                placeholder="Şifren"
              />
            </label>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          ) : null}

          <button type="submit" disabled={isLoading} className="btn-primary mt-6 w-full">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Panele gir
          </button>
        </form>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="px-4 py-10 text-sm text-stone-600">Giriş ekranı hazırlanıyor...</div>}>
      <LoginForm />
    </Suspense>
  );
}
