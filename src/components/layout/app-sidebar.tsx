
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Map,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ListOrdered,
  Activity,
  User,
  Mail,
  Home,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function AppSidebar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const menuItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard', tooltip: 'Dashboard' },
    { href: '/map', icon: Map, label: 'Map View', tooltip: 'World Map with AQI' },
    { href: '/enhanced-aqi', icon: Activity, label: 'Enhanced AQI', tooltip: 'Enhanced Air Quality Data' },
    { href: '/city-rankings', icon: ListOrdered, label: 'City Rankings', tooltip: 'Live City Rankings' },
    { href: '/subscriptions', icon: Mail, label: 'Subscriptions', tooltip: 'City Subscriptions' },
    { href: '/notifications', icon: Bell, label: 'Notifications', tooltip: 'Notifications' },
    { href: '/my-room', icon: Home, label: 'My Room', tooltip: 'My Room Sensor Data' },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="flex items-center justify-end p-4 border-b">
        <SidebarTrigger className="transition-all hover:bg-accent/50" />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.tooltip}>
                  <Link href={item.href} className="transition-all hover:text-foreground">
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="/profile" className="transition-all hover:text-foreground">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 space-y-2">
        {isAuthenticated && user && (
          <div className="px-2 py-1 text-xs text-muted-foreground group-data-[[data-collapsible=icon]]:hidden">
            {user.username}
          </div>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-2 transition-all hover:bg-accent/50 group-data-[[data-collapsible=icon]]:size-8 group-data-[[data-collapsible=icon]]:justify-center group-data-[[data-collapsible=icon]]:p-0"
            >
              <LogOut />
              <span className="group-data-[[data-collapsible=icon]]:hidden">
                Logout
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" align="center">
            Logout
          </TooltipContent>
        </Tooltip>
      </SidebarFooter>
    </Sidebar>
  );
}
