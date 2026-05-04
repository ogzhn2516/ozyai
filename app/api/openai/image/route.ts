import { NextResponse } from "next/server";
import { getEnvValue, getRequestEnvValue } from "../../../lib/env-store";

type ImageResponse = {
  data?: Array<{
    b64_json?: string;
    revised_prompt?: string;
    url?: string;
  }>;
  usage?: unknown;
  error?: { message?: string } | string;
};

type WiroRunResponse = {
  result?: boolean;
  errors?: string[];
  taskid?: string;
  tasktoken?: string;
};

type WiroTaskResponse = {
  result?: boolean;
  errors?: string[];
  tasklist?: Array<{
    status?: string;
    pexit?: string;
    outputs?: Array<{
      url?: string;
      content?: unknown;
      contenttype?: string;
    }>;
    debugoutput?: string;
  }>;
};

const finalStatuses = new Set(["task_postprocess_end", "task_cancel"]);

function joinUrl(baseUrl: string, endpoint: string) {
  return `${baseUrl.replace(/\/+$/g, "")}/${endpoint.replace(/^\/+/g, "")}`;
}

function readText(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function getErrorMessage(payload: ImageResponse | WiroRunResponse | WiroTaskResponse, fallback: string) {
  if ("errors" in payload && payload.errors?.length) {
    return payload.errors.join(" ");
  }

  if ("error" in payload && payload.error) {
    return typeof payload.error === "string" ? payload.error : payload.error.message ?? fallback;
  }

  return fallback;
}

async function readJsonResponse<T>(response: Response, fallback: string) {
  const text = await response.text();

  if (!text) {
    throw new Error(fallback);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text.slice(0, 600) || fallback);
  }
}

function mockImage(mode: string, model: string) {
  return NextResponse.json({
    status: "mock",
    mode,
    model,
    imageUrl: "/mock-generated-avatar.svg",
    revisedPrompt: "Mock fallback: Wiro/OpenAI API key bulunmadığı için gerçek görsel üretilmedi.",
  });
}

async function parseOpenAIResponse(response: Response, outputFormat: string, model: string) {
  const payload = await readJsonResponse<ImageResponse>(response, "OpenAI boş yanıt döndürdü.");

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, "OpenAI görsel API yanıtı başarısız oldu."));
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

function findWiroImageUrl(payload: WiroTaskResponse) {
  const task = payload.tasklist?.[0];
  const output = task?.outputs?.find((item) => item.url || typeof item.content === "string");

  if (output?.url) return output.url;
  if (typeof output?.content === "string" && output.content.startsWith("http")) return output.content;
  if (task?.debugoutput?.startsWith("http")) return task.debugoutput;

  return "";
}

async function waitForWiroImage(baseUrl: string, apiKey: string, taskid: string) {
  const detailUrl = joinUrl(baseUrl, "/Task/Detail");

  for (let attempt = 0; attempt < 18; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 1000 : 5000));

    const response = await fetch(detailUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ taskid }),
      cache: "no-store",
    });
    const payload = await readJsonResponse<WiroTaskResponse>(response, "Wiro task durumu boş yanıt döndürdü.");

    if (!response.ok || payload.result === false) {
      throw new Error(getErrorMessage(payload, "Wiro task durumu alınamadı."));
    }

    const task = payload.tasklist?.[0];

    if (!task || !task.status || !finalStatuses.has(task.status)) {
      continue;
    }

    if (task.status === "task_cancel" || (task.pexit && task.pexit !== "0")) {
      throw new Error(task.debugoutput || "Wiro görsel görevi başarısız tamamlandı.");
    }

    const imageUrl = findWiroImageUrl(payload);

    if (!imageUrl) {
      throw new Error("Wiro görevi tamamlandı fakat görsel URL'si dönmedi.");
    }

    return {
      status: "completed",
      mode: "text-to-image",
      model: "wiro",
      imageUrl,
      revisedPrompt: null,
    };
  }

  throw new Error("Wiro görsel görevi başlatıldı ama sonuç zamanında hazır olmadı. Biraz sonra tekrar deneyin.");
}

async function generateWithWiro(request: Request, prompt: string, size: string, quality: string) {
  const apiKey =
    getRequestEnvValue(request, "WIRO_API_KEY") || getRequestEnvValue(request, "OPENAI_API_KEY");
  const baseUrl = getRequestEnvValue(request, "WIRO_API_BASE_URL", "https://api.wiro.ai/v1");
  const endpoint = getRequestEnvValue(request, "WIRO_IMAGE_ENDPOINT", "/Run/wiro/text-to-image-sana");

  if (!apiKey) return null;

  const [widthText = "1024", heightText = "1024"] = size.split("x");
  const response = await fetch(joinUrl(baseUrl, endpoint), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      prompt,
      negative_prompt: "blurry, low quality, distorted",
      width: Number(widthText) || 1024,
      height: Number(heightText) || 1024,
      quality,
    }),
    cache: "no-store",
  });
  const payload = await readJsonResponse<WiroRunResponse>(response, "Wiro görsel API boş yanıt döndürdü.");

  if (!response.ok || payload.result === false) {
    throw new Error(getErrorMessage(payload, "Wiro görsel üretim isteği başarısız oldu."));
  }

  const taskid = payload.taskid || payload.tasktoken;

  if (!taskid) {
    throw new Error("Wiro yanıtında task ID bulunamadı.");
  }

  return waitForWiroImage(baseUrl, apiKey, taskid);
}

export async function POST(request: Request) {
  const model = getRequestEnvValue(request, "OPENAI_IMAGE_MODEL", getEnvValue("OPENAI_IMAGE_MODEL", "gpt-image-1.5"));
  const openAiKey = getRequestEnvValue(request, "OPENAI_API_KEY");
  const formData = await request.formData();
  const mode = readText(formData.get("mode"), "text-to-image");
  const prompt = readText(formData.get("prompt")).trim();
  const size = readText(formData.get("size"), "1024x1024");
  const quality = readText(formData.get("quality"), "medium");
  const outputFormat = readText(formData.get("outputFormat"), "png");
  const image = formData.get("image");

  if (prompt.length < 12) {
    return NextResponse.json({ error: "Prompt en az 12 karakter olmalı." }, { status: 400 });
  }

  if (mode === "image-to-image" && !(image instanceof File)) {
    return NextResponse.json({ error: "Image-to-image için referans görsel yüklenmeli." }, { status: 400 });
  }

  try {
    if (!openAiKey.startsWith("sk-")) {
      if (mode === "image-to-image") {
        return NextResponse.json(
          { error: "Wiro text-to-image aktif. Image-to-image için Wiro image-to-image endpoint'i ayrıca tanımlanmalı." },
          { status: 400 },
        );
      }

      const wiroResult = await generateWithWiro(request, prompt, size, quality);

      if (wiroResult) {
        return NextResponse.json(wiroResult);
      }

      await new Promise((resolve) => setTimeout(resolve, 700));
      return mockImage(mode, "wiro/mock");
    }

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
          Authorization: `Bearer ${openAiKey}`,
        },
        body,
      });

      return NextResponse.json(await parseOpenAIResponse(response, outputFormat, model));
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
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
