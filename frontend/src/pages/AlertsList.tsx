import { useEffect, useState } from 'react';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';

import { useAlerts } from '../hooks/useAlerts';
import type { AlertSort } from '../hooks/useAlerts';
import type { Category, Severity, Status } from '../types';

const SEVERITY_OPTIONS: Severity[] = [
  'critical',
  'high',
  'medium',
  'low',
  'info',
];
const STATUS_OPTIONS: Status[] = [
  'new',
  'investigating',
  'resolved',
  'false_positive',
];
const CATEGORY_OPTIONS: Category[] = [
  'malware',
  'phishing',
  'unauthorized_access',
  'data_exfiltration',
  'policy_violation',
  'suspicious_login',
];

const SORT_OPTIONS: { value: AlertSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'severity_desc', label: 'Highest severity' },
  { value: 'severity_asc', label: 'Lowest severity' },
];

function formatText(value: string): string {
  return value.replace(/_/g, ' ');
}

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

interface PillSelectProps<T extends string> {
  options: readonly T[];
  selected: T[];
  onToggle: (value: T) => void;
}

function PillSelect<T extends string>({
  options,
  selected,
  onToggle,
}: PillSelectProps<T>) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`px-2.5 py-1 text-xs rounded-md font-medium capitalize transition-colors ${
              isSelected
                ? 'bg-slate-900 text-white border border-slate-900'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            {formatText(opt)}
          </button>
        );
      })}
    </div>
  );
}

export default function AlertsList() {
  const { filters, setFilter, clearFilters } = useAlerts();

  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (searchInput === filters.search) return;
    const timer = setTimeout(() => setFilter('search', searchInput), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const hasFilters =
    filters.severity.length > 0 ||
    filters.status.length > 0 ||
    filters.category.length > 0 ||
    filters.search.length > 0 ||
    filters.dateFrom.length > 0 ||
    filters.dateTo.length > 0 ||
    filters.sort !== 'newest' ||
    filters.page !== 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <div className="sticky top-0 z-10 -mx-4 px-4 pt-2 pb-3 bg-slate-50">
          <Card padding="md" className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search title or description…"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilter('dateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    To
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilter('dateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Severity
              </label>
              <PillSelect
                options={SEVERITY_OPTIONS}
                selected={filters.severity}
                onToggle={(v) =>
                  setFilter('severity', toggle(filters.severity, v))
                }
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Status
              </label>
              <PillSelect
                options={STATUS_OPTIONS}
                selected={filters.status}
                onToggle={(v) => setFilter('status', toggle(filters.status, v))}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Category
              </label>
              <PillSelect
                options={CATEGORY_OPTIONS}
                selected={filters.category}
                onToggle={(v) =>
                  setFilter('category', toggle(filters.category, v))
                }
              />
            </div>

            <div className="flex items-end justify-between gap-3 pt-1">
              <div className="w-56">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Sort
                </label>
                <Select
                  value={filters.sort}
                  onChange={(v) => setFilter('sort', v as AlertSort)}
                  options={SORT_OPTIONS}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                disabled={!hasFilters}
              >
                Clear filters
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
