import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { getEnvValue } from "../../../lib/env-store";

export const runtime = "nodejs";

type WiroRunResponse = {
  result?: boolean;
  errors?: string[];
  taskid?: string;
  tasktoken?: string;
  socketaccesstoken?: string;
};

type WiroTask = {
  status?: string;
  pexit?: string;
  outputs?: Array<{
    name?: string;
    contenttype?: string;
    url?: string;
    content?: unknown;
  }>;
  debugoutput?: string;
  totalcost?: string;
};

type WiroTaskResponse = {
  result?: boolean;
  errors?: string[];
  tasklist?: WiroTask[];
};

const finalStatuses = new Set(["task_postprocess_end", "task_cancel"]);

function joinUrl(baseUrl: string, endpoint: string) {
  return `${baseUrl.replace(/\/+$/g, "")}/${endpoint.replace(/^\/+/g, "")}`;
}

function getWiroHeaders() {
  const apiKey = getEnvValue("WIRO_API_KEY");
  const apiSecret = getEnvValue("WIRO_API_SECRET");
  const headers: Record<string, string> = {
    "x-api-key": apiKey,
  };

  if (apiKey && apiSecret) {
    const nonce = Math.floor(Date.now() / 1000).toString();
    headers["x-nonce"] = nonce;
    headers["x-signature"] = createHmac("sha256", apiKey).update(`${apiSecret}${nonce}`).digest("hex");
  }

  return headers;
}

function getWiroError(payload: { errors?: string[] }, fallback: string) {
  return payload.errors?.filter(Boolean).join(" ") || fallback;
}

function dataUrlToFile(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;,]+)?(;base64)?,(.*)$/);

  if (!match) return null;

  const mimeType = match[1] || "image/png";
  const isBase64 = Boolean(match[2]);
  const raw = isBase64 ? Buffer.from(match[3], "base64") : Buffer.from(decodeURIComponent(match[3]));
  const extension = mimeType.split("/")[1] || "png";

  return new File([raw], `generated-avatar.${extension}`, { type: mimeType });
}

function mockResponse() {
  return NextResponse.json({
    status: "mock",
    videoUrl: "/demo-avatar-video.mp4",
    message: "WIRO_API_KEY bulunmadığı için demo video döndü.",
  });
}

async function waitForTask(baseUrl: string, taskid: string) {
  const detailUrl = joinUrl(baseUrl, "/Task/Detail");
  const headers = getWiroHeaders();

  for (let attempt = 0; attempt < 18; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 1000 : 5000));

    const response = await fetch(detailUrl, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ taskid }),
      cache: "no-store",
    });
    const payload = (await response.json()) as WiroTaskResponse;

    if (!response.ok || payload.result === false) {
      throw new Error(getWiroError(payload, "Wiro task durumu alınamadı."));
    }

    const task = payload.tasklist?.[0];

    if (!task || !task.status || !finalStatuses.has(task.status)) {
      continue;
    }

    if (task.status === "task_cancel") {
      throw new Error("Wiro görevi iptal edildi.");
    }

    const output = task.outputs?.find((item) => item.url);

    if (task.pexit && task.pexit !== "0") {
      throw new Error(task.debugoutput || "Wiro görevi başarısız tamamlandı.");
    }

    if (!output?.url) {
      throw new Error("Wiro görevi tamamlandı fakat video URL'si dönmedi.");
    }

    return {
      status: "completed",
      videoUrl: output.url,
      taskid,
      contentType: output.contenttype ?? null,
      totalCost: task.totalcost ?? null,
    };
  }

  return {
    status: "processing",
    taskid,
    videoUrl: "",
    message: "Wiro görevi başlatıldı; sonuç henüz hazır değil.",
  };
}

export async function POST(request: Request) {
  const apiKey = getEnvValue("WIRO_API_KEY");

  if (!apiKey) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return mockResponse();
  }

  const formData = await request.formData();
  const portrait = formData.get("portrait");
  const portraitUrl = String(formData.get("portraitUrl") ?? "").trim();
  const script = String(formData.get("script") ?? "").trim();
  const voice = String(formData.get("voice") ?? "").trim();
  const audioName = String(formData.get("audioName") ?? "").trim();
  const language = String(formData.get("language") ?? "").trim();
  const quality = String(formData.get("quality") ?? "").trim();

  if (!(portrait instanceof File) && !portraitUrl) {
    return NextResponse.json({ error: "Wiro için portre görseli gerekli." }, { status: 400 });
  }

  if (script.length < 20) {
    return NextResponse.json({ error: "Konuşma metni en az 20 karakter olmalı." }, { status: 400 });
  }

  const baseUrl = getEnvValue("WIRO_API_BASE_URL", "https://api.wiro.ai/v1");
  const endpoint = getEnvValue("WIRO_AVATAR_VIDEO_ENDPOINT", "/Run/wiro/avatarmotion");
  const runBody = new FormData();
  const headers = getWiroHeaders();

  if (portrait instanceof File) {
    runBody.append("inputImage", portrait);
    runBody.append("inputImageUrl", "");
  } else if (portraitUrl.startsWith("data:")) {
    const generatedFile = dataUrlToFile(portraitUrl);

    if (!generatedFile) {
      return NextResponse.json({ error: "Üretilmiş görsel verisi okunamadı." }, { status: 400 });
    }

    runBody.append("inputImage", generatedFile);
    runBody.append("inputImageUrl", "");
  } else {
    runBody.append("inputImage", "");
    runBody.append("inputImageUrl", portraitUrl);
  }

  runBody.append("prompt", script);
  runBody.append("script", script);
  runBody.append("text", script);
  runBody.append("voice", voice);
  runBody.append("audioName", audioName);
  runBody.append("language", language);
  runBody.append("quality", quality);

  try {
    const response = await fetch(joinUrl(baseUrl, endpoint), {
      method: "POST",
      headers,
      body: runBody,
      cache: "no-store",
    });
    const payload = (await response.json()) as WiroRunResponse;

    if (!response.ok || payload.result === false) {
      throw new Error(getWiroError(payload, "Wiro avatar video isteği başarısız oldu."));
    }

    const taskid = payload.taskid || payload.tasktoken;

    if (!taskid) {
      throw new Error("Wiro yanıtında task ID bulunamadı.");
    }

    return NextResponse.json(await waitForTask(baseUrl, taskid));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Wiro avatar video hatası oluştu." },
      { status: 500 },
    );
  }
}
