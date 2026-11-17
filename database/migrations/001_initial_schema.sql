-- DesignHub demo schema. All data loaded into it is fictional.
-- IDs are short readable strings (pr-101, cl-01) to match the frontend demo data.

CREATE TABLE IF NOT EXISTS clients (
  id              TEXT PRIMARY KEY,
  company_name    TEXT NOT NULL,
  contact_person  TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT NOT NULL DEFAULT '',
  industry        TEXT NOT NULL,
  website         TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL CHECK (status IN ('active', 'onboarding', 'inactive')),
  client_since    DATE NOT NULL DEFAULT CURRENT_DATE,
  notes           TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS team_members (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  role            TEXT NOT NULL,
  department      TEXT NOT NULL CHECK (department IN ('Design', 'Engineering', 'Delivery')),
  availability    TEXT NOT NULL CHECK (availability IN ('available', 'limited', 'unavailable')),
  capacity_hours  INTEGER NOT NULL DEFAULT 40 CHECK (capacity_hours BETWEEN 0 AND 60),
  location        TEXT NOT NULL DEFAULT 'Studio',
  bio             TEXT NOT NULL DEFAULT '',
  skills          TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS projects (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  client_id    TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  description  TEXT NOT NULL DEFAULT '',
  category     TEXT NOT NULL,
  start_date   DATE NOT NULL,
  due_date     DATE NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('planning', 'in-progress', 'review', 'completed', 'on-hold')),
  priority     TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  member_ids   TEXT[] NOT NULL DEFAULT '{}',
  progress     INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  CHECK (due_date >= start_date)
);
CREATE INDEX IF NOT EXISTS projects_client_id_idx ON projects (client_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects (status);

CREATE TABLE IF NOT EXISTS tasks (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  project_id   TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  assignee_id  TEXT NOT NULL REFERENCES team_members(id),
  due_date     DATE NOT NULL,
  priority     TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status       TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'in-review', 'completed'))
);
CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON tasks (project_id);
CREATE INDEX IF NOT EXISTS tasks_assignee_id_idx ON tasks (assignee_id);

CREATE TABLE IF NOT EXISTS inquiries (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  company       TEXT NOT NULL DEFAULT '',
  project_type  TEXT NOT NULL,
  budget        TEXT NOT NULL,
  description   TEXT NOT NULL,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  status        TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'contacted', 'converted', 'archived'))
);
CREATE INDEX IF NOT EXISTS inquiries_status_idx ON inquiries (status);

CREATE TABLE IF NOT EXISTS activities (
  id         TEXT PRIMARY KEY,
  type       TEXT NOT NULL,
  message    TEXT NOT NULL,
  entity_id  TEXT NOT NULL,
  actor      TEXT NOT NULL,
  at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS activities_at_idx ON activities (at DESC);
