import type { TournamentSlug } from "@/config/site";
import { getTournamentBySlug } from "@/lib/queries/tournaments";
import { getRoundsWithMatches, getRoundWinners } from "@/lib/queries/rounds";
import { formatWinnersJSON, formatWinnersText } from "@/lib/pairings";
import { TournamentSwitcher } from "@/components/superadmin/TournamentSwitcher";
import { CopyBox } from "@/components/CopyBox";

export async function ResultsTab({ tournament }: { tournament: TournamentSlug }) {
  const t = await getTournamentBySlug(tournament);
  if (!t) return null;
  const rounds = await getRoundsWithMatches(t.id);

  return (
    <div className="space-y-6">
      <TournamentSwitcher current={tournament} tab="sonuclar" />

      {rounds.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-400">
          Henüz tur yok.
        </p>
      )}

      {rounds.map((round) => (
        <RoundResults key={round.id} roundId={round.id} title={round.title} />
      ))}
    </div>
  );
}

async function RoundResults({ roundId, title }: { roundId: number; title: string }) {
  const { complete, pendingCount, winners } = await getRoundWinners(roundId);

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-900">{title}</h4>
        {complete ? (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
            Tamamlandı
          </span>
        ) : (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            {pendingCount} maç sonuçlanmadı
          </span>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
          Bir üst tur için kazananlar {!complete && "(eksik — tamamlanınca güncellenir)"}
        </p>
        <CopyBox text={formatWinnersText(winners)} json={formatWinnersJSON(winners)} />
      </div>
    </div>
  );
}
