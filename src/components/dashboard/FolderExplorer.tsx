'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Folder, FileText, Star, MoreVertical, Plus } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';

export function FolderExplorer() {
  const { accentColor } = useTheme();

  const folders = [
    { name: 'Work docs', count: '142 files', size: '1.2 GB', color: '#3B82F6' },
    { name: 'NCA forms', count: '38 files', size: '450 MB', color: '#10B981' },
    { name: 'Family photos', count: '890 files', size: '8.4 GB', color: '#8B5CF6' },
    { name: 'Spiritual', count: '24 files', size: '120 MB', color: '#F59E0B' },
  ];

  const recentFiles = [
    { name: 'Q3_Financial_Report_2026.pdf', size: '4.8 MB', date: 'Today, 2:15 PM', type: 'PDF' },
    { name: 'System_Architecture_V2.docx', size: '1.2 MB', date: 'Yesterday', type: 'DOC' },
    { name: 'Team_Offsite_Group_Photo.png', size: '14.5 MB', date: '07 Aug 2026', type: 'IMG' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Folder Tree Cards */}
      <Card className="lg:col-span-2 space-y-4 bg-white border border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#111827]">
              Documents & Folder Manager
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Quick access to active organizational folders and media repositories.
            </p>
          </div>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-2xs hover:opacity-90 transition-opacity"
            style={{ backgroundColor: accentColor.primary }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Folder</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {folders.map((folder, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-[#E5E7EB] bg-gray-50/60 hover:bg-white hover:shadow-xs transition-all duration-200 cursor-pointer group flex items-start justify-between"
            >
              <div className="flex items-start gap-3">
                <div
                  className="p-2.5 rounded-xl text-white shadow-2xs group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: folder.color }}
                >
                  <Folder className="w-5 h-5 fill-white/20" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#111827] group-hover:text-indigo-600">
                    {folder.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {folder.count} • {folder.size}
                  </p>
                </div>
              </div>

              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Files List */}
      <Card className="space-y-4 bg-white border border-[#E5E7EB]">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <h3 className="text-base font-bold text-[#111827]">
            Recent Uploads
          </h3>
          <Badge variant="info">3 New</Badge>
        </div>

        <div className="space-y-3">
          {recentFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="p-2 rounded-lg shrink-0"
                  style={{ backgroundColor: accentColor.light, color: accentColor.primary }}
                >
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-semibold text-xs text-[#111827] truncate">
                    {file.name}
                  </h5>
                  <span className="text-[11px] text-gray-500">
                    {file.size} • {file.date}
                  </span>
                </div>
              </div>
              <Star className="w-4 h-4 text-gray-300 hover:text-amber-400 cursor-pointer shrink-0 ml-2" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
