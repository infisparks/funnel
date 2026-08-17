'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ThemeCustomizer } from '../theme/ThemeCustomizer';
import { useTheme } from '../theme/ThemeProvider';
import { ClientDrawer } from '../client/ClientDrawer';
import { useAuth } from '../auth/AuthContext';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isMobileOpen, setIsMobileOpen } = useTheme();
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // If user is not authenticated and not in public flow, redirect to /login
  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.replace('/login');
    }
  }, [user, loading, router, pathname]);

  // Loading spinner while checking auth session
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F5F6F8]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-[#6B7280]">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // If not logged in, render nothing (router is redirecting to /login)
  if (!user && pathname !== '/login') {
    return null;
  }

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
