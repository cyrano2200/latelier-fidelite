ALTER TABLE loyalty_settings
  ADD COLUMN IF NOT EXISTS dirhams_per_point NUMERIC(8, 2) NOT NULL DEFAULT 10;

UPDATE loyalty_settings
SET
  dirhams_per_point = 10,
  points_per_euro = 0.1
WHERE id = 1;
