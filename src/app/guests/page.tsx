
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import withAuth from '@/components/withAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { placeholderImages } from '@/lib/placeholder-images';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const bookings = [
  {
    id: 'booking-1',
    guest: {
      name: 'Eleanor Vance',
      email: 'eleanor@example.com',
      avatar: placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl,
    },
    status: 'Checked-in',
    checkIn: '2024-08-15',
    checkOut: '2024-08-20',
    type: 'Hotel',
    room: 'Deluxe Suite 301',
  },
  {
    id: 'booking-2',
    guest: {
      name: 'Marcus Thorne',
      email: 'marcus@example.com',
      avatar: placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl,
    },
    status: 'Confirmed',
    checkIn: '2024-08-18',
    checkOut: '2024-08-22',
    type: 'Lodge',
    room: 'Lakeside Cabin 5',
  },
  {
    id: 'booking-3',
    guest: {
      name: 'Liam Gallagher',
      email: 'liam@example.com',
      avatar: placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl,
    },
    status: 'Pending',
    checkIn: '2024-09-01',
    checkOut: '2024-09-05',
    type: 'Hotel',
    room: 'Standard Room 102',
  },
  {
    id: 'booking-4',
    guest: {
      name: 'Sophia Loren',
      email: 'sophia@example.com',
      avatar: '',
    },
    status: 'Checked-out',
    checkIn: '2024-08-10',
    checkOut: '2024-08-14',
    type: 'Restaurant',
    room: 'Table 7',
  },
];

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Checked-in': 'default',
  'Confirmed': 'secondary',
  'Pending': 'outline',
  'Checked-out': 'destructive'
}

function GuestsPage() {
  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">
          Guest & Booking Management
        </h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Booking
        </Button>
      </div>
      <Card className="bg-card/60 backdrop-blur-sm border border-border/20">
        <CardHeader>
          <CardTitle>Current Bookings</CardTitle>
          <CardDescription>
            A list of all current and upcoming guest bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">
                  Booking Type
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Check-in
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={booking.guest.avatar}
                        alt={booking.guest.name}
                      />
                      <AvatarFallback>
                        {booking.guest.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="font-medium">{booking.guest.name}</div>
                    <div className="text-sm text-muted-foreground md:hidden">
                      {booking.guest.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[booking.status] || 'default'}>{booking.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {booking.type} - {booking.room}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(booking.checkIn).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Cancel</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

export default withAuth(GuestsPage);
