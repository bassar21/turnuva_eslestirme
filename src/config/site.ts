export const SITE = {
  schoolName: "Özel Adem Ceylan Final Teknik Koleji",
  welcomeMessage:
    "Özel Adem Ceylan Final Teknik Koleji turnuva işlemlerine hoş geldiniz",
};

export type TournamentSlug = "satranc" | "mangala";

export const TOURNAMENTS: Record<
  TournamentSlug,
  { slug: TournamentSlug; name: string; color: string; accent: string }
> = {
  satranc: {
    slug: "satranc",
    name: "Satranç Turnuvası",
    color: "from-slate-800 to-slate-950",
    accent: "text-slate-200",
  },
  mangala: {
    slug: "mangala",
    name: "Mangala Turnuvası",
    color: "from-amber-700 to-amber-950",
    accent: "text-amber-100",
  },
};

export function isTournamentSlug(value: string): value is TournamentSlug {
  return value === "satranc" || value === "mangala";
}
