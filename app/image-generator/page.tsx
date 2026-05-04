"use client";

import {
  ArrowRight,
  FileImage,
  ImageIcon,
  Loader2,
  RefreshCw,
  Sparkles,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type GenerateMode = "text-to-image" | "image-to-image";

type ImageResult = {
  status: "completed" | "mock";
  mode: GenerateMode;
  model: string;
  imageUrl: string;
  revisedPrompt?: string | null;
};

const sizes = ["1024x1024", "1024x1536", "1536x1024"] as const;
const qualities = ["low", "medium", "high"] as const;
const formats = ["png", "webp", "jpeg"] as const;

async function readApiJson<T>(response: Response) {
  const text = await response.text();

  if (!text) {
    throw new Error("API boş yanıt döndürdü.");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text.slice(0, 500));
  }
}

export default function ImageGeneratorPage() {
  const [mode, setMode] = useState<GenerateMode>("text-to-image");
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<(typeof sizes)[number]>("1024x1024");
  const [quality, setQuality] = useState<(typeof qualities)[number]>("medium");
  const [outputFormat, setOutputFormat] = useState<(typeof formats)[number]>("png");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ImageResult | null>(null);
  const [error, setError] = useState("");

  const promptLength = prompt.trim().length;
  const canGenerate =
    promptLength >= 12 && !isGenerating && (mode === "text-to-image" || referenceImage);

  const resultBadge = useMemo(() => {
    if (!result) return "Sonuç bekleniyor";
    return result.status === "mock" ? "Mock fallback" : "OpenAI tamamlandı";
  }, [result]);

  function handleReferenceImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setReferenceImage(file);
    setReferencePreview(file ? URL.createObjectURL(file) : null);
    setResult(null);
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (promptLength < 12) {
      setError("Prompt en az 12 karakter olmalı.");
      return;
    }

    if (mode === "image-to-image" && !referenceImage) {
      setError("Image-to-image için referans görsel yükleyin.");
      return;
    }

    const formData = new FormData();
    formData.append("mode", mode);
    formData.append("prompt", prompt.trim());
    formData.append("size", size);
    formData.append("quality", quality);
    formData.append("outputFormat", outputFormat);

    if (mode === "image-to-image" && referenceImage) {
      formData.append("image", referenceImage);
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/openai/image", {
        method: "POST",
        body: formData,
      });

      const data = await readApiJson<ImageResult & { error?: string }>(response);

      if (!response.ok) {
        throw new Error(data.error ?? "Görsel üretim isteği başarısız oldu.");
      }

      setResult(data);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-ink">GPT Image Görsel Studio</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Text-to-image ve image-to-image üretimi aynı akışta. API anahtarı yoksa mock
              sonuç döner.
            </p>
          </div>
          <Sparkles className="h-7 w-7 text-wiro-600" />
        </div>

        <form onSubmit={handleGenerate} className="grid gap-5">
          <div className="grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-100 p-1">
            {[
              { value: "text-to-image", label: "Text to image", icon: Wand2 },
              { value: "image-to-image", label: "Image to image", icon: RefreshCw },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setMode(item.value as GenerateMode);
                    setResult(null);
                    setError("");
                  }}
                  className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition ${
                    mode === item.value ? "bg-white text-wiro-700 shadow-sm" : "text-slate-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <label className="grid gap-2">
            <span className="label">Prompt</span>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="field min-h-40 resize-y"
              placeholder={
                mode === "text-to-image"
                  ? "Profesyonel stüdyo ışığında, güven veren, modern Türkçe eğitim sunucusu avatar portresi..."
                  : "Referans görseldeki kişiyi koru; sade stüdyo arka planı, daha profesyonel ışık ve avatar videosuna uygun önden portre oluştur..."
              }
            />
            <span className={promptLength < 12 ? "helper text-amber-600" : "helper"}>
              {promptLength}/12 minimum karakter
            </span>
          </label>

          {mode === "image-to-image" ? (
            <label className="grid gap-2">
              <span className="label">Referans görsel</span>
              <span className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-wiro-500 hover:bg-blue-50">
                {referencePreview ? (
                  <img
                    src={referencePreview}
                    alt="Referans görsel önizleme"
                    className="h-28 w-28 rounded-lg object-cover shadow-sm"
                  />
                ) : (
                  <FileImage className="h-9 w-9 text-slate-400" />
                )}
                <span className="mt-3 text-sm font-semibold text-ink">
                  {referenceImage?.name ?? "Referans yükle"}
                </span>
                <span className="helper">PNG, JPG veya WEBP kabul edilir.</span>
                <input type="file" accept="image/*" onChange={handleReferenceImage} className="sr-only" />
              </span>
            </label>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="label">Boyut</span>
              <select value={size} onChange={(event) => setSize(event.target.value as typeof size)} className="field">
                {sizes.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="label">Kalite</span>
              <select
                value={quality}
                onChange={(event) => setQuality(event.target.value as typeof quality)}
                className="field"
              >
                {qualities.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="label">Format</span>
              <select
                value={outputFormat}
                onChange={(event) => setOutputFormat(event.target.value as typeof outputFormat)}
                className="field"
              >
                {formats.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          {error ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canGenerate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-wiro-600 px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-wiro-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            Görsel oluştur
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink">Üretim sonucu</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">{resultBadge}</p>
          </div>
          {result ? (
            <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              {result.model}
            </span>
          ) : null}
        </div>

        <div className="mt-4 aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {result?.imageUrl ? (
            <img src={result.imageUrl} alt="Üretilen avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center px-8 text-center text-sm font-semibold text-slate-500">
              Üretim tamamlandığında avatar görseli burada görünür.
            </div>
          )}
        </div>

        {result?.revisedPrompt ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Revised prompt</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{result.revisedPrompt}</p>
          </div>
        ) : null}

        {result?.imageUrl ? (
          <Link
            href={`/create?image=${encodeURIComponent(result.imageUrl)}`}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
          >
            Bu görselle avatar videosu oluştur
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </section>
    </main>
  );
}
