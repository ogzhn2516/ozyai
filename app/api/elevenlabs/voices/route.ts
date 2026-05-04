import { NextResponse } from "next/server";
import { getEnvValue } from "../../../lib/env-store";

type ElevenLabsVoice = {
  voice_id: string;
  name: string;
  category?: string;
  labels?: Record<string, string>;
  preview_url?: string;
};

const mockVoices = [
  {
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    name: "Bella",
    category: "premade",
    accent: "American",
    description: "Sıcak ve anlatıcı kadın sesi",
    previewUrl: "",
  },
  {
    voiceId: "JBFqnCBsd6RMkjVDRZzb",
    name: "George",
    category: "premade",
    accent: "British",
    description: "Tok ve profesyonel erkek sesi",
    previewUrl: "",
  },
  {
    voiceId: "21m00Tcm4TlvDq8ikWAM",
    name: "Rachel",
    category: "premade",
    accent: "American",
    description: "Net, sakin ve sunuma uygun ses",
    previewUrl: "",
  },
];

export async function GET() {
  const apiKey = getEnvValue("ELEVENLABS_API_KEY");

  if (!apiKey) {
    return NextResponse.json({
      status: "mock",
      voices: mockVoices,
    });
  }

  const response = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: {
      "xi-api-key": apiKey,
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as {
    voices?: ElevenLabsVoice[];
    detail?: { message?: string };
  };

  if (!response.ok) {
    return NextResponse.json(
      { error: payload.detail?.message ?? "ElevenLabs ses listesi alınamadı." },
      { status: response.status },
    );
  }

  return NextResponse.json({
    status: "completed",
    voices:
      payload.voices?.map((voice) => ({
        voiceId: voice.voice_id,
        name: voice.name,
        category: voice.category ?? "voice",
        accent: voice.labels?.accent ?? voice.labels?.language ?? "",
        description: voice.labels?.description ?? voice.labels?.use_case ?? "",
        previewUrl: voice.preview_url ?? "",
      })) ?? [],
  });
}
