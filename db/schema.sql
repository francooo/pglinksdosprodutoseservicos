-- Andrews Franco · Links — esquema do banco (Neon Postgres)
-- Idempotente: pode rodar de novo sem perder dados (npm run db:migrate).

CREATE TABLE IF NOT EXISTS admins (
  id            serial PRIMARY KEY,
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id    bigserial PRIMARY KEY,
  email text NOT NULL,
  ok    boolean NOT NULL,
  ts    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS login_attempts_email_ts ON login_attempts (email, ts);

CREATE TABLE IF NOT EXISTS links (
  id          text PRIMARY KEY,
  title       text NOT NULL,
  description text NOT NULL DEFAULT '',
  url         text NOT NULL,
  category    text NOT NULL CHECK (category IN ('negocios','cursos','conteudo','lojas')),
  icon        text NOT NULL,
  tag         text,
  position    integer NOT NULL DEFAULT 0,
  visible     boolean NOT NULL DEFAULT true,
  footer      text CHECK (footer IN ('canais','lojas')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id            bigserial PRIMARY KEY,
  ts            timestamptz NOT NULL DEFAULT now(),
  type          text NOT NULL CHECK (type IN ('pageview','click','story_open','story_view','story_cta')),
  link_id       text,
  category      text,
  story_index   smallint,
  visitor_id    uuid NOT NULL,
  session_id    uuid NOT NULL,
  source        text,
  referrer_host text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  device        text,
  browser       text,
  os            text,
  country       text,
  region        text,
  city          text
);
CREATE INDEX IF NOT EXISTS events_ts         ON events (ts);
CREATE INDEX IF NOT EXISTS events_type_ts    ON events (type, ts);
CREATE INDEX IF NOT EXISTS events_link_ts    ON events (link_id, ts);
CREATE INDEX IF NOT EXISTS events_visitor_ts ON events (visitor_id, ts);
