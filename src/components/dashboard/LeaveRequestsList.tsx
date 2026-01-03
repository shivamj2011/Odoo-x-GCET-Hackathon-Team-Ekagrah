import { LeaveRequest } from '@/types/hrms';
import { cn } from '@/lib/utils';
import { CalendarDays, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeaveRequestsListProps {
  requests: LeaveRequest[];
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const statusStyles = {
  pending: { bg: 'bg-warning/10', text: 'text-warning', icon: Clock },
  approved: { bg: 'bg-success/10', text: 'text-success', icon: Check },
  rejected: { bg: 'bg-destructive/10', text: 'text-destructive', icon: X },
};

const typeColors = {
  vacation: 'bg-primary/10 text-primary',
  sick: 'bg-destructive/10 text-destructive',
  personal: 'bg-accent/10 text-accent',
  other: 'bg-muted text-muted-foreground',
};

export function LeaveRequestsList({
  requests,
  showActions,
  onApprove,
  onReject,
}: LeaveRequestsListProps) {
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const sameDay = start === end;

    if (sameDay) {
      return startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    return `${startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} - ${endDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Leave Requests</h3>
          <p className="text-sm text-muted-foreground">
            {showActions ? 'Pending approvals' : 'Your leave history'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No leave requests found</p>
          </div>
        ) : (
          requests.map((request, index) => {
            const StatusIcon = statusStyles[request.status].icon;
            return (
              <div
                key={request.id}
                className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium capitalize',
                        typeColors[request.type]
                      )}
                    >
                      {request.type}
                    </span>
                    <span
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize',
                        statusStyles[request.status].bg,
                        statusStyles[request.status].text
                      )}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {request.status}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">
                    {calculateDays(request.startDate, request.endDate)} day
                    {calculateDays(request.startDate, request.endDate) > 1 ? 's' : ''}
                  </span>
                </div>

                {showActions && (
                  <p className="text-sm font-medium mb-1">{request.userName}</p>
                )}

                <p className="text-sm text-muted-foreground mb-2">
                  {formatDateRange(request.startDate, request.endDate)}
                </p>
                <p className="text-sm">{request.reason}</p>

                {showActions && request.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      className="flex-1 bg-success hover:bg-success/90"
                      onClick={() => onApprove?.(request.id)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => onReject?.(request.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
