"use client";

import {
  AudioLines,
  CirclePlus,
  Loader2,
  Mic2,
  Play,
  RefreshCw,
  SlidersHorizontal,
  Volume2,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Voice = {
  voiceId: string;
  name: string;
  category: string;
  accent: string;
  description: string;
  previewUrl: string;
};

type VoiceResponse = {
  status: "completed" | "mock";
  voices: Voice[];
};

const models = [
  { value: "eleven_multilingual_v2", label: "Multilingual v2" },
  { value: "eleven_flash_v2_5", label: "Flash v2.5" },
  { value: "eleven_turbo_v2_5", label: "Turbo v2.5" },
];

const languages = [
  { value: "", label: "Otomatik" },
  { value: "tr", label: "Türkçe" },
  { value: "en", label: "İngilizce" },
  { value: "de", label: "Almanca" },
  { value: "fr", label: "Fransızca" },
  { value: "es", label: "İspanyolca" },
];

export default function VoiceGeneratorPage() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "mock" | "completed">("idle");
  const [selectedVoiceId, setSelectedVoiceId] = useState("");
  const [text, setText] = useState("");
  const [modelId, setModelId] = useState(models[0].value);
  const [languageCode, setLanguageCode] = useState("");
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [style, setStyle] = useState(0);
  const [customVoiceId, setCustomVoiceId] = useState("");
  const [customVoiceName, setCustomVoiceName] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioStatus, setAudioStatus] = useState("");
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const selectedVoice = useMemo(
    () => voices.find((voice) => voice.voiceId === selectedVoiceId),
    [selectedVoiceId, voices],
  );
  const canGenerate = text.trim().length >= 5 && selectedVoiceId && !isGenerating;

  async function loadVoices() {
    setIsLoadingVoices(true);
    setError("");

    try {
      const response = await fetch("/api/elevenlabs/voices");
      const data = (await response.json()) as VoiceResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Ses listesi alınamadı.");
      }

      setVoices(data.voices);
      setVoiceStatus(data.status);
      setSelectedVoiceId((current) => current || data.voices[0]?.voiceId || "");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setIsLoadingVoices(false);
    }
  }

  useEffect(() => {
    void loadVoices();
  }, []);

  function addCustomVoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = customVoiceId.trim();

    if (!id) {
      setError("Manuel ses eklemek için voice ID girin.");
      return;
    }

    const voice: Voice = {
      voiceId: id,
      name: customVoiceName.trim() || "Manuel ElevenLabs sesi",
      category: "custom",
      accent: "",
      description: "Kullanıcı tarafından eklenen voice ID",
      previewUrl: "",
    };

    setVoices((current) => [voice, ...current.filter((item) => item.voiceId !== id)]);
    setSelectedVoiceId(id);
    setCustomVoiceId("");
    setCustomVoiceName("");
    setError("");
  }

  async function generateSpeech(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setAudioStatus("");

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl("");
    }

    if (!selectedVoiceId) {
      setError("Lütfen bir ses seçin.");
      return;
    }

    if (text.trim().length < 5) {
      setError("Seslendirme metni en az 5 karakter olmalı.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/elevenlabs/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          voiceId: selectedVoiceId,
          modelId,
          languageCode,
          stability,
          similarityBoost,
          style,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Ses üretimi başarısız oldu.");
      }

      const blob = await response.blob();
      setAudioUrl(URL.createObjectURL(blob));
      setAudioStatus(response.headers.get("X-TTS-Status") ?? "completed");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-ink">ElevenLabs Seslendirme</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              ElevenLabs seslerini sitede listele, metni yaz ve seçilen sesle ses üret.
            </p>
          </div>
          <AudioLines className="h-7 w-7 text-wiro-600" />
        </div>

        <form onSubmit={generateSpeech} className="grid gap-5">
          <label className="grid gap-2">
            <span className="label">Seslendirme metni</span>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="field min-h-44 resize-y"
              placeholder="Merhaba, bu metin ElevenLabs API ile seçtiğiniz ses kullanılarak seslendirilecek..."
            />
            <span className={text.trim().length < 5 ? "helper text-amber-600" : "helper"}>
              {text.trim().length}/5 minimum karakter
            </span>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="label">Model</span>
              <select value={modelId} onChange={(event) => setModelId(event.target.value)} className="field">
                {models.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="label">Dil</span>
              <select
                value={languageCode}
                onChange={(event) => setLanguageCode(event.target.value)}
                className="field"
              >
                {languages.map((language) => (
                  <option key={language.value} value={language.value}>
                    {language.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-wiro-600" />
              <h2 className="text-sm font-bold text-ink">Ses ayarları</h2>
            </div>
            <div className="grid gap-4">
              {[
                { label: "Stability", value: stability, setter: setStability },
                { label: "Similarity boost", value: similarityBoost, setter: setSimilarityBoost },
                { label: "Style", value: style, setter: setStyle },
              ].map((control) => (
                <label key={control.label} className="grid gap-2">
                  <span className="flex items-center justify-between text-xs font-bold text-slate-600">
                    {control.label}
                    <span>{control.value.toFixed(2)}</span>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={control.value}
                    onChange={(event) => control.setter(Number(event.target.value))}
                    className="w-full accent-wiro-600"
                  />
                </label>
              ))}
            </div>
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
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Seslendir
          </button>
        </form>
      </section>

      <aside className="grid content-start gap-5">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Mic2 className="h-5 w-5 text-wiro-600" />
              <h2 className="text-lg font-bold text-ink">Sesler</h2>
            </div>
            <button
              type="button"
              onClick={loadVoices}
              disabled={isLoadingVoices}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              title="Sesleri yenile"
            >
              {isLoadingVoices ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </button>
          </div>

          <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-wiro-700">
            Durum: {voiceStatus === "mock" ? "Mock ses listesi" : voiceStatus === "completed" ? "ElevenLabs" : "Yükleniyor"}
          </div>

          <div className="grid max-h-[420px] gap-3 overflow-auto pr-1">
            {voices.map((voice) => (
              <button
                key={voice.voiceId}
                type="button"
                onClick={() => setSelectedVoiceId(voice.voiceId)}
                className={`rounded-lg border p-4 text-left transition ${
                  selectedVoiceId === voice.voiceId
                    ? "border-wiro-500 bg-blue-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-sm font-bold text-ink">{voice.name}</span>
                    <span className="mt-1 block text-xs font-semibold text-slate-500">
                      {voice.category} {voice.accent ? `• ${voice.accent}` : ""}
                    </span>
                  </span>
                  <Volume2 className="h-4 w-4 text-wiro-600" />
                </span>
                <span className="mt-2 block text-xs leading-5 text-slate-600">
                  {voice.description || voice.voiceId}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <CirclePlus className="h-5 w-5 text-wiro-600" />
            <h2 className="text-lg font-bold text-ink">Manuel ses ekle</h2>
          </div>
          <form onSubmit={addCustomVoice} className="grid gap-3">
            <input
              value={customVoiceName}
              onChange={(event) => setCustomVoiceName(event.target.value)}
              className="field"
              placeholder="Ses adı"
            />
            <input
              value={customVoiceId}
              onChange={(event) => setCustomVoiceId(event.target.value)}
              className="field"
              placeholder="ElevenLabs voice ID"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-ink transition hover:bg-slate-50"
            >
              <CirclePlus className="h-4 w-4" />
              Listeye ekle
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Ses çıktısı</h2>
          <p className="mt-2 text-sm text-slate-600">
            {selectedVoice ? `${selectedVoice.name} seçildi.` : "Bir ses seçin."}
          </p>
          {audioUrl ? (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <audio src={audioUrl} controls className="w-full" />
              <p className="mt-3 text-sm font-semibold text-emerald-700">
                Durum: {audioStatus === "mock" ? "Mock demo audio" : "ElevenLabs audio"}
              </p>
            </div>
          ) : (
            <div className="mt-4 grid min-h-28 place-items-center rounded-lg bg-slate-950 px-6 text-center text-sm font-semibold text-slate-300">
              Ses üretildiğinde oynatıcı burada görünür.
            </div>
          )}
        </section>
      </aside>
    </main>
  );
}
