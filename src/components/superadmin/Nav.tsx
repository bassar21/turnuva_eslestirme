import Link from "next/link";

const TABS: { id: string; label: string }[] = [
  { id: "genel", label: "Genel Bakış" },
  { id: "katilimcilar", label: "Katılımcılar" },
  { id: "eslestirmeler", label: "Eşleştirmeler" },
  { id: "sonuclar", label: "Sonuçlar" },
  { id: "adminler", label: "Adminler" },
  { id: "listeler", label: "Listeler" },
];

export function Nav({ current }: { current: string }) {
  return (
    <nav className="flex flex-wrap gap-1.5">
      {TABS.map((tab) => (
        <Link
          key={tab.id}
          href={`/superadmin?tab=${tab.id}`}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
            current === tab.id
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
