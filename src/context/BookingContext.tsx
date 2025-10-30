
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

export type OrderItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
};

export type Order = {
    id: string;
    guestId: string;
    guestName: string;
    items: OrderItem[];
    total: number;
    status: 'New' | 'In Progress' | 'Completed' | 'Cancelled';
    createdAt: string;
};

export type Transaction = {
    id: string;
    guest: string;
    date: string;
    type: string;
    amount: number;
    status: 'Paid' | 'Pending';
};

export type StaffTask = {
    id: string;
    title: string;
    assignedToId: string; // Staff member ID
    status: 'Pending' | 'In Progress' | 'Completed';
    dueDate: string;
};


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
    status: 'Checked-in',
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

const initialTransactions: Transaction[] = [
    { id: 'txn-001', guest: 'Eleanor Vance', date: new Date().toISOString(), type: 'Room', amount: 12500, status: 'Paid'},
    { id: 'txn-002', guest: 'Marcus Thorne', date: new Date().toISOString(), type: 'Restaurant', amount: 3200, status: 'Paid'},
    { id: 'txn-003', guest: 'John Doe', date: new Date().toISOString(), type: 'Room Service', amount: 1500, status: 'Pending'},
    { id: 'txn-004', guest: 'Sophia Loren', date: '2024-08-17', type: 'Lodge', amount: 9800, status: 'Paid'},
];

const initialTasks: StaffTask[] = [
    { id: 'task-1', title: 'Deep clean Suite 301', assignedToId: 'staff-1', status: 'In Progress', dueDate: '2024-08-21' },
    { id: 'task-2', title: 'Fix AC in Lodge 3B', assignedToId: 'staff-2', status: 'Pending', dueDate: '2024-08-21' },
    { id: 'task-3', title: 'Restock minibar for Room 101', assignedToId: 'staff-1', status: 'Pending', dueDate: '2024-08-20'},
];


interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBooking: (updatedBooking: Booking) => void;
  deleteBooking: (bookingId: string) => void;
  maintenanceTasks: MaintenanceTask[];
  addMaintenanceTask: (task: MaintenanceTask) => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  settleTransaction: (transactionId: string) => void;
  tasks: StaffTask[];
  addTask: (task: Omit<StaffTask, 'id' | 'status'>) => void;
  updateTaskStatus: (taskId: string, status: StaffTask['status']) => void;
}

export const BookingContext = createContext<BookingContextType>({
  bookings: [],
  addBooking: () => {},
  updateBooking: () => {},
  deleteBooking: () => {},
  maintenanceTasks: [],
  addMaintenanceTask: () => {},
  orders: [],
  addOrder: () => {},
  updateOrderStatus: () => {},
  transactions: [],
  addTransaction: () => {},
  settleTransaction: () => {},
  tasks: [],
  addTask: () => {},
  updateTaskStatus: () => {},
});

export const BookingProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(initialMaintenanceTasks);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [tasks, setTasks] = useState<StaffTask[]>(initialTasks);

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
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          if (status === 'Completed') {
              addTransaction({
                  guest: o.guestName,
                  type: 'Room Service',
                  amount: o.total,
                  status: 'Pending',
              })
          }
          return { ...o, status };
        }
        return o;
      })
    );
  };
  
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
        ...transaction,
        id: `txn-${Date.now()}`,
        date: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };
  
  const settleTransaction = (transactionId: string) => {
    setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, status: 'Paid' } : t));
  };

  const addTask = (task: Omit<StaffTask, 'id' | 'status'>) => {
    const newTask: StaffTask = {
      ...task,
      id: `task-${Date.now()}`,
      status: 'Pending',
    };
    setTasks(prev => [newTask, ...prev]);
  };
  
  const updateTaskStatus = (taskId: string, status: StaffTask['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  return (
    <BookingContext.Provider value={{ 
        bookings, addBooking, updateBooking, deleteBooking, 
        maintenanceTasks, addMaintenanceTask, 
        orders, addOrder, updateOrderStatus, 
        transactions, addTransaction, settleTransaction,
        tasks, addTask, updateTaskStatus
    }}>
      {children}
    </BookingContext.Provider>
  );
};
