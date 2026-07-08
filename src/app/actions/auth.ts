"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession, destroySession, getSession } from "@/lib/session";

export type LoginState = { error?: string };

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Preenche e-mail e senha." };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    return { error: "E-mail ou senha inválidos." };
  }

  const ok = await verifyPassword(password, admin.passwordHash);
  if (!ok) {
    return { error: "E-mail ou senha inválidos." };
  }

  await createSession({ adminId: admin.id, name: admin.name });
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
