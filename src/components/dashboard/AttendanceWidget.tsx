import { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { checkInEmployee, checkOutEmployee, getTodayAttendance } from '@/lib/attendanceStorage';

interface AttendanceWidgetProps {
  onAttendanceChange?: () => void;
}

export function AttendanceWidget({ onAttendanceChange }: AttendanceWidgetProps) {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);

  // Load today's attendance on mount
  useEffect(() => {
    if (user?.id) {
      const todayAttendance = getTodayAttendance(user.id);
      if (todayAttendance) {
        setCheckIn(todayAttendance.checkIn);
        setCheckOut(todayAttendance.checkOut);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCheckIn = () => {
    if (user?.id) {
      const record = checkInEmployee(user.id);
      setCheckIn(record.checkIn);
      onAttendanceChange?.();
    }
  };

  const handleCheckOut = () => {
    if (user?.id) {
      const record = checkOutEmployee(user.id);
      if (record) {
        setCheckOut(record.checkOut);
        onAttendanceChange?.();
      }
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Today's Attendance</h3>
          <p className="text-sm text-muted-foreground">{formatDate(currentTime)}</p>
        </div>
      </div>

      {/* Live Clock */}
      <div className="text-center mb-6">
        <p className="text-4xl font-bold gradient-text">{formatTime(currentTime)}</p>
      </div>

      {/* Status */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Check In</p>
          <p className={cn('font-semibold', checkIn ? 'text-success' : 'text-muted-foreground')}>
            {checkIn || '--:--'}
          </p>
        </div>
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Check Out</p>
          <p className={cn('font-semibold', checkOut ? 'text-accent' : 'text-muted-foreground')}>
            {checkOut || '--:--'}
          </p>
        </div>
      </div>

      {/* Action Button */}
      {!checkIn ? (
        <Button
          onClick={handleCheckIn}
          className="w-full h-12 bg-success hover:bg-success/90 text-success-foreground font-semibold"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Check In
        </Button>
      ) : !checkOut ? (
        <Button
          onClick={handleCheckOut}
          className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Check Out
        </Button>
      ) : (
        <div className="bg-success/10 rounded-xl p-4 text-center">
          <p className="text-success font-semibold flex items-center justify-center gap-2">
            <span className="pulse-dot" />
            Attendance Recorded
          </p>
        </div>
      )}
    </div>
  );
}
