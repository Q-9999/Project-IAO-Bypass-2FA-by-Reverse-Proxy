CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,              -- bcrypt hash, never plaintext
  failed_logins INTEGER NOT NULL DEFAULT 0,
  locked_until  INTEGER NOT NULL DEFAULT 0, -- epoch ms
  created_at    INTEGER NOT NULL
);

-- One live code per (purpose, email). Only an HMAC of the code is stored.
CREATE TABLE otps (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  purpose      TEXT NOT NULL CHECK (purpose IN ('register','login','reset')),
  email        TEXT NOT NULL COLLATE NOCASE,
  user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token_hash   TEXT,                        -- login challenge id (hashed)
  code_hash    TEXT NOT NULL,
  expires_at   INTEGER NOT NULL,
  attempts     INTEGER NOT NULL DEFAULT 0,
  used_at      INTEGER,
  last_sent_at INTEGER NOT NULL,
  window_start INTEGER NOT NULL,            -- start of the hourly resend window
  sent_count   INTEGER NOT NULL DEFAULT 1,
  UNIQUE (purpose, email)
);
CREATE INDEX idx_otps_token ON otps(token_hash);

-- created_at doubles as the "logged in at" time shown on the dashboard.
CREATE TABLE sessions (
  id_hash    TEXT PRIMARY KEY,              -- SHA-256 of the cookie value
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  ip         TEXT,
  user_agent TEXT
);
CREATE INDEX idx_sessions_user ON sessions(user_id);
