import { prisma } from "@/lib/prisma";
import { getSettings, formatMoney } from "@/lib/settings";

export default async function AdminOrdersPage() {
  const [orders, settings] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: true, paymentLink: true },
      take: 100,
    }),
    getSettings(),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Pedidos</h1>
      <div className="glass-panel overflow-hidden max-w-3xl">
        {orders.length === 0 ? (
          <div className="p-5 text-sm" style={{ color: "var(--text-tertiary)" }}>
            Nenhum pedido ainda.
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="table-row p-4 flex items-center justify-between text-sm gap-3">
              <div>
                <div className="font-medium">{order.customerName}</div>
                <div style={{ color: "var(--text-tertiary)" }}>
                  {order.product?.name ?? order.paymentLink?.description ?? "—"} · {order.cardBrand} •••• {order.cardLast4}
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
