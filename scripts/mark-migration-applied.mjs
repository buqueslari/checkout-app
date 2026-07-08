import "dotenv/config";
import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { Client } from "pg";

const MIGRATION_NAME = "20260708000000_init";
const sql = readFileSync(
  new URL(`../prisma/migrations/${MIGRATION_NAME}/migration.sql`, import.meta.url),
  "utf8"
);
const checksum = createHash("sha256").update(sql).digest("hex");

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" VARCHAR(36) PRIMARY KEY,
      "checksum" VARCHAR(64) NOT NULL,
      "finished_at" TIMESTAMPTZ,
      "migration_name" VARCHAR(255) NOT NULL,
      "logs" TEXT,
      "rolled_back_at" TIMESTAMPTZ,
      "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    );
  `);

  const existing = await client.query(
    `SELECT 1 FROM "_prisma_migrations" WHERE migration_name = $1`,
    [MIGRATION_NAME]
  );

  if (existing.rowCount > 0) {
    console.log("Já estava marcada como aplicada, nada a fazer.");
  } else {
    await client.query(
      `INSERT INTO "_prisma_migrations"
        (id, checksum, finished_at, migration_name, started_at, applied_steps_count)
       VALUES ($1, $2, now(), $3, now(), 1)`,
      [randomUUID(), checksum, MIGRATION_NAME]
    );
    console.log("Migration marcada como aplicada em _prisma_migrations.");
  }
} finally {
  await client.end();
}
