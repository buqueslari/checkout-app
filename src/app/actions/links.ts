"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/app/actions/auth";

function randomCode() {
  return Math.random().toString(36).slice(2, 10);
}

export async function createPaymentLink(formData: FormData) {
  await requireAdmin();

  const description = String(formData.get("description") ?? "").trim();
  const amountReais = Number(formData.get("amount") ?? 0);
  const singleUse = formData.get("singleUse") === "on";
  const expiresAtRaw = String(formData.get("expiresAt") ?? "").trim();

  if (!description || !amountReais) return;

  let code = randomCode();
  while (await prisma.paymentLink.findUnique({ where: { code } })) {
    code = randomCode();
  }

  await prisma.paymentLink.create({
    data: {
      code,
      description,
      amountCents: Math.round(amountReais * 100),
      singleUse,
      expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
    },
  });

  revalidatePath("/admin/links");
}

export async function toggleLinkActive(linkId: string) {
  await requireAdmin();
  const link = await prisma.paymentLink.findUnique({ where: { id: linkId } });
  if (!link) return;
  await prisma.paymentLink.update({ where: { id: linkId }, data: { active: !link.active } });
  revalidatePath("/admin/links");
}

export async function deleteLink(linkId: string) {
  await requireAdmin();
  await prisma.paymentLink.delete({ where: { id: linkId } }).catch(() => {});
  revalidatePath("/admin/links");
}
