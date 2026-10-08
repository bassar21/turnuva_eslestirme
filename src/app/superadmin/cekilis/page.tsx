import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isTournamentSlug, TOURNAMENTS, type TournamentSlug } from "@/config/site";
import { getTournamentBySlug } from "@/lib/queries/tournaments";
import { listParticipants } from "@/lib/queries/participants";
import { getNextRoundNo, getRoundByNo, getRoundWinners } from "@/lib/queries/rounds";
import { CekilisClient, type DrawParticipant } from "@/components/superadmin/CekilisClient";

export default async function CekilisPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; round?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    redirect("/superadmin/login");
  }

  const { t, round } = await searchParams;
  const slug: TournamentSlug = t && isTournamentSlug(t) ? t : "satranc";
  const tournament = await getTournamentBySlug(slug);

  if (!tournament) {
    return <Blocked tournament={slug} message="Turnuva bulunamadı." />;
  }

  const requestedRound = Number(round);
  const roundNo =
    Number.isInteger(requestedRound) && requestedRound > 0
      ? requestedRound
      : await getNextRoundNo(tournament.id);

  const existing = await getRoundByNo(tournament.id, roundNo);
  if (existing) {
    return (
      <Blocked
        tournament={slug}
        message={`${roundNo}. tur zaten mevcut ("${existing.title}"). Devam etmek için önce "Eşleştirmeler" sekmesinden bu turu silin ya da farklı bir tur numarası seçin.`}
      />
    );
  }

  let participants: DrawParticipant[];

  if (roundNo <= 1) {
    const rows = await listParticipants(tournament.id);
    participants = rows.map((p) => ({
      fullName: p.full_name,
      sinif: p.sinif,
      bolum: p.bolum,
      sube: p.sube,
    }));
  } else {
    const prevRound = await getRoundByNo(tournament.id, roundNo - 1);
    if (!prevRound) {
      return (
        <Blocked
          tournament={slug}
          message={`${roundNo - 1}. tur henüz oluşturulmamış. Önce o turu çekip yayınlamanız gerekir.`}
        />
      );
    }
    const { complete, pendingCount, winners } = await getRoundWinners(prevRound.id);
    if (!complete) {
      return (
        <Blocked
          tournament={slug}
          message={`"${prevRound.title}" turunda ${pendingCount} maç henüz sonuçlanmadı. Tüm sonuçlar girilmeden bir sonraki tur çekilemez.`}
        />
      );
    }
    participants = winners.map((w) => ({
      fullName: w.fullName,
      sinif: w.sinif,
      bolum: w.bolum,
      sube: w.sube,
    }));
  }

  if (participants.length < 2) {
    return (
      <Blocked
        tournament={slug}
        message={`Çekiliş için en az 2 katılımcı gerekir (şu an ${participants.length}).`}
      />
    );
  }

  return (
    <CekilisClient
      tournament={slug}
      tournamentName={TOURNAMENTS[slug].name}
      roundNo={roundNo}
      defaultTitle={`Tur ${roundNo}`}
      participants={participants}
    />
  );
}

function Blocked({ tournament, message }: { tournament: TournamentSlug; message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-600">{message}</p>
        <Link
          href={`/superadmin?tab=eslestirmeler&t=${tournament}`}
          className="inline-block rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          ← Eşleştirmeler paneline dön
        </Link>
      </div>
    </div>
  );
}
