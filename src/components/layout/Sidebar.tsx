'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../theme/ThemeProvider';
import {
  Sparkles,
  TrendingUp,
  Columns,
  Calendar,
  CalendarCheck,
  Users,
  Package,
  FileText,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Settings,
  LogOut,
  ChevronLeft,
  Star,
  Clock,
  Share2,
  Trash2,
  Plus,
  LogIn,
  MessageSquare,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname() || '/';
  const {
    accentColor,
    sidebarStyle,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileOpen,
    setIsMobileOpen,
  } = useTheme();

  const [foldersOpen, setFoldersOpen] = useState(true);
  const [myDocsOpen, setMyDocsOpen] = useState(true);

  // Active link helper
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  // Top Main CRM workspace items requested by user
  const crmWorkspaceItems = [
    { label: 'Landing Page', icon: Sparkles, href: '/landing', badge: null },
    { label: 'Dashboard & Leads', icon: TrendingUp, href: '/dashboard', badge: null },
    { label: 'Pipeline Stage Board', icon: Columns, href: '/pipeline', badge: '14' },
    { label: 'WhatsApp Automation', icon: MessageSquare, href: '/whatsapp', badge: 'Auto' },
    { label: 'Meetings Calendar', icon: Calendar, href: '/calendar', badge: '3' },
    { label: 'Scheduled Meetings', icon: CalendarCheck, href: '/meetings', badge: null },
  ];

  const secondaryNavItems = [
    { label: 'Supabase Auth', icon: LogIn, href: '/login', badge: 'New' },
    { label: 'Customers', icon: Users, href: '/customers', badge: null },
    { label: 'Products', icon: Package, href: '/products', badge: null },
    { label: 'Documents', icon: FileText, href: '/documents', badge: null },
  ];

  const customSavedItems = [
    { label: 'List of sales', href: '/sales', color: '#F97316' },
    { label: 'Saved items', href: '/saved', color: '#10B981' },
    { label: 'Ecommerce', href: '/ecommerce', color: '#3B82F6' },
  ];

  // ----------------------------------------------------
  // COMPACT VERTICAL DOCK BAR
  // ----------------------------------------------------
  if (sidebarStyle === 'compact') {
    return (
      <aside className="w-16 sm:w-20 bg-white border-r border-[#E5E7EB] h-screen flex flex-col justify-between items-center py-5 shrink-0 z-30">
        <div className="flex flex-col items-center gap-6">
          <Link
            href="/landing"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs font-bold text-lg"
            style={{ backgroundColor: accentColor.primary }}
          >
            <Sparkles className="w-5 h-5 fill-white/20" />
          </Link>

          <nav className="flex flex-col items-center space-y-3 w-full px-2">
            {crmWorkspaceItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative p-3 rounded-xl transition-all duration-200 group flex items-center justify-center ${
                    active
                      ? 'shadow-2xs font-semibold'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: active ? accentColor.light : undefined,
                    color: active ? accentColor.primary : undefined,
                  }}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" style={{ color: accentColor.primary }} />
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full"
                      style={{ backgroundColor: accentColor.primary }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <Link href="/login" className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm">
          DM
        </Link>
      </aside>
    );
  }

  // ----------------------------------------------------
  // STANDARD EXECUTIVE & DUAL-COLUMN SIDEBAR
  // ----------------------------------------------------
  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 bg-white border-r border-[#E5E7EB] h-dvh lg:h-screen flex flex-col justify-between transition-all duration-300 z-50 lg:z-30 shrink-0 ${
        isSidebarCollapsed ? 'w-20' : 'w-[85vw] max-w-xs sm:w-72'
      } ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* User Account / Profile Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
          {!isSidebarCollapsed ? (
            <Link
              href="/login"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-3 w-full group min-h-[44px]"
            >
              <div
                className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0"
                style={{ backgroundColor: accentColor.primary }}
              >
                DM
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-[#111827] group-hover:text-indigo-600 transition-colors truncate">
                  Diana Mary
                </h2>
                <p className="text-xs text-[#6B7280] truncate">
                  Manager Account
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
            </Link>
          ) : (
            <div
              className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-2xs"
              style={{ backgroundColor: accentColor.primary }}
            >
              F
            </div>
          )}
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-6 scrollbar-thin">
          {/* CRM WORKSPACE SECTION */}
          <div>
            {!isSidebarCollapsed && (
              <span className="text-[11px] font-bold tracking-wider uppercase text-gray-400 px-3 block mb-2.5">
                CRM WORKSPACE
              </span>
            )}

            <div className="space-y-1.5">
              {crmWorkspaceItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`relative flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group min-h-[44px] ${
                      active
                        ? 'shadow-2xs'
                        : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-950'
                    }`}
                    style={{
                      backgroundColor: active ? accentColor.light : 'transparent',
                      color: active ? accentColor.primary : '#1F2937',
                    }}
                  >
                    {active && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full"
                        style={{ backgroundColor: accentColor.primary }}
                      />
                    )}

                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className="w-5 h-5 shrink-0"
                        style={{
                          color: active ? accentColor.primary : accentColor.primary,
                        }}
                      />
                      {!isSidebarCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {!isSidebarCollapsed && item.badge && (
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: active ? accentColor.primary : accentColor.light,
                          color: active ? '#FFFFFF' : accentColor.primary,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* SECONDARY MANAGEMENT LINKS */}
          <div>
            {!isSidebarCollapsed && (
              <span className="text-[11px] font-bold tracking-wider uppercase text-gray-400 px-3 block mb-2">
                MANAGEMENT
              </span>
            )}

            <div className="space-y-1">
              {secondaryNavItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'shadow-2xs font-semibold'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    style={{
                      backgroundColor: active ? accentColor.light : undefined,
                      color: active ? accentColor.primary : undefined,
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 shrink-0 text-gray-500" />
                      {!isSidebarCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {!isSidebarCollapsed && item.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-[#8146F0]">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* FOLDERS SECTION */}
          {!isSidebarCollapsed && (
            <div className="pt-2 border-t border-gray-100">
              <div
                className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1 cursor-pointer hover:text-gray-700"
                onClick={() => setFoldersOpen(!foldersOpen)}
              >
                <span>FOLDERS</span>
                {foldersOpen ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </div>

              {foldersOpen && (
                <div className="mt-2 space-y-1 pl-1">
                  <div>
                    <div
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                      onClick={() => setMyDocsOpen(!myDocsOpen)}
                    >
                      {myDocsOpen ? (
                        <FolderOpen className="w-4 h-4 text-blue-500 shrink-0" />
                      ) : (
                        <Folder className="w-4 h-4 text-blue-500 shrink-0" />
                      )}
                      <span className="flex-1 truncate">My documents</span>
                      {myDocsOpen ? (
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      )}
                    </div>

                    {myDocsOpen && (
                      <div className="ml-6 pl-2 border-l border-gray-200 space-y-1 mt-1">
                        <Link
                          href="/documents/work"
                          className="block px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                        >
                          Work docs
                        </Link>
                        <Link
                          href="/documents/nca"
                          className="block px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                        >
                          NCA forms
                        </Link>
                        <div className="flex items-center justify-between px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                          <span>Others</span>
                          <Plus className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>

                  <Link
                    href="/documents/family"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Folder className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>Family photos</span>
                  </Link>

                  <Link
                    href="/documents/spiritual"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Folder className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Spiritual</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* OTHERS SECTION */}
          {!isSidebarCollapsed && (
            <div className="pt-2 border-t border-gray-100">
              <span className="text-[11px] font-bold tracking-wider uppercase text-gray-400 px-3 block mb-2">
                OTHERS
              </span>
              <div className="space-y-1">
                {customSavedItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#E5E7EB] flex items-center justify-between shrink-0 bg-gray-50/50">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="p-2 rounded-lg hover:bg-gray-200 text-gray-500"
                  title="User Account & Supabase Auth"
                >
                  <Settings className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </Link>
              </div>

              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 hidden lg:block"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="p-2 mx-auto rounded-lg hover:bg-gray-200 text-gray-500"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
