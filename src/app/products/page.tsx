import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button, Card, Badge, SectionHeader } from '@/components/ui';
import { Package, Plus, Star } from 'lucide-react';

export default function ProductsPage() {
  const products = [
    { id: 1, name: 'Enterprise HR Suite', category: 'Software', price: '$499/mo', rating: '4.9' },
    { id: 2, name: 'Analytics Pro Add-on', category: 'Extension', price: '$129/mo', rating: '4.8' },
    { id: 3, name: 'Custom CRM Connector', category: 'Integration', price: '$299 one-time', rating: '5.0' },
    { id: 4, name: 'Automated Payroll Module', category: 'Module', price: '$199/mo', rating: '4.7' },
  ];

  return (
    <MainLayout>
      <SectionHeader
        title="Products & Catalog"
        subtitle="Browse and configure active software packages and subscriptions."
        actions={
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            New Product
          </Button>
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
    </MainLayout>
  );
}
