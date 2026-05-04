import { cookies } from "next/headers";
import { getEnvValue } from "./env-store";

export const adminSessionCookie = "wiro_admin_session";

export const fallbackAdminCredentials = {
  username: "oguzhan",
  password: "Ogzhn.Kb.2516",
  sessionSecret: "ozyai-admin-session-fallback-2026",
};

export function getAdminCredentials() {
  return {
    username: getEnvValue("ADMIN_USERNAME", fallbackAdminCredentials.username),
    password: getEnvValue("ADMIN_PASSWORD", fallbackAdminCredentials.password),
    sessionSecret: getEnvValue("ADMIN_SESSION_SECRET", fallbackAdminCredentials.sessionSecret),
  };
}

export async function isAdminSessionValid() {
  const { sessionSecret } = getAdminCredentials();
  const cookieStore = await cookies();
  const session = cookieStore.get(adminSessionCookie)?.value;

  return Boolean(sessionSecret && session && session === sessionSecret);
}
