import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockSalaryInfo } from '@/data/mockData';
import { DollarSign, TrendingUp, TrendingDown, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Salary() {
  const downloadPayslip = () => {
    const data = {
      ...mockSalaryInfo,
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const breakdown = [
    { label: 'Base Salary', amount: mockSalaryInfo.baseSalary, type: 'income' },
    { label: 'Performance Bonus', amount: mockSalaryInfo.bonus, type: 'income' },
    { label: 'Tax & Deductions', amount: -mockSalaryInfo.deductions, type: 'deduction' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Salary Information</h1>
        <p className="text-muted-foreground">View your salary details and payment history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Net Salary Card */}
        <div className="lg:col-span-2 glass-card p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground">Net Monthly Salary</p>
                <p className="text-4xl font-bold gradient-text">
                  {formatCurrency(mockSalaryInfo.netSalary)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-success">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Last paid: {formatDate(mockSalaryInfo.lastPaid)}</span>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={downloadPayslip}>
              <FileText className="w-4 h-4 mr-2" />
              Download Payslip
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-xl font-bold text-success">
                  {formatCurrency(mockSalaryInfo.baseSalary + mockSalaryInfo.bonus)}
                </p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Deductions</p>
                <p className="text-xl font-bold text-destructive">
                  {formatCurrency(mockSalaryInfo.deductions)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Breakdown */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-semibold mb-6">Salary Breakdown</h3>
        <div className="space-y-4">
          {breakdown.map((item, index) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    item.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'
                  }`}
                >
                  {item.type === 'income' ? (
                    <TrendingUp className="w-5 h-5 text-success" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
              <span
                className={`text-lg font-bold ${
                  item.type === 'income' ? 'text-success' : 'text-destructive'
                }`}
              >
                {item.type === 'income' ? '+' : ''}
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
          <div className="border-t border-border pt-4 mt-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5">
              <span className="font-semibold text-lg">Net Salary</span>
              <span className="text-2xl font-bold gradient-text">
                {formatCurrency(mockSalaryInfo.netSalary)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
