"use client";

import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  Mic2,
  Play,
  Upload,
  Wand2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, Suspense, useMemo, useState } from "react";

type Result = {
  status: "completed" | "processing" | "mock";
  videoUrl?: string;
  taskid?: string;
  message?: string;
};

const voices = [
  "Ayşe - Türkçe doğal kadın sesi",
  "Mert - Türkçe stüdyo erkek sesi",
  "Derya - Enerjik sunum sesi",
];

const languages = ["Türkçe", "İngilizce", "Almanca", "Fransızca", "İspanyolca"];

function CreateForm() {
  const searchParams = useSearchParams();
  const generatedImage = searchParams.get("image");
  const [portraitName, setPortraitName] = useState(generatedImage ? "Mock GPT Image 2 avatarı" : "");
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [portraitPreview, setPortraitPreview] = useState<string | null>(generatedImage);
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState(voices[0]);
  const [audioName, setAudioName] = useState("");
  const [language, setLanguage] = useState(languages[0]);
  const [quality, setQuality] = useState<"720p" | "1080p">("1080p");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const scriptLength = script.trim().length;
  const canSubmit = portraitName && scriptLength >= 20 && !isLoading;

  const statusText = useMemo(() => {
    if (!isLoading) return "Mock üretim beklemede";
    if (progress < 35) return "Portre ve metin doğrulanıyor";
    if (progress < 75) return "Avatar video simülasyonu hazırlanıyor";
    return "Demo response alınıyor";
  }, [isLoading, progress]);

  function handlePortrait(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPortraitFile(file);
    setPortraitName(file.name);
    setPortraitPreview(URL.createObjectURL(file));
    setResult(null);
  }

  function handleAudio(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setAudioName(file?.name ?? "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!portraitName) {
      setError("Lütfen bir portre görseli yükleyin veya görsel üreticiden avatar seçin.");
      return;
    }

    if (scriptLength < 20) {
      setError("Konuşma metni en az 20 karakter olmalı.");
      return;
    }

    setIsLoading(true);
    setProgress(12);

    const timer = window.setInterval(() => {
      setProgress((current) => Math.min(current + 18, 92));
    }, 280);

    try {
      const formData = new FormData();
      formData.append("portraitName", portraitName);
      formData.append("script", script);
      formData.append("voice", voice);
      formData.append("audioName", audioName);
      formData.append("language", language);
      formData.append("quality", quality);

      if (portraitFile) {
        formData.append("portrait", portraitFile);
      } else if (generatedImage) {
        formData.append("portraitUrl", generatedImage);
      }

      const response = await fetch("/api/wiro/avatar-video", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as Result & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Wiro API yanıtı alınamadı.");
      }

      setProgress(100);
      setResult(data);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      window.clearInterval(timer);
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-ink">Avatar Video Oluştur</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Bu ekran mock API ile çalışır. Gerçek Wiro kredisi harcanmaz.
            </p>
          </div>
          <Wand2 className="h-7 w-7 text-wiro-600" />
        </div>

        <div className="grid gap-5">
          <label className="grid gap-2">
            <span className="label">Portre görseli</span>
            <span className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-wiro-500 hover:bg-blue-50">
              {portraitPreview ? (
                <img
                  src={portraitPreview}
                  alt="Seçilen avatar portresi"
                  className="h-32 w-32 rounded-lg object-cover shadow-sm"
                />
              ) : (
                <ImagePlus className="h-9 w-9 text-slate-400" />
              )}
              <span className="mt-3 text-sm font-semibold text-ink">
                {portraitName || "Portre yükle"}
              </span>
              <span className="helper">PNG, JPG veya WEBP önerilir.</span>
              <input type="file" accept="image/*" onChange={handlePortrait} className="sr-only" />
            </span>
          </label>

          <label className="grid gap-2">
            <span className="label">Konuşma metni</span>
            <textarea
              value={script}
              onChange={(event) => setScript(event.target.value)}
              className="field min-h-40 resize-y"
              placeholder="Merhaba, ben Wiro avatar demo akışınız için oluşturulmuş dijital sunucuyum..."
            />
            <span className={scriptLength < 20 ? "helper text-amber-600" : "helper"}>
              {scriptLength}/20 minimum karakter
            </span>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="label">Hazır ses seçimi</span>
              <select value={voice} onChange={(event) => setVoice(event.target.value)} className="field">
                {voices.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="label">Dil seçimi</span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="field"
              >
                {languages.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="label">Ses dosyası yükleme</span>
              <span className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                <Upload className="h-4 w-4" />
                {audioName || "Opsiyonel ses dosyası"}
                <input type="file" accept="audio/*" onChange={handleAudio} className="sr-only" />
              </span>
            </label>

            <div className="grid gap-2">
              <span className="label">Çözünürlük</span>
              <div className="grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-100 p-1">
                {(["720p", "1080p"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setQuality(item)}
                    className={`rounded-md px-4 py-2 text-sm font-bold transition ${
                      quality === item ? "bg-white text-wiro-700 shadow-sm" : "text-slate-600"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-wiro-600 px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-wiro-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Video oluştur
          </button>
        </div>
      </section>

      <aside className="grid content-start gap-5">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Mic2 className="h-5 w-5 text-wiro-600" />
            <h2 className="text-lg font-bold text-ink">Üretim durumu</h2>
          </div>
          <p className="mt-3 text-sm text-slate-600">{statusText}</p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-wiro-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-right text-xs font-bold text-slate-500">{progress}%</div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-ink">Demo video alanı</h2>
          </div>
          <div className="aspect-video overflow-hidden rounded-lg bg-slate-950">
            {result?.videoUrl ? (
              <video
                src={result.videoUrl}
                poster="/demo-video-poster.svg"
                controls
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center px-6 text-center text-sm font-semibold text-slate-300">
                Mock API tamamlandığında demo video burada gösterilir.
              </div>
            )}
          </div>
          {result ? (
            <p className="mt-3 text-sm font-semibold text-emerald-700">
              Status: {result.status}
              {result.videoUrl ? ` • URL: ${result.videoUrl}` : ""}
              {result.taskid ? ` • Task: ${result.taskid}` : ""}
            </p>
          ) : null}
        </section>
      </aside>
    </form>
  );
}

export default function CreatePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-sm text-slate-600">Form hazırlanıyor...</div>}>
        <CreateForm />
      </Suspense>
    </main>
  );
}
