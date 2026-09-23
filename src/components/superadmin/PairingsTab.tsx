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
          <p className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center text-neutral-500">
            Henüz tur oluşturulmadı.
          </p>
        )}
        {rounds.map((round) => {
          const byeCount = round.matches.filter((m) => m.status === "bye").length;
          const doneCount = round.matches.filter((m) => m.status === "done").length;
          return (
            <div key={round.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-neutral-800">{round.title}</h4>
                  <p className="text-xs text-neutral-500">
                    {round.matches.length} maç · {byeCount} bay · {doneCount} sonuçlanmış ·{" "}
                    {round.published ? (
                      <span className="font-medium text-green-700">Yayında</span>
                    ) : (
                      <span className="font-medium text-neutral-500">Taslak</span>
                    )}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
