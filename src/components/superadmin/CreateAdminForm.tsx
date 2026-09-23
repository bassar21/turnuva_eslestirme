"use client";

import { useActionState } from "react";
import { createAdminAction, type ActionState } from "@/app/actions/superadmin";

const initialState: ActionState = {};

export function CreateAdminForm() {
  const [state, formAction, pending] = useActionState(createAdminAction, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h4 className="font-semibold text-neutral-800">Yeni Admin Hesabı</h4>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-neutral-600">Kullanıcı adı</label>
          <input
            name="username"
            required
            minLength={3}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600">Şifre</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600">Turnuva</label>
          <select
            name="scope"
            required
            defaultValue="satranc"
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          >
            <option value="satranc">Satranç</option>
            <option value="mangala">Mangala</option>
          </select>
        </div>
      </div>

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state.success && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{state.success}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {pending ? "Oluşturuluyor…" : "Hesap Oluştur"}
      </button>
    </form>
  );
}
