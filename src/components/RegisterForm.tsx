"use client";

import { useActionState } from "react";
import { registerParticipant, type RegisterState } from "@/app/actions/register";
import type { TournamentSlug } from "@/config/site";

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
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-800">
        <p className="font-semibold">Kaydınız alındı.</p>
        <p className="text-sm">Eşleştirmeler yayınlandığında bu sayfada görebilirsiniz.</p>
      </div>
    );
  }

  const noOptionsYet =
    options.sinif.length === 0 || options.bolum.length === 0 || options.sube.length === 0;

  if (noOptionsYet) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-neutral-600">
        Kayıt formu henüz hazır değil. Lütfen daha sonra tekrar deneyin.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <input type="hidden" name="tournament" value={tournament} />

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700">
          Ad Soyad
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          maxLength={100}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-neutral-500 focus:outline-none"
          placeholder="Adınız ve soyadınız"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Select label="Sınıf" name="sinif" values={options.sinif} />
        <Select label="Bölüm" name="bolum" values={options.bolum} />
        <Select label="Şube" name="sube" values={options.sube} />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
      >
        {pending ? "Kaydediliyor…" : "Kayıt Ol"}
      </button>
    </form>
  );
}

function Select({ label, name, values }: { label: string; name: string; values: string[] }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <select
        id={name}
        name={name}
        required
        defaultValue=""
        className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 focus:border-neutral-500 focus:outline-none"
      >
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
