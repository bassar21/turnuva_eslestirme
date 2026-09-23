export function ActionButton({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "danger" | "muted";
}) {
  const styles = {
    primary: "bg-slate-900 text-white shadow-sm hover:bg-slate-800",
    danger: "bg-red-600 text-white shadow-sm hover:bg-red-500",
    muted: "bg-slate-100 text-slate-600 hover:bg-slate-200",
  }[variant];

  return (
    <button
      type="submit"
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${styles}`}
    >
      {children}
    </button>
  );
}
