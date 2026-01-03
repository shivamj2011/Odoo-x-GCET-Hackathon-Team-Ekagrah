import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LeaveRequestsList } from '@/components/dashboard/LeaveRequestsList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { mockLeaveRequests } from '@/data/mockData';
import { getStoredLeaves, addLeaveRequest, updateLeaveStatus } from '@/lib/leaveStorage';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, CalendarPlus, Calendar, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Leave() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const [leaves, setLeaves] = useState(() => getStoredLeaves());
  const userLeaves = leaves.filter((r) => r.userId === user?.id);

  const handleApprove = (id: string) => {
    if (updateLeaveStatus(id, 'approved')) {
      setLeaves(getStoredLeaves());
      toast.success('Leave approved');
    } else {
      toast.error('Unable to approve leave');
    }
  };

  const handleReject = (id: string) => {
    if (updateLeaveStatus(id, 'rejected')) {
      setLeaves(getStoredLeaves());
      toast.success('Leave rejected');
    } else {
      toast.error('Unable to reject leave');
    }
  };

  const leaveBalance = {
    vacation: 12,
    sick: 5,
    personal: 3,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Leave request submitted successfully!');
    if (!user) {
      toast.error('You must be logged in to submit a leave request');
      return;
    }

    const newLeave = {
      id: `leave-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      type: formData.type as 'vacation' | 'sick' | 'personal' | 'other',
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      status: 'pending' as const,
      appliedOn: new Date().toISOString().split('T')[0],
    };

    addLeaveRequest(newLeave);
    setLeaves(getStoredLeaves());
    setIsDialogOpen(false);
    setFormData({ type: '', startDate: '', endDate: '', reason: '' });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Leave Management</h1>
          <p className="text-muted-foreground">Apply for leave and track your requests</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-5 h-5 mr-2" />
              Apply Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-primary" />
                Apply for Leave
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="type">Leave Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for leave..."
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Submit Request
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase">Vacation</span>
          </div>
          <p className="text-3xl font-bold text-primary">{leaveBalance.vacation}</p>
          <p className="text-sm text-muted-foreground">days remaining</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-destructive" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase">Sick</span>
          </div>
          <p className="text-3xl font-bold text-destructive">{leaveBalance.sick}</p>
          <p className="text-sm text-muted-foreground">days remaining</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase">Personal</span>
          </div>
          <p className="text-3xl font-bold text-accent">{leaveBalance.personal}</p>
          <p className="text-sm text-muted-foreground">days remaining</p>
        </div>
      </div>

      {/* Leave Requests */}
      <LeaveRequestsList
        requests={userLeaves}
        showActions={user?.role === 'admin'}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </DashboardLayout>
  );
}
