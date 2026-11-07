export type ActivityType = "cafe" | "billard" | "restaurant" | "autre";

export type TransactionType =
  | ActivityType
  | "bonus"
  | "reward"
  | "visit"
  | "ajustement";

export type Client = {
  id: string;
  name: string;
  phone: string;
  points: number;
  total_spent: number;
  pin: string | null;
  created_at: string;
};

export type Visit = {
  id: string;
  client_id: string;
  activity_type: ActivityType | string;
  notes: string | null;
  created_at: string;
};

export type Transaction = {
  id: string;
  client_id: string;
  amount: number;
  points: number;
  type: TransactionType | string;
  description: string | null;
  created_at: string;
  client_name?: string;
  client_phone?: string;
};

export type Reward = {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  active: boolean;
  created_at: string;
};

export type LoyaltySettings = {
  id: number;
  establishment_name: string;
  tagline: string;
  /** Conservé pour compatibilité DB ; dérivé de dirhams_per_point. */
  points_per_euro: number;
  /** Nombre de dirhams à dépenser pour gagner 1 point (ex. 10). */
  dirhams_per_point: number;
  visit_bonus_points: number;
  admin_pin: string;
};

export type VisitCode = {
  id: string;
  code: string;
  activity_type: string;
  amount: number;
  label: string;
  used: boolean;
  used_by: string | null;
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
};

export type DashboardStats = {
  clientCount: number;
  visitsToday: number;
  visitsWeek: number;
  visitsMonth: number;
  revenueTotal: number;
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  pointsDistributed: number;
};

export const ACTIVITY_LABELS: Record<string, string> = {
  cafe: "Café",
  billard: "Billard",
  restaurant: "Restaurant",
  autre: "Autre",
  bonus: "Bonus",
  reward: "Récompense",
  visit: "Visite",
  ajustement: "Ajustement",
};
