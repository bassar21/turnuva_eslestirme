import { LoginForm } from "@/components/LoginForm";
import { loginSuperadmin } from "@/app/actions/auth";

export default function SuperadminLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <LoginForm action={loginSuperadmin} title="Superadmin Girişi" />
    </main>
  );
}
