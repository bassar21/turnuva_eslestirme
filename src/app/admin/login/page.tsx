import { LoginForm } from "@/components/LoginForm";
import { loginAdmin } from "@/app/actions/auth";

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <LoginForm action={loginAdmin} title="Turnuva Admin Girişi" subtitle="Satranç veya Mangala admini" />
    </main>
  );
}
