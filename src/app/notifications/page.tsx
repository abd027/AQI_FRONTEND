
'use client';

import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notificationsData } from '@/lib/notifications-data';
import type { Notification } from '@/lib/types';
import { getAqiColor } from '@/lib/data';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const alertIcons = {
  Critical: <ShieldAlert className="h-5 w-5 text-red-500" />,
  Warning: <AlertTriangle className="h-5 w-5 text-orange-400" />,
  Info: <Info className="h-5 w-5 text-blue-400" />,
};

const getVariantForType = (type: Notification['type']): 'destructive' | 'secondary' | 'default' => {
  switch (type) {
    case 'Critical':
      return 'destructive';
    case 'Warning':
      return 'secondary';
    case 'Info':
    default:
      return 'default';
  }
};


export default function NotificationsPage() {
  return (
    <MainLayout>
      <div className="p-4 md:p-6 lg:p-8 flex flex-col min-h-[calc(100vh-8rem)] max-w-4xl mx-auto w-full">
        <header className="mb-6 md:mb-8 animate-slide-up">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            Recent alerts and updates from the network.
          </p>
        </header>
        <ScrollArea className="flex-1">
          <div className="space-y-4 pr-4">
            {notificationsData.map((notification, index) => (
              <Card 
                key={notification.id} 
                className="glass transition-all duration-300 hover:shadow-2xl animate-slide-up cursor-pointer"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-4 md:p-6 flex items-start gap-4 hover:bg-accent/30 transition-colors">
                    <div className="pt-1">
                        {alertIcons[notification.type]}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold">{notification.title}</p>
                            <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            An AQI of <span className={cn("font-bold", getAqiColor(notification.aqi))}>{notification.aqi}</span> was recorded in {notification.city}.
                        </p>
                    </div>
                    <Badge variant={getVariantForType(notification.type)} className="self-center">
                        {notification.type}
                    </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </MainLayout>
  );
}
