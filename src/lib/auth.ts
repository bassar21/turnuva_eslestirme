import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import type { TournamentSlug } from "@/config/site";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/session";

export { SESSION_COOKIE, verifySessionToken, type SessionPayload };

// ---------------------------------------------------------------------------
// Şifre hash'leme (scrypt, harici bağımlılık yok) — yalnızca Node runtime
// ---------------------------------------------------------------------------

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, saltHex, hashHex] = parts;
  try {
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(password, salt, expected.length);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Çerez okuma/yazma — yalnızca Node runtime (next/headers)
// ---------------------------------------------------------------------------

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Sunucu bileşenleri / server action'lar için: token'ı doğrular VE admin
 * oturumlarında veritabanından askıya alma durumunu tekrar kontrol eder.
 * Askıya alınmış bir adminin mevcut oturumu burada geçersiz sayılır.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  if (payload.role === "admin") {
    const { rows } = await query<{ suspended: boolean }>(
      "SELECT suspended FROM admins WHERE id = $1",
      [payload.adminId]
    );
    if (rows.length === 0 || rows[0].suspended) return null;
  }

  return payload;
}

export async function requireSuperadmin(): Promise<SessionPayload & { role: "superadmin" }> {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    throw new AuthError(401, "Bu işlem için superadmin girişi gerekir.");
  }
  return session;
}

/**
 * Admin panelinde: superadmin de her şeyi görebilir, ama scope belirtilmişse
 * normal adminin scope'u eşleşmelidir.
 */
export async function requireAdminOrSuperadmin(
  scope?: TournamentSlug
): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new AuthError(401, "Giriş yapmanız gerekir.");
  }
  if (session.role === "superadmin") return session;
  if (scope && session.scope !== scope) {
    throw new AuthError(403, "Bu turnuvaya erişim yetkiniz yok.");
  }
  return session;
}

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
