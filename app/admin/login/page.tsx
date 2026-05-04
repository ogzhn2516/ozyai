"use client";

import { KeyRound, Loader2, LogIn, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Giriş başarısız oldu.");
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
    <form onSubmit={handleSubmit} className="mx-auto grid w-full max-w-md gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
      <div className="grid h-12 w-12 place-items-center rounded-lg bg-blue-50 text-wiro-600">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-ink">Admin Girişi</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          API anahtarları ve servis ayarlarına erişmek için giriş yapın.
        </p>
      </div>

      <label className="grid gap-2">
        <span className="label">Kullanıcı adı</span>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="field"
          autoComplete="username"
          placeholder="admin_..."
        />
      </label>

      <label className="grid gap-2">
        <span className="label">Şifre</span>
        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field pr-11"
            autoComplete="current-password"
            placeholder="••••••••••••"
          />
          <KeyRound className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </label>

      {error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isLoading || !username || !password}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-wiro-600 px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-wiro-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        Giriş yap
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-[calc(100vh-73px)] place-items-center px-4 py-10 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-sm text-slate-600">Giriş ekranı hazırlanıyor...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
