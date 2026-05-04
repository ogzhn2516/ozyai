import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export type User = {
  id: string;
  name: string;
  email: string;
  sessionToken: string;
  createdAt: string;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export const userSessionCookie = "wiro_user_session";
const sessionPrefix = "user.";

function createSessionToken(user: Omit<User, "sessionToken">) {
  return `${sessionPrefix}${Buffer.from(JSON.stringify(user)).toString("base64url")}`;
}

function readSessionToken(sessionToken: string | undefined) {
  if (!sessionToken?.startsWith(sessionPrefix)) return null;

  try {
    const user = JSON.parse(
      Buffer.from(sessionToken.slice(sessionPrefix.length), "base64url").toString("utf8"),
    ) as Omit<User, "sessionToken">;

    if (!user.id || !user.email) return null;

    return {
      ...user,
      sessionToken,
    } satisfies User;
  } catch {
    return null;
  }
}

function createUserSession(name: string, email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user: User = {
    id: randomBytes(12).toString("hex"),
    name: name.trim() || normalizedEmail.split("@")[0] || "Kullanici",
    email: normalizedEmail,
    sessionToken: "",
    createdAt: new Date().toISOString(),
  };

  user.sessionToken = createSessionToken({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  });

  return user;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export function createUser(name: string, email: string) {
  return createUserSession(name, email);
}

export function authenticateUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail.includes("@") || password.length < 8) {
    throw new Error("E-posta veya sifre hatali.");
  }

  return createUserSession("", normalizedEmail);
}

export function getUserBySession(sessionToken: string | undefined) {
  return readSessionToken(sessionToken);
}

export function clearUserSession() {
  return;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(userSessionCookie)?.value;
  const user = getUserBySession(sessionToken);

  return user ? toPublicUser(user) : null;
}
