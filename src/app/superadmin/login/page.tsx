import { LoginForm } from "@/components/LoginForm";
import { loginSuperadmin } from "@/app/actions/auth";

export default function SuperadminLoginPage() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.12),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(15,23,42,0.06),transparent_45%)]"
      />
      <LoginForm action={loginSuperadmin} title="Superadmin Girişi" />
    </main>
  );
}
