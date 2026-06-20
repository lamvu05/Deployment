-- ============================================================
-- Full Schema Migration
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(20) NOT NULL DEFAULT 'user',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Services (phòng / dịch vụ có thể đặt) ───────────────────
CREATE TABLE IF NOT EXISTS services (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             VARCHAR(100) NOT NULL,
  description      TEXT,
  duration_minutes INT NOT NULL DEFAULT 60,
  price            NUMERIC(12,2) NOT NULL DEFAULT 0,
  capacity         INT NOT NULL DEFAULT 1,
  location         VARCHAR(200),
  image_url        VARCHAR(500),
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Bookings ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id   UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'pending' | 'confirmed' | 'cancelled'
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_time_order CHECK (end_time > start_time),
  CONSTRAINT chk_status     CHECK (status IN ('pending','confirmed','cancelled'))
);

-- ── Auto update_at trigger function ──────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
    CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_services_updated_at') THEN
    CREATE TRIGGER trg_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_bookings_updated_at') THEN
    CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email        ON users(email);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id   ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date      ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status    ON bookings(status);

-- ── Seed: demo services ───────────────────────────────────────
INSERT INTO services (name, description, duration_minutes, price, capacity, location)
VALUES
  ('Phòng họp A', 'Phòng họp nhỏ, tối đa 8 người, có máy chiếu', 60, 150000, 8, 'Tầng 2'),
  ('Phòng họp B', 'Phòng họp lớn, tối đa 20 người, có màn hình TV', 60, 300000, 20, 'Tầng 3'),
  ('Phòng đào tạo', 'Phòng đào tạo với bảng trắng và máy chiếu kép', 120, 500000, 30, 'Tầng 4'),
  ('Tư vấn 1-1', 'Buổi tư vấn cá nhân với chuyên gia', 30, 200000, 1, 'Văn phòng 101'),
  ('Workshop', 'Không gian workshop sáng tạo, thoải mái', 180, 800000, 15, 'Khu A')
ON CONFLICT DO NOTHING;
