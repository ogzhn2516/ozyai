"use client";

import { ArrowRight, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Kayıt oluşturulamadı.");
      }

      router.replace("/panel");
      router.refresh();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-73px)] place-items-center px-4 py-10 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold text-ink">Hesap oluştur</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Avatar, görsel ve ses üretim araçlarına tek panelden erişin.
          </p>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="label">Ad Soyad</span>
            <input value={name} onChange={(event) => setName(event.target.value)} className="field" placeholder="Ayşe Yılmaz" />
          </label>
          <label className="grid gap-2">
            <span className="label">E-posta</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="field" placeholder="ornek@mail.com" />
          </label>
          <label className="grid gap-2">
            <span className="label">Şifre</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field"
              placeholder="En az 8 karakter"
            />
          </label>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-wiro-600 px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-wiro-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          Kayıt ol ve panele gir
        </button>

        <p className="mt-4 text-center text-sm text-slate-600">
          Zaten hesabınız var mı?{" "}
          <Link href="/login" className="font-bold text-wiro-700">
            Giriş yap
          </Link>
        </p>
      </form>
    </main>
  );
}
