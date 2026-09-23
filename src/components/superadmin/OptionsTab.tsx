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
        <div key={kind} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h4 className="font-semibold text-neutral-800">{KIND_LABELS[kind]}</h4>
          <AddOptionForm kind={kind} />
          <ul className="space-y-1">
            {options
              .filter((o) => o.kind === kind)
              .map((o) => (
                <li key={o.id} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-1.5 text-sm">
                  <span className={o.active ? "text-neutral-800" : "text-neutral-400 line-through"}>
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
              <li className="text-sm text-neutral-400">Henüz eklenmedi.</li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
