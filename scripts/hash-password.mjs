// Kullanım: node scripts/hash-password.mjs "sifreniz"
// Çıktıyı .env dosyasında SUPERADMIN_PASSWORD_HASH olarak veya admin
// oluştururken kullanın. Format src/lib/auth.ts ile birebir uyumludur.

import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error('Kullanım: node scripts/hash-password.mjs "sifreniz"');
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
console.log(`scrypt:${salt.toString("hex")}:${hash.toString("hex")}`);
