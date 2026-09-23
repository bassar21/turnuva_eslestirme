"use client";

import { useActionState } from "react";
import { registerParticipant, type RegisterState } from "@/app/actions/register";
import type { TournamentSlug } from "@/config/site";
import { inputClass } from "@/components/ui";

const initialState: RegisterState = {};

export function RegisterForm({
  tournament,
  options,
}: {
  tournament: TournamentSlug;
  options: { sinif: string[]; bolum: string[]; sube: string[] };
}) {
  const [state, formAction, pending] = useActionState(registerParticipant, initialState);

  if (state.success) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path
              fillRule="evenodd"
              d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <div>
          <p className="font-semibold text-green-800">Kaydınız alındı.</p>
          <p className="mt-0.5 text-sm text-green-700">
            Eşleştirmeler yayınlandığında bu sayfada görebilirsiniz.
          </p>
        </div>
      </div>
    );
  }

  const noOptionsYet =
    options.sinif.length === 0 || options.bolum.length === 0 || options.sube.length === 0;

  if (noOptionsYet) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm">
        Kayıt formu henüz hazır değil. Lütfen daha sonra tekrar deneyin.
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-8"
    >
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Turnuvaya Kayıt Ol</h3>
        <p className="text-sm text-slate-500">Bilgilerinizi eksiksiz doldurun.</p>
      </div>

      <input type="hidden" name="tournament" value={tournament} />

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
          Ad Soyad
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          maxLength={100}
          className={inputClass}
          placeholder="Adınız ve soyadınız"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Select label="Sınıf" name="sinif" values={options.sinif} />
        <Select label="Bölüm" name="bolum" values={options.bolum} />
        <Select label="Şube" name="sube" values={options.sube} />
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-red-100">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Kaydediliyor…" : "Kayıt Ol"}
      </button>
    </form>
  );
}

function Select({ label, name, values }: { label: string; name: string; values: string[] }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select id={name} name={name} required defaultValue="" className={inputClass}>
        <option value="" disabled>
          Seçiniz
        </option>
        {values.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </div>
  );
}
