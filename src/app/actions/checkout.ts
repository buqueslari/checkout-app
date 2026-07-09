"use server";

import { prisma } from "@/lib/prisma";
import { detectBrand } from "@/lib/card";

export type CheckoutState = {
  error?: string;
  success?: boolean;
  last4?: string;
  brand?: string;
};

// Modo de teste: sempre aprova, não valida formato de cartão (Luhn/validade/
// CVV) e NUNCA grava o número completo ou o CVV em lugar nenhum — só marca +
// últimos 4 dígitos, pra já servir de registro do pedido no admin. Ver
// checkout-app/DEPLOY.md pra como isso muda quando um gateway real entrar.
export async function submitOrder(
  _prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerEmail = String(formData.get("customerEmail") ?? "").trim() || null;
  const cardNumberRaw = String(formData.get("cardNumber") ?? "").replace(/\D/g, "");
  const productId = String(formData.get("productId") ?? "").trim() || null;
  const paymentLinkId = String(formData.get("paymentLinkId") ?? "").trim() || null;

  if (!customerName) return { error: "Preenche o nome do titular." };
  if (!cardNumberRaw) return { error: "Preenche o número do cartão." };

  let amountCents: number;

  if (productId) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.active) return { error: "Produto indisponível." };
    amountCents = product.priceCents;
  } else if (paymentLinkId) {
    const link = await prisma.paymentLink.findUnique({ where: { id: paymentLinkId } });
    if (!link || !link.active) return { error: "Link de pagamento inválido." };
    if (link.expiresAt && link.expiresAt < new Date()) return { error: "Esse link expirou." };
    if (link.singleUse && link.usedAt) return { error: "Esse link já foi utilizado." };
    amountCents = link.amountCents;
  } else {
    return { error: "Link de pagamento inválido." };
  }

  const brand = detectBrand(cardNumberRaw);
  const last4 = cardNumberRaw.slice(-4);

  await prisma.order.create({
    data: {
      kind: productId ? "PRODUCT" : "LINK",
      productId: productId || undefined,
      paymentLinkId: paymentLinkId || undefined,
      amountCents,
      customerName,
      customerEmail,
      cardBrand: brand,
      cardLast4: last4,
      status: "APPROVED",
      gatewayProvider: "TEST",
    },
  });

  if (paymentLinkId) {
    await prisma.paymentLink
      .update({ where: { id: paymentLinkId }, data: { usedAt: new Date() } })
      .catch(() => {});
  }

  return { success: true, last4, brand };
}
