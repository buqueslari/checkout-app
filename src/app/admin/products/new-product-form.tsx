"use client";

import { useRef } from "react";
import { createProduct } from "@/app/actions/products";

export function NewProductForm() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createProduct(formData);
        formRef.current?.reset();
      }}
      className="glass-panel p-5 flex flex-col gap-3 max-w-md mb-6"
    >
      <div className="flex flex-col gap-1.5">
        <label className="field-label">Nome</label>
        <input className="input" name="name" placeholder="Plano Mensal" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="field-label">Descrição (opcional)</label>
        <input className="input" name="description" placeholder="Assinatura mensal" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="field-label">Preço (R$)</label>
        <input className="input" name="price" type="number" step="0.01" min="0" placeholder="19.50" required />
      </div>
      <button className="btn btn-primary justify-center" type="submit">
        Criar produto
      </button>
    </form>
  );
}
