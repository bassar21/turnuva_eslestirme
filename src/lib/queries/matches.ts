import { query } from "@/lib/db";
import type { TournamentSlug } from "@/config/site";
import type { MatchRow } from "@/lib/queries/rounds";

export type MatchWithContext = MatchRow & {
  round_no: number;
  tournament_id: number;
  tournament_slug: TournamentSlug;
};

export async function getMatchWithContext(id: number) {
  const { rows } = await query<MatchWithContext>(
    `SELECT m.*, r.round_no, t.id AS tournament_id, t.slug AS tournament_slug
     FROM matches m
     JOIN rounds r ON r.id = m.round_id
     JOIN tournaments t ON t.id = r.tournament_id
     WHERE m.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function listMatchesForTournament(tournamentId: number) {
  const { rows } = await query<MatchWithContext>(
    `SELECT m.*, r.round_no, t.id AS tournament_id, t.slug AS tournament_slug
     FROM matches m
     JOIN rounds r ON r.id = m.round_id
     JOIN tournaments t ON t.id = r.tournament_id
     WHERE t.id = $1
     ORDER BY r.round_no, m.match_no`,
    [tournamentId]
  );
  return rows;
}

export class InvalidResultError extends Error {}

export async function submitMatchResult(
  matchId: number,
  setsPlayed: number,
  p1Sets: number,
  p2Sets: number,
  updatedBy: string
) {
  const match = await getMatchWithContext(matchId);
  if (!match) {
    throw new InvalidResultError("Maç bulunamadı.");
  }
  if (match.status === "bye") {
    throw new InvalidResultError("Bay geçen bir maça sonuç girilemez.");
  }
  if (!match.p2_name) {
    throw new InvalidResultError("Bu maçın ikinci oyuncusu yok.");
  }
  if (!Number.isInteger(setsPlayed) || setsPlayed <= 0) {
    throw new InvalidResultError("Oynanan set sayısı geçerli değil.");
  }
  if (!Number.isInteger(p1Sets) || !Number.isInteger(p2Sets) || p1Sets < 0 || p2Sets < 0) {
    throw new InvalidResultError("Set skorları geçerli değil.");
  }
  if (p1Sets + p2Sets !== setsPlayed) {
    throw new InvalidResultError(
      `Set skorlarının toplamı (${p1Sets}+${p2Sets}) oynanan set sayısına (${setsPlayed}) eşit değil.`
    );
  }
  if (p1Sets === p2Sets) {
    throw new InvalidResultError("Berabere sonuç girilemez, bir kazanan olmalı.");
  }

  const winnerName = p1Sets > p2Sets ? match.p1_name : match.p2_name;

  const { rows } = await query<MatchRow>(
    `UPDATE matches
     SET sets_played = $2, p1_sets = $3, p2_sets = $4, winner_name = $5,
         status = 'done', updated_by = $6, updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [matchId, setsPlayed, p1Sets, p2Sets, winnerName, updatedBy]
  );
  return rows[0];
}
