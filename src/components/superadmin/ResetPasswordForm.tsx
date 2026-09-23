"use client";

import { useActionState, useState } from "react";
import { resetAdminPasswordAction, type ActionState } from "@/app/actions/superadmin";

const initialState: ActionState = {};

export function ResetPasswordForm({ adminId }: { adminId: number }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(resetAdminPasswordAction, initialState);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200"
      >
        Şifre Sıfırla
      </button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="adminId" value={adminId} />
      <input
        type="password"
        name="password"
        placeholder="Yeni şifre"
        required
        minLength={6}
        className="w-32 rounded-lg border border-neutral-300 px-2 py-1 text-xs focus:border-neutral-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        Kaydet
      </button>
      {state.error && <span className="text-xs text-red-700">{state.error}</span>}
      {state.success && <span className="text-xs text-green-700">Güncellendi</span>}
    </form>
  );
}
