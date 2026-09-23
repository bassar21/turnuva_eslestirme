import Link from "next/link";
import { SITE, TOURNAMENTS } from "@/config/site";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="max-w-2xl space-y-3">
        <p className="text-sm font-medium tracking-wide text-neutral-500 uppercase">
          {SITE.schoolName}
        </p>
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
          {SITE.welcomeMessage}
        </h1>
      </div>

      <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
        <TournamentButton slug="satranc" />
        <TournamentButton slug="mangala" />
      </div>

      <footer className="mt-16 flex gap-4 text-sm text-neutral-400">
        <Link href="/admin/login" className="hover:text-neutral-600 hover:underline">
          Admin girişi
        </Link>
        <span>·</span>
        <Link href="/superadmin/login" className="hover:text-neutral-600 hover:underline">
          Superadmin girişi
        </Link>
      </footer>
    </main>
  );
}

function TournamentButton({ slug }: { slug: keyof typeof TOURNAMENTS }) {
  const tournament = TOURNAMENTS[slug];
  return (
    <Link
      href={`/${slug}`}
      className={`group flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br ${tournament.color} px-8 py-14 shadow-lg transition hover:scale-[1.02] hover:shadow-xl`}
    >
      <span className={`text-2xl font-bold text-white`}>{tournament.name}</span>
      <span className={`text-sm ${tournament.accent} opacity-80 group-hover:opacity-100`}>
        Kayıt ol / eşleştirmeleri görüntüle →
      </span>
    </Link>
  );
}
