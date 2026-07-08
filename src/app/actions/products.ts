"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/app/actions/auth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceReais = Number(formData.get("price") ?? 0);
  if (!name || !priceReais) return;

  const baseSlug = slugify(name) || "produto";
  let slug = baseSlug;
  let n = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++n}`;
  }

  await prisma.product.create({
    data: {
      name,
      slug,
      description: description || null,
      priceCents: Math.round(priceReais * 100),
    },
  });

  revalidatePath("/admin/products");
}

export async function toggleProductActive(productId: string) {
  await requireAdmin();
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return;
  await prisma.product.update({ where: { id: productId }, data: { active: !product.active } });
  revalidatePath("/admin/products");
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id: productId } }).catch(() => {});
  revalidatePath("/admin/products");
}
