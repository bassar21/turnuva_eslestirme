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
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-lg bg-neutral-50 p-3">
      <input type="hidden" name="matchId" value={matchId} />

      <NumberField label="Oynanan set" name="setsPlayed" defaultValue={existing?.setsPlayed} />
      <NumberField label={`${p1Name} seti`} name="p1Sets" defaultValue={existing?.p1Sets} />
      <NumberField label={`${p2Name} seti`} name="p2Sets" defaultValue={existing?.p2Sets} />

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
      >
        {pending ? "Kaydediliyor…" : existing ? "Güncelle" : "Kaydet"}
      </button>

      {state.error && <p className="w-full text-sm text-red-700">{state.error}</p>}
      {state.success && <p className="w-full text-sm text-green-700">Kaydedildi.</p>}
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
      <label className="text-xs font-medium text-neutral-600">{label}</label>
      <input
        type="number"
        name={name}
        min={0}
        required
        defaultValue={defaultValue}
        className="mt-1 w-20 rounded-lg border border-neutral-300 px-2 py-1.5 focus:border-neutral-500 focus:outline-none"
      />
    </div>
  );
}
