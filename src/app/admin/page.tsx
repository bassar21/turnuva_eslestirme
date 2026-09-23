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
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {TOURNAMENTS[scope].name} — Admin Paneli
          </h1>
          <p className="text-sm text-neutral-500">Giriş: {session.username}</p>
        </div>
        <div className="flex items-center gap-3">
          {session.role === "superadmin" && (
            <div className="flex gap-2 text-sm">
              <Link
                href="/admin?t=satranc"
                className={`rounded-full px-3 py-1 ${scope === "satranc" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"}`}
              >
                Satranç
              </Link>
              <Link
                href="/admin?t=mangala"
                className={`rounded-full px-3 py-1 ${scope === "mangala" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"}`}
              >
                Mangala
              </Link>
            </div>
          )}
          <form action={logout}>
            <button className="text-sm text-neutral-400 hover:text-neutral-700 hover:underline">
              Çıkış yap
            </button>
          </form>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {rounds.length === 0 ? (
            <p className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center text-neutral-500">
              Henüz eşleştirme girilmemiş.
            </p>
          ) : (
            rounds.map(({ roundNo, list }) => (
              <div key={roundNo} className="rounded-xl border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-3">
                  <h2 className="font-semibold text-neutral-800">Tur {roundNo}</h2>
                </div>
                <div className="divide-y divide-neutral-100">
                  {list.map((m) => (
                    <div key={m.id} className="space-y-2 px-5 py-4">
                      {m.status === "bye" ? (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-neutral-800">{m.p1_name}</span>
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                            BAY GEÇTİ
                          </span>
                        </div>
                      ) : (
                        <>
                          <p className="font-medium text-neutral-800">
                            {m.p1_name} <span className="text-neutral-400">vs</span> {m.p2_name}
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
          <h2 className="text-sm font-semibold text-neutral-500 uppercase">
            Katılımcılar ({participants.length})
          </h2>
          <ul className="max-h-[70vh] space-y-1 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-3 text-sm shadow-sm">
            {participants.map((p) => (
              <li key={p.id} className="text-neutral-700">
                {p.full_name}{" "}
                <span className="text-neutral-400">
                  ({p.sinif} / {p.bolum} / {p.sube})
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </main>
  );
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
