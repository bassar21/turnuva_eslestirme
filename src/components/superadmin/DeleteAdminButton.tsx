"use client";

import { useState } from "react";
import { deleteAdminAction } from "@/app/actions/superadmin";

export function DeleteAdminButton({ adminId, username }: { adminId: number; username: string }) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!confirm(`"${username}" hesabını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }
    setPending(true);
    try {
      await deleteAdminAction(adminId);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-500 disabled:opacity-50"
    >
      Sil
    </button>
  );
}
