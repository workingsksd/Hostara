
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
  type: 'Hotel' | 'Lodge';
  room: string;
};

export type MaintenanceTask = {
  room: string;
  issue: string;
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
}

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
    category: 'Linen' | 'Toiletries' | 'Maintenance' | 'F&B';
};

export type InventoryItem = {
    id: string;
    name: string;
    quantity: number;
    category: 'Linen' | 'Toiletries' | 'Maintenance' | 'F&B';
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

export type RecipeIngredient = {
    itemId: string; // ID of the inventory item
    quantity: number; // Quantity of the item used in the recipe
};

export type MenuItem = {
    id: string;
    name: string;
    price: number;
    category: 'Appetizer' | 'Main Course' | 'Dessert' | 'Beverage';
    recipe: RecipeIngredient[];
};

export type OrderItem = {
    menuItemId: string;
    name: string;
    quantity: number;
};

export type Order = {
    id: string;
    tableId: string;
    items: OrderItem[];
    status: 'New' | 'In Progress' | 'Ready' | 'Served' | 'Paid';
    timestamp: string;
};

export type RestaurantTable = {
    id: string;
    name: string;
    status: 'Available' | 'Occupied' | 'Billing';
    orderId: string | null;
};


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
    { id: 'txn-2', guest: 'John Doe', date: '2024-08-19', type: 'Room Service', amount: 2500, status: 'Pending' },
    { id: 'txn-3', guest: 'Jane Smith', date: '2024-08-20', type: 'Lodge', amount: 12000, status: 'Paid' },
    { id: 'txn-4', guest: 'Eleanor Vance', date: '2024-07-14', type: 'Room Service', amount: 1500, status: 'Paid' },
    { id: 'txn-5', guest: 'Eleanor Vance', date: '2024-07-14', type: 'Room', amount: 24000, status: 'Paid' },
];

const initialTasks: StaffTask[] = [
    { id: 'task-1', title: 'Deep clean Suite 4B', assignedToId: 'staff-1', status: 'Pending', dueDate: '2024-08-21' },
    { id: 'task-2', title: 'Fix lobby AC unit', assignedToId: 'staff-2', status: 'In Progress', dueDate: '2024-08-20' },
];

const initialVendors: Vendor[] = [
    { id: 'vendor-1', name: 'Fresh Produce Inc.', contactPerson: 'Mr. Kumar', phone: '9876543210', category: 'F&B' },
    { id: 'vendor-2', name: 'Deluxe Linens', contactPerson: 'Ms. Gupta', phone: '9876543211', category: 'Linen' },
    { id: 'vendor-3', name: 'All-in-One Maintenance', contactPerson: 'Mr. Singh', phone: '9876543212', category: 'Maintenance' },
];

const initialInventory: InventoryItem[] = [
    { id: 'inv-1', name: 'Tomatoes', quantity: 50, category: 'F&B', unit: 'kg' },
    { id: 'inv-2', name: 'Paneer', quantity: 20, category: 'F&B', unit: 'kg' },
    { id: 'inv-3', name: 'Bath Towels', quantity: 200, category: 'Linen', unit: 'pieces' },
    { id: 'inv-4', name: 'Soap Bars', quantity: 500, category: 'Toiletries', unit: 'pieces' },
    { id: 'inv-5', name: 'LED Bulbs', quantity: 50, category: 'Maintenance', unit: 'pieces' },
    { id: 'inv-6', name: 'Chicken Breast', quantity: 30, category: 'F&B', unit: 'kg' },
    { id: 'inv-7', name: 'Cream', quantity: 15, category: 'F&B', unit: 'liters' },
    { id: 'inv-8', name: 'Garam Masala', quantity: 5, category: 'F&B', unit: 'kg' },
];

const initialStaffMembers: StaffMember[] = [
    { id: 'user1', name: 'Admin User', role: 'Admin', avatar: placeholderImages.find(p => p.id === "user-avatar-4")?.imageUrl },
    { id: 'staff-1', name: 'Maria Garcia', role: 'Head Housekeeper', avatar: placeholderImages.find(p => p.id === "user-avatar-2")?.imageUrl },
    { id: 'staff-2', name: 'Liam Gallagher', role: 'Maintenance Lead', avatar: placeholderImages.find(p => p.id === "user-avatar-3")?.imageUrl },
    { id: 'staff-3', name: 'Chloe Nguyen', role: 'Front Desk', avatar: placeholderImages.find(p => p.id === "user-avatar-1")?.imageUrl },
    { id: 'staff-5', name: 'Ravi Kumar', role: 'Chef', avatar: undefined },
    { id: 'staff-6', name: 'Priya Singh', role: 'Waiter', avatar: undefined },
];

const initialShifts: Shift[] = [
    { id: 'shift-morning', name: 'Morning', startTime: '07:00', endTime: '15:00', color: 'bg-blue-200/50 text-blue-800' },
    { id: 'shift-evening', name: 'Evening', startTime: '15:00', endTime: '23:00', color: 'bg-yellow-200/50 text-yellow-800' },
    { id: 'shift-night', name: 'Night', startTime: '23:00', endTime: '07:00', color: 'bg-indigo-200/50 text-indigo-800' },
    { id: 'shift-off', name: 'Off', startTime: '', endTime: '', color: 'bg-gray-200/50 text-gray-800' },
];

const initialMenu: MenuItem[] = [
    { id: 'menu-1', name: 'Paneer Butter Masala', price: 450, category: 'Main Course', recipe: [{ itemId: 'inv-2', quantity: 0.2 }, { itemId: 'inv-1', quantity: 0.3 }, { itemId: 'inv-7', quantity: 0.05 }, { itemId: 'inv-8', quantity: 0.01 }] },
    { id: 'menu-2', name: 'Chicken Tikka', price: 550, category: 'Appetizer', recipe: [{ itemId: 'inv-6', quantity: 0.25 }, { itemId: 'inv-8', quantity: 0.02 }] },
    { id: 'menu-3', name: 'Garlic Naan', price: 90, category: 'Main Course', recipe: [] },
    { id: 'menu-4', name: 'Gulab Jamun', price: 150, category: 'Dessert', recipe: [] },
    { id: 'menu-5', name: 'Mineral Water', price: 50, category: 'Beverage', recipe: [] },
];

const initialTables: RestaurantTable[] = Array.from({ length: 8 }, (_, i) => ({
    id: `t-${i + 1}`,
    name: `Table ${i + 1}`,
    status: 'Available',
    orderId: null,
}));


interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBooking: (updatedBooking: Booking) => void;
  deleteBooking: (bookingId: string) => void;
  maintenanceTasks: MaintenanceTask[];
  addMaintenanceTask: (task: MaintenanceTask) => void;
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
  menu: MenuItem[];
  orders: Order[];
  tables: RestaurantTable[];
  addOrder: (order: Omit<Order, 'id' | 'status' | 'timestamp'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addExternalOrder: (order: Omit<Order, 'id' | 'status' | 'timestamp'>) => void;
}

export const BookingContext = createContext<BookingContextType>({
  bookings: [],
  addBooking: () => {},
  updateBooking: () => {},
  deleteBooking: () => {},
  maintenanceTasks: [],
  addMaintenanceTask: () => {},
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
  menu: [],
  orders: [],
  tables: [],
  addOrder: () => {},
  updateOrderStatus: () => {},
  addExternalOrder: () => {},
});

export const BookingProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(initialMaintenanceTasks);
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

  // Restaurant state
  const [menu, setMenu] = useState<MenuItem[]>(initialMenu);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>(initialTables);


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
            'staff-5': i < 5 ? 'shift-evening' : 'shift-off',
            'staff-6': 'shift-morning',
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
  
  // Restaurant Functions
  const addOrder = (order: Omit<Order, 'id' | 'status' | 'timestamp'>) => {
    const newOrder: Order = {
        ...order,
        id: `ord-${Date.now()}`,
        status: 'New',
        timestamp: new Date().toISOString(),
    };
    setOrders(prev => [newOrder, ...prev]);
    setTables(prev => prev.map(t => t.id === order.tableId ? { ...t, status: 'Occupied', orderId: newOrder.id } : t));

    // Deduct inventory
    setInventory(prevInventory => {
        let tempInventory = [...prevInventory];
        let stockOut = false;
        order.items.forEach(orderItem => {
            const menuItem = menu.find(m => m.id === orderItem.menuItemId);
            if (menuItem?.recipe) {
                menuItem.recipe.forEach(ingredient => {
                    const invItemIndex = tempInventory.findIndex(i => i.id === ingredient.itemId);
                    if (invItemIndex !== -1) {
                        tempInventory[invItemIndex].quantity -= (ingredient.quantity * orderItem.quantity);
                        if(tempInventory[invItemIndex].quantity <= 0) {
                            stockOut = true;
                            toast({
                                variant: 'destructive',
                                title: 'Stock Alert!',
                                description: `${tempInventory[invItemIndex].name} is now out of stock.`
                            });
                        }
                    }
                });
            }
        });
        return tempInventory;
    });
  };

  const addExternalOrder = (order: Omit<Order, 'id' | 'status' | 'timestamp'>) => {
    const newOrder: Order = {
        ...order,
        id: `ext-${order.tableId.toLowerCase()}-${Date.now()}`,
        status: 'New',
        timestamp: new Date().toISOString(),
    };
    setOrders(prev => [newOrder, ...prev]);
    // Note: This does not occupy a physical table.
    toast({
        title: 'New Online Order!',
        description: `An order from ${order.tableId} has been received.`
    });
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
            if (status === 'Served' || status === 'Paid') {
                setTables(prevTables => prevTables.map(t => t.orderId === orderId ? { ...t, status: 'Billing', orderId: null } : t));
            }
            return { ...o, status };
        }
        return o;
    }));
  };

  return (
    <BookingContext.Provider value={{ 
        bookings, addBooking, updateBooking, deleteBooking, 
        maintenanceTasks, addMaintenanceTask, 
        transactions, addTransaction, settleTransaction,
        tasks, addTask, updateTaskStatus,
        guestProfiles,
        vendors, addVendor, updateVendor,
        inventory, purchaseOrders, addPurchaseOrder, updatePurchaseOrderStatus, receiveStock,
        staff, shifts, schedule, updateSchedule,
        attendanceLog, clockIn, clockOut,
        menu, orders, tables, addOrder, updateOrderStatus, addExternalOrder
    }}>
      {children}
    </BookingContext.Provider>
  );
};
