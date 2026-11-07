import { newId, sql } from "./db";
import type {
  ActivityType,
  Client,
  DashboardStats,
  LoyaltySettings,
  Reward,
  Transaction,
  Visit,
  VisitCode,
} from "./types";

function num(v: unknown): number {
  return Number(v ?? 0);
}

export async function getSettings(): Promise<LoyaltySettings> {
  const rows = await sql<LoyaltySettings>(
    "SELECT * FROM loyalty_settings WHERE id = 1",
  );
  const s = rows[0];
  const dirhamsPerPoint = num(
    (s as LoyaltySettings | undefined)?.dirhams_per_point ?? 10,
  );
  const safeDirhams = dirhamsPerPoint > 0 ? dirhamsPerPoint : 10;
  return {
    id: 1,
    establishment_name: s?.establishment_name ?? "L'Atelier",
    tagline: s?.tagline ?? "Café · Billard · Restaurant",
    dirhams_per_point: safeDirhams,
    points_per_euro: 1 / safeDirhams,
    visit_bonus_points: num(s?.visit_bonus_points ?? 5),
    admin_pin: s?.admin_pin ?? "2468",
  };
}

export async function updateSettings(input: {
  establishment_name: string;
  tagline: string;
  dirhams_per_point: number;
  visit_bonus_points: number;
  admin_pin?: string;
}) {
  const dirhams =
    input.dirhams_per_point > 0 ? input.dirhams_per_point : 10;
  const pointsPerUnit = 1 / dirhams;

  if (input.admin_pin && input.admin_pin.trim().length > 0) {
    await sql(
      `UPDATE loyalty_settings
       SET establishment_name = $1,
           tagline = $2,
           dirhams_per_point = $3,
           points_per_euro = $4,
           visit_bonus_points = $5,
           admin_pin = $6
       WHERE id = 1`,
      [
        input.establishment_name.trim(),
        input.tagline.trim(),
        dirhams,
        pointsPerUnit,
        input.visit_bonus_points,
        input.admin_pin.trim(),
      ],
    );
  } else {
    await sql(
      `UPDATE loyalty_settings
       SET establishment_name = $1,
           tagline = $2,
           dirhams_per_point = $3,
           points_per_euro = $4,
           visit_bonus_points = $5
       WHERE id = 1`,
      [
        input.establishment_name.trim(),
        input.tagline.trim(),
        dirhams,
        pointsPerUnit,
        input.visit_bonus_points,
      ],
    );
  }
  return getSettings();
}

export function computePointsForAmount(
  amount: number,
  settings: LoyaltySettings,
  includeVisitBonus: boolean,
): number {
  const per = settings.dirhams_per_point > 0 ? settings.dirhams_per_point : 10;
  const fromSpend = Math.floor(Number(amount) / per);
  const bonus = includeVisitBonus ? settings.visit_bonus_points : 0;
  return fromSpend + bonus;
}

export async function addConsumption(input: {
  clientId: string;
  amount: number;
  activityType: ActivityType;
  description?: string;
  recordVisit?: boolean;
  includeVisitBonus?: boolean;
}) {
  const settings = await getSettings();
  const includeVisitBonus = input.includeVisitBonus ?? true;
  const points = computePointsForAmount(
    input.amount,
    settings,
    includeVisitBonus && (input.recordVisit ?? true),
  );

  const txId = newId("tx");
  await sql(
    `INSERT INTO transactions (id, client_id, amount, points, type, description)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      txId,
      input.clientId,
      input.amount,
      points,
      input.activityType,
      input.description?.trim() ||
        `Consommation ${input.activityType} — ${input.amount} DH`,
    ],
  );

  if (input.recordVisit ?? true) {
    await sql(
      `INSERT INTO visits (id, client_id, activity_type, notes)
       VALUES ($1, $2, $3, $4)`,
      [
        newId("vis"),
        input.clientId,
        input.activityType,
        input.description?.trim() || null,
      ],
    );
  }

  await sql(
    `UPDATE clients
     SET points = points + $1,
         total_spent = total_spent + $2
     WHERE id = $3`,
    [points, input.amount, input.clientId],
  );

  const client = await getClientById(input.clientId);
  return { points, client, transactionId: txId };
}

export async function addManualPoints(input: {
  clientId: string;
  points: number;
  description: string;
}) {
  const pts = Math.round(input.points);
  await sql(
    `INSERT INTO transactions (id, client_id, amount, points, type, description)
     VALUES ($1, $2, 0, $3, 'bonus', $4)`,
    [
      newId("tx"),
      input.clientId,
      pts,
      input.description.trim() || "Bonus manuel",
    ],
  );
  await sql(`UPDATE clients SET points = points + $1 WHERE id = $2`, [
    pts,
    input.clientId,
  ]);
  return getClientById(input.clientId);
}

export async function addVisitOnly(input: {
  clientId: string;
  activityType: ActivityType;
  notes?: string;
  withBonus?: boolean;
}) {
  const settings = await getSettings();
  const bonus =
    input.withBonus === false ? 0 : settings.visit_bonus_points;

  await sql(
    `INSERT INTO visits (id, client_id, activity_type, notes)
     VALUES ($1, $2, $3, $4)`,
    [
      newId("vis"),
      input.clientId,
      input.activityType,
      input.notes?.trim() || null,
    ],
  );

  if (bonus > 0) {
    await sql(
      `INSERT INTO transactions (id, client_id, amount, points, type, description)
       VALUES ($1, $2, 0, $3, 'visit', $4)`,
      [
        newId("tx"),
        input.clientId,
        bonus,
        `Bonus de visite (+${bonus} pts)`,
      ],
    );
    await sql(`UPDATE clients SET points = points + $1 WHERE id = $2`, [
      bonus,
      input.clientId,
    ]);
  }

  return getClientById(input.clientId);
}

export async function redeemReward(clientId: string, rewardId: string) {
  const rewards = await sql<Reward>(
    "SELECT * FROM rewards WHERE id = $1 AND active = TRUE",
    [rewardId],
  );
  const reward = rewards[0];
  if (!reward) return { error: "Récompense introuvable." as const };

  const client = await getClientById(clientId);
  if (!client) return { error: "Client introuvable." as const };
  if (client.points < reward.points_cost) {
    return { error: "Solde de points insuffisant." as const };
  }

  await sql(
    `INSERT INTO reward_redemptions (id, client_id, reward_id, points_spent)
     VALUES ($1, $2, $3, $4)`,
    [newId("rd"), clientId, rewardId, reward.points_cost],
  );
  await sql(
    `INSERT INTO transactions (id, client_id, amount, points, type, description)
     VALUES ($1, $2, 0, $3, 'reward', $4)`,
    [
      newId("tx"),
      clientId,
      -reward.points_cost,
      `Récompense : ${reward.name}`,
    ],
  );
  await sql(`UPDATE clients SET points = points - $1 WHERE id = $2`, [
    reward.points_cost,
    clientId,
  ]);

  return { client: await getClientById(clientId), reward };
}

export async function redeemVisitCode(clientId: string, rawCode: string) {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { error: "Saisissez un code." as const };

  const rows = await sql<VisitCode>(
    "SELECT * FROM visit_codes WHERE UPPER(code) = $1 LIMIT 1",
    [code],
  );
  const visitCode = rows[0];
  if (!visitCode) return { error: "Code invalide." as const };
  if (visitCode.used) return { error: "Ce code a déjà été utilisé." as const };
  if (visitCode.expires_at && new Date(visitCode.expires_at) < new Date()) {
    return { error: "Ce code a expiré." as const };
  }

  const amount = num(visitCode.amount);
  const activityType = (visitCode.activity_type || "autre") as ActivityType;

  const result = await addConsumption({
    clientId,
    amount,
    activityType,
    description: visitCode.label || `Code ${visitCode.code}`,
    recordVisit: true,
    includeVisitBonus: true,
  });

  await sql(
    `UPDATE visit_codes
     SET used = TRUE, used_by = $1, used_at = NOW()
     WHERE id = $2`,
    [clientId, visitCode.id],
  );

  return { ...result, code: visitCode };
}

export async function createVisitCode(input: {
  code?: string;
  activityType: ActivityType;
  amount: number;
  label: string;
  expiresInDays?: number;
}) {
  const code =
    input.code?.trim().toUpperCase() ||
    `F${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const id = newId("code");
  const days = input.expiresInDays ?? 30;
  const created = await sql<VisitCode>(
    `INSERT INTO visit_codes (id, code, activity_type, amount, label, expires_at)
     VALUES ($1, $2, $3, $4, $5, NOW() + ($6::text || ' days')::interval)
     RETURNING *`,
    [id, code, input.activityType, input.amount, input.label.trim(), String(days)],
  );
  return created[0];
}

export async function getClientById(id: string): Promise<Client | null> {
  const rows = await sql<Client>("SELECT * FROM clients WHERE id = $1", [id]);
  const c = rows[0];
  if (!c) return null;
  return {
    ...c,
    points: num(c.points),
    total_spent: num(c.total_spent),
  };
}

export async function searchClients(query: string): Promise<Client[]> {
  const q = `%${query.trim().toLowerCase()}%`;
  if (!query.trim()) {
    const rows = await sql<Client>(
      "SELECT * FROM clients ORDER BY created_at DESC LIMIT 50",
    );
    return rows.map((c) => ({
      ...c,
      points: num(c.points),
      total_spent: num(c.total_spent),
    }));
  }
  const rows = await sql<Client>(
    `SELECT * FROM clients
     WHERE LOWER(name) LIKE $1 OR phone LIKE $2
     ORDER BY name ASC
     LIMIT 50`,
    [q, `%${query.trim()}%`],
  );
  return rows.map((c) => ({
    ...c,
    points: num(c.points),
    total_spent: num(c.total_spent),
  }));
}

export async function getClientVisits(clientId: string): Promise<Visit[]> {
  return sql<Visit>(
    `SELECT * FROM visits WHERE client_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [clientId],
  );
}

export async function getClientTransactions(
  clientId: string,
): Promise<Transaction[]> {
  const rows = await sql<Transaction>(
    `SELECT * FROM transactions WHERE client_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [clientId],
  );
  return rows.map((t) => ({
    ...t,
    amount: num(t.amount),
    points: num(t.points),
  }));
}

export async function getActiveRewards(): Promise<Reward[]> {
  const rows = await sql<Reward>(
    "SELECT * FROM rewards WHERE active = TRUE ORDER BY points_cost ASC",
  );
  return rows.map((r) => ({ ...r, points_cost: num(r.points_cost) }));
}

export async function getAllRewards(): Promise<Reward[]> {
  const rows = await sql<Reward>(
    "SELECT * FROM rewards ORDER BY points_cost ASC",
  );
  return rows.map((r) => ({ ...r, points_cost: num(r.points_cost) }));
}

export async function upsertReward(input: {
  id?: string;
  name: string;
  description: string;
  points_cost: number;
  active?: boolean;
}) {
  if (input.id) {
    await sql(
      `UPDATE rewards
       SET name = $1, description = $2, points_cost = $3, active = $4
       WHERE id = $5`,
      [
        input.name.trim(),
        input.description.trim(),
        input.points_cost,
        input.active ?? true,
        input.id,
      ],
    );
    return input.id;
  }
  const id = newId("rw");
  await sql(
    `INSERT INTO rewards (id, name, description, points_cost, active)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      id,
      input.name.trim(),
      input.description.trim(),
      input.points_cost,
      input.active ?? true,
    ],
  );
  return id;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [clients] = await sql<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM clients",
  );
  const [vToday] = await sql<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM visits
     WHERE created_at >= date_trunc('day', NOW())`,
  );
  const [vWeek] = await sql<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM visits
     WHERE created_at >= date_trunc('week', NOW())`,
  );
  const [vMonth] = await sql<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM visits
     WHERE created_at >= date_trunc('month', NOW())`,
  );
  const [rTotal] = await sql<{ sum: number }>(
    `SELECT COALESCE(SUM(amount), 0) AS sum FROM transactions WHERE amount > 0`,
  );
  const [rToday] = await sql<{ sum: number }>(
    `SELECT COALESCE(SUM(amount), 0) AS sum FROM transactions
     WHERE amount > 0 AND created_at >= date_trunc('day', NOW())`,
  );
  const [rWeek] = await sql<{ sum: number }>(
    `SELECT COALESCE(SUM(amount), 0) AS sum FROM transactions
     WHERE amount > 0 AND created_at >= date_trunc('week', NOW())`,
  );
  const [rMonth] = await sql<{ sum: number }>(
    `SELECT COALESCE(SUM(amount), 0) AS sum FROM transactions
     WHERE amount > 0 AND created_at >= date_trunc('month', NOW())`,
  );
  const [pts] = await sql<{ sum: number }>(
    `SELECT COALESCE(SUM(points), 0) AS sum FROM transactions WHERE points > 0`,
  );

  return {
    clientCount: num(clients?.count),
    visitsToday: num(vToday?.count),
    visitsWeek: num(vWeek?.count),
    visitsMonth: num(vMonth?.count),
    revenueTotal: num(rTotal?.sum),
    revenueToday: num(rToday?.sum),
    revenueWeek: num(rWeek?.sum),
    revenueMonth: num(rMonth?.sum),
    pointsDistributed: num(pts?.sum),
  };
}

export async function getTopClients(
  by: "points" | "spent" = "points",
  limit = 5,
): Promise<Client[]> {
  const order = by === "spent" ? "total_spent DESC" : "points DESC";
  const rows = await sql<Client>(
    `SELECT * FROM clients ORDER BY ${order} LIMIT $1`,
    [limit],
  );
  return rows.map((c) => ({
    ...c,
    points: num(c.points),
    total_spent: num(c.total_spent),
  }));
}

export async function getRecentTransactions(
  limit = 40,
): Promise<Transaction[]> {
  const rows = await sql<Transaction>(
    `SELECT t.*, c.name AS client_name, c.phone AS client_phone
     FROM transactions t
     JOIN clients c ON c.id = t.client_id
     ORDER BY t.created_at DESC
     LIMIT $1`,
    [limit],
  );
  return rows.map((t) => ({
    ...t,
    amount: num(t.amount),
    points: num(t.points),
  }));
}

export async function getActiveVisitCodes(): Promise<VisitCode[]> {
  const rows = await sql<VisitCode>(
    `SELECT * FROM visit_codes
     WHERE used = FALSE AND (expires_at IS NULL OR expires_at > NOW())
     ORDER BY created_at DESC
     LIMIT 30`,
  );
  return rows.map((c) => ({ ...c, amount: num(c.amount) }));
}
