
'use client';

import { createContext, useState, ReactNode, FC } from 'react';
import { placeholderImages } from '@/lib/placeholder-images';

export type Booking = {
  id: string;
  guest: {
    name: string;
    email: string;
    avatar: string | undefined;
  };
  status: 'Checked-in' | 'Confirmed' | 'Pending' | 'Checked-out';
  checkIn: string;
  checkOut: string;
  type: 'Hotel' | 'Lodge' | 'Restaurant';
  room: string;
};

export type MaintenanceTask = {
  room: string;
  issue: string;
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
}

const initialBookings: Booking[] = [
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

const initialMaintenanceTasks: MaintenanceTask[] = [
  { room: "Room 204", issue: "Leaky Faucet", priority: "High" },
  { room: "Lodge 3B", issue: "AC Not Cooling", priority: "High" },
  { room: "Restaurant", issue: "Freezer Malfunction", priority: "Critical" },
];


interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBooking: (updatedBooking: Booking) => void;
  deleteBooking: (bookingId: string) => void;
  maintenanceTasks: MaintenanceTask[];
  addMaintenanceTask: (task: MaintenanceTask) => void;
}

export const BookingContext = createContext<BookingContextType>({
  bookings: [],
  addBooking: () => {},
  updateBooking: () => {},
  deleteBooking: () => {},
  maintenanceTasks: [],
  addMaintenanceTask: () => {},
});

export const BookingProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(initialMaintenanceTasks);

  const addBooking = (booking: Booking) => {
    setBookings(prev => [booking, ...prev]);
  };

  const updateBooking = (updatedBooking: Booking) => {
    setBookings(prev =>
      prev.map(b => (b.id === updatedBooking.id ? updatedBooking : b))
    );
  };

  const deleteBooking = (bookingId: string) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };
  
  const addMaintenanceTask = (task: MaintenanceTask) => {
    setMaintenanceTasks(prev => [task, ...prev]);
  }

  return (
    <BookingContext.Provider value={{ bookings, addBooking, updateBooking, deleteBooking, maintenanceTasks, addMaintenanceTask }}>
      {children}
    </BookingContext.Provider>
  );
};
