'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import DashboardHeader from '@/components/dashboard/header';

type MainLayoutProps = {
  children: ReactNode;
};

type MainLayoutPropsWithSearch = MainLayoutProps & {
  onCitySearch?: (city: string, location: { lat: number; lng: number }) => void;
};

export default function MainLayout({ children, onCitySearch }: MainLayoutPropsWithSearch) {

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col relative overflow-hidden w-full">
          <DashboardHeader
            onCitySearch={onCitySearch}
          />
          <SidebarInset className="flex-1 overflow-y-auto w-full bg-background">
            <div className="animate-fade-in w-full">
              {children}
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
