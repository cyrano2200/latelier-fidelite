import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
let pool: pg.Pool | undefined;
let local: Promise<PGlite> | undefined;

export async function sql<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (databaseUrl !== "") {
    pool ??= new pg.Pool({ connectionString: databaseUrl, max: 5 });
    return (await pool.query(text, params)).rows as T[];
  }
  local ??= startLocal().catch((error: unknown) => {
    local = undefined;
    throw error;
  });
  return (await (await local).query<T>(text, params)).rows;
}

async function startLocal(): Promise<PGlite> {
  const db = new PGlite();
  const migrationsDir = path.join(process.cwd(), "migrations");
  const files = (await readdir(migrationsDir).catch(() => []))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    await db.exec(await readFile(path.join(migrationsDir, file), "utf8"));
  }
  await seedIfEmpty(db);
  return db;
}

async function seedIfEmpty(db: PGlite) {
  const existing = await db.query<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM rewards",
  );
  if ((existing.rows[0]?.count ?? 0) > 0) return;

  const rewards = [
    ["rw-cafe", "Café offert", "Un espresso ou un café crème offert", 100],
    ["rw-dessert", "Dessert du jour", "Un dessert au choix de la carte", 180],
    ["rw-billard", "1 h de billard", "Une heure de table offerte", 300],
    ["rw-menu", "Menu du jour", "Entrée + plat ou plat + dessert", 450],
  ] as const;

  for (const [id, name, description, cost] of rewards) {
    await db.query(
      `INSERT INTO rewards (id, name, description, points_cost)
       VALUES ($1, $2, $3, $4)`,
      [id, name, description, cost],
    );
  }

  const demoClients = [
    ["cl-demo-1", "Sara Benali", "0612345678", 145, 82.5],
    ["cl-demo-2", "Youssef Amrani", "0698765432", 320, 210],
    ["cl-demo-3", "Inès Kadiri", "0661122334", 75, 42],
  ] as const;

  for (const [id, name, phone, points, spent] of demoClients) {
    await db.query(
      `INSERT INTO clients (id, name, phone, points, total_spent)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, name, phone, points, spent],
    );
  }

  await db.query(
    `INSERT INTO visits (id, client_id, activity_type, notes, created_at)
     VALUES
       ('v1', 'cl-demo-1', 'cafe', 'Espresso + croissant', NOW() - INTERVAL '2 days'),
       ('v2', 'cl-demo-1', 'billard', 'Partie entre amis', NOW() - INTERVAL '1 day'),
       ('v3', 'cl-demo-2', 'restaurant', 'Dîner', NOW() - INTERVAL '5 hours'),
       ('v4', 'cl-demo-3', 'cafe', 'Thé à la menthe', NOW() - INTERVAL '3 days')`,
  );

  await db.query(
    `INSERT INTO transactions (id, client_id, amount, points, type, description, created_at)
     VALUES
       ('t1', 'cl-demo-1', 12.5, 18, 'cafe', 'Café + viennoiserie', NOW() - INTERVAL '2 days'),
       ('t2', 'cl-demo-1', 20, 25, 'billard', '1h billard', NOW() - INTERVAL '1 day'),
       ('t3', 'cl-demo-2', 65, 70, 'restaurant', 'Menu du soir', NOW() - INTERVAL '5 hours'),
       ('t4', 'cl-demo-2', 0, 50, 'bonus', 'Bonus anniversaire', NOW() - INTERVAL '10 days'),
       ('t5', 'cl-demo-3', 8, 13, 'cafe', 'Boisson chaude', NOW() - INTERVAL '3 days')`,
  );

  await db.query(
    `INSERT INTO visit_codes (id, code, activity_type, amount, label, expires_at)
     VALUES
       ('code-1', 'CAFE10', 'cafe', 10, 'Consommation café 10€', NOW() + INTERVAL '30 days'),
       ('code-2', 'BILL20', 'billard', 20, '1h de billard', NOW() + INTERVAL '30 days'),
       ('code-3', 'VISITE', 'autre', 0, 'Validation de visite', NOW() + INTERVAL '30 days')`,
  );
}

export function newId(prefix = "id"): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}
