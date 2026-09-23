import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { isTournamentSlug, type TournamentSlug } from "@/config/site";
import { Nav } from "@/components/superadmin/Nav";
import { OverviewTab } from "@/components/superadmin/OverviewTab";
import { ParticipantsTab } from "@/components/superadmin/ParticipantsTab";
import { PairingsTab } from "@/components/superadmin/PairingsTab";
import { ResultsTab } from "@/components/superadmin/ResultsTab";
import { AdminsTab } from "@/components/superadmin/AdminsTab";
import { OptionsTab } from "@/components/superadmin/OptionsTab";

export default async function SuperadminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; t?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    redirect("/superadmin/login");
  }

  const { tab = "genel", t } = await searchParams;
  const tournament: TournamentSlug = t && isTournamentSlug(t) ? t : "satranc";

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto w-full max-w-5xl px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                Superadmin
              </p>
              <h1 className="text-xl font-bold text-slate-900">Kontrol Paneli</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">{session.username}</span>
              <form action={logout}>
                <button className="text-sm font-medium text-slate-400 transition hover:text-red-600">
                  Çıkış yap
                </button>
              </form>
            </div>
          </div>
          <div className="mt-4">
            <Nav current={tab} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        {tab === "genel" && <OverviewTab />}
        {tab === "katilimcilar" && <ParticipantsTab tournament={tournament} />}
        {tab === "eslestirmeler" && <PairingsTab tournament={tournament} />}
        {tab === "sonuclar" && <ResultsTab tournament={tournament} />}
        {tab === "adminler" && <AdminsTab />}
        {tab === "listeler" && <OptionsTab />}
      </main>
    </div>
  );
}
