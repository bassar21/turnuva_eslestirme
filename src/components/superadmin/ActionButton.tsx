export function ActionButton({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "danger" | "muted";
}) {
  const styles = {
    primary: "bg-neutral-900 text-white hover:bg-neutral-700",
    danger: "bg-red-600 text-white hover:bg-red-500",
    muted: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
  }[variant];

  return (
    <button
      type="submit"
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${styles}`}
    >
      {children}
    </button>
  );
}
