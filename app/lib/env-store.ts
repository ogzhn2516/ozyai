import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const envPath = join(process.cwd(), ".env.local");
export const runtimeSettingsCookie = "ozyai_service_settings";

export const managedEnvKeys = [
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD",
  "ADMIN_SESSION_SECRET",
  "OPENAI_API_KEY",
  "OPENAI_IMAGE_MODEL",
  "WIRO_API_KEY",
  "WIRO_API_SECRET",
  "WIRO_API_BASE_URL",
  "WIRO_AVATAR_VIDEO_ENDPOINT",
  "ELEVENLABS_API_KEY",
  "ELEVENLABS_TTS_MODEL",
] as const;

export type ManagedEnvKey = (typeof managedEnvKeys)[number];
export type ManagedEnvValues = Partial<Record<ManagedEnvKey, string>>;

function unquote(value: string) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function quote(value: string) {
  if (!value) return "";

  return JSON.stringify(value);
}

export function readEnvFile() {
  const values = new Map<string, string>();

  try {
    if (!existsSync(envPath)) {
      return values;
    }

    const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }

      const key = trimmed.slice(0, trimmed.indexOf("=")).trim();
      const value = trimmed.slice(trimmed.indexOf("=") + 1);
      values.set(key, unquote(value));
    }
  } catch {
    return values;
  }

  return values;
}

export function encodeRuntimeSettings(values: ManagedEnvValues) {
  const safeValues = managedEnvKeys.reduce((settings, key) => {
    const value = values[key]?.trim();

    if (value) {
      settings[key] = value;
    }

    return settings;
  }, {} as ManagedEnvValues);

  return Buffer.from(JSON.stringify(safeValues), "utf8").toString("base64url");
}

export function decodeRuntimeSettings(value: string | undefined) {
  if (!value) return {};

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as ManagedEnvValues;

    return managedEnvKeys.reduce((settings, key) => {
      const setting = parsed[key]?.trim();

      if (setting) {
        settings[key] = setting;
      }

      return settings;
    }, {} as ManagedEnvValues);
  } catch {
    return {};
  }
}

export function getRuntimeSettingsFromRequest(request: Request) {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${runtimeSettingsCookie}=`))
    ?.slice(runtimeSettingsCookie.length + 1);

  return decodeRuntimeSettings(cookie ? decodeURIComponent(cookie) : undefined);
}

export function getEnvValue(key: ManagedEnvKey, fallback = "") {
  return readEnvFile().get(key) || process.env[key] || fallback;
}

export function getRequestEnvValue(request: Request, key: ManagedEnvKey, fallback = "") {
  return getRuntimeSettingsFromRequest(request)[key] || getEnvValue(key, fallback);
}

export function maskSecret(value: string) {
  if (!value) return "";
  if (value.length <= 8) return "••••";

  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
}

export function writeManagedEnv(updates: Partial<Record<ManagedEnvKey, string>>) {
  try {
    const existingLines = existsSync(envPath) ? readFileSync(envPath, "utf8").split(/\r?\n/) : [];
    const updateKeys = new Set(Object.keys(updates));
    const writtenKeys = new Set<string>();
    const nextLines: string[] = [];

    for (const line of existingLines) {
      const trimmed = line.trim();
      const key = trimmed.includes("=") ? trimmed.slice(0, trimmed.indexOf("=")).trim() : "";

      if (updateKeys.has(key)) {
        const value = updates[key as ManagedEnvKey] ?? "";
        nextLines.push(`${key}=${quote(value)}`);
        writtenKeys.add(key);
      } else if (line || nextLines.length > 0) {
        nextLines.push(line);
      }
    }

    const missingKeys = managedEnvKeys.filter((key) => updateKeys.has(key) && !writtenKeys.has(key));

    if (missingKeys.length > 0 && nextLines.length > 0 && nextLines[nextLines.length - 1] !== "") {
      nextLines.push("");
    }

    for (const key of missingKeys) {
      nextLines.push(`${key}=${quote(updates[key] ?? "")}`);
    }

    writeFileSync(envPath, `${nextLines.join("\n").replace(/\n+$/g, "")}\n`, "utf8");
    return true;
  } catch {
    return false;
  }
}
