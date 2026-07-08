"use client";

import { useRef } from "react";
import { createPaymentLink } from "@/app/actions/links";

export function NewLinkForm() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createPaymentLink(formData);
        formRef.current?.reset();
      }}
      className="glass-panel p-5 flex flex-col gap-3 max-w-md mb-6"
    >
      <div className="flex flex-col gap-1.5">
        <label className="field-label">Descrição</label>
        <input className="input" name="description" placeholder="Cobrança avulsa — sinal do pedido" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="field-label">Valor (R$)</label>
        <input className="input" name="amount" type="number" step="0.01" min="0" placeholder="150.00" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="field-label">Expira em (opcional)</label>
        <input className="input" name="expiresAt" type="date" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="singleUse" defaultChecked />
        Uso único (expira depois do primeiro pagamento)
      </label>
      <button className="btn btn-primary justify-center" type="submit">
        Gerar link
      </button>
    </form>
  );
}
