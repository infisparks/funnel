import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TaskTable } from '@/components/dashboard/TaskTable';
import { Button, SectionHeader } from '@/components/ui';
import { UserPlus, Download } from 'lucide-react';

export default function CustomersPage() {
  return (
    <MainLayout>
      <SectionHeader
        title="Customers Directory"
        subtitle="Manage customer relations, account records, and contact directories."
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
              Export CSV
            </Button>
            <Button variant="primary" leftIcon={<UserPlus className="w-4 h-4" />}>
              Add Customer
            </Button>
          </>
        }
      />

      <TaskTable />
    </MainLayout>
  );
}
