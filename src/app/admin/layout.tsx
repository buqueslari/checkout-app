import Link from "next/link";
import { requireAdmin, logoutAction } from "@/app/actions/auth";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/settings", label: "Configurações" },
  { href: "/admin/products", label: "Produtos" },
  { href: "/admin/links", label: "Links avulsos" },
  { href: "/admin/orders", label: "Pedidos" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen flex">
      <aside
        className="w-56 shrink-0 p-5 flex flex-col gap-1"
        style={{ borderRight: "1px solid var(--border)" }}
      >
        <div className="text-sm font-semibold mb-4">Checkout admin</div>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm px-3 py-2 rounded-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            {item.label}
          </Link>
        ))}
        <div className="flex-1" />
        <div className="text-xs mb-2" style={{ color: "var(--text-tertiary)" }}>
          {session.name}
        </div>
        <form action={logoutAction}>
          <button type="submit" className="btn btn-secondary text-xs w-full justify-center">
            Sair
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
