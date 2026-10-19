ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ADD COLUMN google_subject TEXT UNIQUE;
ALTER TABLE users ADD COLUMN profile_complete BOOLEAN NOT NULL DEFAULT TRUE;

-- Google supplies verified identity; location details are collected afterwards.
ALTER TABLE users ADD CONSTRAINT users_identity_required
  CHECK (password_hash IS NOT NULL OR google_subject IS NOT NULL);

CREATE TABLE google_login_flows (
  state_hash TEXT PRIMARY KEY,
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX google_login_flows_expiry ON google_login_flows (expires_at);
