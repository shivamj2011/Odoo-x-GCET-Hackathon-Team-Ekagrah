// Attendance record storage for real-time tracking

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null;
  checkOut: string | null;
  hoursWorked: number;
  status: 'present' | 'absent' | 'leave' | 'checked-out';
}

export interface EmployeeAttendance {
  employeeId: string;
  records: AttendanceRecord[];
}

const ATTENDANCE_KEY = 'hrms_attendance';

// Get all attendance records
export function getAllAttendance(): Record<string, AttendanceRecord[]> {
  const stored = localStorage.getItem(ATTENDANCE_KEY);
  return stored ? JSON.parse(stored) : {};
}

// Get attendance for a specific employee
export function getEmployeeAttendance(employeeId: string): AttendanceRecord[] {
  const all = getAllAttendance();
  return all[employeeId] || [];
}

// Get today's attendance for an employee
export function getTodayAttendance(employeeId: string): AttendanceRecord | null {
  const today = new Date().toISOString().split('T')[0];
  const records = getEmployeeAttendance(employeeId);
  return records.find(r => r.date === today) || null;
}

// Check in an employee
export function checkInEmployee(employeeId: string): AttendanceRecord {
  const all = getAllAttendance();
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  if (!all[employeeId]) {
    all[employeeId] = [];
  }

  // Check if already checked in today
  let todayRecord = all[employeeId].find(r => r.date === today);
  
  if (!todayRecord) {
    todayRecord = {
      id: `att-${Date.now()}`,
      date: today,
      checkIn: now,
      checkOut: null,
      hoursWorked: 0,
      status: 'present',
    };
    all[employeeId].push(todayRecord);
  } else if (!todayRecord.checkIn) {
    todayRecord.checkIn = now;
    todayRecord.status = 'present';
  }

  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(all));
  return todayRecord;
}

// Check out an employee
export function checkOutEmployee(employeeId: string): AttendanceRecord | null {
  const all = getAllAttendance();
  const today = new Date().toISOString().split('T')[0];
  
  if (!all[employeeId]) return null;

  const todayRecord = all[employeeId].find(r => r.date === today);
  
  if (todayRecord && todayRecord.checkIn && !todayRecord.checkOut) {
    const now = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    
    todayRecord.checkOut = now;
    todayRecord.status = 'checked-out';
    
    // Calculate hours worked
    const checkInTime = parseTimeString(todayRecord.checkIn);
    const checkOutTime = parseTimeString(now);
    if (checkInTime && checkOutTime) {
      const diffMs = checkOutTime.getTime() - checkInTime.getTime();
      todayRecord.hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    }

    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(all));
  }

  return todayRecord || null;
}

// Helper to parse time string
function parseTimeString(timeStr: string): Date | null {
  try {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const date = new Date();
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;
    date.setHours(hour24, minutes, seconds, 0);
    return date;
  } catch {
    return null;
  }
}

// Get employee stats (for dashboard)
export function getEmployeeStats(employeeId: string): {
  daysPresent: number;
  totalHoursWorked: number;
  avgHoursPerDay: number;
  leavesTaken: number;
} {
  const records = getEmployeeAttendance(employeeId);
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  const monthRecords = records.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const daysPresent = monthRecords.filter(r => r.status === 'present' || r.status === 'checked-out').length;
  const totalHoursWorked = monthRecords.reduce((sum, r) => sum + r.hoursWorked, 0);
  const avgHoursPerDay = daysPresent > 0 ? Math.round((totalHoursWorked / daysPresent) * 10) / 10 : 0;
  const leavesTaken = monthRecords.filter(r => r.status === 'leave').length;

  return { daysPresent, totalHoursWorked, avgHoursPerDay, leavesTaken };
}

// Get current status of an employee
export function getEmployeeStatus(employeeId: string): 'present' | 'leave' | 'absent' {
  const today = getTodayAttendance(employeeId);
  if (!today) return 'absent';
  if (today.status === 'leave') return 'leave';
  if (today.status === 'present') return 'present';
  if (today.status === 'checked-out') return 'absent';
  return 'absent';
}

// Initialize attendance for a new employee (all zeros)
export function initializeEmployeeAttendance(employeeId: string): void {
  const all = getAllAttendance();
  if (!all[employeeId]) {
    all[employeeId] = [];
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(all));
  }
}

// Get all employees' status for HR view
export function getAllEmployeesStatus(): Record<string, 'present' | 'leave' | 'absent'> {
  const all = getAllAttendance();
  const statuses: Record<string, 'present' | 'leave' | 'absent'> = {};
  
  Object.keys(all).forEach(empId => {
    statuses[empId] = getEmployeeStatus(empId);
  });
  
  return statuses;
}
