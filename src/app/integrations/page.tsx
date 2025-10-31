
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plug, RefreshCw } from "lucide-react";
import withAuth from "@/components/withAuth";
import { AppLayout } from "@/components/layout/app-layout";
import Image from "next/image";

const integrations = [
    { name: "OYO", logo: "/images/integrations/oyo.svg", status: "Connected", description: "Syncs bookings and room availability." },
    { name: "Trivago", logo: "/images/integrations/trivago.svg", status: "Connected", description: "Syncs rates and availability." },
    { name: "MakeMyTrip", logo: "/images/integrations/mmt.svg", status: "Inactive", description: "Manages listings and bookings." },
    { name: "Booking.com", logo: "/images/integrations/bookingcom.svg", status: "Error", description: "API connection failed." },
]

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Connected': 'default',
  'Inactive': 'secondary',
  'Error': 'destructive'
}

function IntegrationsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline mb-6">Integration Hub</h1>
        <Card className="bg-card/60 backdrop-blur-sm border border-border/20">
          <CardHeader>
            <CardTitle>API Connections & OTA Management</CardTitle>
             <CardDescription>
              Sync with OYO, Trivago, and other booking platforms. This is a placeholder and will be fully implemented soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {integrations.map(integration => (
                    <Card key={integration.name} className="flex flex-col">
                        <CardHeader className="flex-row items-start gap-4">
                            <div className="relative h-12 w-12 bg-muted/50 rounded-lg flex items-center justify-center">
                                {/* Placeholder for logos */}
                                <Plug />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-headline">{integration.name}</CardTitle>
                                <Badge variant={statusVariant[integration.status]}>{integration.status}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-muted-foreground text-sm">{integration.description}</p>
                        </CardContent>
                        <CardFooter>
                            <Button variant="secondary" className="w-full">
                                <RefreshCw className="mr-2" /> Sync Now
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default withAuth(IntegrationsPage);
