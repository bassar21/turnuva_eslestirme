import Link from "next/link";
import { TOURNAMENTS, type TournamentSlug } from "@/config/site";

export function TournamentSwitcher({ current, tab }: { current: TournamentSlug; tab: string }) {
  const slugs: TournamentSlug[] = ["satranc", "mangala"];
  return (
    <div className="flex gap-2 text-sm">
      {slugs.map((slug) => (
        <Link
          key={slug}
          href={`/superadmin?tab=${tab}&t=${slug}`}
          className={`rounded-full px-3 py-1 font-medium ${
            current === slug ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          {TOURNAMENTS[slug].name}
        </Link>
      ))}
    </div>
  );
}
