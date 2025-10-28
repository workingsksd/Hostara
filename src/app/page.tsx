
'use client'
import withAuth from "@/components/withAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BedDouble, BookOpenCheck, Bot, Building, ChefHat, UtensilsCrossed, Users, Wrench } from "lucide-react";
import { placeholderImages } from "@/lib/placeholder-images";
import { BookingsChart } from "@/components/dashboard/bookings-chart";
import { AppLayout } from "@/components/layout/app-layout";

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
    type: "Restaurant",
    status: "Completed",
    amount: "₹4,500"
  },
];

const maintenanceTasks = [
  { room: "Room 204", issue: "Leaky Faucet", priority: "High" },
  { room: "Lodge 3B", issue: "AC Not Cooling", priority: "High" },
  { room: "Restaurant", issue: "Freezer Malfunction", priority: "Critical" },
  { room: "Room 101", issue: "Wi-Fi Down", priority: "Medium" },
];

function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Hotel Occupancy" value="78%" icon={<Building className="size-6" />} description="+5% from last week" />
          <StatCard title="Lodge Occupancy" value="62%" icon={<BedDouble className="size-6" />} description="-2% from last week" />
          <StatCard title="Table Availability" value="12 / 30" icon={<UtensilsCrossed className="size-6" />} description="5 new reservations" />
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
                  <ChefHat className="text-muted-foreground" />
                  <span className="text-sm">Restaurant Orders</span>
                </div>
                <span className="font-bold text-lg">112</span>
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
                Maintenance & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {maintenanceTasks.map((task) => (
                <div key={task.room} className="flex items-start justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <p className="font-semibold">{task.room}</p>
                    <p className="text-sm text-muted-foreground">{task.issue}</p>
                  </div>
                  <Badge variant={task.priority === 'High' || task.priority === 'Critical' ? 'destructive' : 'secondary'}>{task.priority}</Badge>
                </div>
              ))}
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
