'use client';

import { createContext, useState, ReactNode, FC, useEffect } from 'react';
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

export type GuestProfile = {
    email: string;
    name: string;
    avatar: string | undefined;
    totalStays: number;
    totalSpend: number;
    stayHistory: { room: string; checkIn: string; checkOut: string }[];
}

export type Vendor = {
    id: string;
    name: string;
    contactPerson: string;
    phone: string;
    category: 'Food' | 'Linen' | 'Toiletries' | 'Maintenance';
};

export type InventoryItem = {
    id: string;
    name: string;
    quantity: number;
    category: 'Food' | 'Linen' | 'Toiletries' | 'Maintenance';
    unit: 'kg' | 'liters' | 'pieces' | 'packets';
};

export type PurchaseOrderItem = {
    itemId: string;
    name: string;
    quantity: number;
    price: number;
};

export type PurchaseOrder = {
    id: string;
    vendorId: string;
    date: string;
    items: PurchaseOrderItem[];
    status: 'Draft' | 'Ordered' | 'Partially Received' | 'Completed' | 'Cancelled';
    totalAmount: number;
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
    {
    id: 'booking-5',
    guest: {
      name: 'Eleanor Vance',
      email: 'eleanor@example.com',
      avatar: placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl,
    },
    status: 'Checked-out',
    checkIn: '2024-07-01',
    checkOut: '2024-07-05',
    type: 'Hotel',
    room: 'Sea View 402',
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
    { id: 'txn-005', guest: 'Eleanor Vance', date: '2024-07-04', type: 'Room', amount: 22000, status: 'Paid'},
];

const initialTasks: StaffTask[] = [
    { id: 'task-1', title: 'Deep clean Suite 301', assignedToId: 'staff-1', status: 'In Progress', dueDate: '2024-08-21' },
    { id: 'task-2', title: 'Fix AC in Lodge 3B', assignedToId: 'staff-2', status: 'Pending', dueDate: '2024-08-21' },
    { id: 'task-3', title: 'Restock minibar for Room 101', assignedToId: 'staff-1', status: 'Pending', dueDate: '2024-08-20'},
];

const initialVendors: Vendor[] = [
    { id: 'vendor-1', name: 'Fresh Veggies Co.', contactPerson: 'Rajesh Kumar', phone: '9876543210', category: 'Food' },
    { id: 'vendor-2', name: 'Hotel Supplies Inc.', contactPerson: 'Priya Sharma', phone: '8765432109', category: 'Linen' },
    { id: 'vendor-3', name: 'HygienePro', contactPerson: 'Amit Patel', phone: '7654321098', category: 'Toiletries' },
];

const initialInventory: InventoryItem[] = [
    { id: 'item-1', name: 'Tomatoes', quantity: 50, category: 'Food', unit: 'kg' },
    { id: 'item-2', name: 'Onions', quantity: 100, category: 'Food', unit: 'kg' },
    { id: 'item-3', name: 'Bath Towels', quantity: 200, category: 'Linen', unit: 'pieces' },
    { id: 'item-4', name: 'Shampoo', quantity: 500, category: 'Toiletries', unit: 'pieces' },
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
  guestProfiles: GuestProfile[];
  vendors: Vendor[];
  addVendor: (vendor: Omit<Vendor, 'id'>) => void;
  updateVendor: (vendor: Vendor) => void;
  inventory: InventoryItem[];
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id'>) => void;
  updatePurchaseOrderStatus: (poId: string, status: PurchaseOrder['status']) => void;
  receiveStock: (poId: string, receivedItems: { itemId: string, quantity: number }[]) => void;
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
  guestProfiles: [],
  vendors: [],
  addVendor: () => {},
  updateVendor: () => {},
  inventory: [],
  purchaseOrders: [],
  addPurchaseOrder: () => {},
  updatePurchaseOrderStatus: () => {},
  receiveStock: () => {},
});

export const BookingProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(initialMaintenanceTasks);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [tasks, setTasks] = useState<StaffTask[]>(initialTasks);
  const [guestProfiles, setGuestProfiles] = useState<GuestProfile[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    const profiles: { [email: string]: GuestProfile } = {};
    const checkedOutBookings = bookings.filter(b => b.status === 'Checked-out');

    bookings.forEach(booking => {
      const { email, name, avatar } = booking.guest;
      if (!profiles[email]) {
        profiles[email] = {
          email,
          name,
          avatar,
          totalStays: 0,
          totalSpend: 0,
          stayHistory: [],
        };
      }
      profiles[email].totalStays += 1;
      profiles[email].stayHistory.push({
        room: booking.room,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
      });
    });

    transactions.forEach(transaction => {
      const booking = bookings.find(b => b.guest.name === transaction.guest);
      if (booking) {
        const { email } = booking.guest;
        if (profiles[email] && transaction.status === 'Paid') {
          profiles[email].totalSpend += transaction.amount;
        }
      }
    });

    const loyalGuestProfiles = Object.values(profiles).filter(profile => {
        const checkedOutCount = profile.stayHistory.filter(stay => 
            checkedOutBookings.some(b => 
                b.guest.email === profile.email && 
                b.checkIn === stay.checkIn && 
                b.checkOut === stay.checkOut
            )
        ).length;
        return checkedOutCount >= 2;
    });

    setGuestProfiles(loyalGuestProfiles.sort((a, b) => b.totalSpend - a.totalSpend));
  }, [bookings, transactions]);


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

  const addVendor = (vendor: Omit<Vendor, 'id'>) => {
    const newVendor: Vendor = { ...vendor, id: `vendor-${Date.now()}` };
    setVendors(prev => [newVendor, ...prev]);
  };
  
  const updateVendor = (updatedVendor: Vendor) => {
    setVendors(prev => prev.map(v => v.id === updatedVendor.id ? updatedVendor : v));
  };

  const addPurchaseOrder = (po: Omit<PurchaseOrder, 'id'>) => {
    const newPO: PurchaseOrder = { ...po, id: `po-${Date.now()}` };
    setPurchaseOrders(prev => [newPO, ...prev]);
  };
  
  const updatePurchaseOrderStatus = (poId: string, status: PurchaseOrder['status']) => {
    setPurchaseOrders(prev => prev.map(po => po.id === poId ? { ...po, status } : po));
  };

  const receiveStock = (poId: string, receivedItems: { itemId: string, quantity: number }[]) => {
    setInventory(prevInventory => {
      const newInventory = [...prevInventory];
      receivedItems.forEach(receivedItem => {
        const itemIndex = newInventory.findIndex(invItem => invItem.id === receivedItem.itemId);
        if (itemIndex > -1) {
          newInventory[itemIndex].quantity += receivedItem.quantity;
        }
      });
      return newInventory;
    });

    setPurchaseOrders(prevPOs => {
        const newPOs = [...prevPOs];
        const poIndex = newPOs.findIndex(po => po.id === poId);
        if (poIndex > -1) {
            // Simplified logic: Assume full receipt completes the order.
            // A more complex implementation would track received quantities against ordered quantities.
            newPOs[poIndex].status = 'Completed';
        }
        return newPOs;
    })
  };

  return (
    <BookingContext.Provider value={{ 
        bookings, addBooking, updateBooking, deleteBooking, 
        maintenanceTasks, addMaintenanceTask, 
        orders, addOrder, updateOrderStatus, 
        transactions, addTransaction, settleTransaction,
        tasks, addTask, updateTaskStatus,
        guestProfiles,
        vendors, addVendor, updateVendor,
        inventory, purchaseOrders, addPurchaseOrder, updatePurchaseOrderStatus, receiveStock
    }}>
      {children}
    </BookingContext.Provider>
  );
};
