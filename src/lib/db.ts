import { Pool, type QueryResultRow } from "pg";

// Tüm veritabanı erişimi bu tek Pool üzerinden geçer. Havuz TEMBEL
// (lazy) oluşturulur: `next build` sayfa verisini toplarken bu modülü
// DATABASE_URL olmadan içe aktarabilir; Pool'u modül yüklenirken değil,
// ilk sorguda oluşturmak bu adımın hatasız geçmesini sağlar.
declare global {
  var __turnuvaPgPool: Pool | undefined;
}

function getPool(): Pool {
  if (globalThis.__turnuvaPgPool) return globalThis.__turnuvaPgPool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL tanımlı değil. .env.example dosyasına bakıp .env oluşturun."
    );
  }
  const pool = new Pool({ connectionString });
  globalThis.__turnuvaPgPool = pool;
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  return getPool().query<T>(text, params);
}

/** Birden fazla yazma işlemini tek transaction içinde çalıştırır. */
export async function withTransaction<T>(
  fn: (client: import("pg").PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
