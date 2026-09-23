import { TOURNAMENTS } from "@/config/site";
import { listAdmins } from "@/lib/queries/admins";
import { setAdminSuspendedAction } from "@/app/actions/superadmin";
import { ActionButton } from "@/components/superadmin/ActionButton";
import { CreateAdminForm } from "@/components/superadmin/CreateAdminForm";
import { ResetPasswordForm } from "@/components/superadmin/ResetPasswordForm";

export async function AdminsTab() {
  const admins = await listAdmins();

  return (
    <div className="space-y-6">
      <CreateAdminForm />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">
            <tr>
              <th className="px-4 py-3">Kullanıcı adı</th>
              <th className="px-4 py-3">Turnuva</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Şifre</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {admins.map((a) => (
              <tr key={a.id} className="transition hover:bg-slate-50/70">
                <td className="px-4 py-2.5 font-medium text-slate-800">{a.username}</td>
                <td className="px-4 py-2.5 text-slate-600">{TOURNAMENTS[a.scope].name}</td>
                <td className="px-4 py-2.5">
                  {a.suspended ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                      Askıda
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      Aktif
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <ResetPasswordForm adminId={a.id} />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <form action={setAdminSuspendedAction.bind(null, a.id, !a.suspended)}>
                    <ActionButton variant={a.suspended ? "primary" : "danger"}>
                      {a.suspended ? "Kullanıma Aç" : "Askıya Al"}
                    </ActionButton>
                  </form>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Henüz admin hesabı yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
