import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings, formatMoney } from "@/lib/settings";
import { CheckoutForm } from "@/components/checkout-form";

export default async function ProductCheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [product, settings] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    getSettings(),
  ]);

  if (!product || !product.active) notFound();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <CheckoutForm
        title={product.name}
        amountLabel={formatMoney(product.priceCents, settings.currency)}
        productId={product.id}
        primaryColor={settings.primaryColor}
        logoUrl={settings.logoUrl}
        companyName={settings.companyName}
      />
    </div>
  );
}
