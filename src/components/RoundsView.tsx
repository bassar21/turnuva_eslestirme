import type { MatchRow, RoundRow } from "@/lib/queries/rounds";

type RoundWithMatches = RoundRow & { matches: MatchRow[] };

export function RoundsView({ rounds }: { rounds: RoundWithMatches[] }) {
  if (rounds.length === 0) {
    return (
      <p className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center text-neutral-500">
        Henüz yayınlanmış bir eşleştirme yok.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {rounds.map((round) => (
        <div key={round.id} className="rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-3">
            <h2 className="font-semibold text-neutral-800">{round.title}</h2>
          </div>
          <ul className="divide-y divide-neutral-100">
            {round.matches.map((match) => (
              <li key={match.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <MatchLine match={match} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function MatchLine({ match }: { match: MatchRow }) {
  if (match.status === "bye") {
    return (
      <div className="flex w-full items-center justify-between">
        <span className="font-medium text-neutral-800">{match.p1_name}</span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          BAY GEÇTİ
        </span>
      </div>
    );
  }

  const p1Wins = match.status === "done" && match.winner_name === match.p1_name;
  const p2Wins = match.status === "done" && match.winner_name === match.p2_name;

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-3">
        <span className={p1Wins ? "font-semibold text-green-700" : "text-neutral-800"}>
          {match.p1_name}
        </span>
        <span className="text-xs text-neutral-400">vs</span>
        <span className={p2Wins ? "font-semibold text-green-700" : "text-neutral-800"}>
          {match.p2_name}
        </span>
      </div>
      {match.status === "done" ? (
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
          {match.p1_sets}–{match.p2_sets} · {match.winner_name} kazandı
        </span>
      ) : (
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
          Sonuç bekleniyor
        </span>
      )}
    </div>
  );
}
