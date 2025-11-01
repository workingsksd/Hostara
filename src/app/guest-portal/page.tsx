
'use client';

import { useContext, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import withAuth from '@/components/withAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Crown, Medal, Gem, Bot, Loader2, Wand2 } from 'lucide-react';
import { BookingContext } from '@/context/BookingContext';
import { format } from 'date-fns';
import { analyzeGuestProfile } from '@/ai/flows/guest-preference-flow';
import { type GuestProfileAnalysisOutput } from '@/ai/schemas/guest-preference-schema';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const loyaltyTiers = {
  Bronze: { icon: <Medal className="text-yellow-600" />, minSpend: 0, color: 'text-yellow-600' },
  Silver: { icon: <Medal className="text-gray-400" />, minSpend: 25000, color: 'text-gray-400' },
  Gold: { icon: <Gem className="text-amber-400" />, minSpend: 75000, color: 'text-amber-400' },
  Diamond: { icon: <Crown className="text-blue-400" />, minSpend: 150000, color: 'text-blue-400' },
};

type AnalysisState = {
  [guestEmail: string]: {
    loading: boolean;
    data: GuestProfileAnalysisOutput | null;
  };
};


function GuestLoyaltyPage() {
  const { guestProfiles, transactions } = useContext(BookingContext);
  const [analysis, setAnalysis] = useState<AnalysisState>({});
  const { toast } = useToast();

  const getLoyaltyTier = (totalSpend: number) => {
    if (totalSpend >= loyaltyTiers.Diamond.minSpend) return 'Diamond';
    if (totalSpend >= loyaltyTiers.Gold.minSpend) return 'Gold';
    if (totalSpend >= loyaltyTiers.Silver.minSpend) return 'Silver';
    return 'Bronze';
  };

  const handleAnalyzeProfile = async (guestEmail: string) => {
    const guest = guestProfiles.find(p => p.email === guestEmail);
    if (!guest) return;

    setAnalysis(prev => ({ ...prev, [guestEmail]: { loading: true, data: null } }));

    try {
        const guestTransactions = transactions.filter(t => {
            const booking = guest.stayHistory.some(s => s.checkIn <= t.date && s.checkOut >= t.date);
            return booking;
        });

        const result = await analyzeGuestProfile({
            guestName: guest.name,
            stayHistory: JSON.stringify(guest.stayHistory.map(s => ({ room: s.room, checkIn: s.checkIn }))),
            transactionHistory: JSON.stringify(guestTransactions.map(t => ({ type: t.type, amount: t.amount, date: t.date }))),
        });

        setAnalysis(prev => ({ ...prev, [guestEmail]: { loading: false, data: result } }));
        toast({
            title: `Analysis Complete for ${guest.name}`,
            description: "Guest preferences and next best offer have been generated.",
        });
    } catch (error) {
        console.error("Analysis failed:", error);
        setAnalysis(prev => ({ ...prev, [guestEmail]: { loading: false, data: null } }));
        toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: "Could not generate AI insights for this guest.",
        });
    }
  }


  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Guest Relationship Management (CRM)</h1>
          <p className="text-muted-foreground">A unified dashboard of guest profiles, loyalty status, and AI-driven preferences.</p>
        </div>

        <Card className="bg-card/60 backdrop-blur-sm border-border/20">
          <CardHeader>
            <CardTitle>Guest Profiles & Loyalty</CardTitle>
            <CardDescription>
              Explore guest data, loyalty tiers, and generate AI-powered marketing insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {guestProfiles.map(guest => {
                const tierName = getLoyaltyTier(guest.totalSpend);
                const tierInfo = loyaltyTiers[tierName as keyof typeof loyaltyTiers];
                const guestAnalysis = analysis[guest.email];

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

                        {guestAnalysis?.data && (
                             <div className="space-y-3 pt-3">
                                <Separator />
                                <h4 className="font-semibold text-sm flex items-center gap-2"><Bot className="text-accent" /> AI Insights</h4>
                                <div className="p-3 rounded-md bg-muted/50 text-sm space-y-2">
                                    <p><strong className="font-medium">Habits:</strong> {guestAnalysis.data.spendingHabits}</p>
                                    <p><strong className="font-medium">Prediction:</strong> {guestAnalysis.data.predictedNextBooking}</p>
                                    <div className="p-2 rounded-md bg-accent/10 border border-accent/20">
                                        <p className="font-semibold text-accent">Next Best Offer:</p>
                                        <p className="text-accent/90">{guestAnalysis.data.nextBestOffer}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleAnalyzeProfile(guest.email)}
                            disabled={guestAnalysis?.loading}
                        >
                            {guestAnalysis?.loading ? (
                                <><Loader2 className="mr-2 animate-spin" />Analyzing...</>
                            ) : (
                                <><Wand2 className="mr-2" /> {guestAnalysis?.data ? 'Re-Analyze Profile' : 'Analyze with AI'}</>
                            )}
                        </Button>
                        <div className="grid grid-cols-2 gap-2 w-full">
                            <Button variant="outline" className="w-full">
                                <Mail className="mr-2"/> Email
                            </Button>
                            <Button variant="secondary" className="w-full">
                                <MessageSquare className="mr-2"/> Send Offer
                            </Button>
                        </div>
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
