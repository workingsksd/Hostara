
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const initialBookings = [
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
  const [bookings, setBookings] = useState(initialBookings);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newBooking = {
      id: `booking-${Date.now()}`,
      guest: {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        avatar: '',
      },
      checkIn: format(new Date(formData.get('checkin') as string), 'yyyy-MM-dd'),
      checkOut: format(new Date(formData.get('checkout') as string), 'yyyy-MM-dd'),
      status: formData.get('status') as string,
      type: 'Hotel',
      room: 'New Room',
    };
    setBookings(prev => [newBooking, ...prev]);
    setIsDialogOpen(false);
  };
  
  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">
          Guest & Booking Management
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddBooking}>
              <DialogHeader>
                <DialogTitle>Add New Booking</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new booking.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" name="name" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input id="email" name="email" type="email" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="checkin" className="text-right">
                    Check-in
                  </Label>
                  <DatePicker name="checkin" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="checkout" className="text-right">
                    Check-out
                  </Label>
                  <DatePicker name="checkout"/>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select name="status" defaultValue="Pending">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="Checked-in">Checked-in</SelectItem>
                      <SelectItem value="Checked-out">Checked-out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Booking</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                  Check-in / Check-out
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
                    <div className="text-sm text-muted-foreground">
                      {booking.guest.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[booking.status] || 'default'}>{booking.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
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

function DatePicker({name}: {name: string}) {
  const [date, setDate] = useState<Date>()

  return (
    <>
    <input type="hidden" name={name} value={date ? date.toISOString() : ''} />
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "col-span-3 justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
    </>
  )
}


export default withAuth(GuestsPage);
