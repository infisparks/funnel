'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { LeadsTable } from '@/components/funnel/LeadsTable';
import { SectionHeader } from '@/components/ui';
import { Shield } from 'lucide-react';

export default function CustomersPage() {
  return (
    <MainLayout>
      <SectionHeader
        title="Landing Page Leads & Customers Directory"
        subtitle="View and manage leads captured strictly from your landing page and 3-popup funnel."
        actions={
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 font-extrabold text-xs flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Isolated Workspace Privacy</span>
            </span>
          </div>
        }
      />

      <LeadsTable />
    </MainLayout>
  );
}
