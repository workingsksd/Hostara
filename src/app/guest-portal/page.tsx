
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import withAuth from '@/components/withAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bed, Bell, Utensils, Wifi } from 'lucide-react';

function GuestPortalPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome, Guest!</h1>
          <p className="text-muted-foreground">Your personal portal for a comfortable stay.</p>
        </div>

        <Card className="bg-card/60 backdrop-blur-sm border-border/20">
            <CardHeader>
                <CardTitle>Your Stay</CardTitle>
                <CardDescription>Quick overview of your current booking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                 <div className="flex items-center">
                    <div className="w-2/5 text-muted-foreground">Room Number</div>
                    <div className="w-3/5 font-medium flex items-center gap-2"><Bed className="h-4 w-4 text-accent"/> Lakeside Cabin 5</div>
                </div>
                 <div className="flex items-center">
                    <div className="w-2/5 text-muted-foreground">Wi-Fi Password</div>
                    <div className="w-3/5 font-medium flex items-center gap-2"><Wifi className="h-4 w-4 text-accent"/> LodgeGuest123</div>
                </div>
                 <div className="flex items-center">
                    <div className="w-2/5 text-muted-foreground">Check-out Date</div>
                    <div className="w-3/5 font-medium">August 22, 2024</div>
                </div>
            </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm border-border/20">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Need something? Let us know.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
                <Utensils/>
                <span>Order Room Service</span>
            </Button>
             <Button variant="outline" className="h-20 flex-col gap-2">
                <Bell/>
                <span>Request Housekeeping</span>
            </Button>
             <Button variant="outline" className="h-20 flex-col gap-2">
                <Bed/>
                <span>Late Check-out</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default withAuth(GuestPortalPage);
