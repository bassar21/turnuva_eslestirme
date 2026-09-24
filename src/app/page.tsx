import Link from "next/link";
import { SITE, TOURNAMENTS, type TournamentSlug } from "@/config/site";

export default function HomePage() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.12),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(217,119,6,0.10),transparent_45%),radial-gradient(circle_at_50%_90%,rgba(15,23,42,0.06),transparent_50%)]"
      />

      <div className="flex w-full max-w-3xl flex-col items-center gap-3 text-center">
        <span className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">
          {SITE.schoolName}
        </span>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-balance text-slate-900 sm:text-5xl">
          {SITE.welcomeMessage}
        </h1>
        <p className="max-w-lg text-base text-slate-500">
          Turnuvaya kayıt olmak veya eşleştirmeleri görüntülemek için bir
          branş seçin.
        </p>
      </div>

      <div className="mt-12 grid w-full max-w-3xl gap-6 sm:grid-cols-2">
        <TournamentButton slug="satranc" />
        <TournamentButton slug="mangala" />
      </div>
    </main>
  );
}

const ICONS: Record<TournamentSlug, React.ReactNode> = {
  satranc: (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" stroke="currentColor" strokeWidth="1.6">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3c1.1 0 2 .9 2 2 0 .7-.37 1.32-.92 1.68.9.53 1.5 1.7 1.83 2.82.2.68.09 1.5-.41 1.5H9.5c-.5 0-.61-.82-.41-1.5.33-1.12.93-2.29 1.83-2.82A1.99 1.99 0 0 1 10 5c0-1.1.9-2 2-2Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 14h7l1.5 6h-10l1.5-6Z" />
      <path strokeLinecap="round" d="M6.5 20h11" />
    </svg>
  ),
  mangala: (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" stroke="currentColor" strokeWidth="1.6">
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <circle cx="6.5" cy="9.3" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="9.3" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="9.3" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="6.5" cy="14.7" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14.7" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="14.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
};

function TournamentButton({ slug }: { slug: TournamentSlug }) {
  const tournament = TOURNAMENTS[slug];
  return (
    <Link
      href={`/${slug}`}
      className={`group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl bg-gradient-to-br ${tournament.color} px-8 py-10 shadow-md ring-1 ring-black/5 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl transition group-hover:bg-white/20"
      />
      <span className={`flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 ${tournament.accent}`}>
        {ICONS[slug]}
      </span>
      <div className="text-left">
        <span className="block text-xl font-bold text-white">{tournament.name}</span>
        <span className={`mt-1 flex items-center gap-1 text-sm ${tournament.accent} opacity-80 transition group-hover:opacity-100`}>
          Kayıt ol / eşleştirmeleri görüntüle
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 transition group-hover:translate-x-0.5">
            <path
              fillRule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H4a1 1 0 110-2h8.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}
