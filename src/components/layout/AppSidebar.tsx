import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  User,
  LogOut,
  Building2,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: User, label: 'My Profile', path: '/profile' },
  { icon: Clock, label: 'Attendance', path: '/attendance' },
  { icon: CalendarDays, label: 'Leave', path: '/leave' },
  { icon: DollarSign, label: 'Salary', path: '/salary' },
  { icon: Users, label: 'Employees', path: '/employees', adminOnly: true },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg gradient-text">HRMS</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? (
            <Menu className="w-5 h-5 text-sidebar-foreground" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-sidebar-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon
                    className={cn(
                      'w-5 h-5 flex-shrink-0',
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'
                    )}
                  />
                  {!collapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                  {isActive && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-2 border-t border-sidebar-border">
        {user && (
          <div
            className={cn(
              'flex items-center gap-3 p-2 rounded-lg mb-2',
              collapsed ? 'justify-center' : ''
            )}
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-9 h-9 rounded-full bg-muted"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user.role}
                </p>
              </div>
            )}
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors',
            collapsed ? 'justify-center' : ''
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
