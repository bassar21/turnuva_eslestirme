"use client";

import { useActionState } from "react";
import { createOptionAction, type ActionState } from "@/app/actions/superadmin";
import type { OptionKind } from "@/lib/queries/options";

const initialState: ActionState = {};

export function AddOptionForm({ kind }: { kind: OptionKind }) {
  const [state, formAction, pending] = useActionState(createOptionAction, initialState);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="kind" value={kind} />
      <input
        name="value"
        required
        placeholder="Yeni değer"
        className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
      >
        Ekle
      </button>
      {state.error && <span className="text-xs text-red-700">{state.error}</span>}
    </form>
  );
}
