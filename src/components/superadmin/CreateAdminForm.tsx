"use client";

import { useActionState } from "react";
import { createAdminAction, type ActionState } from "@/app/actions/superadmin";
import { inputClass } from "@/components/ui";

const initialState: ActionState = {};

export function CreateAdminForm() {
  const [state, formAction, pending] = useActionState(createAdminAction, initialState);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h4 className="font-semibold text-slate-900">Yeni Admin Hesabı</h4>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-slate-600">Kullanıcı adı</label>
          <input name="username" required minLength={3} className={`${inputClass} text-sm`} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Şifre</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className={`${inputClass} text-sm`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Turnuva</label>
          <select
            name="scope"
            required
            defaultValue="satranc"
            className={`${inputClass} text-sm`}
          >
            <option value="satranc">Satranç</option>
            <option value="mangala">Mangala</option>
          </select>
        </div>
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-red-100">
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
        {pending ? "Oluşturuluyor…" : "Hesap Oluştur"}
      </button>
    </form>
  );
}
