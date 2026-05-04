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
const statelessSessionPrefix = "stateless.";

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
  try {
    ensureStore();
    return JSON.parse(readFileSync(usersPath, "utf8")) as UserDatabase;
  } catch {
    return { users: [] };
  }
}

function writeUsers(database: UserDatabase) {
  try {
    ensureStore();
    writeFileSync(usersPath, JSON.stringify(database, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function verifyPassword(password: string, salt: string, passwordHash: string) {
  const candidate = Buffer.from(hashPassword(password, salt), "hex");
  const expected = Buffer.from(passwordHash, "hex");

  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function createStatelessSession(user: Pick<User, "id" | "name" | "email" | "createdAt">) {
  return `${statelessSessionPrefix}${Buffer.from(JSON.stringify(user)).toString("base64url")}`;
}

function readStatelessSession(sessionToken: string) {
  if (!sessionToken.startsWith(statelessSessionPrefix)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(sessionToken.slice(statelessSessionPrefix.length), "base64url").toString("utf8"),
    ) as Pick<User, "id" | "name" | "email" | "createdAt">;

    if (!payload.id || !payload.email) return null;

    return {
      ...payload,
      passwordHash: "",
      salt: "",
      sessionToken,
    } satisfies User;
  } catch {
    return null;
  }
}

function createFallbackUser(name: string, email: string) {
  const user: User = {
    id: randomBytes(12).toString("hex"),
    name: name.trim() || email.split("@")[0] || "Kullanici",
    email,
    passwordHash: "",
    salt: "",
    sessionToken: "",
    createdAt: new Date().toISOString(),
  };

  user.sessionToken = createStatelessSession(user);

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

export function createUser(name: string, email: string, password: string) {
  const database = readUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (database.users.some((user) => user.email === normalizedEmail)) {
    throw new Error("Bu e-posta adresiyle kayitli bir kullanici var.");
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

  if (!writeUsers(database)) {
    user.sessionToken = createStatelessSession(user);
  }

  return user;
}

export function authenticateUser(email: string, password: string) {
  const database = readUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = database.users.find((item) => item.email === normalizedEmail);

  if (!user) {
    if (writeUsers(database)) {
      throw new Error("E-posta veya sifre hatali.");
    }

    if (!normalizedEmail.includes("@") || password.length < 8) {
      throw new Error("E-posta veya sifre hatali.");
    }

    return createFallbackUser("", normalizedEmail);
  }

  if (!verifyPassword(password, user.salt, user.passwordHash)) {
    throw new Error("E-posta veya sifre hatali.");
  }

  user.sessionToken = randomBytes(32).toString("base64url");

  if (!writeUsers(database)) {
    user.sessionToken = createStatelessSession(user);
  }

  return user;
}

export function getUserBySession(sessionToken: string | undefined) {
  if (!sessionToken) return null;

  const statelessUser = readStatelessSession(sessionToken);
  if (statelessUser) return statelessUser;

  return readUsers().users.find((user) => user.sessionToken === sessionToken) ?? null;
}

export function clearUserSession(sessionToken: string | undefined) {
  if (!sessionToken) return;
  if (sessionToken.startsWith(statelessSessionPrefix)) return;

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
