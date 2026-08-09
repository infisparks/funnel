'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { MoreHorizontal, Filter, ArrowUpDown } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';

export function TaskTable() {
  const { accentColor } = useTheme();

  const users = [
    {
      id: 1,
      name: 'Diana Mary',
      email: 'diana.mary@company.com',
      avatar: 'DM',
      role: 'Product Lead',
      department: 'Management',
      status: 'Active',
      tasks: '18 Tasks',
    },
    {
      id: 2,
      name: 'Alex Johnson',
      email: 'alex.j@company.com',
      avatar: 'AJ',
      role: 'Senior Developer',
      department: 'Engineering',
      status: 'Active',
      tasks: '24 Tasks',
    },
    {
      id: 3,
      name: 'Sarah Connor',
      email: 'sarah.c@company.com',
      avatar: 'SC',
      role: 'UX Designer',
      department: 'Design',
      status: 'Onboarding',
      tasks: '9 Tasks',
    },
    {
      id: 4,
      name: 'Michael Scott',
      email: 'm.scott@company.com',
      avatar: 'MS',
      role: 'Regional Manager',
      department: 'Sales',
      status: 'Inactive',
      tasks: '5 Tasks',
    },
    {
      id: 5,
      name: 'Elena Rostova',
      email: 'elena.r@company.com',
      avatar: 'ER',
      role: 'Data Analyst',
      department: 'Analytics',
      status: 'Active',
      tasks: '31 Tasks',
    },
  ];

  return (
    <Card className="p-0 overflow-hidden bg-white border border-[#E5E7EB]">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div>
          <h3 className="text-lg font-bold text-[#111827]">
            Team Members & Directory
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage roles, department assignments, and active task workloads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort</span>
          </button>
        </div>
      </div>

      {/* Table Responsive Wrapper */}
      <div className="overflow-x-auto bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F8FAFC] text-gray-600 font-bold text-xs border-b border-[#E5E7EB]">
            <tr>
              <th className="px-6 py-4">Member</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Workload</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-[#F9FAFB] transition-colors group"
              >
                {/* Member Avatar + Name + Email */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-2xs shrink-0"
                      style={{
                        backgroundColor: accentColor.light,
                        color: accentColor.primary,
                      }}
                    >
                      {user.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-[#111827]">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="px-6 py-4 font-medium text-gray-700">
                  {user.role}
                </td>

                {/* Department Badge */}
                <td className="px-6 py-4">
                  <Badge variant="info">{user.department}</Badge>
                </td>

                {/* Status Badge */}
                <td className="px-6 py-4">
                  <Badge
                    variant={
                      user.status === 'Active'
                        ? 'success'
                        : user.status === 'Onboarding'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {user.status}
                  </Badge>
                </td>

                {/* Workload */}
                <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                  {user.tasks}
                </td>

                {/* 3 Dots Actions */}
                <td className="px-6 py-4 text-right">
                  <button className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
