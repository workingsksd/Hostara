
'use client'
import { useContext, useEffect } from "react";
import withAuth from "@/components/withAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BedDouble, BookOpenCheck, Bot, Building, Users, Wrench, Sparkles, Trash2, Clock, CookingPot } from "lucide-react";
import { placeholderImages } from "@/lib/placeholder-images";
import { BookingsChart } from "@/components/dashboard/bookings-chart";
import { AppLayout } from "@/components/layout/app-layout";
import { BookingContext } from "@/context/BookingContext";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";


const recentBookings = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl || '',
    type: "Hotel",
    status: "Checked In",
    amount: "₹12,500"
  },
  {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    avatar: placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl || '',
    type: "Lodge",
    status: "Confirmed",
    amount: "₹8,000"
  },
  {
    name: "Sam Wilson",
    email: "sam.wilson@example.com",
    avatar: placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl || '',
    type: "Lodge",
    status: "Completed",
    amount: "₹4,500"
  },
];


function DashboardPage() {
  const { maintenanceTasks } = useContext(BookingContext);
  const router = useRouter();
  const { user } = useUser();
  
  const organisationType = user?.profile.organisationType;

  useEffect(() => {
    if (organisationType === 'Restaurant') {
      // Redirect to the restaurant page if the user is in a restaurant org
      router.replace('/restaurant');
    }
  }, [organisationType, router]);


  if (organisationType === 'Restaurant') {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-lg font-semibold">Loading Restaurant Dashboard...</div>
        </div>
    );
  }


  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Hotel Occupancy" value="78%" icon={<Building className="size-6" />} description="+5% from last week" />
          <StatCard title="Lodge Occupancy" value="62%" icon={<BedDouble className="size-6" />} description="-2% from last week" />
          <StatCard title="Pending Tasks" value={maintenanceTasks.length.toString()} icon={<Wrench className="size-6" />} description="3 overdue" />
          <StatCard title="Pending KYC" value="8" icon={<Users className="size-6" />} description="2 overdue" variant="destructive" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="col-span-1 lg:col-span-2 bg-card/60 backdrop-blur-sm border border-border/20 shadow-[0_8px_32px_0_hsl(var(--primary)/0.2)]">
            <CardHeader>
              <CardTitle className="font-headline">Bookings Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <BookingsChart />
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card className="bg-card/60 backdrop-blur-sm border border-border/20 shadow-[0_8px_32px_0_hsl(var(--primary)/0.2)]">
              <CardHeader>
                <CardTitle className="font-headline">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="text-muted-foreground" />
                    <span className="text-sm">Total Guests</span>
                  </div>
                  <span className="font-bold text-lg">245</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpenCheck className="text-muted-foreground" />
                    <span className="text-sm">Today's Bookings</span>
                  </div>
                  <span className="font-bold text-lg">42</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bot className="text-muted-foreground" />
                    <span className="text-sm">Low Stock Alerts</span>
                  </div>
                  <span className="font-bold text-lg text-destructive">5</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-sm border border-border/20 shadow-[0_8px_32px_0_hsl(var(--primary)/0.2)]">
              <CardHeader>
                  <CardTitle className="font-headline">Housekeeping Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-green-400">
                          <Sparkles />
                          <span className="text-sm text-foreground">Rooms Ready</span>
                      </div>
                      <span className="font-bold text-lg">42</span>
                  </div>
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-yellow-400">
                          <Clock />
                          <span className="text-sm text-foreground">In Progress</span>
                      </div>
                      <span className="font-bold text-lg">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-red-400">
                          <Trash2 />
                          <span className="text-sm text-foreground">Needs Cleaning</span>
                      </div>
                      <span className="font-bold text-lg text-destructive">5</span>
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-card/60 backdrop-blur-sm border border-border/20 shadow-[0_8px_32px_0_hsl(var(--primary)/0.2)]">
            <CardHeader>
              <CardTitle className="font-headline">Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.map((booking) => (
                    <TableRow key={booking.email}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={booking.avatar} alt="Avatar" />
                            <AvatarFallback>{booking.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="grid gap-0.5">
                            <p className="font-medium">{booking.name}</p>
                            <p className="text-xs text-muted-foreground">{booking.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">{booking.type}</Badge>
                      </TableCell>
                       <TableCell className="hidden md:table-cell">
                        <Badge variant={booking.status === 'Checked In' ? 'default' : 'secondary'}>{booking.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{booking.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60 backdrop-blur-sm border border-border/20 shadow-[0_8px_32px_0_hsl(var(--primary)/0.2)]">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Wrench className="text-destructive" />
                Maintenance &amp; Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {maintenanceTasks.map((task, index) => (
                <div key={index} className="flex items-start justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <p className="font-semibold">{task.room}</p>
                    <p className="text-sm text-muted-foreground">{task.issue}</p>
                  </div>
                  <Badge variant={task.priority === 'High' || task.priority === 'Critical' ? 'destructive' : 'secondary'}>{task.priority}</Badge>
                </div>
              ))}
              {maintenanceTasks.length === 0 && (
                <div className="text-center text-sm text-muted-foreground p-4">No maintenance alerts.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ title, value, icon, description, variant }: { title: string, value: string, icon: React.ReactNode, description: string, variant?: "default" | "destructive" }) {
  return (
    <Card className="bg-card/60 backdrop-blur-sm border border-border/20 shadow-[0_8px_32px_0_hsl(var(--primary)/0.2)] transform transition-transform duration-300 hover:-translate-y-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={variant === 'destructive' ? 'text-destructive' : 'text-accent'}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-4xl font-bold font-headline ${variant === 'destructive' ? 'text-destructive' : ''}`}>{value}</div>
        <p className="text-xs text-muted-foreground pt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

export default withAuth(DashboardPage);
