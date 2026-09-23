import Link from "next/link";
import { notFound } from "next/navigation";
import { isTournamentSlug, TOURNAMENTS } from "@/config/site";
import { getTournamentBySlug } from "@/lib/queries/tournaments";
import { getActiveOptionsByKind } from "@/lib/queries/options";
import { getRoundsWithMatches } from "@/lib/queries/rounds";
import { RegisterForm } from "@/components/RegisterForm";
import { RoundsView } from "@/components/RoundsView";

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ tournament: string }>;
}) {
  const { tournament: slug } = await params;
  if (!isTournamentSlug(slug)) {
    notFound();
  }

  const tournament = await getTournamentBySlug(slug);
  if (!tournament) {
    notFound();
  }

  const meta = TOURNAMENTS[slug];
  const [options, rounds] = await Promise.all([
    getActiveOptionsByKind(),
    getRoundsWithMatches(tournament.id, true),
  ]);

  return (
    <main className="flex-1 pb-16">
      <div className={`bg-gradient-to-br ${meta.color}`}>
        <div className="mx-auto w-full max-w-3xl px-6 pt-8 pb-10">
          <Link
            href="/"
            className={`inline-flex items-center gap-1 text-sm ${meta.accent} opacity-80 transition hover:opacity-100`}
          >
            ← Anasayfa
          </Link>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">{meta.name}</h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                tournament.registration_open
                  ? "bg-green-400/20 text-green-100 ring-1 ring-green-300/30"
                  : "bg-white/10 text-white/70 ring-1 ring-white/20"
              }`}
            >
              Kayıt {tournament.registration_open ? "Açık" : "Kapalı"}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-6 w-full max-w-3xl space-y-8 px-6">
        <section>
          {tournament.registration_open ? (
            <RegisterForm tournament={slug} options={options} />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="font-medium text-slate-700">Kayıtlar şu anda kapalı.</p>
              <p className="mt-1 text-sm text-slate-500">
                Kayıtlar tekrar açıldığında bu sayfadan kaydolabileceksiniz.
              </p>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">Eşleştirmeler</h2>
          <RoundsView rounds={rounds} />
        </section>
      </div>
    </main>
  );
}
