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

export interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface AlertFilters {
  page?: number;
  pageSize?: number;
  severity?: Severity[];
  status?: Status[];
  category?: Category[];
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: 'created_at' | 'severity';
  sortDir?: 'asc' | 'desc';
}

export interface AlertStats {
  bySeverity: { key: Severity; count: number }[];
  byCategory: { key: Category; count: number }[];
  byStatus: { key: Status; count: number }[];
  trend: { date: string; count: number }[];
}

export interface AlertPatch {
  status?: Status;
  severity?: Severity;
  assignee?: string | null;
}
