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
        className="w-40 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        Ekle
      </button>
      {state.error && <span className="text-xs text-red-700">{state.error}</span>}
    </form>
  );
}
