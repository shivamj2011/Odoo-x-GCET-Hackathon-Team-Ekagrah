import { LeaveRequest } from '@/types/hrms';
import { mockLeaveRequests } from '@/data/mockData';

const LEAVES_KEY = 'hrms_leaves';

export function getStoredLeaves(): LeaveRequest[] {
  const stored = localStorage.getItem(LEAVES_KEY);
  if (!stored) {
    localStorage.setItem(LEAVES_KEY, JSON.stringify(mockLeaveRequests));
    return mockLeaveRequests;
  }
  return JSON.parse(stored);
}

export function addLeaveRequest(leave: LeaveRequest) {
  const leaves = getStoredLeaves();
  leaves.push(leave);
  localStorage.setItem(LEAVES_KEY, JSON.stringify(leaves));
}

export function updateLeaveStatus(id: string, status: 'pending' | 'approved' | 'rejected'): boolean {
  const leaves = getStoredLeaves();
  const idx = leaves.findIndex((l) => l.id === id);
  if (idx === -1) return false;
  leaves[idx] = { ...leaves[idx], status };
  localStorage.setItem(LEAVES_KEY, JSON.stringify(leaves));
  return true;
}

export function replaceLeaves(newLeaves: LeaveRequest[]) {
  localStorage.setItem(LEAVES_KEY, JSON.stringify(newLeaves));
}

export default {};
