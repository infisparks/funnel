'use client';

import React from 'react';
import { StatCard } from '../ui';
import { DollarSign, Users, CheckCircle, TrendingUp } from 'lucide-react';

export function StatsGrid() {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$128,430.00',
      change: '+14.2%',
      isPositive: true,
      icon: DollarSign,
      subtext: 'vs. last month',
    },
    {
      title: 'Active Customers',
      value: '2,845',
      change: '+8.1%',
      isPositive: true,
      icon: Users,
      subtext: 'vs. last month',
    },
    {
      title: 'Task Completion',
      value: '92.4%',
      change: '+3.5%',
      isPositive: true,
      icon: CheckCircle,
      subtext: '1,290 completed',
    },
    {
      title: 'Conversion Rate',
      value: '3.84%',
      change: '-0.4%',
      isPositive: false,
      icon: TrendingUp,
      subtext: 'vs. last month',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, idx) => (
        <StatCard key={idx} {...stat} />
      ))}
    </div>
  );
}
