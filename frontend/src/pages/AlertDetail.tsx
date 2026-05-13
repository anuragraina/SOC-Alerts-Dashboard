import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Select } from '../components/ui/Select';
import { Skeleton } from '../components/ui/Skeleton';
import { useAlert, useUpdateAlert } from '../hooks/useAlert';
import { useAuthStore } from '../store/auth';
import type { Severity, Status } from '../types';

const SEVERITY_OPTIONS: { value: Severity; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'info', label: 'Info' },
];

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'false_positive', label: 'False positive' },
];

function formatText(value: string): string {
  return value.replace(/_/g, ' ');
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  try {
    return format(new Date(value), 'MMM d, yyyy HH:mm');
  } catch {
    return value;
  }
}

// raw_event is stored as a JSON string. Try to parse it for pretty-printing.
// fall back to the raw text if it isn't valid JSON.
function prettyPrintJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

function MetadataRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-slate-100 last:border-b-0">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm text-slate-900 text-right break-all">
        {children}
      </span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <Card className="space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </Card>
        <Card>
          <Skeleton className="h-72 w-full" />
        </Card>
      </div>
      <div className="space-y-4">
        <Card className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </Card>
        <Card className="space-y-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </Card>
      </div>
    </div>
  );
}

export default function AlertDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: alert, isLoading, isError } = useAlert(id);
  const updateMutation = useUpdateAlert(id ?? '');

  // Local mirror of the assignee field so the user can type freely; we only
  // send a PATCH on blur/save (not per keystroke).
  const [assigneeDraft, setAssigneeDraft] = useState('');

  useEffect(() => {
    setAssigneeDraft(alert?.assignee ?? '');
  }, [alert?.assignee]);

  function goBack() {
    // Prefer browser back so the previous filter params on /alerts are preserved.
    if (window.history.length > 1) navigate(-1);
    else navigate('/alerts');
  }

  function saveAssignee() {
    const trimmed = assigneeDraft.trim();
    const current = alert?.assignee ?? '';
    if (trimmed === current) return;
    updateMutation.mutate({ assignee: trimmed === '' ? null : trimmed });
  }

  function assignToMe() {
    if (!user?.email) return;
    setAssigneeDraft(user.email);
    if (user.email !== alert?.assignee) {
      updateMutation.mutate({ assignee: user.email });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <div>
          <Button variant="ghost" size="sm" onClick={goBack}>
            ← Back to alerts
          </Button>
        </div>

        {isLoading ? (
          <DetailSkeleton />
        ) : isError || !alert ? (
          <Card>
            <EmptyState
              title="Alert not found"
              description="This alert may have been deleted, or the link is invalid."
            />
            <div className="flex justify-center pb-4">
              <Button variant="secondary" onClick={() => navigate('/alerts')}>
                Back to alerts list
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Card className="space-y-3">
                <div className="flex items-start gap-3 flex-wrap">
                  <Badge variant={alert.severity}>{alert.severity}</Badge>
                  <Badge variant={alert.status}>
                    {formatText(alert.status)}
                  </Badge>
                  <span className="text-xs text-slate-500 capitalize">
                    {formatText(alert.category)}
                  </span>
                </div>
                <h1 className="text-xl font-semibold text-slate-900 leading-tight">
                  {alert.title}
                </h1>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {alert.description}
                </p>
              </Card>

              <Card padding="none">
                <div className="px-4 py-2.5 border-b border-slate-200">
                  <h2 className="text-sm font-medium text-slate-900">
                    Raw event
                  </h2>
                </div>
                <pre className="font-mono text-xs bg-slate-50 p-4 max-h-96 overflow-auto rounded-b-lg text-slate-800">
                  {prettyPrintJson(alert.raw_event)}
                </pre>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <h2 className="text-sm font-medium text-slate-900 mb-2">
                  Details
                </h2>
                <MetadataRow label="Severity">
                  <Badge variant={alert.severity}>{alert.severity}</Badge>
                </MetadataRow>
                <MetadataRow label="Status">
                  <Badge variant={alert.status}>
                    {formatText(alert.status)}
                  </Badge>
                </MetadataRow>
                <MetadataRow label="Category">
                  <span className="capitalize">
                    {formatText(alert.category)}
                  </span>
                </MetadataRow>
                <MetadataRow label="Source">{alert.source}</MetadataRow>
                <MetadataRow label="Affected asset">
                  <span className="font-mono text-xs">
                    {alert.affected_asset}
                  </span>
                </MetadataRow>
                <MetadataRow label="Assignee">
                  {alert.assignee || (
                    <span className="text-slate-400">Unassigned</span>
                  )}
                </MetadataRow>
                <MetadataRow label="Created">
                  {formatDate(alert.created_at)}
                </MetadataRow>
                <MetadataRow label="Updated">
                  {formatDate(alert.updated_at)}
                </MetadataRow>
              </Card>

              <Card className="space-y-3">
                <h2 className="text-sm font-medium text-slate-900">Actions</h2>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Severity
                  </label>
                  <Select
                    value={alert.severity}
                    onChange={(v) =>
                      updateMutation.mutate({ severity: v as Severity })
                    }
                    options={SEVERITY_OPTIONS}
                    disabled={updateMutation.isPending}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Status
                  </label>
                  <Select
                    value={alert.status}
                    onChange={(v) =>
                      updateMutation.mutate({ status: v as Status })
                    }
                    options={STATUS_OPTIONS}
                    disabled={updateMutation.isPending}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Assignee
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={assigneeDraft}
                      onChange={(e) => setAssigneeDraft(e.target.value)}
                      onBlur={saveAssignee}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                      placeholder="email or name"
                      className="flex-1 min-w-0 px-3 py-2 border border-slate-300 rounded-md text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={assignToMe}
                    disabled={!user?.email || updateMutation.isPending}
                    className="mt-2 text-xs font-medium text-slate-700 hover:text-slate-900 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    Assign to me
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <Button
                    variant="danger"
                    size="md"
                    className="w-full"
                    disabled={
                      alert.status === 'false_positive' ||
                      updateMutation.isPending
                    }
                    onClick={() =>
                      updateMutation.mutate({ status: 'false_positive' })
                    }
                  >
                    Dismiss as false positive
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
