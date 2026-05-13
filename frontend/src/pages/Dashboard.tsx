import { useNavigate } from 'react-router-dom';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { KpiTile } from '../components/dashboard/KpiTile';
import { SeverityChart } from '../components/dashboard/SeverityChart';
import { StatusTile } from '../components/dashboard/StatusTile';
import { TrendChart } from '../components/dashboard/TrendChart';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { useAlertStats } from '../hooks/useAlertStats';
import type { Status } from '../types';

const STATUS_ORDER: Status[] = [
  'new',
  'investigating',
  'resolved',
  'false_positive',
];

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-sm font-medium text-slate-900 uppercase tracking-wide mb-4">
      {children}
    </h2>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading, isError, refetch } = useAlertStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Card>
            <EmptyState
              title="Couldn't load dashboard"
              description="There was a problem fetching alert stats."
            />
            <div className="flex justify-center pb-4">
              <Button variant="secondary" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const totalsEmpty = stats.totals.total === 0;
  const statusTotal = stats.byStatus.reduce((sum, s) => sum + s.count, 0);
  const statusCounts = new Map(stats.byStatus.map((s) => [s.key, s.count]));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiTile
            label="New Alerts"
            value={stats.totals.new}
            accent="blue"
            onClick={() => navigate('/alerts?status=new')}
          />
          <KpiTile
            label="Critical & New"
            value={stats.totals.criticalNew}
            accent="red"
            onClick={() => navigate('/alerts?severity=critical&status=new')}
          />
          <KpiTile
            label="Last 24 Hours"
            value={stats.totals.last24h}
            accent="neutral"
          />
          <KpiTile
            label="Resolved This Week"
            value={stats.totals.resolvedThisWeek}
            accent="green"
          />
        </div>

        {totalsEmpty ? (
          <Card>
            <EmptyState
              title="No alerts yet"
              description="When alerts arrive, they'll show up here."
            />
          </Card>
        ) : (
          <>
            <Card>
              <SectionTitle>Alert Volume (Last 14 Days)</SectionTitle>
              <TrendChart data={stats.trend} />
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <SectionTitle>By Severity</SectionTitle>
                <SeverityChart
                  data={stats.bySeverity}
                  onSliceClick={(severity) =>
                    navigate(`/alerts?severity=${severity}`)
                  }
                />
              </Card>

              <Card>
                <SectionTitle>By Category</SectionTitle>
                <CategoryChart
                  data={stats.byCategory}
                  onBarClick={(category) =>
                    navigate(`/alerts?category=${category}`)
                  }
                />
              </Card>
            </div>

            <Card>
              <SectionTitle>By Status</SectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {STATUS_ORDER.map((status) => {
                  const count = statusCounts.get(status) ?? 0;
                  const percent =
                    statusTotal === 0
                      ? 0
                      : Math.round((count / statusTotal) * 100);
                  return (
                    <StatusTile
                      key={status}
                      status={status}
                      count={count}
                      percent={percent}
                      onClick={() => navigate(`/alerts?status=${status}`)}
                    />
                  );
                })}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
