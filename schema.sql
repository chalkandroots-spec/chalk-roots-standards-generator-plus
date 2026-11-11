-- Chalk & Roots Standards Library — Cloudflare D1
-- Apply with: npx wrangler d1 execute chalk-roots-standards --remote --file=./schema.sql
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS standards (
  id TEXT PRIMARY KEY,
  framework TEXT NOT NULL DEFAULT 'CCSS',
  jurisdiction TEXT NOT NULL DEFAULT 'National',
  subject TEXT NOT NULL DEFAULT 'ELA',
  grade INTEGER NOT NULL CHECK (grade BETWEEN 0 AND 12),
  strand TEXT NOT NULL,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  wording TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  keywords TEXT NOT NULL DEFAULT '',
  official_url TEXT NOT NULL,
  source_name TEXT NOT NULL DEFAULT 'Common Core State Standards Initiative',
  source_checked_at TEXT NOT NULL DEFAULT '2026-11-11',
  curated INTEGER NOT NULL DEFAULT 0 CHECK (curated IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(framework, jurisdiction, code)
);
CREATE INDEX IF NOT EXISTS idx_standards_grade_subject ON standards(grade, subject);
CREATE INDEX IF NOT EXISTS idx_standards_code ON standards(code);
CREATE INDEX IF NOT EXISTS idx_standards_framework ON standards(framework, jurisdiction);
CREATE INDEX IF NOT EXISTS idx_standards_strand ON standards(strand);
