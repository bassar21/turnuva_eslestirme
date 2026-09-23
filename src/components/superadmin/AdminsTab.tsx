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

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-medium">Kullanıcı adı</th>
              <th className="px-4 py-2 font-medium">Turnuva</th>
              <th className="px-4 py-2 font-medium">Durum</th>
              <th className="px-4 py-2 font-medium">Şifre</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {admins.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-2 text-neutral-800">{a.username}</td>
                <td className="px-4 py-2 text-neutral-600">{TOURNAMENTS[a.scope].name}</td>
                <td className="px-4 py-2">
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
                <td className="px-4 py-2">
                  <ResetPasswordForm adminId={a.id} />
                </td>
                <td className="px-4 py-2 text-right">
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
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
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
