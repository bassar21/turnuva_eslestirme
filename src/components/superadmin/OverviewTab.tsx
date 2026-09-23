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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className={`bg-gradient-to-br ${meta.color} px-6 py-4`}>
        <h3 className="text-lg font-bold text-white">{meta.name}</h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Katılımcı" value={participantCount} />
          <Stat label="Tur" value={rounds.length} />
          <Stat label="Bekleyen maç" value={pending} />
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              tournament.registration_open
                ? "bg-green-100 text-green-800"
                : "bg-slate-200 text-slate-600"
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
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2 py-3">
      <div className="text-xl font-bold text-slate-900">{value}</div>
      <div className="mt-0.5 text-[11px] font-medium text-slate-500">{label}</div>
    </div>
  );
}
