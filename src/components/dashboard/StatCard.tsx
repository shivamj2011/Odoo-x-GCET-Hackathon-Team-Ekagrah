import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'success';
}

const variantStyles = {
  default: 'text-foreground',
  primary: 'text-primary',
  accent: 'text-accent',
  success: 'text-success',
};

const iconBgStyles = {
  default: 'bg-muted',
  primary: 'bg-primary/10',
  accent: 'bg-accent/10',
  success: 'bg-success/10',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: StatCardProps) {
  return (
    <div className="stat-card fade-in">
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            iconBgStyles[variant]
          )}
        >
          <Icon className={cn('w-6 h-6', variantStyles[variant])} />
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full',
              trend.isPositive
                ? 'bg-success/10 text-success'
                : 'bg-destructive/10 text-destructive'
            )}
          >
            <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
        <p className={cn('text-3xl font-bold', variantStyles[variant])}>
          {value}
        </p>
        {subtitle && (
          <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
