import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings, formatMoney } from "@/lib/settings";
import { CheckoutForm } from "@/components/checkout-form";

export default async function PaymentLinkCheckoutPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const [link, settings] = await Promise.all([
    prisma.paymentLink.findUnique({ where: { code } }),
    getSettings(),
  ]);

  if (!link || !link.active) notFound();
  if (link.expiresAt && link.expiresAt < new Date()) notFound();
  if (link.singleUse && link.usedAt) notFound();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <CheckoutForm
        title={link.description}
        amountLabel={formatMoney(link.amountCents, settings.currency)}
        paymentLinkId={link.id}
        primaryColor={settings.primaryColor}
        logoUrl={settings.logoUrl}
        companyName={settings.companyName}
      />
    </div>
  );
}
