-- Okul Turnuva Yönetim Sistemi — veritabanı şeması
-- npm run db:init ile uygulanır (idempotent: IF NOT EXISTS kullanır)

CREATE TABLE IF NOT EXISTS tournaments (
  id                 SERIAL PRIMARY KEY,
  slug               TEXT NOT NULL UNIQUE CHECK (slug IN ('satranc', 'mangala')),
  name               TEXT NOT NULL,
  registration_open  BOOLEAN NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS options (
  id          SERIAL PRIMARY KEY,
  kind        TEXT NOT NULL CHECK (kind IN ('sinif', 'bolum', 'sube')),
  value       TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (kind, value)
);

CREATE TABLE IF NOT EXISTS participants (
  id              SERIAL PRIMARY KEY,
  tournament_id   INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  sinif           TEXT NOT NULL,
  bolum           TEXT NOT NULL,
  sube            TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mükerrer kayıt kontrolü: aynı turnuvada isim + sınıf + şube tekrar edemez
CREATE UNIQUE INDEX IF NOT EXISTS participants_dedupe_idx
  ON participants (tournament_id, lower(btrim(full_name)), sinif, sube);

CREATE TABLE IF NOT EXISTS admins (
  id             SERIAL PRIMARY KEY,
  username       TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  scope          TEXT NOT NULL CHECK (scope IN ('satranc', 'mangala')),
  suspended      BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rounds (
  id             SERIAL PRIMARY KEY,
  tournament_id  INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round_no       INTEGER NOT NULL,
  title          TEXT NOT NULL,
  published      BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, round_no)
);

CREATE TABLE IF NOT EXISTS matches (
  id                  SERIAL PRIMARY KEY,
  round_id            INTEGER NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  match_no            INTEGER NOT NULL,
  p1_name             TEXT NOT NULL,
  p2_name             TEXT,                    -- NULL => BAY (bye)
  p1_participant_id   INTEGER REFERENCES participants(id) ON DELETE SET NULL,
  p2_participant_id   INTEGER REFERENCES participants(id) ON DELETE SET NULL,
  sets_played         INTEGER,
  p1_sets             INTEGER,
  p2_sets             INTEGER,
  winner_name         TEXT,
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'bye')),
  updated_by          TEXT,
  updated_at          TIMESTAMPTZ,
  UNIQUE (round_id, match_no)
);

CREATE INDEX IF NOT EXISTS matches_round_idx ON matches (round_id);
CREATE INDEX IF NOT EXISTS participants_tournament_idx ON participants (tournament_id);
CREATE INDEX IF NOT EXISTS rounds_tournament_idx ON rounds (tournament_id);
CREATE INDEX IF NOT EXISTS admins_scope_idx ON admins (scope);
