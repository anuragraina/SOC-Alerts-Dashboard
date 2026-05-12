import { Router } from 'express';
import { db } from '../db/database';
import { authMiddleware } from '../middleware/auth';
import { Alert, Severity, Status, Category } from '../types';

const router = Router();

router.use(authMiddleware);

const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];
const STATUSES: Status[] = [
  'new',
  'investigating',
  'resolved',
  'false_positive',
];
const CATEGORIES: Category[] = [
  'malware',
  'phishing',
  'unauthorized_access',
  'data_exfiltration',
  'policy_violation',
  'suspicious_login',
];

const SEVERITY_CASE = `CASE severity
  WHEN 'critical' THEN 1
  WHEN 'high' THEN 2
  WHEN 'medium' THEN 3
  WHEN 'low' THEN 4
  WHEN 'info' THEN 5
END`;

function parseMultiSelectParam<T extends string>(
  rawValue: unknown,
  allowedValues: readonly T[],
): T[] {
  if (typeof rawValue !== 'string' || !rawValue.trim()) return [];
  return rawValue
    .split(',')
    .map((value) => value.trim())
    .filter((value): value is T =>
      (allowedValues as readonly string[]).includes(value),
    );
}

router.get('/', (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
  const pageSizeRaw = parseInt(String(req.query.pageSize ?? '25'), 10) || 25;
  const pageSize = Math.min(100, Math.max(1, pageSizeRaw));

  const severities = parseMultiSelectParam(req.query.severity, SEVERITIES);
  const statuses = parseMultiSelectParam(req.query.status, STATUSES);
  const categories = parseMultiSelectParam(req.query.category, CATEGORIES);
  const source =
    typeof req.query.source === 'string' ? req.query.source.trim() : '';
  const dateFrom =
    typeof req.query.dateFrom === 'string' ? req.query.dateFrom : '';
  const dateTo = typeof req.query.dateTo === 'string' ? req.query.dateTo : '';
  const search =
    typeof req.query.search === 'string' ? req.query.search.trim() : '';

  const sortBy = req.query.sortBy === 'severity' ? 'severity' : 'created_at';
  const sortDir = req.query.sortDir === 'asc' ? 'ASC' : 'DESC';

  const where: string[] = [];
  const params: unknown[] = [];

  if (severities.length) {
    where.push(`severity IN (${severities.map(() => '?').join(',')})`);
    params.push(...severities);
  }
  if (statuses.length) {
    where.push(`status IN (${statuses.map(() => '?').join(',')})`);
    params.push(...statuses);
  }
  if (categories.length) {
    where.push(`category IN (${categories.map(() => '?').join(',')})`);
    params.push(...categories);
  }
  if (source) {
    where.push('source = ?');
    params.push(source);
  }
  if (dateFrom) {
    where.push('created_at >= ?');
    params.push(dateFrom);
  }
  if (dateTo) {
    where.push('created_at <= ?');
    params.push(dateTo);
  }
  if (search) {
    where.push('(title LIKE ? OR description LIKE ?)');
    const pattern = `%${search}%`;
    params.push(pattern, pattern);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderClause =
    sortBy === 'severity'
      ? `ORDER BY ${SEVERITY_CASE} ${sortDir}, created_at DESC`
      : `ORDER BY created_at ${sortDir}`;

  const total = (
    db
      .prepare(`SELECT COUNT(*) as count FROM alerts ${whereClause}`)
      .get(...params) as {
      count: number;
    }
  ).count;

  const offset = (page - 1) * pageSize;
  const rows = db
    .prepare(
      `SELECT * FROM alerts ${whereClause} ${orderClause} LIMIT ? OFFSET ?`,
    )
    .all(...params, pageSize, offset) as Alert[];

  res.json({
    data: rows,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  });
});

router.get('/stats', (_req, res) => {
  const bySeverity = db
    .prepare(
      `SELECT severity as key, COUNT(*) as count FROM alerts GROUP BY severity ORDER BY ${SEVERITY_CASE}`,
    )
    .all() as { key: string; count: number }[];

  const byCategory = db
    .prepare(
      'SELECT category as key, COUNT(*) as count FROM alerts GROUP BY category ORDER BY key',
    )
    .all() as { key: string; count: number }[];

  const byStatus = db
    .prepare(
      'SELECT status as key, COUNT(*) as count FROM alerts GROUP BY status ORDER BY key',
    )
    .all() as { key: string; count: number }[];

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 13);

  const counts = db
    .prepare(
      `SELECT substr(created_at, 1, 10) as date, COUNT(*) as count
       FROM alerts
       WHERE created_at >= ?
       GROUP BY date`,
    )
    .all(start.toISOString()) as { date: string; count: number }[];

  const countMap = new Map(counts.map((c) => [c.date, c.count]));
  const trend: { date: string; count: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    trend.push({ date: key, count: countMap.get(key) ?? 0 });
  }

  res.json({ data: { bySeverity, byCategory, byStatus, trend } });
});

router.get('/:id', (req, res) => {
  const row = db
    .prepare('SELECT * FROM alerts WHERE id = ?')
    .get(req.params.id) as Alert | undefined;

  if (!row) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  res.json({ data: row });
});

router.patch('/:id', (req, res) => {
  const { status, severity, assignee } = req.body ?? {};
  const updates: string[] = [];
  const params: unknown[] = [];

  if (status !== undefined) {
    if (!STATUSES.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    updates.push('status = ?');
    params.push(status);
  }

  if (severity !== undefined) {
    if (!SEVERITIES.includes(severity)) {
      res.status(400).json({ error: 'Invalid severity' });
      return;
    }
    updates.push('severity = ?');
    params.push(severity);
  }

  if (assignee !== undefined) {
    if (assignee !== null && typeof assignee !== 'string') {
      res.status(400).json({ error: 'Invalid assignee' });
      return;
    }
    updates.push('assignee = ?');
    params.push(assignee);
  }

  const existing = db
    .prepare('SELECT id FROM alerts WHERE id = ?')
    .get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  if (updates.length) {
    updates.push('updated_at = ?');
    params.push(new Date().toISOString(), req.params.id);
    db.prepare(`UPDATE alerts SET ${updates.join(', ')} WHERE id = ?`).run(
      ...params,
    );
  }

  const row = db
    .prepare('SELECT * FROM alerts WHERE id = ?')
    .get(req.params.id) as Alert;
  res.json({ data: row });
});

export default router;
