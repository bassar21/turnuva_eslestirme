import { listOptions, type OptionKind } from "@/lib/queries/options";
import { deleteOptionAction, setOptionActiveAction } from "@/app/actions/superadmin";
import { ActionButton } from "@/components/superadmin/ActionButton";
import { AddOptionForm } from "@/components/superadmin/AddOptionForm";

const KIND_LABELS: Record<OptionKind, string> = {
  sinif: "Sınıf",
  bolum: "Bölüm",
  sube: "Şube",
};

export async function OptionsTab() {
  const options = await listOptions();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {(Object.keys(KIND_LABELS) as OptionKind[]).map((kind) => (
        <div key={kind} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="text-sm font-semibold tracking-wide text-slate-400 uppercase">
            {KIND_LABELS[kind]}
          </h4>
          <AddOptionForm kind={kind} />
          <ul className="space-y-1.5">
            {options
              .filter((o) => o.kind === kind)
              .map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                >
                  <span className={o.active ? "font-medium text-slate-800" : "text-slate-400 line-through"}>
                    {o.value}
                  </span>
                  <div className="flex gap-1">
                    <form action={setOptionActiveAction.bind(null, o.id, !o.active)}>
                      <ActionButton variant="muted">{o.active ? "Pasifleştir" : "Aktifleştir"}</ActionButton>
                    </form>
                    <form action={deleteOptionAction.bind(null, o.id)}>
                      <ActionButton variant="danger">Sil</ActionButton>
                    </form>
                  </div>
                </li>
              ))}
            {options.filter((o) => o.kind === kind).length === 0 && (
              <li className="px-1 py-2 text-sm text-slate-400">Henüz eklenmedi.</li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
