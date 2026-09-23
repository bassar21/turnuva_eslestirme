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
    <nav className="flex flex-wrap gap-2 border-b border-neutral-200 pb-4">
      {TABS.map((tab) => (
        <Link
          key={tab.id}
          href={`/superadmin?tab=${tab.id}`}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            current === tab.id
              ? "bg-neutral-900 text-white"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
