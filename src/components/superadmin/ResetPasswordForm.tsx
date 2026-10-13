"use client";

import { useActionState, useState } from "react";
import { resetAdminPasswordAction, type ActionState } from "@/app/actions/superadmin";

const initialState: ActionState = {};

export function ResetPasswordForm({ adminId }: { adminId: number }) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(resetAdminPasswordAction, initialState);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
      >
        Şifre Sıfırla
      </button>
    );
  }

  return (
    <div className="space-y-1">
      <form action={formAction} className="flex items-center gap-1.5">
        <input type="hidden" name="adminId" value={adminId} />
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Yeni şifre"
          required
          minLength={6}
          className="w-28 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="shrink-0 rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50"
        >
          {showPassword ? "Gizle" : "Göster"}
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
        >
          Kaydet
        </button>
      </form>
      {state.error && <p className="text-xs text-red-700">{state.error}</p>}
      {state.success && <p className="text-xs font-medium text-green-700">{state.success}</p>}
    </div>
  );
}
