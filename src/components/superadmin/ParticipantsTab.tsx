import { TOURNAMENTS, type TournamentSlug } from "@/config/site";
import { getTournamentBySlug } from "@/lib/queries/tournaments";
import { listParticipants } from "@/lib/queries/participants";
import { formatParticipantsJSON, formatParticipantsText } from "@/lib/pairings";
import { deleteParticipantAction } from "@/app/actions/superadmin";
import { CopyBox } from "@/components/CopyBox";
import { ActionButton } from "@/components/superadmin/ActionButton";
import { TournamentSwitcher } from "@/components/superadmin/TournamentSwitcher";

export async function ParticipantsTab({ tournament }: { tournament: TournamentSlug }) {
  const t = await getTournamentBySlug(tournament);
  if (!t) return null;
  const participants = await listParticipants(t.id);

  const participantData = participants.map((p) => ({
    fullName: p.full_name,
    sinif: p.sinif,
    bolum: p.bolum,
    sube: p.sube,
  }));

  return (
    <div className="space-y-6">
      <TournamentSwitcher current={tournament} tab="katilimcilar" />

      <div>
        <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
          Çekiliş için kopyala — {TOURNAMENTS[tournament].name}
        </h3>
        <CopyBox
          text={formatParticipantsText(participantData)}
          json={formatParticipantsJSON(participantData)}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">
            <tr>
              <th className="px-4 py-3">Ad Soyad</th>
              <th className="px-4 py-3">Sınıf</th>
              <th className="px-4 py-3">Bölüm</th>
              <th className="px-4 py-3">Şube</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {participants.map((p) => (
              <tr key={p.id} className="transition hover:bg-slate-50/70">
                <td className="px-4 py-2.5 font-medium text-slate-800">{p.full_name}</td>
                <td className="px-4 py-2.5 text-slate-600">{p.sinif}</td>
                <td className="px-4 py-2.5 text-slate-600">{p.bolum}</td>
                <td className="px-4 py-2.5 text-slate-600">{p.sube}</td>
                <td className="px-4 py-2.5 text-right">
                  <form action={deleteParticipantAction.bind(null, p.id)}>
                    <ActionButton variant="danger">Sil</ActionButton>
                  </form>
                </td>
              </tr>
            ))}
            {participants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Henüz katılımcı yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
