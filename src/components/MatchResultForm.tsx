"use client";

import { useActionState } from "react";
import { submitMatchResultAction, type MatchResultState } from "@/app/actions/admin";

const initialState: MatchResultState = {};

export function MatchResultForm({
  matchId,
  p1Name,
  p2Name,
  existing,
}: {
  matchId: number;
  p1Name: string;
  p2Name: string;
  existing?: { setsPlayed: number; p1Sets: number; p2Sets: number };
}) {
  const [state, formAction, pending] = useActionState(submitMatchResultAction, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5"
    >
      <input type="hidden" name="matchId" value={matchId} />

      <NumberField label="Oynanan set" name="setsPlayed" defaultValue={existing?.setsPlayed} />
      <NumberField label={`${p1Name} seti`} name="p1Sets" defaultValue={existing?.p1Sets} />
      <NumberField label={`${p2Name} seti`} name="p2Sets" defaultValue={existing?.p2Sets} />

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Kaydediliyor…" : existing ? "Güncelle" : "Kaydet"}
      </button>

      {state.error && (
        <p className="w-full rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="w-full rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 ring-1 ring-green-100">
          Kaydedildi.
        </p>
      )}
    </form>
  );
}

function NumberField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: number;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input
        type="number"
        name={name}
        min={0}
        required
        defaultValue={defaultValue}
        className="mt-1 w-20 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
      />
    </div>
  );
}
