"use client";

import { toggleProductActive, deleteProduct } from "@/app/actions/products";
import { CopyLinkButton } from "@/components/copy-link-button";

export function ProductRow({
  product,
}: {
  product: { id: string; name: string; slug: string; priceLabel: string; active: boolean };
}) {
  return (
    <div className="table-row p-4 flex items-center justify-between text-sm gap-3">
      <div>
        <div className="font-medium">{product.name}</div>
        <div style={{ color: "var(--text-tertiary)" }}>
          /checkout/{product.slug} — {product.priceLabel}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <CopyLinkButton path={`/checkout/${product.slug}`} />
        <button
          type="button"
          onClick={() => toggleProductActive(product.id)}
          className="btn btn-secondary text-xs"
        >
          {product.active ? "Desativar" : "Ativar"}
        </button>
        <button
          type="button"
          onClick={() => deleteProduct(product.id)}
          className="btn text-xs"
          style={{ color: "var(--red)" }}
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
