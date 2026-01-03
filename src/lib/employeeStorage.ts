import { User, UserRole } from '@/types/hrms';
import { initializeEmployeeAttendance } from './attendanceStorage';

export interface StoredEmployee extends User {
  password: string;
  loginId: string;
  gender?: 'male' | 'female' | 'other';
  photo?: string;
  resume?: string;
}

const EMPLOYEES_KEY = 'hrms_employees';

// Generate employee ID: OI + Name Initials + Year + 4-digit serial
export function generateEmployeeId(name: string, joinDate: string): string {
  const initials = name
    .split(' ')
    .map((n) => n.charAt(0).toUpperCase())
    .join('')
    .slice(0, 4);
  const year = new Date(joinDate).getFullYear();
  const serial = String(Math.floor(1000 + Math.random() * 9000));
  return `OI${initials}${year}${serial}`;
}

// Generate a random password
export function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Get all stored employees
export function getStoredEmployees(): StoredEmployee[] {
  const stored = localStorage.getItem(EMPLOYEES_KEY);
  if (!stored) {
    // Initialize with default demo employees
    const defaultEmployees: StoredEmployee[] = [
      {
        id: 'emp-001',
        loginId: 'OIALJO20220001',
        password: 'demo123',
        name: 'Alex Johnson',
        email: 'alex.johnson@company.com',
        role: 'employee',
        department: 'Engineering',
        position: 'Senior Developer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        joinDate: '2022-03-15',
        phone: '+1 (555) 123-4567',
        address: '123 Tech Lane, San Francisco, CA 94102',
        gender: 'male',
      },
      {
        id: 'admin-001',
        loginId: 'OIWISA20200001',
        password: 'admin123',
        name: 'Sarah Williams',
        email: 'sarah.williams@company.com',
        role: 'admin',
        department: 'Human Resources',
        position: 'HR Director',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        joinDate: '2020-01-10',
        phone: '+1 (555) 987-6543',
        address: '456 Corporate Blvd, San Francisco, CA 94103',
        gender: 'female',
      },
    ];
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(defaultEmployees));
    return defaultEmployees;
  }
  return JSON.parse(stored);
}

// Add a new employee
export function addEmployee(employeeData: {
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  joinDate: string;
  address: string;
  gender: 'male' | 'female' | 'other';
  photo?: string;
  resume?: string;
}): { employee: StoredEmployee; loginId: string; password: string } {
  const employees = getStoredEmployees();
  
  const loginId = generateEmployeeId(employeeData.name, employeeData.joinDate);
  const password = generatePassword();
  
  const newEmployee: StoredEmployee = {
    id: `emp-${Date.now()}`,
    loginId,
    password,
    name: employeeData.name,
    email: employeeData.email,
    phone: employeeData.phone,
    position: employeeData.position,
    department: employeeData.department,
    joinDate: employeeData.joinDate,
    address: employeeData.address,
    gender: employeeData.gender,
    role: 'employee' as UserRole,
    avatar: employeeData.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employeeData.name.replace(/\s/g, '')}`,
    photo: employeeData.photo,
    resume: employeeData.resume,
  };
  
  employees.push(newEmployee);
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
  
  // Initialize attendance records for new employee (starts at 0)
  initializeEmployeeAttendance(newEmployee.id);
  
  return { employee: newEmployee, loginId, password };
}

// Remove an employee
export function removeEmployee(employeeId: string): boolean {
  const employees = getStoredEmployees();
  const filtered = employees.filter((emp) => emp.id !== employeeId);
  
  if (filtered.length < employees.length) {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(filtered));
    return true;
  }
  return false;
}

// Update an existing employee's data (partial fields)
export function updateEmployee(employeeId: string, updatedData: Partial<StoredEmployee>): StoredEmployee | null {
  const employees = getStoredEmployees();
  const idx = employees.findIndex((emp) => emp.id === employeeId);
  if (idx === -1) return null;

  const existing = employees[idx];
  const updated: StoredEmployee = {
    ...existing,
    ...updatedData,
    // ensure id, loginId and password remain unchanged unless explicitly provided
    id: updatedData.id || existing.id,
    loginId: updatedData.loginId || existing.loginId,
    password: updatedData.password || existing.password,
  };

  employees[idx] = updated;
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
  return updated;
}

// Export employees as JSON string
export function exportEmployees(): string {
  return JSON.stringify(getStoredEmployees(), null, 2);
}

// Import employees - merges by loginId (skip duplicates)
export function importEmployees(imported: StoredEmployee[]): { added: number; skipped: number } {
  const employees = getStoredEmployees();
  const existingLoginIds = new Set(employees.map((e) => e.loginId));
  let added = 0;
  let skipped = 0;

  for (const imp of imported) {
    if (existingLoginIds.has(imp.loginId)) {
      skipped++;
      continue;
    }
    // Ensure required fields
    const toAdd: StoredEmployee = {
      ...imp,
      id: imp.id || `emp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      loginId: imp.loginId,
      password: imp.password || generatePassword(),
      role: imp.role || 'employee',
      avatar: imp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${imp.name?.replace(/\s/g, '')}`,
    };
    employees.push(toAdd);
    existingLoginIds.add(toAdd.loginId);
    added++;
  }

  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
  return { added, skipped };
}

// Validate login credentials
export function validateCredentials(
  loginId: string,
  password: string
): { success: boolean; user: User | null; error?: string } {
  const employees = getStoredEmployees();
  
  const employee = employees.find(
    (emp) => emp.loginId.toLowerCase() === loginId.toLowerCase()
  );
  
  if (!employee) {
    return { success: false, user: null, error: 'Invalid Login ID. Please check and try again.' };
  }
  
  if (employee.password !== password) {
    return { success: false, user: null, error: 'Incorrect password. Please try again.' };
  }
  
  // Return user without password
  const { password: _, loginId: __, ...user } = employee;
  return { success: true, user: user as User };
}
