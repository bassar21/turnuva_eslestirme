"use server";

import { revalidatePath } from "next/cache";
import { getSession, AuthError } from "@/lib/auth";
import { getMatchWithContext, submitMatchResult, InvalidResultError } from "@/lib/queries/matches";

export type MatchResultState = { error?: string; success?: boolean };

export async function submitMatchResultAction(
  _prev: MatchResultState,
  formData: FormData
): Promise<MatchResultState> {
  const session = await getSession();
  if (!session) {
    return { error: "Giriş yapmanız gerekir." };
  }

  const matchId = Number(formData.get("matchId"));
  const setsPlayed = Number(formData.get("setsPlayed"));
  const p1Sets = Number(formData.get("p1Sets"));
  const p2Sets = Number(formData.get("p2Sets"));

  if (!Number.isInteger(matchId)) {
    return { error: "Geçersiz maç." };
  }

  const match = await getMatchWithContext(matchId);
  if (!match) {
    return { error: "Maç bulunamadı." };
  }

  // Sunucu tarafı yetki kontrolü: admin yalnızca kendi turnuvasının maçına
  // sonuç girebilir; bu kontrol istemciden gelen hiçbir veriye güvenmez.
  if (session.role === "admin" && session.scope !== match.tournament_slug) {
    return { error: "Bu turnuvaya erişim yetkiniz yok." };
  }

  try {
    await submitMatchResult(
      matchId,
      setsPlayed,
      p1Sets,
      p2Sets,
      session.username
    );
  } catch (err) {
    if (err instanceof InvalidResultError) {
      return { error: err.message };
    }
    if (err instanceof AuthError) {
      return { error: err.message };
    }
    throw err;
  }

  revalidatePath("/admin");
  revalidatePath("/superadmin");
  revalidatePath(`/${match.tournament_slug}`);
  return { success: true };
}
