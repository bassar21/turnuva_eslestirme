"use server";

import { isTournamentSlug } from "@/config/site";
import { getTournamentBySlug } from "@/lib/queries/tournaments";
import { getActiveOptionsByKind } from "@/lib/queries/options";
import { createParticipant, DuplicateParticipantError } from "@/lib/queries/participants";

export type RegisterState = { error?: string; success?: boolean };

export async function registerParticipant(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const slug = String(formData.get("tournament") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const sinif = String(formData.get("sinif") ?? "");
  const bolum = String(formData.get("bolum") ?? "");
  const sube = String(formData.get("sube") ?? "");

  if (!isTournamentSlug(slug)) {
    return { error: "Geçersiz turnuva." };
  }
  if (!fullName) {
    return { error: "İsim boş olamaz." };
  }
  if (fullName.length > 100) {
    return { error: "İsim çok uzun." };
  }
  if (!sinif || !bolum || !sube) {
    return { error: "Sınıf, bölüm ve şube seçmelisiniz." };
  }

  const tournament = await getTournamentBySlug(slug);
  if (!tournament) {
    return { error: "Turnuva bulunamadı." };
  }
  if (!tournament.registration_open) {
    return { error: "Kayıtlar şu anda kapalı." };
  }

  const activeOptions = await getActiveOptionsByKind();
  if (
    !activeOptions.sinif.includes(sinif) ||
    !activeOptions.bolum.includes(bolum) ||
    !activeOptions.sube.includes(sube)
  ) {
    return { error: "Seçilen sınıf/bölüm/şube geçerli değil. Sayfayı yenileyip tekrar deneyin." };
  }

  try {
    await createParticipant(tournament.id, fullName, sinif, bolum, sube);
  } catch (err) {
    if (err instanceof DuplicateParticipantError) {
      return { error: err.message };
    }
    throw err;
  }

  return { success: true };
}
