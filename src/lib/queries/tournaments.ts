import { query } from "@/lib/db";
import type { TournamentSlug } from "@/config/site";

export type TournamentRow = {
  id: number;
  slug: TournamentSlug;
  name: string;
  registration_open: boolean;
  created_at: string;
};

export async function getTournamentBySlug(slug: TournamentSlug) {
  const { rows } = await query<TournamentRow>(
    "SELECT * FROM tournaments WHERE slug = $1",
    [slug]
  );
  return rows[0] ?? null;
}

export async function getAllTournaments() {
  const { rows } = await query<TournamentRow>(
    "SELECT * FROM tournaments ORDER BY slug"
  );
  return rows;
}

export async function setRegistrationOpen(slug: TournamentSlug, open: boolean) {
  const { rows } = await query<TournamentRow>(
    "UPDATE tournaments SET registration_open = $2 WHERE slug = $1 RETURNING *",
    [slug, open]
  );
  return rows[0] ?? null;
}
