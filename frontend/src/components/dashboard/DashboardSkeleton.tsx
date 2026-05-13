import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-20" />
          </Card>
        ))}
      </div>
      <Card>
        <Skeleton className="h-4 w-56 mb-4" />
        <Skeleton className="h-60 w-full" />
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-60 w-full" />
        </Card>
        <Card>
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-60 w-full" />
        </Card>
      </div>
      <Card>
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
