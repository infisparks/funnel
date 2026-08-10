'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ThemeCustomizer } from '../theme/ThemeCustomizer';
import { useTheme } from '../theme/ThemeProvider';
import { ClientDrawer } from '../client/ClientDrawer';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isMobileOpen, setIsMobileOpen } = useTheme();

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F6F8] text-[#111827] font-sans antialiased">
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Modern Professional Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Page Main View - 100% Full Width & Fully Responsive */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 scrollbar-thin">
          <div className="w-full space-y-4 sm:space-y-6">
            {children}
          </div>
        </main>

        {/* Theme Customizer Floating Trigger & Side Drawer */}
        <ThemeCustomizer />
      </div>

      {/* Slide-over Client Details Drawer */}
      <ClientDrawer />
    </div>
  );
}
