import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckSquare, Clock, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function TasksPage() {
  const tasks = [
    { id: 1, title: 'Review Q3 Performance Appraisal Drafts', category: 'Management', priority: 'High', due: 'Today', status: 'In Progress' },
    { id: 2, title: 'Update Partner Branding Guidelines', category: 'Design', priority: 'Medium', due: 'Tomorrow', status: 'Pending' },
    { id: 3, title: 'Audit Security Credentials & Next.js Build', category: 'Engineering', priority: 'High', due: '12 Aug', status: 'In Progress' },
    { id: 4, title: 'Send Monthly Invoice Summaries to Finance', category: 'Finance', priority: 'Low', due: '15 Aug', status: 'Completed' },
  ];

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Task Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track action items, assignments, and pending approvals.
          </p>
        </div>

        <Button variant="primary">
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant={task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'default'}>
                {task.priority} Priority
              </Badge>
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Due {task.due}
              </span>
            </div>

            <h3 className="font-semibold text-base text-gray-900 dark:text-white">
              {task.title}
            </h3>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                Category: {task.category}
              </span>
              <Badge variant={task.status === 'Completed' ? 'success' : 'info'}>
                {task.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
}
