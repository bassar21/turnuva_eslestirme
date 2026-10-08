import { withTransaction, query } from "@/lib/db";
import type { ParsedMatch, WinnerEntry } from "@/lib/pairings";
import { findParticipantByName } from "@/lib/queries/participants";

export type RoundRow = {
  id: number;
  tournament_id: number;
  round_no: number;
  title: string;
  published: boolean;
  created_at: string;
};

export type MatchRow = {
  id: number;
  round_id: number;
  match_no: number;
  p1_name: string;
  p2_name: string | null;
  p1_participant_id: number | null;
  p2_participant_id: number | null;
  sets_played: number | null;
  p1_sets: number | null;
  p2_sets: number | null;
  winner_name: string | null;
  status: "pending" | "done" | "bye";
  updated_by: string | null;
  updated_at: string | null;
  p1_sinif: string | null;
  p1_bolum: string | null;
  p1_sube: string | null;
  p2_sinif: string | null;
  p2_bolum: string | null;
  p2_sube: string | null;
};

const MATCH_SELECT = `
  SELECT m.*,
         p1.sinif AS p1_sinif, p1.bolum AS p1_bolum, p1.sube AS p1_sube,
         p2.sinif AS p2_sinif, p2.bolum AS p2_bolum, p2.sube AS p2_sube
  FROM matches m
  LEFT JOIN participants p1 ON p1.id = m.p1_participant_id
  LEFT JOIN participants p2 ON p2.id = m.p2_participant_id
`;

export class DuplicateRoundError extends Error {
  constructor(roundNo: number) {
    super(`${roundNo}. tur zaten mevcut. Önce mevcut turu silin veya farklı bir tur numarası kullanın.`);
  }
}

export async function listRounds(tournamentId: number, onlyPublished = false) {
  const { rows } = await query<RoundRow>(
    `SELECT * FROM rounds WHERE tournament_id = $1 ${onlyPublished ? "AND published = true" : ""}
     ORDER BY round_no`,
    [tournamentId]
  );
  return rows;
}

export async function getRoundById(id: number) {
  const { rows } = await query<RoundRow>("SELECT * FROM rounds WHERE id = $1", [id]);
  return rows[0] ?? null;
}

export async function getRoundByNo(tournamentId: number, roundNo: number) {
  const { rows } = await query<RoundRow>(
    "SELECT * FROM rounds WHERE tournament_id = $1 AND round_no = $2",
    [tournamentId, roundNo]
  );
  return rows[0] ?? null;
}

export async function getMatchesForRound(roundId: number) {
  const { rows } = await query<MatchRow>(
    `${MATCH_SELECT} WHERE m.round_id = $1 ORDER BY m.match_no`,
    [roundId]
  );
  return rows;
}

export async function getRoundsWithMatches(tournamentId: number, onlyPublished = false) {
  const rounds = await listRounds(tournamentId, onlyPublished);
  const results: (RoundRow & { matches: MatchRow[] })[] = [];
  for (const round of rounds) {
    const matches = await getMatchesForRound(round.id);
    results.push({ ...round, matches });
  }
  return results;
}

export async function getNextRoundNo(tournamentId: number) {
  const { rows } = await query<{ max: number | null }>(
    "SELECT max(round_no) FROM rounds WHERE tournament_id = $1",
    [tournamentId]
  );
  return (rows[0].max ?? 0) + 1;
}

/**
 * Çekiliş çıktısından bir turu ve maçlarını tek transaction'da oluşturur.
 * İsim eşleşirse katılımcıya bağlanır (sınıf/bölüm/şube gösterimi için),
 * eşleşmezse maç yine de isimle kaydedilir — veri girişi bloke olmaz.
 */
export async function createRoundWithMatches(
  tournamentId: number,
  roundNo: number,
  title: string,
  matches: ParsedMatch[]
) {
  return withTransaction(async (client) => {
    const existing = await client.query(
      "SELECT id FROM rounds WHERE tournament_id = $1 AND round_no = $2",
      [tournamentId, roundNo]
    );
    if (existing.rows.length > 0) {
      throw new DuplicateRoundError(roundNo);
    }

    const roundResult = await client.query<RoundRow>(
      `INSERT INTO rounds (tournament_id, round_no, title) VALUES ($1, $2, $3) RETURNING *`,
      [tournamentId, roundNo, title]
    );
    const round = roundResult.rows[0];

    let matchNo = 1;
    for (const m of matches) {
      const p1 = await findParticipantByName(tournamentId, m.p1);
      const p2 = m.p2 ? await findParticipantByName(tournamentId, m.p2) : null;
      const status = m.p2 === null ? "bye" : "pending";
      const winnerName = m.p2 === null ? m.p1 : null;

      await client.query(
        `INSERT INTO matches
           (round_id, match_no, p1_name, p2_name, p1_participant_id, p2_participant_id, status, winner_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [round.id, matchNo, m.p1, m.p2, p1?.id ?? null, p2?.id ?? null, status, winnerName]
      );
      matchNo += 1;
    }

    return round;
  });
}

export async function setRoundPublished(id: number, published: boolean) {
  const { rows } = await query<RoundRow>(
    "UPDATE rounds SET published = $2 WHERE id = $1 RETURNING *",
    [id, published]
  );
  return rows[0] ?? null;
}

export async function deleteRound(id: number) {
  await query("DELETE FROM rounds WHERE id = $1", [id]);
}

/**
 * Bir üst tura geçecek katılımcılar: tamamlanmış maçların kazananları + bay
 * geçenler, sınıf/bölüm/şube bilgileriyle birlikte. Henüz sonuçlanmamış maç
 * varsa `complete: false` döner.
 */
export async function getRoundWinners(roundId: number) {
  const matches = await getMatchesForRound(roundId);
  const pending = matches.filter((m) => m.status === "pending");
  const winners: WinnerEntry[] = matches
    .filter((m) => m.status !== "pending" && m.winner_name)
    .map((m) => {
      const isP1 = m.winner_name === m.p1_name;
      return {
        fullName: m.winner_name as string,
        sinif: isP1 ? m.p1_sinif : m.p2_sinif,
        bolum: isP1 ? m.p1_bolum : m.p2_bolum,
        sube: isP1 ? m.p1_sube : m.p2_sube,
      };
    });
  return { complete: pending.length === 0, pendingCount: pending.length, winners };
}
