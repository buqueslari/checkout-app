import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-panel p-8 max-w-sm w-full">
        <h1 className="text-lg font-semibold mb-1">Painel admin</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Faça login para gerenciar produtos, links e pedidos.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
