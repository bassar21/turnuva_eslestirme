"use client";

import { useActionState } from "react";
import { setAdminScopeAction, type ActionState } from "@/app/actions/superadmin";
import type { TournamentSlug } from "@/config/site";

const initialState: ActionState = {};

export function ChangeScopeForm({
  adminId,
  scope,
}: {
  adminId: number;
  scope: TournamentSlug;
}) {
  const [state, formAction, pending] = useActionState(setAdminScopeAction, initialState);

  return (
    <form action={formAction} className="flex items-center gap-1.5">
      <input type="hidden" name="adminId" value={adminId} />
      <select
        name="scope"
        defaultValue={scope}
        disabled={pending}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-slate-300 px-2 py-1 text-xs shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none disabled:opacity-50"
      >
        <option value="satranc">Satranç</option>
        <option value="mangala">Mangala</option>
      </select>
      {state.error && <span className="text-xs text-red-700">{state.error}</span>}
    </form>
  );
}
