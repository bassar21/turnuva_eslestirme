import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { isTournamentSlug, TOURNAMENTS, type TournamentSlug } from "@/config/site";
import { getTournamentBySlug } from "@/lib/queries/tournaments";
import { listParticipants } from "@/lib/queries/participants";
import { listMatchesForTournament } from "@/lib/queries/matches";
import { MatchResultForm } from "@/components/MatchResultForm";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const { t } = await searchParams;
  let scope: TournamentSlug;
  if (session.role === "admin") {
    scope = session.scope;
  } else {
    scope = t && isTournamentSlug(t) ? t : "satranc";
  }

  const tournament = await getTournamentBySlug(scope);
  if (!tournament) {
    redirect("/admin/login");
  }

  const [participants, matches] = await Promise.all([
    listParticipants(tournament.id),
    listMatchesForTournament(tournament.id),
  ]);

  const rounds = groupByRound(matches);

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Admin Paneli
            </p>
            <h1 className="text-xl font-bold text-slate-900">{TOURNAMENTS[scope].name}</h1>
          </div>
          <div className="flex items-center gap-3">
            {session.role === "superadmin" && (
              <div className="flex gap-1 rounded-full bg-slate-100 p-1 text-sm">
                <Link
                  href="/admin?t=satranc"
                  className={`rounded-full px-3 py-1 font-medium transition ${scope === "satranc" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Satranç
                </Link>
                <Link
                  href="/admin?t=mangala"
                  className={`rounded-full px-3 py-1 font-medium transition ${scope === "mangala" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Mangala
                </Link>
              </div>
            )}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <span className="text-sm text-slate-500">{session.username}</span>
              <form action={logout}>
                <button className="text-sm font-medium text-slate-400 transition hover:text-red-600">
                  Çıkış yap
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            {rounds.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-400">
                Henüz eşleştirme girilmemiş.
              </p>
            ) : (
              rounds.map(({ roundNo, list }) => (
                <div
                  key={roundNo}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
                    <h2 className="font-semibold text-slate-800">Tur {roundNo}</h2>
                    <span className="text-xs font-medium text-slate-400">{list.length} maç</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {list.map((m) => (
                      <div key={m.id} className="space-y-2.5 px-5 py-4">
                        {m.status === "bye" ? (
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-800">
                              {m.p1_name}
                              {classInfo(m.p1_sinif, m.p1_bolum, m.p1_sube) && (
                                <span className="ml-1.5 text-xs font-normal text-slate-400">
                                  ({classInfo(m.p1_sinif, m.p1_bolum, m.p1_sube)})
                                </span>
                              )}
                            </span>
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                              BAY GEÇTİ
                            </span>
                          </div>
                        ) : (
                          <>
                            <p className="font-medium text-slate-800">
                              {m.p1_name}
                              {classInfo(m.p1_sinif, m.p1_bolum, m.p1_sube) && (
                                <span className="ml-1.5 text-xs font-normal text-slate-400">
                                  ({classInfo(m.p1_sinif, m.p1_bolum, m.p1_sube)})
                                </span>
                              )}{" "}
                              <span className="text-slate-300">vs</span> {m.p2_name}
                              {classInfo(m.p2_sinif, m.p2_bolum, m.p2_sube) && (
                                <span className="ml-1.5 text-xs font-normal text-slate-400">
                                  ({classInfo(m.p2_sinif, m.p2_bolum, m.p2_sube)})
                                </span>
                              )}
                            </p>
                            <MatchResultForm
                              matchId={m.id}
                              p1Name={m.p1_name}
                              p2Name={m.p2_name ?? ""}
                              existing={
                                m.status === "done" && m.sets_played !== null && m.p1_sets !== null && m.p2_sets !== null
                                  ? { setsPlayed: m.sets_played, p1Sets: m.p1_sets, p2Sets: m.p2_sets }
                                  : undefined
                              }
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <aside className="space-y-3">
            <h2 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Katılımcılar ({participants.length})
            </h2>
            <ul className="max-h-[70vh] space-y-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              {participants.map((p) => (
                <li key={p.id} className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500">
                    {p.full_name.charAt(0).toUpperCase()}
                  </span>
                  <span>
                    <span className="text-slate-800">{p.full_name}</span>{" "}
                    <span className="block text-xs text-slate-400">
                      {p.sinif} / {p.bolum} / {p.sube}
                    </span>
                  </span>
                </li>
              ))}
              {participants.length === 0 && (
                <li className="px-2 py-3 text-sm text-slate-400">Henüz katılımcı yok.</li>
              )}
            </ul>
          </aside>
        </section>
      </main>
    </div>
  );
}

function classInfo(sinif: string | null, bolum: string | null, sube: string | null) {
  if (!sinif && !bolum && !sube) return null;
  return [sinif, bolum, sube].filter(Boolean).join(" / ");
}

function groupByRound(matches: Awaited<ReturnType<typeof listMatchesForTournament>>) {
  const map = new Map<number, typeof matches>();
  for (const m of matches) {
    const list = map.get(m.round_no) ?? [];
    list.push(m);
    map.set(m.round_no, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([roundNo, list]) => ({ roundNo, list }));
}
