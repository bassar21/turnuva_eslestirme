import type { MatchRow, RoundRow } from "@/lib/queries/rounds";

type RoundWithMatches = RoundRow & { matches: MatchRow[] };

export function RoundsView({ rounds }: { rounds: RoundWithMatches[] }) {
  if (rounds.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-400">
        Henüz yayınlanmış bir eşleştirme yok.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {rounds.map((round) => (
        <div
          key={round.id}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
            <h3 className="font-semibold text-slate-800">{round.title}</h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {round.matches.map((match) => (
              <li key={match.id} className="px-5 py-4">
                <MatchLine match={match} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function classInfo(sinif: string | null, bolum: string | null, sube: string | null) {
  if (!sinif && !bolum && !sube) return null;
  return [sinif, bolum, sube].filter(Boolean).join(" / ");
}

function MatchLine({ match }: { match: MatchRow }) {
  const p1Info = classInfo(match.p1_sinif, match.p1_bolum, match.p1_sube);
  const p2Info = classInfo(match.p2_sinif, match.p2_bolum, match.p2_sube);

  if (match.status === "bye") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium text-slate-800">
          {match.p1_name}
          {p1Info && <span className="ml-1.5 text-xs font-normal text-slate-400">({p1Info})</span>}
        </span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          BAY GEÇTİ
        </span>
      </div>
    );
  }

  const p1Wins = match.status === "done" && match.winner_name === match.p1_name;
  const p2Wins = match.status === "done" && match.winner_name === match.p2_name;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5 text-[15px]">
        <span className={p1Wins ? "font-semibold text-green-700" : "text-slate-700"}>
          {match.p1_name}
          {p1Info && <span className="ml-1.5 text-xs font-normal text-slate-400">({p1Info})</span>}
        </span>
        <span className="text-xs font-medium text-slate-300">vs</span>
        <span className={p2Wins ? "font-semibold text-green-700" : "text-slate-700"}>
          {match.p2_name}
          {p2Info && <span className="ml-1.5 text-xs font-normal text-slate-400">({p2Info})</span>}
        </span>
      </div>
      {match.status === "done" ? (
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
          {match.p1_sets}–{match.p2_sets} · {match.winner_name} kazandı
        </span>
      ) : (
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
          Sonuç bekleniyor
        </span>
      )}
    </div>
  );
}
