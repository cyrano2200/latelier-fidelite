CREATE TABLE IF NOT EXISTS loyalty_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  establishment_name TEXT NOT NULL DEFAULT 'L''Atelier',
  tagline TEXT NOT NULL DEFAULT 'Café · Billard · Restaurant',
  points_per_euro NUMERIC(8, 2) NOT NULL DEFAULT 1,
  visit_bonus_points INTEGER NOT NULL DEFAULT 5,
  admin_pin TEXT NOT NULL DEFAULT '2468'
);

INSERT INTO loyalty_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  points INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC(12, 2) NOT NULL DEFAULT 0,
  pin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS clients_name_idx ON clients (LOWER(name));
CREATE INDEX IF NOT EXISTS clients_phone_idx ON clients (phone);

CREATE TABLE IF NOT EXISTS visits (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients (id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL DEFAULT 'autre',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS visits_client_idx ON visits (client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS visits_created_idx ON visits (created_at DESC);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients (id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS transactions_client_idx ON transactions (client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_created_idx ON transactions (created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON transactions (type);

CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  points_cost INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reward_redemptions (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients (id) ON DELETE CASCADE,
  reward_id TEXT NOT NULL REFERENCES rewards (id),
  points_spent INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visit_codes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  activity_type TEXT NOT NULL DEFAULT 'autre',
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  label TEXT NOT NULL DEFAULT '',
  used BOOLEAN NOT NULL DEFAULT FALSE,
  used_by TEXT REFERENCES clients (id),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS visit_codes_code_idx ON visit_codes (code);

INSERT INTO rewards (id, name, description, points_cost)
VALUES
  ('rw-cafe', 'Café offert', 'Un espresso ou un café crème offert', 100),
  ('rw-dessert', 'Dessert du jour', 'Un dessert au choix de la carte', 180),
  ('rw-billard', '1 h de billard', 'Une heure de table offerte', 300),
  ('rw-menu', 'Menu du jour', 'Entrée + plat ou plat + dessert', 450)
ON CONFLICT (id) DO NOTHING;
