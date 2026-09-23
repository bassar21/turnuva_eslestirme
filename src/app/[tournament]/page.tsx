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
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-neutral-400 hover:text-neutral-600">
            ← Anasayfa
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900">{meta.name}</h1>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            tournament.registration_open
              ? "bg-green-100 text-green-800"
              : "bg-neutral-200 text-neutral-600"
          }`}
        >
          Kayıt {tournament.registration_open ? "Açık" : "Kapalı"}
        </span>
      </div>

      <section>
        {tournament.registration_open ? (
          <RegisterForm tournament={slug} options={options} />
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center text-neutral-500">
            Kayıtlar şu anda kapalı.
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-800">Eşleştirmeler</h2>
        <RoundsView rounds={rounds} />
      </section>
    </main>
  );
}
