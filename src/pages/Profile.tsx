import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getStoredEmployees, updateEmployee, StoredEmployee } from '@/lib/employeeStorage';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Calendar,
  Edit2,
  Save,
  X,
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [certifications, setCertifications] = useState<string[]>(user?.certifications || []);
  const [resume, setResume] = useState<string | undefined>(user?.resume);
  const [salary, setSalary] = useState<{ base?: number; bonus?: number; deductions?: number; net?: number }>(user?.salary || {});
  const [privateInfo, setPrivateInfo] = useState<string | undefined>(user?.privateInfo);

  useEffect(() => {
    setSkills(user?.skills || []);
    setCertifications(user?.certifications || []);
    setResume(user?.resume);
    setSalary(user?.salary || {});
    setPrivateInfo(user?.privateInfo);
  }, [user]);

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, save to backend
    const stored = getStoredEmployees().find((e) => e.id === user?.id) as StoredEmployee | undefined;
    if (stored) {
      updateEmployee(stored.id, {
        phone: formData.phone,
        address: formData.address,
        skills,
        certifications,
        resume,
        salary,
        privateInfo,
      });
      toast.success('Profile saved');
    }
  };

  const infoItems = [
    { icon: Mail, label: 'Email', value: user?.email },
    { icon: Phone, label: 'Phone', value: formData.phone || 'Not provided' },
    { icon: Building2, label: 'Department', value: user?.department },
    { icon: Briefcase, label: 'Position', value: user?.position },
    { icon: Calendar, label: 'Join Date', value: user?.joinDate },
    { icon: MapPin, label: 'Address', value: formData.address || 'Not provided' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="glass-card p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
          
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-28 h-28 rounded-2xl bg-muted border-4 border-background shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-success flex items-center justify-center border-4 border-background">
                <div className="w-3 h-3 rounded-full bg-success-foreground" />
              </div>
            </div>
            
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-bold mb-1">{user?.name}</h1>
              <p className="text-lg text-muted-foreground mb-2">{user?.position}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {user?.department}
                </span>
                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium capitalize">
                  {user?.role}
                </span>
              </div>
            </div>

            <Button
              variant={isEditing ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
          
          {isEditing ? (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Enter address"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex gap-2">
                  <Input id="newSkill" placeholder="Add skill and press Enter" onKeyDown={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (e.key === 'Enter' && target.value.trim()) {
                      setSkills([...skills, target.value.trim()]);
                      target.value = '';
                      e.preventDefault();
                    }
                  }} />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((s, i) => (
                    <span key={i} className="px-2 py-1 rounded-full bg-muted/20 flex items-center gap-2">
                      {s}
                      <button type="button" onClick={() => setSkills(skills.filter((_, idx) => idx !== i))} className="text-xs text-destructive">x</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Certifications</Label>
                <div className="flex gap-2">
                  <Input id="newCert" placeholder="Add certification and press Enter" onKeyDown={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (e.key === 'Enter' && target.value.trim()) {
                      setCertifications([...certifications, target.value.trim()]);
                      target.value = '';
                      e.preventDefault();
                    }
                  }} />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {certifications.map((c, i) => (
                    <span key={i} className="px-2 py-1 rounded-full bg-muted/20 flex items-center gap-2">
                      {c}
                      <button type="button" onClick={() => setCertifications(certifications.filter((_, idx) => idx !== i))} className="text-xs text-destructive">x</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Resume</Label>
                <input type="file" accept="application/pdf,application/msword" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setResume(String(reader.result));
                  reader.readAsDataURL(file);
                }} />
                {resume && <p className="text-sm text-muted-foreground">Resume attached</p>}
              </div>

              {user?.role === 'admin' && (
                <div className="space-y-2">
                  <Label>Salary Details (HR only)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Base" value={salary.base ?? ''} onChange={(e) => setSalary({ ...salary, base: Number(e.target.value) || undefined })} />
                    <Input placeholder="Bonus" value={salary.bonus ?? ''} onChange={(e) => setSalary({ ...salary, bonus: Number(e.target.value) || undefined })} />
                    <Input placeholder="Deductions" value={salary.deductions ?? ''} onChange={(e) => setSalary({ ...salary, deductions: Number(e.target.value) || undefined })} />
                  </div>
                </div>
              )}

              {user?.role === 'admin' && (
                <div className="space-y-2">
                  <Label>Private Info (HR only)</Label>
                  <textarea value={privateInfo} onChange={(e) => setPrivateInfo(e.target.value)} className="w-full p-2 rounded-md bg-muted/10" />
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Skills & Certifications</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {skills.map((s, i) => (
                    <span key={i} className="px-2 py-1 rounded-full bg-muted/20">{s}</span>
                  ))}
                  {certifications.map((c, i) => (
                    <span key={`c-${i}`} className="px-2 py-1 rounded-full bg-muted/20">{c}</span>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {infoItems.map((item, index) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-medium truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
