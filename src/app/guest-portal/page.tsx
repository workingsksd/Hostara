
'use client';

import { useContext } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import withAuth from '@/components/withAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, MessageSquare, Crown, Medal, Gem } from 'lucide-react';
import { BookingContext } from '@/context/BookingContext';
import { format } from 'date-fns';

const loyaltyTiers = {
  Bronze: { icon: <Medal className="text-yellow-600" />, minSpend: 0, color: 'text-yellow-600' },
  Silver: { icon: <Medal className="text-gray-400" />, minSpend: 25000, color: 'text-gray-400' },
  Gold: { icon: <Gem className="text-amber-400" />, minSpend: 75000, color: 'text-amber-400' },
  Diamond: { icon: <Crown className="text-blue-400" />, minSpend: 150000, color: 'text-blue-400' },
};

function GuestLoyaltyPage() {
  const { guestProfiles } = useContext(BookingContext);

  const getLoyaltyTier = (totalSpend: number) => {
    if (totalSpend >= loyaltyTiers.Diamond.minSpend) return 'Diamond';
    if (totalSpend >= loyaltyTiers.Gold.minSpend) return 'Gold';
    if (totalSpend >= loyaltyTiers.Silver.minSpend) return 'Silver';
    return 'Bronze';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Guest Relationship Management (CRM)</h1>
          <p className="text-muted-foreground">A unified dashboard of guest profiles, loyalty status, and preferences.</p>
        </div>

        <Card className="bg-card/60 backdrop-blur-sm border-border/20">
          <CardHeader>
            <CardTitle>Guest Profiles & Loyalty</CardTitle>
            <CardDescription>
              Explore guest data, visit history, and loyalty tiers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {guestProfiles.map(guest => {
                const tierName = getLoyaltyTier(guest.totalSpend);
                const tierInfo = loyaltyTiers[tierName as keyof typeof loyaltyTiers];

                return (
                  <Card key={guest.email} className="flex flex-col">
                    <CardHeader className="flex-row items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={guest.avatar} alt={guest.name} />
                        <AvatarFallback>{guest.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {guest.name}
                          <span className={tierInfo.color}>{tierInfo.icon}</span>
                        </CardTitle>
                        <CardDescription>{guest.email}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                       <div className="flex justify-around text-center">
                          <div>
                            <p className="text-2xl font-bold font-headline">{guest.totalStays}</p>
                            <p className="text-xs text-muted-foreground">Total Stays</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold font-headline">₹{guest.totalSpend.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Total Spend</p>
                          </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-2">Visit History</h4>
                            <div className="max-h-24 overflow-y-auto no-scrollbar rounded-md bg-muted/50 p-2 space-y-1">
                                {guest.stayHistory.map((stay, index) => (
                                    <div key={index} className="text-xs flex justify-between">
                                        <span>{stay.room}</span>
                                        <span className="text-muted-foreground">{format(new Date(stay.checkIn), 'MMM yyyy')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        <Button variant="outline" className="w-full">
                            <Mail className="mr-2"/> Email
                        </Button>
                        <Button variant="secondary" className="w-full">
                            <MessageSquare className="mr-2"/> Send Offer
                        </Button>
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

export default withAuth(GuestLoyaltyPage);
