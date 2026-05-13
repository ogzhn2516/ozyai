import { cookies } from "next/headers";
import { sessionCookieName, verifySessionValue } from "./auth";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  return verifySessionValue(cookieStore.get(sessionCookieName)?.value);
}
