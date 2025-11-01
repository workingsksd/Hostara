
"use client";

import { useState, useContext } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plug, RefreshCw, Loader2, AlertTriangle, Link2, ShoppingBasket } from "lucide-react";
import withAuth from "@/components/withAuth";
import { AppLayout } from "@/components/layout/app-layout";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { BookingContext } from "@/context/BookingContext";

type IntegrationStatus = "Connected" | "Inactive" | "Error" | "Syncing";

type Integration = {
    name: string;
    logo: string;
    imageHint: string;
    status: IntegrationStatus;
    description: string;
};

const initialIntegrations: Integration[] = [
    { name: "OYO", logo: "https://picsum.photos/seed/oyo/64/64", imageHint: "OYO rooms logo", status: "Connected", description: "Syncs bookings and room availability." },
    { name: "Trivago", logo: "https://picsum.photos/seed/trivago/64/64", imageHint: "Connected", description: "Syncs rates and availability." },
    { name: "MakeMyTrip", logo: "https://picsum.photos/seed/mmt/64/64", imageHint: "MakeMyTrip logo", status: "Inactive", description: "Manages listings and bookings." },
    { name: "Booking.com", logo: "https://picsum.photos/seed/booking/64/64", imageHint: "Booking.com logo", status: "Error", description: "API connection failed." },
]

const statusConfig: { [key in IntegrationStatus]: { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: React.ReactNode } } = {
  'Connected': { variant: 'default', icon: <Link2 /> },
  'Inactive': { variant: 'secondary', icon: <Plug /> },
  'Error': { variant: 'destructive', icon: <AlertTriangle /> },
  'Syncing': { variant: 'outline', icon: <Loader2 className="animate-spin" /> }
}

function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
  const { addExternalOrder } = useContext(BookingContext);
  const { toast } = useToast();

  const handleSync = (name: string) => {
    // Set the specific integration to 'Syncing'
    setIntegrations(prev => prev.map(int => int.name === name ? { ...int, status: 'Syncing' } : int));

    // Simulate API call
    setTimeout(() => {
        const isSuccess = Math.random() > 0.2; // 80% success rate
        
        if (isSuccess) {
            setIntegrations(prev => prev.map(int => int.name === name ? { ...int, status: 'Connected' } : int));
            toast({
                title: `${name} Synced Successfully`,
                description: "Bookings and availability have been updated.",
            });
        } else {
             setIntegrations(prev => prev.map(int => int.name === name ? { ...int, status: 'Error' } : int));
             toast({
                variant: 'destructive',
                title: `${name} Sync Failed`,
                description: "Could not connect to the API. Please check credentials.",
            });
        }
    }, 2000);
  };
  
  const handleSimulateOrder = (platformName: string) => {
    // A sample order for simulation purposes
    const sampleOrderItems = [
      { id: 'item-1', name: 'Paneer Butter Masala', price: 350, quantity: 2, recipe: [{ inventoryId: 'inv-1', quantity: 0.2 }, { inventoryId: 'inv-6', quantity: 0.25 }] },
      { id: 'item-3', name: 'Garlic Naan', price: 70, quantity: 4, recipe: [{ inventoryId: 'inv-10', quantity: 0.15 }, { inventoryId: 'inv-8', quantity: 0.02 }] },
    ];
    
    addExternalOrder(platformName, sampleOrderItems);

    toast({
      title: 'Simulated Order Received',
      description: `A new order from ${platformName} has been sent to the KDS.`,
      className: "bg-blue-500 text-white",
    });
  }
    
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline mb-6">Integration Hub</h1>
        <Card className="bg-card/60 backdrop-blur-sm border-border/20">
          <CardHeader>
            <CardTitle>API Connections & OTA Management</CardTitle>
             <CardDescription>
              Sync with OYO, Trivago, and other booking platforms to manage your channels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {integrations.map(integration => {
                    const config = statusConfig[integration.status];
                    return (
                        <Card key={integration.name} className="flex flex-col">
                            <CardHeader className="flex-row items-start gap-4">
                                <div className="relative h-12 w-12 bg-muted/50 rounded-lg flex items-center justify-center overflow-hidden">
                                    <Image src={integration.logo} alt={`${integration.name} logo`} width={64} height={64} data-ai-hint={integration.imageHint} />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-headline">{integration.name}</CardTitle>
                                    <Badge variant={config.variant} className="gap-1.5">
                                        {config.icon}
                                        {integration.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-muted-foreground text-sm">{integration.description}</p>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-2">
                                <Button 
                                    variant={integration.status === 'Connected' ? 'secondary' : 'default'}
                                    className="w-full"
                                    onClick={() => handleSync(integration.name)}
                                    disabled={integration.status === 'Syncing'}
                                >
                                    {integration.status === 'Syncing' ? (
                                        <><Loader2 className="mr-2 animate-spin" /> Syncing...</>
                                    ) : (
                                        <><RefreshCw className="mr-2" /> Sync Now</>
                                    )}
                                </Button>
                                {integration.status === 'Connected' && (
                                  <Button 
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => handleSimulateOrder(integration.name)}
                                  >
                                    <ShoppingBasket className="mr-2" /> Simulate Incoming Order
                                  </Button>
                                )}
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default withAuth(IntegrationsPage);
