import { readdir, readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
let pool: pg.Pool | undefined;

type GlobalDb = typeof globalThis & {
  __fidelioPglite?: Promise<PGlite>;
};

export async function sql<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (databaseUrl !== "") {
    pool ??= new pg.Pool({ connectionString: databaseUrl, max: 5 });
    return (await pool.query(text, params)).rows as T[];
  }
  const g = globalThis as GlobalDb;
  g.__fidelioPglite ??= startLocal().catch((error: unknown) => {
    g.__fidelioPglite = undefined;
    throw error;
  });
  return (await (await g.__fidelioPglite).query<T>(text, params)).rows;
}

async function startLocal(): Promise<PGlite> {
  const dataDir = path.join(process.cwd(), ".data", "pglite");
  await mkdir(dataDir, { recursive: true });
  const db = new PGlite(dataDir);

  const migrationsDir = path.join(process.cwd(), "migrations");
  const files = (await readdir(migrationsDir).catch(() => []))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  const done = new Set(
    (
      await db.query<{ name: string }>("SELECT name FROM schema_migrations")
    ).rows.map((r) => r.name),
  );

  for (const file of files.filter((f) => !done.has(f))) {
    await db.exec(await readFile(path.join(migrationsDir, file), "utf8"));
    await db.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
  }

  await seedIfEmpty(db);
  return db;
}

async function seedIfEmpty(db: PGlite) {
  const existing = await db.query<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM rewards",
  );
  if ((existing.rows[0]?.count ?? 0) > 0) {
    // Ensure demo codes exist even if rewards were seeded by SQL migration only
    const codes = await db.query<{ count: number }>(
      "SELECT COUNT(*)::int AS count FROM visit_codes",
    );
    if ((codes.rows[0]?.count ?? 0) === 0) {
      await seedDemoExtras(db);
    }
    return;
  }

  const rewards = [
    ["rw-cafe", "Café offert", "Un espresso ou un café crème offert", 100],
    ["rw-dessert", "Dessert du jour", "Un dessert au choix de la carte", 180],
    ["rw-billard", "1 h de billard", "Une heure de table offerte", 300],
    ["rw-menu", "Menu du jour", "Entrée + plat ou plat + dessert", 450],
  ] as const;

  for (const [id, name, description, cost] of rewards) {
    await db.query(
      `INSERT INTO rewards (id, name, description, points_cost)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING`,
      [id, name, description, cost],
    );
  }

  await seedDemoExtras(db);
}

async function seedDemoExtras(db: PGlite) {
  const demoClients = [
    ["cl-demo-1", "Sara Benali", "0612345678", 145, 82.5],
    ["cl-demo-2", "Youssef Amrani", "0698765432", 320, 210],
    ["cl-demo-3", "Inès Kadiri", "0661122334", 75, 42],
  ] as const;

  for (const [id, name, phone, points, spent] of demoClients) {
    await db.query(
      `INSERT INTO clients (id, name, phone, points, total_spent)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (phone) DO NOTHING`,
      [id, name, phone, points, spent],
    );
  }

  await db.exec(`
    INSERT INTO visits (id, client_id, activity_type, notes, created_at)
    SELECT 'v1', 'cl-demo-1', 'cafe', 'Espresso + croissant', NOW() - INTERVAL '2 days'
    WHERE EXISTS (SELECT 1 FROM clients WHERE id = 'cl-demo-1')
      AND NOT EXISTS (SELECT 1 FROM visits WHERE id = 'v1');
    INSERT INTO visits (id, client_id, activity_type, notes, created_at)
    SELECT 'v2', 'cl-demo-1', 'billard', 'Partie entre amis', NOW() - INTERVAL '1 day'
    WHERE EXISTS (SELECT 1 FROM clients WHERE id = 'cl-demo-1')
      AND NOT EXISTS (SELECT 1 FROM visits WHERE id = 'v2');
    INSERT INTO visits (id, client_id, activity_type, notes, created_at)
    SELECT 'v3', 'cl-demo-2', 'restaurant', 'Dîner', NOW() - INTERVAL '5 hours'
    WHERE EXISTS (SELECT 1 FROM clients WHERE id = 'cl-demo-2')
      AND NOT EXISTS (SELECT 1 FROM visits WHERE id = 'v3');
    INSERT INTO visits (id, client_id, activity_type, notes, created_at)
    SELECT 'v4', 'cl-demo-3', 'cafe', 'Thé à la menthe', NOW() - INTERVAL '3 days'
    WHERE EXISTS (SELECT 1 FROM clients WHERE id = 'cl-demo-3')
      AND NOT EXISTS (SELECT 1 FROM visits WHERE id = 'v4');
  `);

  await db.exec(`
    INSERT INTO transactions (id, client_id, amount, points, type, description, created_at)
    SELECT 't1', 'cl-demo-1', 12.5, 18, 'cafe', 'Café + viennoiserie', NOW() - INTERVAL '2 days'
    WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE id = 't1');
    INSERT INTO transactions (id, client_id, amount, points, type, description, created_at)
    SELECT 't2', 'cl-demo-1', 20, 25, 'billard', '1h billard', NOW() - INTERVAL '1 day'
    WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE id = 't2');
    INSERT INTO transactions (id, client_id, amount, points, type, description, created_at)
    SELECT 't3', 'cl-demo-2', 65, 70, 'restaurant', 'Menu du soir', NOW() - INTERVAL '5 hours'
    WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE id = 't3');
    INSERT INTO transactions (id, client_id, amount, points, type, description, created_at)
    SELECT 't4', 'cl-demo-2', 0, 50, 'bonus', 'Bonus anniversaire', NOW() - INTERVAL '10 days'
    WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE id = 't4');
    INSERT INTO transactions (id, client_id, amount, points, type, description, created_at)
    SELECT 't5', 'cl-demo-3', 8, 13, 'cafe', 'Boisson chaude', NOW() - INTERVAL '3 days'
    WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE id = 't5');
  `);

  await db.exec(`
    INSERT INTO visit_codes (id, code, activity_type, amount, label, expires_at)
    SELECT 'code-1', 'CAFE10', 'cafe', 10, 'Consommation café 10 DH', NOW() + INTERVAL '30 days'
    WHERE NOT EXISTS (SELECT 1 FROM visit_codes WHERE code = 'CAFE10');
    INSERT INTO visit_codes (id, code, activity_type, amount, label, expires_at)
    SELECT 'code-2', 'BILL20', 'billard', 20, '1h de billard', NOW() + INTERVAL '30 days'
    WHERE NOT EXISTS (SELECT 1 FROM visit_codes WHERE code = 'BILL20');
    INSERT INTO visit_codes (id, code, activity_type, amount, label, expires_at)
    SELECT 'code-3', 'VISITE', 'autre', 0, 'Validation de visite', NOW() + INTERVAL '30 days'
    WHERE NOT EXISTS (SELECT 1 FROM visit_codes WHERE code = 'VISITE');
  `);
}

export function newId(prefix = "id"): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}
