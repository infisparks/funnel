'use client';

import React, { createContext, useContext, useState } from 'react';

export interface ClientData {
  id?: string | number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  stage?: string;
  dealValue?: string | number;
  time?: string;
  survey?: {
    industry?: string;
    investmentReady?: string;
    revenue?: string;
    role?: string;
  } | null;
  meetingTime?: string;
  googleMeetUrl?: string;
  campaign?: string;
  createdDate?: string;
}

interface ClientDrawerContextType {
  isOpen: boolean;
  selectedClient: ClientData | null;
  openClientDrawer: (client: ClientData) => void;
  closeClientDrawer: () => void;
}

const ClientDrawerContext = createContext<ClientDrawerContextType | undefined>(undefined);

export function ClientDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);

  const openClientDrawer = (client: ClientData) => {
    setSelectedClient(client);
    setIsOpen(true);
  };

  const closeClientDrawer = () => {
    setIsOpen(false);
  };

  return (
    <ClientDrawerContext.Provider
      value={{
        isOpen,
        selectedClient,
        openClientDrawer,
        closeClientDrawer,
      }}
    >
      {children}
    </ClientDrawerContext.Provider>
  );
}

export function useClientDrawer() {
  const context = useContext(ClientDrawerContext);
  if (!context) {
    throw new Error('useClientDrawer must be used within a ClientDrawerProvider');
  }
  return context;
}
