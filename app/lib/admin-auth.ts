import { cookies } from "next/headers";
import { getEnvValue } from "./env-store";

export const adminSessionCookie = "wiro_admin_session";

export function getAdminCredentials() {
  return {
    username: getEnvValue("ADMIN_USERNAME"),
    password: getEnvValue("ADMIN_PASSWORD"),
    sessionSecret: getEnvValue("ADMIN_SESSION_SECRET"),
  };
}

export async function isAdminSessionValid() {
  const { sessionSecret } = getAdminCredentials();
  const cookieStore = await cookies();
  const session = cookieStore.get(adminSessionCookie)?.value;

  return Boolean(sessionSecret && session && session === sessionSecret);
}
