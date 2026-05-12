CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  status TEXT NOT NULL CHECK (status IN ('new', 'investigating', 'resolved', 'false_positive')),
  category TEXT NOT NULL CHECK (category IN ('malware', 'phishing', 'unauthorized_access', 'data_exfiltration', 'policy_violation', 'suspicious_login')),
  source TEXT NOT NULL,
  affected_asset TEXT NOT NULL,
  assignee TEXT,
  description TEXT NOT NULL,
  raw_event TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_category ON alerts(category);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
