'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button, Card, Badge, SectionHeader } from '@/components/ui';
import { useClientDrawer } from '@/components/client/ClientDrawerContext';
import { Plus, MoreVertical, Phone, MessageCircle } from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  company: string;
  value: string;
  contact: string;
  email: string;
  phone: string;
  avatar: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface Column {
  id: string;
  title: string;
  color: string;
  deals: Deal[];
}

export default function PipelinePage() {
  const { openClientDrawer } = useClientDrawer();

  const [columns] = useState<Column[]>([
    {
      id: 'lead-in',
      title: 'Lead In',
      color: '#3B82F6',
      deals: [
        {
          id: 'd1',
          title: 'Enterprise HR Integration',
          company: 'BlueWave Logistics',
          value: '₹35,000',
          contact: 'Liam O’Connor',
          email: 'liam@bluewave.com',
          phone: '+91 9409242100',
          avatar: 'Liam O’Connor',
          priority: 'High',
        },
        {
          id: 'd2',
          title: 'Custom CRM Pipeline Setup',
          company: 'Apex Digital Labs',
          value: '₹12,500',
          contact: 'Nina Patel',
          email: 'nina@apexdigital.io',
          phone: '+91 8082931505',
          avatar: 'Nina Patel',
          priority: 'Medium',
        },
      ],
    },
    {
      id: 'contact-made',
      title: 'Contact Made',
      color: '#8B5CF6',
      deals: [
        {
          id: 'd3',
          title: 'Healthcare Staffing Suite',
          company: 'Apex Healthcare Inc.',
          value: '₹18,200',
          contact: 'Dr. Rebecca Stone',
          email: 'rstone@apexhealth.org',
          phone: '+91 9867869968',
          avatar: 'Rebecca Stone',
          priority: 'Medium',
        },
      ],
    },
    {
      id: 'demo-scheduled',
      title: 'Demo Scheduled',
      color: '#F59E0B',
      deals: [
        {
          id: 'd4',
          title: 'Global Fintech Platform',
          company: 'Starlight Financial',
          value: '₹48,000',
          contact: 'Marcus Vance',
          email: 'm.vance@starlight.io',
          phone: '+91 7709037124',
          avatar: 'Marcus Vance',
          priority: 'High',
        },
        {
          id: 'd5',
          title: 'Automated Payroll Engine',
          company: 'Nexlify Studios',
          value: '₹22,000',
          contact: 'Chloe Bennett',
          email: 'chloe@nexlify.com',
          phone: '+91 9885020967',
          avatar: 'Chloe Bennett',
          priority: 'Low',
        },
      ],
    },
    {
      id: 'proposal-sent',
      title: 'Proposal Sent',
      color: '#06B6D4',
      deals: [
        {
          id: 'd6',
          title: 'Annual Enterprise License',
          company: 'Acme Global Tech',
          value: '₹24,500',
          contact: 'Sarah Jenkins',
          email: 'sarah.j@acme.com',
          phone: '+91 9409242100',
          avatar: 'Sarah Jenkins',
          priority: 'High',
        },
      ],
    },
    {
      id: 'closed-won',
      title: 'Closed Won',
      color: '#10B981',
      deals: [
        {
          id: 'd7',
          title: 'Cyber Security Compliance App',
          company: 'CyberShield Systems',
          value: '₹62,000',
          contact: 'Elena Rostova',
          email: 'elena@cybershield.co',
          phone: '+91 9867869968',
          avatar: 'Elena Rostova',
          priority: 'High',
        },
      ],
    },
  ]);

  return (
    <MainLayout>
      <SectionHeader
        title="Pipeline Stage Board"
        subtitle="Visual sales stages, deal momentum, and stage conversions."
        actions={
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Create New Deal
          </Button>
        }
      />

      <div className="flex gap-5 overflow-x-auto pb-6 pt-2">
        {columns.map((col) => {
          const totalColValue = col.deals.reduce((acc, deal) => {
            const num = parseInt(deal.value.replace(/[^0-9]/g, ''), 10) || 0;
            return acc + num;
          }, 0);

          return (
            <div
              key={col.id}
              className="w-72 sm:w-80 shrink-0 flex flex-col bg-gray-50/70 border border-[#E5E7EB] rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: col.color }}
                  />
                  <h3 className="font-bold text-sm text-[#111827]">{col.title}</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                    {col.deals.length}
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-500">
                  ₹{(totalColValue / 1000).toFixed(1)}k
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {col.deals.map((deal) => (
                  <Card
                    key={deal.id}
                    interactive
                    padding="sm"
                    className="space-y-3 bg-white border border-[#E5E7EB] hover:shadow-md cursor-pointer"
                    onClick={() =>
                      openClientDrawer({
                        id: deal.id,
                        name: deal.contact,
                        email: deal.email,
                        phone: deal.phone,
                        stage: col.title,
                        dealValue: deal.value,
                        survey: {
                          industry: 'Service Business',
                          investmentReady: 'Yes',
                          revenue: 'Below ₹5L',
                          role: 'Founder / Owner',
                        },
                      })
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Badge
                        variant={
                          deal.priority === 'High'
                            ? 'error'
                            : deal.priority === 'Medium'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {deal.priority}
                      </Badge>
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          openClientDrawer({
                            id: deal.id,
                            name: deal.contact,
                            email: deal.email,
                            phone: deal.phone,
                            stage: col.title,
                            dealValue: deal.value,
                          });
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-[#111827] group-hover:text-purple-600 transition-colors">
                        {deal.title}
                      </h4>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">
                        {deal.company}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                      <span className="font-extrabold text-sm text-[#8146F0]">
                        {deal.value}
                      </span>
                      <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-[#8146F0] text-[10px] font-bold flex items-center justify-center">
                          {deal.contact[0]}
                        </span>
                        <span>{deal.contact.split(' ')[0]}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </MainLayout>
  );
}
