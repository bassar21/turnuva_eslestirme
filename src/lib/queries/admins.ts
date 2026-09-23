import { query } from "@/lib/db";
import type { TournamentSlug } from "@/config/site";

export type AdminRow = {
  id: number;
  username: string;
  password_hash: string;
  scope: TournamentSlug;
  suspended: boolean;
  created_at: string;
};

export class DuplicateAdminError extends Error {
  constructor() {
    super("Bu kullanıcı adı zaten kullanılıyor.");
  }
}

export async function listAdmins() {
  const { rows } = await query<AdminRow>("SELECT * FROM admins ORDER BY scope, username");
  return rows;
}

export async function getAdminByUsername(username: string) {
  const { rows } = await query<AdminRow>("SELECT * FROM admins WHERE username = $1", [
    username,
  ]);
  return rows[0] ?? null;
}

export async function createAdmin(
  username: string,
  passwordHash: string,
  scope: TournamentSlug
) {
  try {
    const { rows } = await query<AdminRow>(
      `INSERT INTO admins (username, password_hash, scope) VALUES ($1, $2, $3) RETURNING *`,
      [username.trim(), passwordHash, scope]
    );
    return rows[0];
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "23505"
    ) {
      throw new DuplicateAdminError();
    }
    throw err;
  }
}

export async function setAdminSuspended(id: number, suspended: boolean) {
  const { rows } = await query<AdminRow>(
    "UPDATE admins SET suspended = $2 WHERE id = $1 RETURNING *",
    [id, suspended]
  );
  return rows[0] ?? null;
}

export async function resetAdminPassword(id: number, passwordHash: string) {
  await query("UPDATE admins SET password_hash = $2 WHERE id = $1", [id, passwordHash]);
}
