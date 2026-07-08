import { prisma } from "@/lib/prisma";
import { getSettings, formatMoney } from "@/lib/settings";
import { NewProductForm } from "./new-product-form";
import { ProductRow } from "./product-row";

export default async function AdminProductsPage() {
  const [products, settings] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
    getSettings(),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Produtos</h1>
      <NewProductForm />

      <div className="glass-panel overflow-hidden max-w-2xl">
        {products.length === 0 ? (
          <div className="p-5 text-sm" style={{ color: "var(--text-tertiary)" }}>
            Nenhum produto cadastrado ainda.
          </div>
        ) : (
          products.map((product) => (
            <ProductRow
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                priceLabel: formatMoney(product.priceCents, settings.currency),
                active: product.active,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
