import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Mail,
  Phone,
  Building2,
  Calendar,
  Edit2,
  Trash2,
  MoreVertical,
  Copy,
  Check,
  User as UserIcon,
  MapPin,
  Briefcase,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User } from '@/types/hrms';
import { cn } from '@/lib/utils';
import { getStoredEmployees, addEmployee, removeEmployee, StoredEmployee, updateEmployee, exportEmployees, importEmployees } from '@/lib/employeeStorage';
import { getEmployeeAttendance } from '@/lib/attendanceStorage';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PhotoUpload } from '@/components/employees/PhotoUpload';

const departmentColors: Record<string, string> = {
  Engineering: 'bg-primary/10 text-primary',
  Design: 'bg-accent/10 text-accent',
  Marketing: 'bg-success/10 text-success',
  Finance: 'bg-warning/10 text-warning',
  Sales: 'bg-destructive/10 text-destructive',
  'Human Resources': 'bg-primary/10 text-primary',
};

const departments = ['Engineering', 'Design', 'Marketing', 'Finance', 'Sales', 'Human Resources'];

export default function Employees() {
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<StoredEmployee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<StoredEmployee | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<StoredEmployee | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const [newCredentials, setNewCredentials] = useState<{ loginId: string; password: string } | null>(null);
  
  const [newEmployeeData, setNewEmployeeData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    joinDate: '',
    address: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    photo: undefined as string | undefined,
    resume: undefined as string | undefined,
  });
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);
  const { user: authUser } = useAuth();
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [attendanceFor, setAttendanceFor] = useState<StoredEmployee | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

  useEffect(() => {
    setEmployees(getStoredEmployees());
  }, []);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewEmployee = (employee: StoredEmployee) => {
    setSelectedEmployee(employee);
    setIsViewDialogOpen(true);
  };

  const handleOpenEdit = (employee: StoredEmployee) => {
    setEditingEmployeeId(employee.id);
    setNewEmployeeData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      department: employee.department,
      joinDate: employee.joinDate,
      address: employee.address || '',
      gender: employee.gender || '',
      photo: employee.photo || undefined,
      resume: employee.resume || undefined,
    });
    setIsAddDialogOpen(true);
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!newEmployeeData.name || !newEmployeeData.email || !newEmployeeData.phone || 
        !newEmployeeData.position || !newEmployeeData.department || !newEmployeeData.joinDate ||
        !newEmployeeData.gender) {
      toast.error('Please fill in all required fields including gender');
      return;
    }
    
    if (editingEmployeeId) {
      // Update existing
      const updated = updateEmployee(editingEmployeeId, {
        name: newEmployeeData.name,
        email: newEmployeeData.email,
        phone: newEmployeeData.phone,
        position: newEmployeeData.position,
        department: newEmployeeData.department,
        joinDate: newEmployeeData.joinDate,
        address: newEmployeeData.address,
        gender: newEmployeeData.gender,
        avatar: newEmployeeData.photo || undefined,
        photo: newEmployeeData.photo,
        resume: newEmployeeData.resume,
        skills: (newEmployeeData as any).skills || [],
        certifications: (newEmployeeData as any).certifications || [],
        salary: (newEmployeeData as any).salary || undefined,
        privateInfo: (newEmployeeData as any).privateInfo || undefined,
      });
      if (updated) {
        setEmployees(getStoredEmployees());
        setIsAddDialogOpen(false);
        toast.success('Employee updated successfully!');
      } else {
        toast.error('Failed to update employee');
      }
      setEditingEmployeeId(null);
    } else {
      const result = addEmployee({
        ...newEmployeeData,
        gender: newEmployeeData.gender as 'male' | 'female' | 'other',
      });
      // Persist extended fields not covered by addEmployee
      updateEmployee(result.employee.id, {
        skills: (newEmployeeData as any).skills || [],
        certifications: (newEmployeeData as any).certifications || [],
        salary: (newEmployeeData as any).salary || undefined,
        privateInfo: (newEmployeeData as any).privateInfo || undefined,
      });
      setNewCredentials({ loginId: result.loginId, password: result.password });
      setEmployees(getStoredEmployees());
      setIsAddDialogOpen(false);
      setIsCredentialsDialogOpen(true);
      toast.success('Employee added successfully!');
    }

    // Reset form
    setNewEmployeeData({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      joinDate: '',
      address: '',
      gender: '',
      photo: undefined,
      resume: undefined,
    });
  };

  const handleDeleteEmployee = () => {
    if (employeeToDelete) {
      const success = removeEmployee(employeeToDelete.id);
      if (success) {
        setEmployees(getStoredEmployees());
        toast.success('Employee removed successfully');
      }
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const confirmDelete = (employee: StoredEmployee, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Employee Directory</h1>
          <p className="text-muted-foreground">
            Manage and view all employees in your organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={(el) => { /* placeholder ref for type */ }}
            type="file"
            id="importEmployees"
            accept="application/json"
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // export employees
              const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(exportEmployees())}`;
              const a = document.createElement('a');
              a.href = dataStr;
              a.download = `employees-${new Date().toISOString().slice(0,10)}.json`;
              a.click();
            }}
          >
            Export
          </Button>
          <input
            ref={(el) => (fileInputRef.current = el)}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const parsed = JSON.parse(String(reader.result));
                  const { added, skipped } = importEmployees(parsed);
                  setEmployees(getStoredEmployees());
                  toast.success(`Imported ${added} employees, skipped ${skipped} duplicates`);
                } catch (err) {
                  toast.error('Invalid JSON file');
                }
              };
              reader.readAsText(file);
              e.currentTarget.value = '';
            }}
          />
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((employee, index) => (
          <div
            key={employee.id}
            className="glass-card-hover p-5 cursor-pointer fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => handleViewEmployee(employee)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={employee.avatar}
                  alt={employee.name}
                  className="w-12 h-12 rounded-xl bg-muted"
                />
                <div>
                  <h3 className="font-semibold">{employee.name}</h3>
                  <p className="text-sm text-muted-foreground">{employee.position}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {authUser?.role === 'admin' && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openAttendanceFor(employee); }}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Attendance
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenEdit(employee); }}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={(e) => confirmDelete(employee, e)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="truncate">{employee.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{employee.phone}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  departmentColors[employee.department] || 'bg-muted text-muted-foreground'
                )}
              >
                {employee.department}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* View Employee Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedEmployee.avatar}
                  alt={selectedEmployee.name}
                  className="w-20 h-20 rounded-2xl bg-muted"
                />
                <div>
                  <h3 className="text-xl font-bold">{selectedEmployee.name}</h3>
                  <p className="text-muted-foreground">{selectedEmployee.position}</p>
                  <span
                    className={cn(
                      'inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium',
                      departmentColors[selectedEmployee.department] ||
                        'bg-muted text-muted-foreground'
                    )}
                  >
                    {selectedEmployee.department}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium text-sm">{selectedEmployee.email}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium text-sm">{selectedEmployee.phone}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Join Date</Label>
                  <p className="font-medium text-sm">
                    {new Date(selectedEmployee.joinDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Login ID</Label>
                  <p className="font-medium text-sm font-mono">{selectedEmployee.loginId}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => {
                    if (selectedEmployee) {
                      setIsViewDialogOpen(false);
                      handleOpenEdit(selectedEmployee);
                    }
                  }}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Employee
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    if (selectedEmployee?.email) {
                      window.location.href = `mailto:${selectedEmployee.email}`;
                    } else {
                      toast('No email available for this employee');
                    }
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </div>
              <div className="mt-4 space-y-4">
                {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold">Skills</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedEmployee.skills.map((s, i) => (
                        <span key={i} className="px-2 py-1 rounded-full bg-muted/20 text-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEmployee.certifications && selectedEmployee.certifications.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold">Certifications</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedEmployee.certifications.map((c, i) => (
                        <span key={i} className="px-2 py-1 rounded-full bg-muted/20 text-sm">{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEmployee.resume && (
                  <div>
                    <h4 className="text-sm font-semibold">Resume</h4>
                    <a href={selectedEmployee.resume} target="_blank" rel="noreferrer" className="text-primary hover:underline">Download / View Resume</a>
                  </div>
                )}

                {/* Salary: visible to employee themselves and HR */}
                {(authUser?.id === selectedEmployee.id || authUser?.role === 'admin') && selectedEmployee.salary && (
                  <div>
                    <h4 className="text-sm font-semibold">Salary</h4>
                    <p className="font-medium">Base: ${selectedEmployee.salary.base ?? '—'}</p>
                    <p className="font-medium">Bonus: ${selectedEmployee.salary.bonus ?? 0}</p>
                    <p className="font-medium">Deductions: ${selectedEmployee.salary.deductions ?? 0}</p>
                    <p className="font-bold">Net: ${selectedEmployee.salary.net ?? '—'}</p>
                  </div>
                )}

                {/* Private info only HR */}
                {authUser?.role === 'admin' && selectedEmployee.privateInfo && (
                  <div>
                    <h4 className="text-sm font-semibold">Private Info (HR)</h4>
                    <p className="text-sm text-muted-foreground">{selectedEmployee.privateInfo}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {(authUser?.id === selectedEmployee.id || authUser?.role === 'admin') && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        const newPass = window.prompt('Enter new password:');
                        if (newPass && selectedEmployee) {
                          updateEmployee(selectedEmployee.id, { password: newPass });
                          toast.success('Password updated');
                        }
                      }}
                    >
                      Change Password
                    </Button>
                  )}
                  {authUser?.id === selectedEmployee.id && (
                    <Button variant="outline" onClick={() => {
                      // open edit dialog for updating photo only
                      setIsViewDialogOpen(false);
                      handleOpenEdit(selectedEmployee);
                    }}>
                      Change Photo
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Attendance Dialog (HR) */}
      <Dialog open={attendanceDialogOpen} onOpenChange={setAttendanceDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Attendance Records</DialogTitle>
          </DialogHeader>
          {attendanceFor ? (
            <div className="mt-4 space-y-3">
              <h3 className="font-semibold">{attendanceFor.name}</h3>
              {attendanceRecords.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attendance records found</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {attendanceRecords.map((r) => (
                    <div key={r.id} className="p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium">{r.date}</p>
                          <p className="text-xs text-muted-foreground">Check-in: {r.checkIn || '—'} — Check-out: {r.checkOut || '—'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{r.hoursWorked ?? 0} hrs</p>
                          <p className="text-xs text-muted-foreground">{r.status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEmployeeId ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEmployee} className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto px-1">
            {/* Photo Upload */}
              <div className="flex justify-center mb-4">
                {editingEmployeeId && authUser?.id !== editingEmployeeId ? (
                  <div className="flex flex-col items-center">
                    <img src={newEmployeeData.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newEmployeeData.name.replace(/\s/g,'')}`} alt="avatar" className="w-24 h-24 rounded-2xl bg-muted border-2 border-dashed border-border" />
                    <p className="text-xs text-muted-foreground mt-2">Only the employee can change their photo after creation</p>
                  </div>
                ) : (
                  <PhotoUpload
                    value={newEmployeeData.photo}
                    onChange={(photo) => setNewEmployeeData({ ...newEmployeeData, photo })}
                  />
                )}
              </div>

              {/* Resume Upload (optional) */}
              <div className="flex justify-center mb-4">
                <input
                  ref={(el) => (resumeInputRef.current = el)}
                  type="file"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      setNewEmployeeData({ ...newEmployeeData, resume: String(reader.result) });
                    };
                    reader.readAsDataURL(file);
                    e.currentTarget.value = '';
                  }}
                />
                <Button type="button" variant="outline" onClick={() => resumeInputRef.current?.click()}>
                  Upload Resume
                </Button>
                {newEmployeeData.resume && (
                  <span className="ml-3 text-sm text-muted-foreground">Resume attached</span>
                )}
              </div>
                {/* Skills & Certifications (optional) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Skills (comma separated)</Label>
                    <Input
                      value={(newEmployeeData as any).skills ? (newEmployeeData as any).skills.join(', ') : ''}
                      onChange={(e) => {
                        const val = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setNewEmployeeData({ ...newEmployeeData, ...( { skills: val } as any) });
                      }}
                      placeholder="e.g. React, TypeScript"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Certifications (comma separated)</Label>
                    <Input
                      value={(newEmployeeData as any).certifications ? (newEmployeeData as any).certifications.join(', ') : ''}
                      onChange={(e) => {
                        const val = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setNewEmployeeData({ ...newEmployeeData, ...( { certifications: val } as any) });
                      }}
                      placeholder="e.g. AWS Certified"
                    />
                  </div>
                </div>

                {authUser?.role === 'admin' && (
                  <div className="space-y-2 mt-2">
                    <h4 className="text-sm font-semibold">HR Only Fields</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <Input placeholder="Base" value={(newEmployeeData as any).salary?.base ?? ''} onChange={(e) => {
                        const base = Number(e.target.value) || undefined;
                        setNewEmployeeData({ ...newEmployeeData, ...( { salary: { ...( (newEmployeeData as any).salary || {}), base } } as any) });
                      }} />
                      <Input placeholder="Bonus" value={(newEmployeeData as any).salary?.bonus ?? ''} onChange={(e) => {
                        const bonus = Number(e.target.value) || undefined;
                        setNewEmployeeData({ ...newEmployeeData, ...( { salary: { ...( (newEmployeeData as any).salary || {}), bonus } } as any) });
                      }} />
                      <Input placeholder="Deductions" value={(newEmployeeData as any).salary?.deductions ?? ''} onChange={(e) => {
                        const deductions = Number(e.target.value) || undefined;
                        setNewEmployeeData({ ...newEmployeeData, ...( { salary: { ...( (newEmployeeData as any).salary || {}), deductions } } as any) });
                      }} />
                    </div>
                    <div>
                      <Label>Private Info (HR only)</Label>
                      <Input value={(newEmployeeData as any).privateInfo ?? ''} onChange={(e) => setNewEmployeeData({ ...newEmployeeData, ...( { privateInfo: e.target.value } as any) })} />
                    </div>
                  </div>
                )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={newEmployeeData.name}
                    onChange={(e) => setNewEmployeeData({ ...newEmployeeData, name: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Gender Radio Button */}
              <div className="col-span-2 space-y-2">
                <Label>Gender *</Label>
                <RadioGroup
                  value={newEmployeeData.gender}
                  onValueChange={(value) => setNewEmployeeData({ ...newEmployeeData, gender: value as 'male' | 'female' | 'other' })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="font-normal cursor-pointer">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="font-normal cursor-pointer">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="font-normal cursor-pointer">Other</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@company.com"
                    value={newEmployeeData.email}
                    onChange={(e) => setNewEmployeeData({ ...newEmployeeData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={newEmployeeData.phone}
                    onChange={(e) => setNewEmployeeData({ ...newEmployeeData, phone: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="position"
                    placeholder="Job title"
                    value={newEmployeeData.position}
                    onChange={(e) => setNewEmployeeData({ ...newEmployeeData, position: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select 
                  value={newEmployeeData.department} 
                  onValueChange={(value) => setNewEmployeeData({ ...newEmployeeData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="joinDate">Join Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="joinDate"
                    type="date"
                    value={newEmployeeData.joinDate}
                    onChange={(e) => setNewEmployeeData({ ...newEmployeeData, joinDate: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="Full address"
                    value={newEmployeeData.address}
                    onChange={(e) => setNewEmployeeData({ ...newEmployeeData, address: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Add Employee
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Employee Credentials Generated</DialogTitle>
          </DialogHeader>
          {newCredentials && (
            <div className="space-y-4 mt-4">
              <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-center">
                <Check className="w-10 h-10 mx-auto text-success mb-2" />
                <p className="text-sm text-muted-foreground">
                  New employee has been added successfully. Please share these credentials with the employee.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Login ID</p>
                      <p className="font-mono font-bold text-lg">{newCredentials.loginId}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(newCredentials.loginId, 'loginId')}
                    >
                      {copiedField === 'loginId' ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Password</p>
                      <p className="font-mono font-bold text-lg">{newCredentials.password}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(newCredentials.password, 'password')}
                    >
                      {copiedField === 'password' ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                ⚠️ Make sure to save these credentials. The password cannot be recovered later.
              </p>

              <DialogFooter>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90" 
                  onClick={() => setIsCredentialsDialogOpen(false)}
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{employeeToDelete?.name}</strong> from the system? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEmployee}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
