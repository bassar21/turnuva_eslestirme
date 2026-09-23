import type { TournamentSlug } from "@/config/site";
import { getTournamentBySlug } from "@/lib/queries/tournaments";
import { getRoundsWithMatches } from "@/lib/queries/rounds";
import { publishRoundAction, deleteRoundAction } from "@/app/actions/superadmin";
import { TournamentSwitcher } from "@/components/superadmin/TournamentSwitcher";
import { ImportPairingsForm } from "@/components/superadmin/ImportPairingsForm";
import { ActionButton } from "@/components/superadmin/ActionButton";

export async function PairingsTab({ tournament }: { tournament: TournamentSlug }) {
  const t = await getTournamentBySlug(tournament);
  if (!t) return null;
  const rounds = await getRoundsWithMatches(t.id);

  return (
    <div className="space-y-6">
      <TournamentSwitcher current={tournament} tab="eslestirmeler" />

      <ImportPairingsForm tournament={tournament} />

      <div className="space-y-3">
        {rounds.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-400">
            Henüz tur oluşturulmadı.
          </p>
        )}
        {rounds.map((round) => {
          const byeCount = round.matches.filter((m) => m.status === "bye").length;
          const doneCount = round.matches.filter((m) => m.status === "done").length;
          return (
            <div
              key={round.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-900">{round.title}</h4>
                  {round.published ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                      Yayında
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                      Taslak
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {round.matches.length} maç · {byeCount} bay · {doneCount} sonuçlanmış
                </p>
              </div>
              <div className="flex gap-2">
                <form action={publishRoundAction.bind(null, round.id, !round.published)}>
                  <ActionButton variant={round.published ? "muted" : "primary"}>
                    {round.published ? "Yayından Kaldır" : "Yayınla"}
                  </ActionButton>
                </form>
                <form action={deleteRoundAction.bind(null, round.id)}>
                  <ActionButton variant="danger">Sil</ActionButton>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
