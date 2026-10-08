"use server";

import { revalidatePath } from "next/cache";
import { requireSuperadmin, hashPassword, AuthError } from "@/lib/auth";
import { isTournamentSlug, type TournamentSlug } from "@/config/site";
import { setRegistrationOpen, getTournamentBySlug } from "@/lib/queries/tournaments";
import {
  createOption,
  deleteOption,
  setOptionActive,
  type OptionKind,
} from "@/lib/queries/options";
import { deleteParticipant } from "@/lib/queries/participants";
import {
  createAdmin,
  setAdminSuspended,
  resetAdminPassword,
  DuplicateAdminError,
} from "@/lib/queries/admins";
import {
  createRoundWithMatches,
  setRoundPublished,
  deleteRound,
  getNextRoundNo,
  DuplicateRoundError,
} from "@/lib/queries/rounds";
import { parsePairings, PairingsParseError, type ParsedMatch } from "@/lib/pairings";

export type ActionState = { error?: string; success?: string };
function ok(message = "Kaydedildi."): ActionState {
  return { success: message };
}

async function guard(): Promise<ActionState | null> {
  try {
    await requireSuperadmin();
    return null;
  } catch (err) {
    if (err instanceof AuthError) return { error: err.message };
    throw err;
  }
}

function revalidateAll() {
  revalidatePath("/superadmin");
  revalidatePath("/admin");
  revalidatePath("/satranc");
  revalidatePath("/mangala");
}

// --- Kayıt aç/kapa -----------------------------------------------------

export async function toggleRegistrationAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const denied = await guard();
  if (denied) return denied;

  const slug = String(formData.get("tournament") ?? "");
  const open = formData.get("open") === "true";
  if (!isTournamentSlug(slug)) return { error: "Geçersiz turnuva." };

  await setRegistrationOpen(slug, open);
  revalidateAll();
  return { success: open ? "Kayıt açıldı." : "Kayıt kapatıldı." };
}

/** useActionState gerektirmeyen basit form'lardan .bind ile çağrılır. */
export async function toggleRegistration(tournament: TournamentSlug, open: boolean) {
  const denied = await guard();
  if (denied) throw new Error(denied.error);
  await setRegistrationOpen(tournament, open);
  revalidateAll();
}

// --- Eşleştirme içe aktarma ---------------------------------------------

export async function importPairingsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const denied = await guard();
  if (denied) return denied;

  const slug = String(formData.get("tournament") ?? "");
  const text = String(formData.get("pairingsText") ?? "");
  const titleOverride = String(formData.get("title") ?? "").trim();

  if (!isTournamentSlug(slug)) return { error: "Geçersiz turnuva." };

  const tournament = await getTournamentBySlug(slug);
  if (!tournament) return { error: "Turnuva bulunamadı." };

  let parsed;
  try {
    parsed = parsePairings(text);
  } catch (err) {
    if (err instanceof PairingsParseError) {
      return { error: err.message };
    }
    throw err;
  }

  const roundNo = parsed.roundHint ?? (await getNextRoundNo(tournament.id));
  const title = titleOverride || `Tur ${roundNo}`;

  try {
    await createRoundWithMatches(tournament.id, roundNo, title, parsed.matches);
  } catch (err) {
    if (err instanceof DuplicateRoundError) {
      return { error: err.message };
    }
    throw err;
  }

  const byeCount = parsed.matches.filter((m) => m.p2 === null).length;
  revalidateAll();
  return {
    success: `Tur ${roundNo} oluşturuldu: ${parsed.matches.length} maç (${byeCount} bay). Yayınlamayı unutmayın.`,
  };
}

/**
 * Site içi çekiliş aracının sonucunu kaydeder. Eşleştirmeler tarayıcıda
 * (katılımcılar huzurunda) çekilmiş haliyle gelir — metin ayrıştırma
 * yok, doğrudan createRoundWithMatches'e geçilir.
 */
export async function saveDrawAction(
  tournament: TournamentSlug,
  roundNo: number,
  title: string,
  matches: ParsedMatch[]
): Promise<ActionState> {
  const denied = await guard();
  if (denied) return denied;

  if (!isTournamentSlug(tournament)) return { error: "Geçersiz turnuva." };
  const t = await getTournamentBySlug(tournament);
  if (!t) return { error: "Turnuva bulunamadı." };

  if (!Number.isInteger(roundNo) || roundNo < 1) return { error: "Geçersiz tur numarası." };
  if (!Array.isArray(matches) || matches.length === 0) {
    return { error: "Eşleştirme listesi boş." };
  }
  for (const m of matches) {
    if (!m || typeof m.p1 !== "string" || !m.p1.trim()) {
      return { error: "Geçersiz eşleştirme verisi." };
    }
    if (m.p2 !== null && typeof m.p2 !== "string") {
      return { error: "Geçersiz eşleştirme verisi." };
    }
  }

  try {
    await createRoundWithMatches(t.id, roundNo, title.trim() || `Tur ${roundNo}`, matches);
  } catch (err) {
    if (err instanceof DuplicateRoundError) return { error: err.message };
    throw err;
  }

  revalidateAll();
  return { success: `Tur ${roundNo} oluşturuldu ve kaydedildi.` };
}

export async function publishRoundAction(roundId: number, published: boolean) {
  const denied = await guard();
  if (denied) throw new Error(denied.error);
  await setRoundPublished(roundId, published);
  revalidateAll();
}

export async function deleteRoundAction(roundId: number) {
  const denied = await guard();
  if (denied) throw new Error(denied.error);
  await deleteRound(roundId);
  revalidateAll();
}

// --- Katılımcılar --------------------------------------------------------

export async function deleteParticipantAction(participantId: number) {
  const denied = await guard();
  if (denied) throw new Error(denied.error);
  await deleteParticipant(participantId);
  revalidateAll();
}

// --- Adminler --------------------------------------------------------------

export async function createAdminAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const denied = await guard();
  if (denied) return denied;

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const scope = String(formData.get("scope") ?? "");

  if (!username || username.length < 3) return { error: "Kullanıcı adı en az 3 karakter olmalı." };
  if (!password || password.length < 6) return { error: "Şifre en az 6 karakter olmalı." };
  if (!isTournamentSlug(scope)) return { error: "Geçersiz turnuva." };

  try {
    await createAdmin(username, hashPassword(password), scope as TournamentSlug);
  } catch (err) {
    if (err instanceof DuplicateAdminError) return { error: err.message };
    throw err;
  }

  revalidatePath("/superadmin");
  return { success: `${username} (${scope}) hesabı oluşturuldu.` };
}

export async function setAdminSuspendedAction(adminId: number, suspended: boolean) {
  const denied = await guard();
  if (denied) throw new Error(denied.error);
  await setAdminSuspended(adminId, suspended);
  revalidatePath("/superadmin");
}

export async function resetAdminPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const denied = await guard();
  if (denied) return denied;

  const adminId = Number(formData.get("adminId"));
  const password = String(formData.get("password") ?? "");
  if (!Number.isInteger(adminId)) return { error: "Geçersiz hesap." };
  if (!password || password.length < 6) return { error: "Şifre en az 6 karakter olmalı." };

  await resetAdminPassword(adminId, hashPassword(password));
  revalidatePath("/superadmin");
  return ok();
}

// --- Sınıf / bölüm / şube listeleri ---------------------------------------

export async function createOptionAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const denied = await guard();
  if (denied) return denied;

  const kind = String(formData.get("kind") ?? "") as OptionKind;
  const value = String(formData.get("value") ?? "").trim();
  if (!["sinif", "bolum", "sube"].includes(kind)) return { error: "Geçersiz liste." };
  if (!value) return { error: "Değer boş olamaz." };

  await createOption(kind, value);
  revalidateAll();
  return ok();
}

export async function deleteOptionAction(optionId: number) {
  const denied = await guard();
  if (denied) throw new Error(denied.error);
  await deleteOption(optionId);
  revalidateAll();
}

export async function setOptionActiveAction(optionId: number, active: boolean) {
  const denied = await guard();
  if (denied) throw new Error(denied.error);
  await setOptionActive(optionId, active);
  revalidateAll();
}
