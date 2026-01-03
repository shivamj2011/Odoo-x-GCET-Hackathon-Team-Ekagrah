export type UserRole = 'employee' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  position: string;
  avatar: string;
  joinDate: string;
  phone?: string;
  address?: string;
  // Optional extended fields
  resume?: string; // data URL or link
  salary?: {
    base?: number;
    bonus?: number;
    deductions?: number;
    net?: number;
  };
  privateInfo?: string; // visible to HR only
  skills?: string[];
  certifications?: string[];
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'present' | 'absent' | 'late' | 'half-day';
  hoursWorked: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  type: 'vacation' | 'sick' | 'personal' | 'other';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
}

export interface SalaryInfo {
  baseSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  lastPaid: string;
}

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  pendingLeaves: number;
  avgAttendance: number;
}
