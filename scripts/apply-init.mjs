import "dotenv/config";
import { readFileSync } from "node:fs";
import { Client } from "pg";

const sql = readFileSync(
  new URL("../prisma/migrations/20260708000000_init/migration.sql", import.meta.url),
  "utf8"
);

const client = new Client({ connectionString: process.env.DATABASE_URL });

await client.connect();
try {
  await client.query(sql);
  console.log("Migration aplicada com sucesso.");
} finally {
  await client.end();
}
