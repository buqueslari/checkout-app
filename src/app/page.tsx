import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-panel p-8 max-w-md w-full text-center">
        <h1 className="text-xl font-semibold mb-2">Checkout</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Esse é o backend do checkout por link. Acesse o painel admin pra
          cadastrar produtos e gerar links de cobrança.
        </p>
        <Link href="/login" className="btn btn-primary justify-center w-full">
          Entrar no admin
        </Link>
      </div>
    </div>
  );
}
