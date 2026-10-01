import { query } from "@/lib/db";

export type OptionKind = "sinif" | "bolum" | "sube";

export type OptionRow = {
  id: number;
  kind: OptionKind;
  value: string;
  sort_order: number;
  active: boolean;
};

const NATURAL_ORDER = `
  sort_order,
  CASE WHEN value ~ '^[0-9]+$' THEN 0 ELSE 1 END,
  CASE WHEN value ~ '^[0-9]+$' THEN value::int END,
  value
`;

export async function listOptions(kind?: OptionKind) {
  if (kind) {
    const { rows } = await query<OptionRow>(
      `SELECT * FROM options WHERE kind = $1 ORDER BY ${NATURAL_ORDER}`,
      [kind]
    );
    return rows;
  }
  const { rows } = await query<OptionRow>(
    `SELECT * FROM options ORDER BY kind, ${NATURAL_ORDER}`
  );
  return rows;
}

/** Kayıt formunun select'lerini besler: yalnızca aktif seçenekler. */
export async function getActiveOptionsByKind(): Promise<Record<OptionKind, string[]>> {
  const { rows } = await query<OptionRow>(
    `SELECT * FROM options WHERE active = true ORDER BY ${NATURAL_ORDER}`
  );
  const result: Record<OptionKind, string[]> = { sinif: [], bolum: [], sube: [] };
  for (const row of rows) {
    result[row.kind].push(row.value);
  }
  return result;
}

export async function createOption(kind: OptionKind, value: string, sortOrder = 0) {
  const { rows } = await query<OptionRow>(
    `INSERT INTO options (kind, value, sort_order) VALUES ($1, $2, $3)
     ON CONFLICT (kind, value) DO UPDATE SET active = true
     RETURNING *`,
    [kind, value.trim(), sortOrder]
  );
  return rows[0];
}

export async function setOptionActive(id: number, active: boolean) {
  await query("UPDATE options SET active = $2 WHERE id = $1", [id, active]);
}

export async function deleteOption(id: number) {
  await query("DELETE FROM options WHERE id = $1", [id]);
}
