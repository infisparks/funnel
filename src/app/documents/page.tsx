import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { FolderExplorer } from '@/components/dashboard/FolderExplorer';

export default function DocumentsPage() {
  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Documents & Storage
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Access files, NCA agreements, work docs, and shared repositories.
          </p>
        </div>
      </div>

      <FolderExplorer />
    </MainLayout>
  );
}
