import { AttendanceRecord } from '@/types/hrms';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface RecentActivityProps {
  records: AttendanceRecord[];
}

const statusColors = {
  present: 'bg-success/10 text-success',
  late: 'bg-warning/10 text-warning',
  absent: 'bg-destructive/10 text-destructive',
  'half-day': 'bg-accent/10 text-accent',
};

export function RecentActivity({ records }: RecentActivityProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Clock className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">Your attendance history</p>
        </div>
      </div>

      <div className="space-y-3">
        {records.slice(0, 5).map((record, index) => (
          <div
            key={record.id}
            className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium capitalize',
                  statusColors[record.status]
                )}
              >
                {record.status}
              </div>
              <div>
                <p className="font-medium text-sm">{formatDate(record.date)}</p>
                <p className="text-xs text-muted-foreground">
                  {record.checkIn || '--:--'} - {record.checkOut || '--:--'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">
                {record.hoursWorked > 0 ? `${record.hoursWorked}h` : '-'}
              </p>
              <p className="text-xs text-muted-foreground">hours</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
