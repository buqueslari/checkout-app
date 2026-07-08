import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function hash(plain: string) {
  return bcrypt.hash(plain, 10);
}

async function main() {
  console.log("Seed: limpando dados existentes...");
  await prisma.order.deleteMany();
  await prisma.paymentLink.deleteMany();
  await prisma.product.deleteMany();
  await prisma.adminUser.deleteMany();

  console.log("Seed: criando usuário admin...");
  await prisma.adminUser.create({
    data: {
      name: "Admin",
      email: "admin@checkout.com",
      passwordHash: await hash("mudaressasenha123"),
    },
  });

  console.log("Seed: configurações padrão...");
  await prisma.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
  });

  console.log("Seed: produto e link de exemplo...");
  await prisma.product.create({
    data: {
      slug: "plano-mensal",
      name: "Plano Mensal",
      description: "Assinatura mensal — cobrança recorrente por link fixo.",
      priceCents: 1950,
    },
  });

  await prisma.paymentLink.create({
    data: {
      code: "demo123",
      description: "Cobrança avulsa de exemplo",
      amountCents: 5000,
    },
  });

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
