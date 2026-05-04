import { NextResponse } from "next/server";
import { getEnvValue, getRequestEnvValue } from "../../../lib/env-store";

type OpenAIImageResponse = {
  data?: Array<{
    b64_json?: string;
    revised_prompt?: string;
    url?: string;
  }>;
  usage?: unknown;
};

function mockImage(mode: string, model: string) {
  return NextResponse.json({
    status: "mock",
    mode,
    model,
    imageUrl: "/mock-generated-avatar.svg",
    revisedPrompt: "Mock fallback: OPENAI_API_KEY bulunmadığı için gerçek görsel üretilmedi.",
  });
}

function readText(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

async function parseOpenAIResponse(response: Response, outputFormat: string, model: string) {
  const payload = (await response.json()) as OpenAIImageResponse & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "OpenAI görsel API yanıtı başarısız oldu.");
  }

  const image = payload.data?.[0];

  if (!image?.b64_json && !image?.url) {
    throw new Error("OpenAI yanıtında görsel verisi bulunamadı.");
  }

  return {
    status: "completed",
    model,
    imageUrl: image.b64_json ? `data:image/${outputFormat};base64,${image.b64_json}` : image.url,
    revisedPrompt: image.revised_prompt ?? null,
    usage: payload.usage ?? null,
  };
}

export async function POST(request: Request) {
  const model = getRequestEnvValue(request, "OPENAI_IMAGE_MODEL", getEnvValue("OPENAI_IMAGE_MODEL", "gpt-image-1.5"));
  const apiKey = getRequestEnvValue(request, "OPENAI_API_KEY");
  const formData = await request.formData();
  const mode = readText(formData.get("mode"), "text-to-image");
  const prompt = readText(formData.get("prompt")).trim();
  const size = readText(formData.get("size"), "1024x1024");
  const quality = readText(formData.get("quality"), "medium");
  const outputFormat = readText(formData.get("outputFormat"), "png");
  const image = formData.get("image");

  if (prompt.length < 12) {
    return NextResponse.json(
      { error: "Prompt en az 12 karakter olmalı." },
      { status: 400 },
    );
  }

  if (mode === "image-to-image" && !(image instanceof File)) {
    return NextResponse.json(
      { error: "Image-to-image için referans görsel yüklenmeli." },
      { status: 400 },
    );
  }

  if (!apiKey) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return mockImage(mode, model);
  }

  try {
    if (mode === "image-to-image") {
      const body = new FormData();
      body.append("model", model);
      body.append("prompt", prompt);
      body.append("size", size);
      body.append("quality", quality);
      body.append("output_format", outputFormat);
      body.append("image", image as File);

      const response = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body,
      });

      return NextResponse.json(await parseOpenAIResponse(response, outputFormat, model));
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        size,
        quality,
        output_format: outputFormat,
      }),
    });

    return NextResponse.json(await parseOpenAIResponse(response, outputFormat, model));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Görsel üretim hatası oluştu." },
      { status: 500 },
    );
  }
}
