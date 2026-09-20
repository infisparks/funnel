'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button, Card, Badge, SectionHeader } from '@/components/ui';
import { Package, Plus, Star, Activity } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { MetaPixelModal } from '@/components/funnel/MetaPixelModal';

export default function ProductsPage() {
  const { workspace, saveWorkspaceConfig } = useAuth();
  const [isPixelModalOpen, setIsPixelModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const products = [
    { id: 1, name: 'Enterprise HR Suite', category: 'Software', price: '$499/mo', rating: '4.9' },
    { id: 2, name: 'Analytics Pro Add-on', category: 'Extension', price: '$129/mo', rating: '4.8' },
    { id: 3, name: 'Custom CRM Connector', category: 'Integration', price: '$299 one-time', rating: '5.0' },
    { id: 4, name: 'Automated Payroll Module', category: 'Module', price: '$199/mo', rating: '4.7' },
  ];

  const handleSavePixel = async (newPixelId: string | null) => {
    const ok = await saveWorkspaceConfig({ pixel_id: newPixelId });
    if (ok) {
      setToastMsg(newPixelId ? `Meta Pixel ID ${newPixelId} saved & active! 🎯` : 'Meta Pixel removed.');
      setTimeout(() => setToastMsg(null), 4000);
    }
    return ok;
  };

  return (
    <MainLayout>
      <SectionHeader
        title="Products & Catalog"
        subtitle="Browse and configure active software packages, subscriptions, and conversion tracking."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPixelModalOpen(true)}
              leftIcon={<Activity className={`w-3.5 h-3.5 ${workspace?.pixel_id ? 'text-emerald-600' : 'text-indigo-600'}`} />}
              className={`text-xs font-semibold ${
                workspace?.pixel_id
                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                  : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
              }`}
            >
              {workspace?.pixel_id ? `Pixel: ${workspace.pixel_id}` : 'Set up Meta Pixel'}
            </Button>

            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              New Product
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} interactive className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Package className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Badge variant="info">{product.category}</Badge>
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{product.rating}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#111827] mt-2">
                {product.name}
              </h3>
              <p className="text-xl font-extrabold text-[#111827] mt-1">
                {product.price}
              </p>
            </div>

            <Button variant="secondary" className="w-full">
              Manage Product
            </Button>
          </Card>
        ))}
      </div>

      <MetaPixelModal
        isOpen={isPixelModalOpen}
        onClose={() => setIsPixelModalOpen(false)}
        currentPixelId={workspace?.pixel_id}
        onSave={handleSavePixel}
        workspaceSubdomain={workspace?.subdomain}
      />

      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="px-3.5 py-2 rounded-xl bg-[#111827] text-white text-xs font-medium shadow-lg flex items-center gap-2 border border-gray-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
