import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AttendanceWidget } from '@/components/dashboard/AttendanceWidget';
import { mockAttendanceRecords } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Clock, Calendar, TrendingUp } from 'lucide-react';

const statusColors = {
  present: 'bg-success/10 text-success border-success/20',
  late: 'bg-warning/10 text-warning border-warning/20',
  absent: 'bg-destructive/10 text-destructive border-destructive/20',
  'half-day': 'bg-accent/10 text-accent border-accent/20',
};

export default function Attendance() {
  const weeklyHours = mockAttendanceRecords
    .slice(0, 5)
    .reduce((acc, rec) => acc + rec.hoursWorked, 0);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Attendance</h1>
        <p className="text-muted-foreground">Track your daily attendance and work hours</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Widget */}
        <div className="lg:col-span-1">
          <AttendanceWidget />
        </div>

        {/* Stats & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-success" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Present Days</p>
              <p className="text-2xl font-bold text-success">22</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Weekly Hours</p>
              <p className="text-2xl font-bold text-primary">{weeklyHours.toFixed(1)}h</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Avg Hours</p>
              <p className="text-2xl font-bold text-accent">
                {(weeklyHours / 5).toFixed(1)}h
              </p>
            </div>
          </div>

          {/* Attendance Log */}
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold text-lg">Attendance Log</h3>
              <p className="text-sm text-muted-foreground">Your recent attendance records</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Check In
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Check Out
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Hours
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockAttendanceRecords.map((record, index) => {
                    const { day, date } = formatDate(record.date);
                    return (
                      <tr
                        key={record.id}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{day}</p>
                            <p className="text-sm text-muted-foreground">{date}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            'font-medium',
                            record.checkIn ? 'text-success' : 'text-muted-foreground'
                          )}>
                            {record.checkIn || '--:--'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            'font-medium',
                            record.checkOut ? 'text-accent' : 'text-muted-foreground'
                          )}>
                            {record.checkOut || '--:--'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold">
                            {record.hoursWorked > 0 ? `${record.hoursWorked}h` : '-'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={cn(
                              'px-3 py-1 rounded-full text-xs font-medium capitalize border',
                              statusColors[record.status]
                            )}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
