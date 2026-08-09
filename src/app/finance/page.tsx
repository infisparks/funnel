import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Wallet, TrendingUp, DollarSign, ArrowUpRight } from 'lucide-react';

export default function FinancePage() {
  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Finance & Revenue Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Financial reporting, invoices, and payment history.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="space-y-2">
          <span className="text-xs font-semibold text-gray-400 uppercase">Gross Revenue</span>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">$128,430.00</div>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% this quarter
          </span>
        </Card>

        <Card className="space-y-2">
          <span className="text-xs font-semibold text-gray-400 uppercase">Operating Expenses</span>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">$32,150.00</div>
          <span className="text-xs text-gray-500 font-medium">Within annual budget</span>
        </Card>

        <Card className="space-y-2">
          <span className="text-xs font-semibold text-gray-400 uppercase">Net Profit Margin</span>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">74.9%</div>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> High Margin
          </span>
        </Card>
      </div>
    </MainLayout>
  );
}
