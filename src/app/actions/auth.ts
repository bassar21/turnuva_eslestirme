"use server";

import { redirect } from "next/navigation";
import { verifyPassword, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { getAdminByUsername } from "@/lib/queries/admins";

export type LoginState = { error?: string };

const RATE_LIMIT_DELAY_MS = 300; // Kaba kuvvet denemelerini biraz yavaşlatır.

export async function loginSuperadmin(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const expectedUsername = process.env.SUPERADMIN_USERNAME;
  const expectedHash = process.env.SUPERADMIN_PASSWORD_HASH;

  await sleep(RATE_LIMIT_DELAY_MS);

  if (!expectedUsername || !expectedHash) {
    return { error: "Superadmin hesabı sunucuda yapılandırılmamış." };
  }
  if (username !== expectedUsername || !verifyPassword(password, expectedHash)) {
    return { error: "Kullanıcı adı veya şifre hatalı." };
  }

  await setSessionCookie({ role: "superadmin", username });
  redirect("/superadmin");
}

export async function loginAdmin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  await sleep(RATE_LIMIT_DELAY_MS);

  const admin = await getAdminByUsername(username);
  if (!admin || admin.suspended || !verifyPassword(password, admin.password_hash)) {
    return { error: "Kullanıcı adı veya şifre hatalı ya da hesap askıya alınmış." };
  }

  await setSessionCookie({
    role: "admin",
    adminId: admin.id,
    username: admin.username,
    scope: admin.scope,
  });
  redirect("/admin");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
