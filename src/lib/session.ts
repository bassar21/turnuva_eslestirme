// Edge Runtime uyumlu oturum doğrulama. Yalnızca `jose` kullanır — node:crypto
// veya next/headers YOK, böylece middleware.ts (Edge) bu dosyayı sorunsuz
// içe aktarabilir. Şifre hash'leme ve çerez okuma/yazma src/lib/auth.ts'de
// (Node runtime) yapılır.

import { SignJWT, jwtVerify } from "jose";
import type { TournamentSlug } from "@/config/site";

export const SESSION_COOKIE = "turnuva_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 saat

export type SessionPayload =
  | { role: "superadmin"; username: string }
  | { role: "admin"; adminId: number; username: string; scope: TournamentSlug };

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET tanımlı değil veya çok kısa. .env dosyanızı kontrol edin."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

/** Yalnızca imza/süre doğrular; DB'ye gitmez. Edge middleware'de kullanılabilir. */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.role === "superadmin" && typeof payload.username === "string") {
      return { role: "superadmin", username: payload.username };
    }
    if (
      payload.role === "admin" &&
      typeof payload.adminId === "number" &&
      typeof payload.username === "string" &&
      (payload.scope === "satranc" || payload.scope === "mangala")
    ) {
      return {
        role: "admin",
        adminId: payload.adminId,
        username: payload.username,
        scope: payload.scope,
      };
    }
    return null;
  } catch {
    return null;
  }
}
