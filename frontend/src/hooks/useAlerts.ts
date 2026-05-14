import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getAlerts } from '../api/client';
import type { AlertFilters, Category, Severity, Status } from '../types';

export const PAGE_SIZE = 25;

export type AlertSort = 'newest' | 'oldest' | 'severity_desc' | 'severity_asc';

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

export interface ParsedAlertFilters {
  page: number;
  severity: Severity[];
  status: Status[];
  category: Category[];
  search: string;
  dateFrom: string;
  dateTo: string;
  sort: AlertSort;
}

type FilterValueMap = {
  page: number;
  severity: Severity[];
  status: Status[];
  category: Category[];
  search: string;
  dateFrom: string;
  dateTo: string;
  sort: AlertSort;
};

type FilterKey = keyof FilterValueMap;

// Comma-separated URL param -> typed array, dropping any unknown values.
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

function parseSort(value: string | null): AlertSort {
  if (
    value === 'oldest' ||
    value === 'severity_desc' ||
    value === 'severity_asc'
  ) {
    return value;
  }
  return 'newest';
}

function sortToApi(sort: AlertSort): {
  sortBy: 'created_at' | 'severity';
  sortDir: 'asc' | 'desc';
} {
  switch (sort) {
    case 'oldest':
      return { sortBy: 'created_at', sortDir: 'asc' };
    case 'severity_desc':
      // Backend ranks critical=1 … info=5, so ASC = highest severity first.
      return { sortBy: 'severity', sortDir: 'asc' };
    case 'severity_asc':
      return { sortBy: 'severity', sortDir: 'desc' };
    case 'newest':
    default:
      return { sortBy: 'created_at', sortDir: 'desc' };
  }
}

// URL search params are the single source of truth for list filters so that
// links / refresh / back-forward all restore the same view.
export function useAlerts() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<ParsedAlertFilters>(
    () => ({
      page: Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1),
      severity: parseMultiSelectParam(searchParams.get('severity'), SEVERITIES),
      status: parseMultiSelectParam(searchParams.get('status'), STATUSES),
      category: parseMultiSelectParam(searchParams.get('category'), CATEGORIES),
      search: searchParams.get('search') ?? '',
      dateFrom: searchParams.get('dateFrom') ?? '',
      dateTo: searchParams.get('dateTo') ?? '',
      sort: parseSort(searchParams.get('sort')),
    }),
    [searchParams],
  );

  function setFilter<K extends FilterKey>(key: K, value: FilterValueMap[K]) {
    const next = new URLSearchParams(searchParams);

    // Default/empty values are dropped from the URL to keep it clean.
    if (Array.isArray(value)) {
      const joined = (value as string[]).join(',');
      if (joined) next.set(key, joined);
      else next.delete(key);
    } else if (typeof value === 'number') {
      if (key === 'page' && value <= 1) next.delete(key);
      else next.set(key, String(value));
    } else {
      const str = value as string;
      if (!str || (key === 'sort' && str === 'newest')) next.delete(key);
      else next.set(key, str);
    }

    // Any filter change (other than paging itself) sends the user back to page 1.
    if (key !== 'page') next.delete('page');

    setSearchParams(next, { replace: true });
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams(), { replace: true });
  }

  const { sortBy, sortDir } = sortToApi(filters.sort);
  const apiFilters: AlertFilters = {
    page: filters.page,
    pageSize: PAGE_SIZE,
    severity: filters.severity.length ? filters.severity : undefined,
    status: filters.status.length ? filters.status : undefined,
    category: filters.category.length ? filters.category : undefined,
    search: filters.search || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    sortBy,
    sortDir,
  };

  // queryKey includes every filter so changes refetch automatically.
  // keepPreviousData prevents the table from flashing empty between pages.
  const query = useQuery({
    queryKey: ['alerts', apiFilters],
    queryFn: () => getAlerts(apiFilters),
    placeholderData: keepPreviousData,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    filters,
    setFilter,
    clearFilters,
  };
}
