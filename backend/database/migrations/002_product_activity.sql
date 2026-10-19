ALTER TABLE users ADD COLUMN IF NOT EXISTS starting_preference TEXT
  CHECK (starting_preference IN ('search', 'post'));

CREATE TABLE IF NOT EXISTS product_searches (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  keywords VARCHAR(200) NOT NULL,
  category VARCHAR(80) NOT NULL,
  city VARCHAR(100) NOT NULL,
  max_budget NUMERIC(12,2) CHECK (max_budget >= 0),
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 10000),
  product_url TEXT,
  status TEXT NOT NULL DEFAULT 'searching' CHECK (status IN ('searching', 'matched', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS product_searches_owner_idx ON product_searches (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS product_posts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_name VARCHAR(200) NOT NULL,
  category VARCHAR(80) NOT NULL,
  city VARCHAR(100) NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  quantity_needed INTEGER NOT NULL CHECK (quantity_needed BETWEEN 1 AND 10000),
  store_name VARCHAR(120) NOT NULL,
  product_url TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description VARCHAR(2000) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS product_posts_owner_idx ON product_posts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS product_posts_discovery_idx ON product_posts (city, category, expires_at)
  WHERE status = 'open';
