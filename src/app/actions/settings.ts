"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/app/actions/auth";

export async function updateSettings(formData: FormData) {
  await requireAdmin();

  const companyName = String(formData.get("companyName") ?? "").trim();
  const logoUrl = String(formData.get("logoUrl") ?? "").trim();
  const primaryColor = String(formData.get("primaryColor") ?? "").trim();
  const fontFamily = String(formData.get("fontFamily") ?? "").trim();
  const supportEmail = String(formData.get("supportEmail") ?? "").trim();
  const currency = String(formData.get("currency") ?? "").trim();

  await prisma.settings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      companyName: companyName || undefined,
      logoUrl: logoUrl || null,
      primaryColor: primaryColor || undefined,
      fontFamily: fontFamily || undefined,
      supportEmail: supportEmail || null,
      currency: currency || undefined,
    },
    update: {
      companyName: companyName || undefined,
      logoUrl: logoUrl || null,
      primaryColor: primaryColor || undefined,
      fontFamily: fontFamily || undefined,
      supportEmail: supportEmail || null,
      currency: currency || undefined,
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/checkout", "layout");
  revalidatePath("/pagar", "layout");
}
