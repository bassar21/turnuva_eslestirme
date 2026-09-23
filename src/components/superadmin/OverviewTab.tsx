import { TOURNAMENTS, type TournamentSlug } from "@/config/site";
import { getAllTournaments, type TournamentRow } from "@/lib/queries/tournaments";
import { countParticipants } from "@/lib/queries/participants";
import { listRounds } from "@/lib/queries/rounds";
import { listMatchesForTournament } from "@/lib/queries/matches";
import { toggleRegistration } from "@/app/actions/superadmin";
import { ActionButton } from "@/components/superadmin/ActionButton";

export async function OverviewTab() {
  const tournaments = await getAllTournaments();

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {tournaments.map((t) => (
        <TournamentCard key={t.slug} tournament={t} />
      ))}
    </div>
  );
}

async function TournamentCard({ tournament }: { tournament: TournamentRow }) {
  const slug = tournament.slug as TournamentSlug;
  const meta = TOURNAMENTS[slug];
  const [participantCount, rounds, matches] = await Promise.all([
    countParticipants(tournament.id),
    listRounds(tournament.id),
    listMatchesForTournament(tournament.id),
  ]);
  const pending = matches.filter((m) => m.status === "pending").length;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-neutral-900">{meta.name}</h3>
      <dl className="mt-4 space-y-2 text-sm text-neutral-600">
        <Row label="Katılımcı" value={String(participantCount)} />
        <Row label="Tur sayısı" value={String(rounds.length)} />
        <Row label="Sonuç bekleyen maç" value={String(pending)} />
      </dl>

      <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            tournament.registration_open
              ? "bg-green-100 text-green-800"
              : "bg-neutral-200 text-neutral-600"
          }`}
        >
          Kayıt {tournament.registration_open ? "Açık" : "Kapalı"}
        </span>
        <form action={toggleRegistration.bind(null, slug, !tournament.registration_open)}>
          <ActionButton variant={tournament.registration_open ? "danger" : "primary"}>
            {tournament.registration_open ? "Kaydı Kapat" : "Kaydı Aç"}
          </ActionButton>
        </form>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd className="font-medium text-neutral-900">{value}</dd>
    </div>
  );
}
