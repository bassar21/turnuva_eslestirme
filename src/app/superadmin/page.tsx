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
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Superadmin Paneli</h1>
          <p className="text-sm text-neutral-500">Giriş: {session.username}</p>
        </div>
        <form action={logout}>
          <button className="text-sm text-neutral-400 hover:text-neutral-700 hover:underline">
            Çıkış yap
          </button>
        </form>
      </header>

      <Nav current={tab} />

      {tab === "genel" && <OverviewTab />}
      {tab === "katilimcilar" && <ParticipantsTab tournament={tournament} />}
      {tab === "eslestirmeler" && <PairingsTab tournament={tournament} />}
      {tab === "sonuclar" && <ResultsTab tournament={tournament} />}
      {tab === "adminler" && <AdminsTab />}
      {tab === "listeler" && <OptionsTab />}
    </main>
  );
}
