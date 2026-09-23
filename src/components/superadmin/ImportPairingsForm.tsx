"use client";

import { useActionState } from "react";
import { importPairingsAction, type ActionState } from "@/app/actions/superadmin";
import type { TournamentSlug } from "@/config/site";
import { inputClass } from "@/components/ui";

const initialState: ActionState = {};

export function ImportPairingsForm({ tournament }: { tournament: TournamentSlug }) {
  const [state, formAction, pending] = useActionState(importPairingsAction, initialState);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="tournament" value={tournament} />

      <div>
        <label htmlFor="pairingsText" className="block text-sm font-medium text-slate-700">
          Çekiliş aracından gelen metni veya JSON&apos;u yapıştırın
        </label>
        <textarea
          id="pairingsText"
          name="pairingsText"
          required
          rows={8}
          placeholder={"# SATRANÇ - TUR 1\n1. Ahmet Yılmaz vs Mehmet Demir\n2. Can Öztürk - BAY GEÇTİ"}
          className={`${inputClass} font-mono text-sm`}
        />
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700">
          Tur başlığı <span className="text-slate-400">(opsiyonel, boş bırakılırsa &quot;Tur N&quot;)</span>
        </label>
        <input id="title" name="title" type="text" className={inputClass} />
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm whitespace-pre-wrap text-red-700 ring-1 ring-red-100">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-xl bg-green-50 px-3.5 py-2.5 text-sm text-green-700 ring-1 ring-green-100">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "İçe aktarılıyor…" : "İçe Aktar"}
      </button>
    </form>
  );
}
