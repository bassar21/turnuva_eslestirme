// Kullanım: npm run db:init
// db/schema.sql ve db/seed.sql dosyalarını sırayla uygular. Idempotent'tir,
// birden çok kez çalıştırılabilir.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadEnvFile() {
  // Next.js dışı bir betik olduğundan .env dosyasını elle okuyoruz.
  try {
    const envPath = path.join(__dirname, "..", ".env");
    const content = await readFile(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // .env yoksa ortam değişkenlerinin zaten ayarlı olduğu varsayılır.
  }
}

async function main() {
  await loadEnvFile();

  if (!process.env.DATABASE_URL) {
    console.error("HATA: DATABASE_URL tanımlı değil. .env dosyanızı kontrol edin.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const schema = await readFile(path.join(__dirname, "..", "db", "schema.sql"), "utf8");
    const seed = await readFile(path.join(__dirname, "..", "db", "seed.sql"), "utf8");

    console.log("Şema uygulanıyor...");
    await pool.query(schema);
    console.log("Başlangıç verisi yükleniyor...");
    await pool.query(seed);

    console.log("Veritabanı hazır.");
  } catch (err) {
    console.error("Veritabanı kurulumu başarısız:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
