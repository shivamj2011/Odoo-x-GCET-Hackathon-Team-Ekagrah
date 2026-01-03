import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { AttendanceWidget } from '@/components/dashboard/AttendanceWidget';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { LeaveRequestsList } from '@/components/dashboard/LeaveRequestsList';
import {
  mockLeaveRequests,
} from '@/data/mockData';
import { Users, UserCheck, CalendarClock, TrendingUp } from 'lucide-react';
import { getEmployeeStats, getEmployeeAttendance, getTodayAttendance } from '@/lib/attendanceStorage';
import { getStoredEmployees } from '@/lib/employeeStorage';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [stats, setStats] = useState({
    daysPresent: 0,
    totalHoursWorked: 0,
    avgHoursPerDay: 0,
    leavesTaken: 0,
  });
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load stats on mount and when refreshKey changes
  useEffect(() => {
    if (user?.id) {
      const employeeStats = getEmployeeStats(user.id);
      setStats(employeeStats);
      
      // Get attendance records for recent activity
      const records = getEmployeeAttendance(user.id);
      const formattedRecords = records.slice(-5).reverse().map(r => ({
        id: r.id,
        userId: user.id,
        date: r.date,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        status: r.status === 'present' ? 'present' : r.status === 'leave' ? 'absent' : r.status === 'checked-out' ? 'present' : 'absent',
        hoursWorked: r.hoursWorked,
      }));
      setAttendanceRecords(formattedRecords);
    }
  }, [user?.id, refreshKey]);

  const pendingLeaves = mockLeaveRequests.filter((r) => r.status === 'pending');
  const employees = getStoredEmployees();
  const totalEmployees = employees.length;

  // Callback to refresh stats after check-in/check-out
  const handleAttendanceChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? "Here's an overview of your organization"
            : "Here's your daily work summary"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isAdmin ? (
          <>
            <StatCard
              title="Total Employees"
              value={totalEmployees}
              icon={Users}
              variant="primary"
            />
            <StatCard
              title="Present Today"
              value={0}
              subtitle="Check attendance overview"
              icon={UserCheck}
              variant="success"
            />
            <StatCard
              title="Pending Leaves"
              value={pendingLeaves.length}
              subtitle="Awaiting approval"
              icon={CalendarClock}
              variant="accent"
            />
            <StatCard
              title="Avg Attendance"
              value="--"
              subtitle="This month"
              icon={TrendingUp}
            />
          </>
        ) : (
          <>
            <StatCard
              title="Days Present"
              value={stats.daysPresent}
              subtitle="This month"
              icon={UserCheck}
              variant="success"
            />
            <StatCard
              title="Hours Worked"
              value={`${Math.round(stats.totalHoursWorked)}h`}
              subtitle="This month"
              icon={TrendingUp}
              variant="primary"
            />
            <StatCard
              title="Leave Balance"
              value={12 - stats.leavesTaken}
              subtitle="Days remaining"
              icon={CalendarClock}
              variant="accent"
            />
            <StatCard
              title="Avg Hours/Day"
              value={stats.avgHoursPerDay > 0 ? `${stats.avgHoursPerDay}h` : '--'}
              subtitle="This month"
              icon={Users}
            />
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {!isAdmin && <AttendanceWidget onAttendanceChange={handleAttendanceChange} />}
        {attendanceRecords.length > 0 && <RecentActivity records={attendanceRecords} />}
        <LeaveRequestsList
          requests={isAdmin ? pendingLeaves : mockLeaveRequests.filter((r) => r.userId === user?.id)}
          showActions={isAdmin}
        />
        {isAdmin && <AttendanceWidget onAttendanceChange={handleAttendanceChange} />}
      </div>
    </DashboardLayout>
  );
}
