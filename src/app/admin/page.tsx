import { prisma } from "@/lib/prisma";
import { getSettings, formatMoney } from "@/lib/settings";

export default async function AdminDashboardPage() {
  const settings = await getSettings();
  const [orderCount, approvedSum, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { amountCents: true }, where: { status: "APPROVED" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 mb-8 max-w-lg">
        <div className="glass-panel p-5">
          <div className="text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>
            Pedidos
          </div>
          <div className="text-2xl font-semibold">{orderCount}</div>
        </div>
        <div className="glass-panel p-5">
          <div className="text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>
            Total aprovado
          </div>
          <div className="text-2xl font-semibold">
            {formatMoney(approvedSum._sum.amountCents ?? 0, settings.currency)}
          </div>
        </div>
      </div>

      <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
        Últimos pedidos
      </h2>
      <div className="glass-panel overflow-hidden">
        {recentOrders.length === 0 ? (
          <div className="p-5 text-sm" style={{ color: "var(--text-tertiary)" }}>
            Nenhum pedido ainda.
          </div>
        ) : (
          recentOrders.map((order) => (
            <div key={order.id} className="table-row p-4 flex justify-between text-sm">
              <div>
                <div>{order.customerName}</div>
                <div style={{ color: "var(--text-tertiary)" }}>
                  {order.cardBrand} •••• {order.cardLast4}
                </div>
              </div>
              <div className="text-right">
                <div>{formatMoney(order.amountCents, settings.currency)}</div>
                <div style={{ color: order.status === "APPROVED" ? "var(--green)" : "var(--red)" }}>
                  {order.status}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
