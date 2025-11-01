
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
import { MoreHorizontal, PlusCircle, Camera } from 'lucide-react';
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
import { useState, useContext } from 'react';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Booking, BookingContext } from '@/context/BookingContext';


const statusVariant: { [key in Booking['status']]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Checked-in': 'default',
  'Confirmed': 'secondary',
  'Pending': 'outline',
  'Checked-out': 'destructive'
}

function GuestsPage() {
  const { bookings, addBooking, updateBooking, deleteBooking } = useContext(BookingContext);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const handleAddBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newBookingData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        checkIn: formData.get('checkin') as string,
        checkOut: formData.get('checkout') as string,
        status: formData.get('status') as Booking['status'],
        type: formData.get('type') as Booking['type'],
    }

    if (!newBookingData.checkIn || !newBookingData.checkOut) {
        // Simple validation, can be improved with form libraries
        alert('Please select check-in and check-out dates.');
        return;
    }

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      guest: {
        name: newBookingData.name,
        email: newBookingData.email,
        avatar: '',
      },
      checkIn: newBookingData.checkIn,
      checkOut: newBookingData.checkOut,
      status: newBookingData.status,
      type: newBookingData.type,
      room: 'Not Assigned',
    };
    addBooking(newBooking);
    setIsAddDialogOpen(false);
  };

  const handleUpdateBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedBooking) return;
    const formData = new FormData(e.currentTarget);

    const updatedData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        checkIn: formData.get('checkin') as string,
        checkOut: formData.get('checkout') as string,
        status: formData.get('status') as Booking['status'],
    }
    
    if (!updatedData.checkIn || !updatedData.checkOut) {
        alert('Please select check-in and check-out dates.');
        return;
    }

    const updated: Booking = {
      ...selectedBooking,
      guest: {
        ...selectedBooking.guest,
        name: updatedData.name,
        email: updatedData.email,
      },
      checkIn: updatedData.checkIn,
      checkOut: updatedData.checkOut,
      status: updatedData.status,
    };
    updateBooking(updated);
    setIsEditDialogOpen(false);
    setSelectedBooking(null);
  };
  
  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailDialogOpen(true);
  }

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditDialogOpen(true);
  }

  const handleCancel = (bookingId: string) => {
    deleteBooking(bookingId);
  }
  
  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">
          Front Desk & Booking Management
        </h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/guests/kyc">
              <Camera className="mr-2 h-4 w-4" /> KYC Scanner
            </Link>
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                  <div className="space-y-2">
                    <Label htmlFor="name-add">Name</Label>
                    <Input id="name-add" name="name" required />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="email-add">Email</Label>
                    <Input id="email-add" name="email" type="email" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="checkin-add">Check-in</Label>
                        <DatePicker name="checkin" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="checkout-add">Check-out</Label>
                        <DatePicker name="checkout"/>
                    </div>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="status-add">Status</Label>
                    <Select name="status" defaultValue="Pending">
                      <SelectTrigger id="status-add">
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
                   <div className="space-y-2">
                    <Label htmlFor="type-add">Type</Label>
                    <Select name="type" defaultValue="Hotel">
                      <SelectTrigger id="type-add">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hotel">Hotel</SelectItem>
                        <SelectItem value="Lodge">Lodge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Booking</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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
                    {format(new Date(booking.checkIn), "PP")} - {format(new Date(booking.checkOut), "PP")}
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
                        <DropdownMenuItem onClick={() => handleViewDetails(booking)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(booking)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCancel(booking.id)} className="text-destructive">Cancel</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* View Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Viewing details for {selectedBooking?.guest.name}.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 py-4 text-sm">
                <div className="flex items-center">
                    <div className="w-2/5 text-muted-foreground">Guest Name</div>
                    <div className="w-3/5 font-medium">{selectedBooking.guest.name}</div>
                </div>
                <div className="flex items-center">
                    <div className="w-2/5 text-muted-foreground">Guest Email</div>
                    <div className="w-3/5 font-medium">{selectedBooking.guest.email}</div>
                </div>
                 <div className="flex items-center">
                    <div className="w-2/5 text-muted-foreground">Check-in</div>
                    <div className="w-3/5 font-medium">{format(new Date(selectedBooking.checkIn), "PPP")}</div>
                </div>
                 <div className="flex items-center">
                    <div className="w-2/5 text-muted-foreground">Check-out</div>
                    <div className="w-3/5 font-medium">{format(new Date(selectedBooking.checkOut), "PPP")}</div>
                </div>
                 <div className="flex items-center">
                    <div className="w-2/5 text-muted-foreground">Status</div>
                    <div className="w-3/5 font-medium">
                        <Badge variant={statusVariant[selectedBooking.status] || 'default'}>{selectedBooking.status}</Badge>
                    </div>
                </div>
                <div className="flex items-center">
                    <div className="w-2/5 text-muted-foreground">Room</div>
                    <div className="w-3/5 font-medium">{selectedBooking.room}</div>
                </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Booking Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleUpdateBooking}>
                <DialogHeader>
                  <DialogTitle>Edit Booking</DialogTitle>
                  <DialogDescription>
                    Update the details for this booking.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name-edit">Name</Label>
                    <Input id="name-edit" name="name" defaultValue={selectedBooking?.guest.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-edit">Email</Label>
                    <Input id="email-edit" name="email" type="email" defaultValue={selectedBooking?.guest.email} required />
                  </div>
                   <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="checkin-edit">Check-in</Label>
                            <DatePicker name="checkin" initialDate={selectedBooking?.checkIn ? new Date(selectedBooking.checkIn) : undefined} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="checkout-edit">Check-out</Label>
                            <DatePicker name="checkout" initialDate={selectedBooking?.checkOut ? new Date(selectedBooking.checkOut) : undefined}/>
                        </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status-edit">Status</Label>
                    <Select name="status" defaultValue={selectedBooking?.status}>
                      <SelectTrigger id="status-edit">
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
                  <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

    </AppLayout>
  );
}

export default withAuth(GuestsPage);
