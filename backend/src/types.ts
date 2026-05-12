export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type Status = 'new' | 'investigating' | 'resolved' | 'false_positive';

export type Category =
  | 'malware'
  | 'phishing'
  | 'unauthorized_access'
  | 'data_exfiltration'
  | 'policy_violation'
  | 'suspicious_login';

export interface Alert {
  id: string;
  title: string;
  severity: Severity;
  status: Status;
  category: Category;
  source: string;
  affected_asset: string;
  assignee: string | null;
  description: string;
  raw_event: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
}
