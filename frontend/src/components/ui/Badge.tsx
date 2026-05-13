import type { ReactNode } from 'react';
import type { Severity, Status } from '../../types';

type BadgeVariant = Severity | Status | 'default';

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
}

const styles: Record<BadgeVariant, string> = {
  critical: 'bg-red-50 text-red-600',
  high: 'bg-orange-50 text-orange-600',
  medium: 'bg-amber-50 text-amber-600',
  low: 'bg-blue-50 text-blue-600',
  info: 'bg-slate-50 text-slate-500',
  new: 'bg-blue-50 text-blue-700',
  investigating: 'bg-amber-50 text-amber-700',
  resolved: 'bg-green-50 text-green-700',
  false_positive: 'bg-slate-100 text-slate-600',
  default: 'bg-slate-100 text-slate-700',
};

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs rounded-md font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
