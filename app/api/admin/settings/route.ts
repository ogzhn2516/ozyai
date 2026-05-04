import { NextResponse } from "next/server";
import {
  managedEnvKeys,
  maskSecret,
  readEnvFile,
  writeManagedEnv,
  type ManagedEnvKey,
} from "../../../lib/env-store";
import { isAdminSessionValid } from "../../../lib/admin-auth";

export const runtime = "nodejs";

const secretKeys = new Set<ManagedEnvKey>([
  "OPENAI_API_KEY",
  "WIRO_API_KEY",
  "WIRO_API_SECRET",
  "ELEVENLABS_API_KEY",
]);

function getSettings() {
  const env = readEnvFile();

  return managedEnvKeys.reduce(
    (settings, key) => {
      const value = env.get(key) || process.env[key] || "";

      settings[key] = {
        configured: Boolean(value),
        value: secretKeys.has(key) ? "" : value,
        masked: secretKeys.has(key) ? maskSecret(value) : value,
      };

      return settings;
    },
    {} as Record<
      ManagedEnvKey,
      {
        configured: boolean;
        value: string;
        masked: string;
      }
    >,
  );
}

export async function GET() {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ error: "Admin oturumu gerekli." }, { status: 401 });
  }

  return NextResponse.json({
    status: "completed",
    settings: getSettings(),
  });
}

export async function POST(request: Request) {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ error: "Admin oturumu gerekli." }, { status: 401 });
  }

  const body = (await request.json()) as Partial<Record<ManagedEnvKey, string>>;
  const updates: Partial<Record<ManagedEnvKey, string>> = {};

  for (const key of managedEnvKeys) {
    if (Object.hasOwn(body, key)) {
      updates[key] = String(body[key] ?? "").trim();
    }
  }

  writeManagedEnv(updates);

  return NextResponse.json({
    status: "saved",
    settings: getSettings(),
  });
}
