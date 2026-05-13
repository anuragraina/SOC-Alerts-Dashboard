export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type Status = 'new' | 'investigating' | 'resolved' | 'false_positive';

export type Category =
  | 'malware'
  | 'phishing'
  | 'unauthorized_access'
  | 'data_exfiltration'
  | 'policy_violation'
  | 'suspicious_login';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}
