-- =============================================================================
-- V1__init_schema.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Usuários ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(20)  NOT NULL DEFAULT 'USER',
  active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── Serviços monitorados ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  url         VARCHAR(500) NOT NULL,
  description TEXT,
  category    VARCHAR(50)  NOT NULL DEFAULT 'API',
  active      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── Health checks ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_checks (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id    UUID        NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  status        VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN',
  response_time INTEGER,
  status_code   INTEGER,
  error_message TEXT,
  checked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Métricas do sistema ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_metrics (
  id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  cpu_usage        NUMERIC(5,2) DEFAULT 0,
  memory_usage     NUMERIC(5,2) DEFAULT 0,
  memory_total_mb  BIGINT       DEFAULT 0,
  memory_used_mb   BIGINT       DEFAULT 0,
  disk_usage       NUMERIC(5,2) DEFAULT 0,
  disk_total_gb    BIGINT       DEFAULT 0,
  disk_used_gb     BIGINT       DEFAULT 0,
  active_threads   INTEGER      DEFAULT 0,
  recorded_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── Alertas ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id  UUID         REFERENCES services(id) ON DELETE SET NULL,
  severity    VARCHAR(20)  NOT NULL DEFAULT 'INFO',
  title       VARCHAR(200) NOT NULL,
  message     TEXT         NOT NULL,
  resolved    BOOLEAN      NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_health_checks_service_id ON health_checks(service_id);
CREATE INDEX IF NOT EXISTS idx_health_checks_checked_at ON health_checks(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded  ON system_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved          ON alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at        ON alerts(created_at DESC);

-- ─── Seed: admin ──────────────────────────────────────────────────────────────
-- Senha: [altere no banco para ambiente de produção] — hash BCrypt gerado com strength=10
INSERT INTO users (name, email, password, role) VALUES
  ('Administrador', 'admin@monitor.dev',
   '$2b$12$c67oGPNVoyGX6Dy0vaQWxefoe1PYEalBv7VfxGCOubSDdGNJbyREG', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- ─── Seed: serviços de exemplo ────────────────────────────────────────────────
INSERT INTO services (name, url, description, category) VALUES
  ('Google',         'https://www.google.com',          'Verificação de conectividade externa', 'WEB'),
  ('GitHub API',     'https://api.github.com',           'API pública do GitHub',                'API'),
  ('JSONPlaceholder','https://jsonplaceholder.typicode.com', 'API de teste pública',             'API'),
  ('HTTPBin',        'https://httpbin.org/get',          'Serviço de teste HTTP',                'API'),
  ('Cloudflare DNS', 'https://1.1.1.1',                  'DNS público Cloudflare',               'WEB')
ON CONFLICT DO NOTHING;
