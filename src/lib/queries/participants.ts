import { query } from "@/lib/db";

export type ParticipantRow = {
  id: number;
  tournament_id: number;
  full_name: string;
  sinif: string;
  bolum: string;
  sube: string;
  created_at: string;
};

export class DuplicateParticipantError extends Error {
  constructor() {
    super("Bu isim, sınıf ve şube ile daha önce kayıt oluşturulmuş.");
  }
}

export async function listParticipants(tournamentId: number) {
  const { rows } = await query<ParticipantRow>(
    "SELECT * FROM participants WHERE tournament_id = $1 ORDER BY full_name",
    [tournamentId]
  );
  return rows;
}

export async function countParticipants(tournamentId: number) {
  const { rows } = await query<{ count: string }>(
    "SELECT count(*) FROM participants WHERE tournament_id = $1",
    [tournamentId]
  );
  return Number(rows[0].count);
}

export async function createParticipant(
  tournamentId: number,
  fullName: string,
  sinif: string,
  bolum: string,
  sube: string
) {
  try {
    const { rows } = await query<ParticipantRow>(
      `INSERT INTO participants (tournament_id, full_name, sinif, bolum, sube)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [tournamentId, fullName.trim(), sinif, bolum, sube]
    );
    return rows[0];
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new DuplicateParticipantError();
    }
    throw err;
  }
}

export async function deleteParticipant(id: number) {
  await query("DELETE FROM participants WHERE id = $1", [id]);
}

/** İsim eşleşmesiyle katılımcıyı bulur (eşleştirme içe aktarımında kullanılır). */
export async function findParticipantByName(tournamentId: number, fullName: string) {
  const { rows } = await query<ParticipantRow>(
    `SELECT * FROM participants
     WHERE tournament_id = $1 AND lower(btrim(full_name)) = lower(btrim($2))
     LIMIT 1`,
    [tournamentId, fullName]
  );
  return rows[0] ?? null;
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "23505"
  );
}
