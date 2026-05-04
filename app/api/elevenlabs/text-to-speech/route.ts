import { NextResponse } from "next/server";
import { getEnvValue } from "../../../lib/env-store";

function createMockWav(text: string) {
  const sampleRate = 22050;
  const seconds = Math.min(4, Math.max(1.2, text.length / 45));
  const sampleCount = Math.floor(sampleRate * seconds);
  const dataSize = sampleCount * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let index = 0; index < sampleCount; index += 1) {
    const envelope = Math.sin((Math.PI * index) / sampleCount);
    const toneA = Math.sin((2 * Math.PI * 185 * index) / sampleRate);
    const toneB = Math.sin((2 * Math.PI * 245 * index) / sampleRate);
    const value = Math.floor((toneA * 0.65 + toneB * 0.35) * envelope * 9000);
    buffer.writeInt16LE(value, 44 + index * 2);
  }

  return buffer;
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    text?: string;
    voiceId?: string;
    modelId?: string;
    languageCode?: string;
    stability?: number;
    similarityBoost?: number;
    style?: number;
  };

  const text = body.text?.trim() ?? "";
  const voiceId = body.voiceId?.trim() ?? "";
  const modelId = body.modelId?.trim() || getEnvValue("ELEVENLABS_TTS_MODEL", "eleven_multilingual_v2");
  const languageCode = body.languageCode?.trim() || undefined;

  if (text.length < 5) {
    return NextResponse.json({ error: "Seslendirme metni en az 5 karakter olmalı." }, { status: 400 });
  }

  if (!voiceId) {
    return NextResponse.json({ error: "Lütfen bir ElevenLabs sesi seçin." }, { status: 400 });
  }

  const apiKey = getEnvValue("ELEVENLABS_API_KEY");

  if (!apiKey) {
    const wav = createMockWav(text);

    return new Response(wav, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": 'inline; filename="mock-elevenlabs-tts.wav"',
        "X-TTS-Status": "mock",
        "X-TTS-Model": modelId,
      },
    });
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
      voiceId,
    )}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        language_code: languageCode,
        voice_settings: {
          stability: body.stability ?? 0.5,
          similarity_boost: body.similarityBoost ?? 0.75,
          style: body.style ?? 0,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    return NextResponse.json(
      { error: errorText || "ElevenLabs seslendirme isteği başarısız oldu." },
      { status: response.status },
    );
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "audio/mpeg",
      "Content-Disposition": 'inline; filename="elevenlabs-tts.mp3"',
      "X-TTS-Status": "completed",
      "X-TTS-Model": modelId,
    },
  });
}
