"use client";

import { useActionState } from "react";
import { importPairingsAction, type ActionState } from "@/app/actions/superadmin";
import type { TournamentSlug } from "@/config/site";

const initialState: ActionState = {};

export function ImportPairingsForm({ tournament }: { tournament: TournamentSlug }) {
  const [state, formAction, pending] = useActionState(importPairingsAction, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <input type="hidden" name="tournament" value={tournament} />

      <div>
        <label htmlFor="pairingsText" className="block text-sm font-medium text-neutral-700">
          Çekiliş aracından gelen metni veya JSON&apos;u yapıştırın
        </label>
        <textarea
          id="pairingsText"
          name="pairingsText"
          required
          rows={8}
          placeholder={"# SATRANÇ - TUR 1\n1. Ahmet Yılmaz vs Mehmet Demir\n2. Can Öztürk - BAY GEÇTİ"}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-mono text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-neutral-700">
          Tur başlığı <span className="text-neutral-400">(opsiyonel, boş bırakılırsa &quot;Tur N&quot;)</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-neutral-500 focus:outline-none"
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm whitespace-pre-wrap text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {pending ? "İçe aktarılıyor…" : "İçe Aktar"}
      </button>
    </form>
  );
}
