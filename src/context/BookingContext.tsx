
'use client';

import { createContext, useState, ReactNode, FC, useEffect } from 'react';
import { placeholderImages } from '@/lib/placeholder-images';
import { addDays, format, startOfWeek } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

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

export type RecipeIngredient = {
  inventoryId: string;
  quantity: number; 
};

export type OrderItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    recipe: RecipeIngredient[];
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

export type Shift = {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    color: string;
};

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  avatar: string | undefined;
};

export type ShiftAssignment = {
    [staffId: string]: string | null; // value is shiftId or null for 'Off'
};

export type WeeklySchedule = {
    [date: string]: ShiftAssignment; // Key is YYYY-MM-DD date string
};

export type AttendanceRecord = {
    id: string;
    staffId: string;
    clockInTime: string;
    clockOutTime: string | null;
};

export type RestaurantTable = {
    id: string;
    name: string;
    capacity: number;
    status: 'Available' | 'Occupied' | 'Reserved';
}

export type Reservation = {
    id: string;
    guestName: string;
    guestCount: number;
    reservationTime: string;
    status: 'Pending' | 'Seated' | 'Cancelled';
    tableId: string | null;
}

const initialBookings: Booking[] = [
  {
    id: 'booking-1',
    guest: { name: 'John Doe', email: 'john.doe@example.com', avatar: placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl },
    status: 'Checked-in',
    checkIn: '2024-08-18',
    checkOut: '2024-08-22',
    type: 'Hotel',
    room: 'Room 101',
  },
  {
    id: 'booking-2',
    guest: { name: 'Jane Smith', email: 'jane.smith@example.com', avatar: placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl },
    status: 'Confirmed',
    checkIn: '2024-08-20',
    checkOut: '2024-08-25',
    type: 'Lodge',
    room: 'Lodge 5A',
  },
  {
    id: 'booking-3',
    guest: { name: 'Eleanor Vance', email: 'eleanor@example.com', avatar: placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl },
    status: 'Checked-out',
    checkIn: '2024-07-10',
    checkOut: '2024-07-15',
    type: 'Hotel',
    room: 'Room 301',
  },
    {
    id: 'booking-4',
    guest: { name: 'Eleanor Vance', email: 'eleanor@example.com', avatar: placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl },
    status: 'Checked-out',
    checkIn: '2024-06-01',
    checkOut: '2024-06-05',
    type: 'Hotel',
    room: 'Room 202',
  },
];

const initialMaintenanceTasks: MaintenanceTask[] = [
    { room: 'Room 205', issue: 'Leaky Faucet', priority: 'High' },
    { room: 'Lobby', issue: 'AC not cooling', priority: 'Critical' },
    { room: 'Pool Area', issue: 'Loose tile', priority: 'Medium' },
];

const initialTransactions: Transaction[] = [
    { id: 'txn-1', guest: 'John Doe', date: '2024-08-19', type: 'Room', amount: 8000, status: 'Paid' },
    { id: 'txn-2', guest: 'John Doe', date: '2024-08-19', type: 'Restaurant', amount: 2500, status: 'Pending' },
    { id: 'txn-3', guest: 'Jane Smith', date: '2024-08-20', type: 'Lodge', amount: 12000, status: 'Paid' },
    { id: 'txn-4', guest: 'Eleanor Vance', date: '2024-07-14', type: 'Room Service', amount: 1500, status: 'Paid' },
    { id: 'txn-5', guest: 'Eleanor Vance', date: '2024-07-14', type: 'Room', amount: 24000, status: 'Paid' },
];

const initialTasks: StaffTask[] = [
    { id: 'task-1', title: 'Deep clean Suite 4B', assignedToId: 'staff-1', status: 'Pending', dueDate: '2024-08-21' },
    { id: 'task-2', title: 'Fix lobby AC unit', assignedToId: 'staff-2', status: 'In Progress', dueDate: '2024-08-20' },
];

const initialVendors: Vendor[] = [
    { id: 'vendor-1', name: 'Fresh Veggies Co.', contactPerson: 'Mr. Sharma', phone: '9876543210', category: 'Food' },
    { id: 'vendor-2', name: 'Deluxe Linens', contactPerson: 'Ms. Gupta', phone: '9876543211', category: 'Linen' },
    { id: 'vendor-3', name: 'All-in-One Maintenance', contactPerson: 'Mr. Singh', phone: '9876543212', category: 'Maintenance' },
];

const initialInventory: InventoryItem[] = [
    { id: 'inv-1', name: 'Tomatoes', quantity: 50, category: 'Food', unit: 'kg' },
    { id: 'inv-2', name: 'Onions', quantity: 100, category: 'Food', unit: 'kg' },
    { id: 'inv-3', name: 'Bath Towels', quantity: 200, category: 'Linen', unit: 'pieces' },
    { id: 'inv-4', name: 'Soap Bars', quantity: 500, category: 'Toiletries', unit: 'pieces' },
    { id: 'inv-5', name: 'LED Bulbs', quantity: 50, category: 'Maintenance', unit: 'pieces' },
    { id: 'inv-6', name: 'Paneer', quantity: 20, category: 'Food', unit: 'kg' },
    { id: 'inv-7', name: 'Cream', quantity: 10, category: 'Food', unit: 'liters' },
    { id: 'inv-8', name: 'Garlic', quantity: 5, category: 'Food', unit: 'kg' },
    { id: 'inv-9', name: 'Spices', quantity: 15, category: 'Food', unit: 'kg' },
    { id: 'inv-10', name: 'Flour', quantity: 50, category: 'Food', unit: 'kg' },
    { id: 'inv-11', name: 'Chicken', quantity: 30, category: 'Food', unit: 'kg' },
];

const initialStaffMembers: StaffMember[] = [
    { id: 'user1', name: 'Admin User', role: 'Admin', avatar: placeholderImages.find(p => p.id === "user-avatar-4")?.imageUrl },
    { id: 'staff-1', name: 'Maria Garcia', role: 'Head Housekeeper', avatar: placeholderImages.find(p => p.id === "user-avatar-2")?.imageUrl },
    { id: 'staff-2', name: 'Liam Gallagher', role: 'Maintenance Lead', avatar: placeholderImages.find(p => p.id === "user-avatar-3")?.imageUrl },
    { id: 'staff-3', name: 'Chloe Nguyen', role: 'Front Desk', avatar: placeholderImages.find(p => p.id === "user-avatar-1")?.imageUrl },
    { id: 'staff-4', name: 'John Doe', role: 'Chef', avatar: placeholderImages.find(p => p.id === "user-avatar-1")?.imageUrl },
];

const initialShifts: Shift[] = [
    { id: 'shift-morning', name: 'Morning', startTime: '07:00', endTime: '15:00', color: 'bg-blue-200/50 text-blue-800' },
    { id: 'shift-evening', name: 'Evening', startTime: '15:00', endTime: '23:00', color: 'bg-yellow-200/50 text-yellow-800' },
    { id: 'shift-night', name: 'Night', startTime: '23:00', endTime: '07:00', color: 'bg-indigo-200/50 text-indigo-800' },
    { id: 'shift-off', name: 'Off', startTime: '', endTime: '', color: 'bg-gray-200/50 text-gray-800' },
];

const initialTables: RestaurantTable[] = [
    { id: 't1', name: 'Table 1', capacity: 4, status: 'Available' },
    { id: 't2', name: 'Table 2', capacity: 4, status: 'Occupied' },
    { id: 't3', name: 'Table 3', capacity: 2, status: 'Available' },
    { id: 't4', name: 'Table 4', capacity: 6, status: 'Reserved' },
    { id: 't5', name: 'Table 5', capacity: 4, status: 'Available' },
    { id: 't6', name: 'Table 6', capacity: 8, status: 'Available' },
    { id: 'b1', name: 'Booth 1', capacity: 6, status: 'Available' },
    { id: 'b2', name: 'Booth 2', capacity: 6, status: 'Occupied' },
];

const tomorrow = addDays(new Date(), 1);
tomorrow.setHours(20, 0, 0, 0); // Set to 8:00 PM
const initialReservations: Reservation[] = [
    { id: 'res-1', guestName: 'Michael Scott', guestCount: 4, reservationTime: tomorrow.toISOString(), status: 'Pending', tableId: null },
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
  staff: StaffMember[];
  shifts: Shift[];
  schedule: WeeklySchedule;
  updateSchedule: (date: string, staffId: string, shiftId: string | null) => void;
  attendanceLog: AttendanceRecord[];
  clockIn: (staffId: string) => void;
  clockOut: (attendanceId: string) => void;
  tables: RestaurantTable[];
  updateTableStatus: (tableId: string, status: RestaurantTable['status']) => void;
  reservations: Reservation[];
  addReservation: (reservation: Omit<Reservation, 'id' | 'status' | 'tableId'>) => void;
  updateReservationStatus: (reservationId: string, status: Reservation['status'], tableId?: string) => void;
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
  staff: [],
  shifts: [],
  schedule: {},
  updateSchedule: () => {},
  attendanceLog: [],
  clockIn: () => {},
  clockOut: () => {},
  tables: [],
  updateTableStatus: () => {},
  reservations: [],
  addReservation: () => {},
  updateReservationStatus: () => {},
});

export const BookingProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(initialMaintenanceTasks);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [tasks, setTasks] = useState<StaffTask[]>(initialTasks);
  const [guestProfiles, setGuestProfiles] = useState<GuestProfile[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>(initialStaffMembers);
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [schedule, setSchedule] = useState<WeeklySchedule>({});
  const [attendanceLog, setAttendanceLog] = useState<AttendanceRecord[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>(initialTables);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);

  // Initialize a mock schedule
  useEffect(() => {
    const today = new Date();
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const newSchedule: WeeklySchedule = {};

    for (let i = 0; i < 7; i++) {
        const date = addDays(startOfThisWeek, i);
        const dateString = format(date, 'yyyy-MM-dd');
        newSchedule[dateString] = {
            'staff-1': 'shift-morning',
            'staff-2': 'shift-morning',
            'staff-3': i < 5 ? 'shift-evening' : 'shift-off', // Weekends off for Chloe
            'staff-4': 'shift-evening',
        };
    }
    setSchedule(newSchedule);
  }, []);


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
    
    // Deduct stock from inventory
    setInventory(prevInventory => {
        const newInventory = [...prevInventory];
        order.items.forEach(orderItem => {
            orderItem.recipe.forEach(ingredient => {
                const itemIndex = newInventory.findIndex(invItem => invItem.id === ingredient.inventoryId);
                if (itemIndex > -1) {
                    const totalDeduction = ingredient.quantity * orderItem.quantity;
                    newInventory[itemIndex].quantity -= totalDeduction;

                    if (newInventory[itemIndex].quantity <= 0) {
                        toast({
                            variant: 'destructive',
                            title: 'Low Stock Alert',
                            description: `${newInventory[itemIndex].name} is now out of stock.`
                        });
                    }
                }
            });
        });
        return newInventory;
    });
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          if (status === 'Completed') {
              addTransaction({
                  guest: o.guestName,
                  type: 'Restaurant',
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
            newPOs[poIndex].status = 'Completed';
        }
        return newPOs;
    })
  };

  const updateSchedule = (date: string, staffId: string, shiftId: string | null) => {
    setSchedule(prev => {
        const newSchedule = { ...prev };
        if (!newSchedule[date]) {
            newSchedule[date] = {};
        }
        newSchedule[date][staffId] = shiftId;
        return newSchedule;
    });
  };

  const clockIn = (staffId: string) => {
    const existingRecord = attendanceLog.find(r => r.staffId === staffId && !r.clockOutTime);
    if (existingRecord) return; // Already clocked in

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      staffId,
      clockInTime: new Date().toISOString(),
      clockOutTime: null,
    };
    setAttendanceLog(prev => [newRecord, ...prev]);
  };

  const clockOut = (attendanceId: string) => {
    setAttendanceLog(prev =>
      prev.map(r =>
        r.id === attendanceId ? { ...r, clockOutTime: new Date().toISOString() } : r
      )
    );
  };
  
  const updateTableStatus = (tableId: string, status: RestaurantTable['status']) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));
  };

  const addReservation = (reservation: Omit<Reservation, 'id' | 'status' | 'tableId'>) => {
    const newReservation: Reservation = {
        ...reservation,
        id: `res-${Date.now()}`,
        status: 'Pending',
        tableId: null,
    };
    setReservations(prev => [newReservation, ...prev]);
  }

  const updateReservationStatus = (reservationId: string, status: Reservation['status'], tableId?: string) => {
    setReservations(prev => prev.map(r => {
        if (r.id === reservationId) {
            if (status === 'Seated' && tableId) {
                return { ...r, status, tableId };
            }
            return { ...r, status };
        }
        return r;
    }));
  }

  return (
    <BookingContext.Provider value={{ 
        bookings, addBooking, updateBooking, deleteBooking, 
        maintenanceTasks, addMaintenanceTask, 
        orders, addOrder, updateOrderStatus, 
        transactions, addTransaction, settleTransaction,
        tasks, addTask, updateTaskStatus,
        guestProfiles,
        vendors, addVendor, updateVendor,
        inventory, purchaseOrders, addPurchaseOrder, updatePurchaseOrderStatus, receiveStock,
        staff, shifts, schedule, updateSchedule,
        attendanceLog, clockIn, clockOut,
        tables, updateTableStatus,
        reservations, addReservation, updateReservationStatus,
    }}>
      {children}
    </BookingContext.Provider>
  );
};

  