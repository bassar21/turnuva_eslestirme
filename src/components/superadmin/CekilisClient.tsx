"use client";

import { useState } from "react";
import Link from "next/link";
import type { TournamentSlug } from "@/config/site";
import { formatPairingsJSON, formatPairingsText, type ParsedMatch } from "@/lib/pairings";
import { saveDrawAction } from "@/app/actions/superadmin";
import { CopyBox } from "@/components/CopyBox";

export type DrawParticipant = {
  fullName: string;
  sinif: string | null;
  bolum: string | null;
  sube: string | null;
};

type Phase = "setup" | "draw" | "result";

function secureShuffle<T>(input: T[]): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const j = buf[0] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function labelFor(name: string, byName: Map<string, DrawParticipant>): string {
  const p = byName.get(name);
  if (!p) return name;
  const info = [p.sinif, p.bolum, p.sube].filter(Boolean).join(" / ");
  return info ? `${name} (${info})` : name;
}

export function CekilisClient({
  tournament,
  tournamentName,
  roundNo,
  defaultTitle,
  participants,
}: {
  tournament: TournamentSlug;
  tournamentName: string;
  roundNo: number;
  defaultTitle: string;
  participants: DrawParticipant[];
}) {
  const byName = new Map(participants.map((p) => [p.fullName, p]));

  const [phase, setPhase] = useState<Phase>("setup");
  const [pending, setPending] = useState<string[]>([]);
  const [matches, setMatches] = useState<ParsedMatch[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [stage, setStage] = useState<{ p1: string; p2: string | null } | null>(null);

  const [title, setTitle] = useState(defaultTitle);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const backHref = `/superadmin?tab=eslestirmeler&t=${tournament}`;
  const byeNote = participants.length % 2 === 1 ? " (1 kişi bay geçecek)" : "";

  function startDraw() {
    const shuffled = secureShuffle(participants.map((p) => p.fullName));
    let bye: string | null = null;
    if (shuffled.length % 2 === 1) {
      bye = shuffled.pop() ?? null;
    }
    const total = Math.floor(shuffled.length / 2) + (bye ? 1 : 0);
    setTotalMatches(total);
    setPending(shuffled);

    if (bye) {
      setMatches([{ p1: bye, p2: null }]);
      setStage({ p1: bye, p2: null });
    } else {
      setMatches([]);
      setStage(null);
    }
    setPhase("draw");
  }

  function drawOne() {
    const rest = pending.slice();
    const p1 = rest.pop();
    const p2 = rest.pop();
    if (!p1 || !p2) return;
    setPending(rest);
    setMatches((prev) => [...prev, { p1, p2 }]);
    setStage({ p1, p2 });
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await saveDrawAction(tournament, roundNo, title, matches);
      if (res.error) {
        setSaveError(res.error);
      } else {
        setSaved(true);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <Link href={backHref} className="text-sm text-slate-500 transition hover:text-slate-300">
            ← Panele dön
          </Link>
          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {tournamentName} — Tur {roundNo}
          </span>
        </div>

        {phase === "setup" && (
          <div className="space-y-6 text-center">
            <h1 className="text-2xl font-bold text-slate-100">Çekiliş Hazır</h1>
            <p className="text-slate-400">
              {participants.length} katılımcı yüklendi{byeNote}.
            </p>

            <div className="max-h-72 overflow-auto rounded-2xl border border-slate-700 bg-slate-800 p-4 text-left">
              <ol className="space-y-1 text-sm text-slate-300">
                {participants.map((p) => (
                  <li key={p.fullName}>{labelFor(p.fullName, byName)}</li>
                ))}
              </ol>
            </div>

            <button
              type="button"
              onClick={startDraw}
              className="rounded-xl bg-green-500 px-8 py-3.5 text-base font-bold text-slate-950 shadow-sm transition hover:bg-green-400"
            >
              Çekilişi Başlat
            </button>
          </div>
        )}

        {phase === "draw" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-8 text-center">
              {stage ? (
                stage.p2 === null ? (
                  <p className="text-3xl font-bold text-amber-400">
                    {labelFor(stage.p1, byName)}
                    <br />
                    BAY GEÇTİ
                  </p>
                ) : (
                  <p className="text-3xl font-bold text-green-400">
                    {labelFor(stage.p1, byName)}
                    <br />
                    <span className="text-lg text-slate-400">vs</span>
                    <br />
                    {labelFor(stage.p2, byName)}
                  </p>
                )
              ) : (
                <p className="text-2xl font-bold text-green-400">Çekilişe hazır</p>
              )}
              <p className="mt-4 text-sm text-slate-500">
                {matches.length} / {totalMatches} maç çekildi
              </p>
            </div>

            <div className="max-h-64 overflow-auto rounded-2xl border border-slate-700 bg-slate-800 p-4">
              <ol className="space-y-1 font-mono text-sm text-slate-300">
                {matches.map((m, idx) => (
                  <li key={idx}>
                    {idx + 1}. {labelFor(m.p1, byName)}
                    {m.p2 === null ? " — BAY GEÇTİ" : `  vs  ${labelFor(m.p2, byName)}`}
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={drawOne}
                disabled={pending.length < 2}
                className="rounded-xl bg-green-500 px-8 py-3.5 text-base font-bold text-slate-950 shadow-sm transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Çek
              </button>
              <button
                type="button"
                onClick={() => setPhase("result")}
                disabled={pending.length >= 2}
                className="rounded-xl bg-slate-700 px-6 py-3.5 text-base font-semibold text-slate-100 shadow-sm transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Çekilişi Bitir → Sonuçlar
              </button>
            </div>
          </div>
        )}

        {phase === "result" && (
          <div className="space-y-6">
            <h1 className="text-center text-2xl font-bold text-green-400">Çekiliş Tamamlandı</h1>

            {!saved ? (
              <>
                <div>
                  <label htmlFor="title" className="mb-1 block text-sm text-slate-400">
                    Tur başlığı
                  </label>
                  <input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-100 focus:border-green-500 focus:outline-none"
                  />
                </div>

                <div className="text-slate-900">
                  <CopyBox
                    text={formatPairingsText(tournamentName, roundNo, matches)}
                    json={formatPairingsJSON(tournament, roundNo, matches)}
                  />
                </div>

                {saveError && (
                  <p className="rounded-xl bg-red-950 px-3.5 py-2.5 text-sm text-red-300 ring-1 ring-red-800">
                    {saveError}
                  </p>
                )}

                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl bg-green-500 px-8 py-3.5 text-base font-bold text-slate-950 shadow-sm transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "Kaydediliyor…" : "Kaydet ve Turu Oluştur"}
                  </button>
                  <button
                    type="button"
                    onClick={startDraw}
                    className="rounded-xl bg-slate-700 px-6 py-3.5 text-base font-semibold text-slate-100 shadow-sm transition hover:bg-slate-600"
                  >
                    Yeniden Çek
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-slate-300">
                  Tur {roundNo} oluşturuldu. Eşleştirmeler paneldeki &quot;Eşleştirmeler&quot; sekmesinden
                  yayınlanabilir.
                </p>
                <Link
                  href={backHref}
                  className="inline-block rounded-xl bg-green-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-green-400"
                >
                  Panele Dön
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
