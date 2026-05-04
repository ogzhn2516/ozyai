"use client";

import {
  CheckCircle2,
  EyeOff,
  ImageIcon,
  KeyRound,
  Loader2,
  LogOut,
  Save,
  ServerCog,
  Video,
  Volume2,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ManagedKey =
  | "OPENAI_API_KEY"
  | "OPENAI_IMAGE_MODEL"
  | "WIRO_API_KEY"
  | "WIRO_API_SECRET"
  | "WIRO_API_BASE_URL"
  | "WIRO_AVATAR_VIDEO_ENDPOINT"
  | "ELEVENLABS_API_KEY"
  | "ELEVENLABS_TTS_MODEL";

type Setting = {
  configured: boolean;
  value: string;
  masked: string;
};

type SettingsResponse = {
  status: "completed" | "saved";
  settings: Record<ManagedKey, Setting>;
};

type Field = {
  key: ManagedKey;
  label: string;
  placeholder: string;
  secret?: boolean;
};

const services: Array<{
  id: string;
  title: string;
  description: string;
  icon: typeof ImageIcon;
  fields: Field[];
}> = [
  {
    id: "image",
    title: "Image servisleri",
    description: "GPT Image text-to-image ve image-to-image üretimi için OpenAI ayarları.",
    icon: ImageIcon,
    fields: [
      {
        key: "OPENAI_API_KEY",
        label: "OpenAI API key",
        placeholder: "sk-...",
        secret: true,
      },
      {
        key: "OPENAI_IMAGE_MODEL",
        label: "Image model",
        placeholder: "gpt-image-1.5",
      },
    ],
  },
  {
    id: "video",
    title: "Video servisleri",
    description: "Wiro avatar video API anahtarı ve gerçek endpoint hazırlığı.",
    icon: Video,
    fields: [
      {
        key: "WIRO_API_KEY",
        label: "Wiro API key",
        placeholder: "wiro_...",
        secret: true,
      },
      {
        key: "WIRO_API_SECRET",
        label: "Wiro API secret",
        placeholder: "Signature project kullanıyorsanız gerekli",
        secret: true,
      },
      {
        key: "WIRO_API_BASE_URL",
        label: "Wiro base URL",
        placeholder: "https://api.wiro.ai/v1",
      },
      {
        key: "WIRO_AVATAR_VIDEO_ENDPOINT",
        label: "Avatar video endpoint",
        placeholder: "/v1/avatar-video",
      },
    ],
  },
  {
    id: "voice",
    title: "Seslendirme servisleri",
    description: "ElevenLabs ses listesi ve text-to-speech üretimi için ayarlar.",
    icon: Volume2,
    fields: [
      {
        key: "ELEVENLABS_API_KEY",
        label: "ElevenLabs API key",
        placeholder: "xi-...",
        secret: true,
      },
      {
        key: "ELEVENLABS_TTS_MODEL",
        label: "TTS model",
        placeholder: "eleven_multilingual_v2",
      },
    ],
  },
];

const defaultValues: Record<ManagedKey, string> = {
  OPENAI_API_KEY: "",
  OPENAI_IMAGE_MODEL: "gpt-image-1.5",
  WIRO_API_KEY: "",
  WIRO_API_SECRET: "",
  WIRO_API_BASE_URL: "",
  WIRO_AVATAR_VIDEO_ENDPOINT: "/Run/wiro/avatarmotion",
  ELEVENLABS_API_KEY: "",
  ELEVENLABS_TTS_MODEL: "eleven_multilingual_v2",
};

export default function AdminPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SettingsResponse["settings"] | null>(null);
  const [formValues, setFormValues] = useState<Record<ManagedKey, string>>(defaultValues);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const configuredCount = useMemo(() => {
    if (!settings) return 0;

    return Object.values(settings).filter((setting) => setting.configured).length;
  }, [settings]);

  async function loadSettings() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/settings", { cache: "no-store" });
      const data = (await response.json()) as SettingsResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Admin ayarları alınamadı.");
      }

      setSettings(data.settings);
      setFormValues((current) => {
        const next = { ...current };

        for (const service of services) {
          for (const field of service.fields) {
            if (!field.secret) {
              next[field.key] = data.settings[field.key]?.value || defaultValues[field.key];
            }
          }
        }

        return next;
      });
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  function updateValue(key: ManagedKey, value: string) {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    const payload = {} as Partial<Record<ManagedKey, string>>;

    for (const service of services) {
      for (const field of service.fields) {
        const value = formValues[field.key];

        if (field.secret && !value.trim()) {
          continue;
        }

        payload[field.key] = value;
      }
    }

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as SettingsResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Ayarlar kaydedilemedi.");
      }

      setSettings(data.settings);
      setFormValues((current) => ({
        ...current,
        OPENAI_API_KEY: "",
        WIRO_API_KEY: "",
        WIRO_API_SECRET: "",
        ELEVENLABS_API_KEY: "",
      }));
      setMessage(".env.local güncellendi. API rotaları yeni değerleri dinamik okuyacak.");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-bold text-wiro-700">
              <ServerCog className="h-4 w-4" />
              Servis yönetimi
            </div>
            <h1 className="text-3xl font-bold text-ink">Admin Paneli</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Image, video ve seslendirme servisleri için gerekli API anahtarlarını ve model
              ayarlarını yerel `.env.local` dosyasına kaydedin.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
            {configuredCount} ayar tanımlı
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-ink transition hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Çıkış
          </button>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-5">
        {services.map((service) => {
          const Icon = service.icon;

          return (
            <section key={service.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-slate-100 text-wiro-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-ink">{service.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{service.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {service.fields.map((field) => {
                  const setting = settings?.[field.key];
                  const isSecret = Boolean(field.secret);

                  return (
                    <label key={field.key} className="grid gap-2">
                      <span className="flex items-center justify-between gap-3">
                        <span className="label">{field.label}</span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${
                            setting?.configured
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {setting?.configured ? <CheckCircle2 className="h-3 w-3" /> : <KeyRound className="h-3 w-3" />}
                          {setting?.configured ? "Tanımlı" : "Boş"}
                        </span>
                      </span>
                      <div className="relative">
                        <input
                          type={isSecret ? "password" : "text"}
                          value={formValues[field.key]}
                          onChange={(event) => updateValue(field.key, event.target.value)}
                          className="field pr-11"
                          placeholder={
                            isSecret && setting?.masked
                              ? `Mevcut: ${setting.masked} - değiştirmek için yeni değer girin`
                              : field.placeholder
                          }
                        />
                        {isSecret ? (
                          <EyeOff className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        ) : null}
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })}

        {error ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {message}
          </div>
        ) : null}

        <div className="sticky bottom-4 z-20 rounded-lg border border-slate-200 bg-white/95 p-4 shadow-soft backdrop-blur">
          <button
            type="submit"
            disabled={isLoading || isSaving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-wiro-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-wiro-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Ayarları kaydet
          </button>
        </div>
      </form>
    </main>
  );
}
