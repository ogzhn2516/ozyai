import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { cookies } from "next/headers";

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  sessionToken: string;
  createdAt: string;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type UserDatabase = {
  users: User[];
};

const usersPath = join(process.cwd(), "data", "users.json");
export const userSessionCookie = "wiro_user_session";

function ensureStore() {
  const folder = dirname(usersPath);

  if (!existsSync(folder)) {
    mkdirSync(folder, { recursive: true });
  }

  if (!existsSync(usersPath)) {
    writeFileSync(usersPath, JSON.stringify({ users: [] }, null, 2), "utf8");
  }
}

function readUsers() {
  ensureStore();

  try {
    return JSON.parse(readFileSync(usersPath, "utf8")) as UserDatabase;
  } catch {
    return { users: [] };
  }
}

function writeUsers(database: UserDatabase) {
  ensureStore();
  writeFileSync(usersPath, JSON.stringify(database, null, 2), "utf8");
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function verifyPassword(password: string, salt: string, passwordHash: string) {
  const candidate = Buffer.from(hashPassword(password, salt), "hex");
  const expected = Buffer.from(passwordHash, "hex");

  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export function createUser(name: string, email: string, password: string) {
  const database = readUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (database.users.some((user) => user.email === normalizedEmail)) {
    throw new Error("Bu e-posta adresiyle kayıtlı bir kullanıcı var.");
  }

  const salt = randomBytes(16).toString("hex");
  const user: User = {
    id: randomBytes(12).toString("hex"),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password, salt),
    salt,
    sessionToken: randomBytes(32).toString("base64url"),
    createdAt: new Date().toISOString(),
  };

  database.users.push(user);
  writeUsers(database);

  return user;
}

export function authenticateUser(email: string, password: string) {
  const database = readUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = database.users.find((item) => item.email === normalizedEmail);

  if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
    throw new Error("E-posta veya şifre hatalı.");
  }

  user.sessionToken = randomBytes(32).toString("base64url");
  writeUsers(database);

  return user;
}

export function getUserBySession(sessionToken: string | undefined) {
  if (!sessionToken) return null;

  return readUsers().users.find((user) => user.sessionToken === sessionToken) ?? null;
}

export function clearUserSession(sessionToken: string | undefined) {
  if (!sessionToken) return;

  const database = readUsers();
  const user = database.users.find((item) => item.sessionToken === sessionToken);

  if (user) {
    user.sessionToken = "";
    writeUsers(database);
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(userSessionCookie)?.value;
  const user = getUserBySession(sessionToken);

  return user ? toPublicUser(user) : null;
}
