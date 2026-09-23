import Link from "next/link";
import { TOURNAMENTS, type TournamentSlug } from "@/config/site";

export function TournamentSwitcher({ current, tab }: { current: TournamentSlug; tab: string }) {
  const slugs: TournamentSlug[] = ["satranc", "mangala"];
  return (
    <div className="inline-flex gap-1 rounded-full bg-slate-100 p-1 text-sm">
      {slugs.map((slug) => (
        <Link
          key={slug}
          href={`/superadmin?tab=${tab}&t=${slug}`}
          className={`rounded-full px-3.5 py-1.5 font-medium transition ${
            current === slug
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {TOURNAMENTS[slug].name}
        </Link>
      ))}
    </div>
  );
}
