ALTER TABLE users ADD COLUMN is_test_account BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users DROP CONSTRAINT users_identity_required;
ALTER TABLE users ADD CONSTRAINT users_identity_required
  CHECK (password_hash IS NOT NULL OR google_subject IS NOT NULL OR is_test_account);
ALTER TABLE users ADD CONSTRAINT test_accounts_have_no_real_credentials
  CHECK (NOT is_test_account OR (password_hash IS NULL AND google_subject IS NULL AND role = 'USER'));
