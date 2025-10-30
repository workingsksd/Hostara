
'use client';

import { useState, useContext } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import withAuth from '@/components/withAuth';
import { AppLayout } from '@/components/layout/app-layout';
import { placeholderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, SlidersHorizontal, Trash2, Loader2, Sparkles, Wrench, AlertCircle, Eye, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BookingContext, MaintenanceTask } from '@/context/BookingContext';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

type RoomStatus = 'Ready' | 'Dirty' | 'Cleaning in Progress' | 'Pending Approval' | 'Maintenance';
type StaffName = 'Maria Garcia' | 'Liam Gallagher' | 'Chloe Nguyen' | 'Unassigned';

type Room = {
  id: string;
  name: string;
  status: RoomStatus;
  assignedTo: StaffName | null;
  lastCleanedBy: StaffName | null;
  avatar: string | undefined;
  guest: string | null;
}

const initialRooms: Room[] = [
  {
    id: 'room-101',
    name: 'Room 101',
    status: 'Ready',
    assignedTo: null,
    lastCleanedBy: 'Maria Garcia',
    guest: 'John Doe',
    avatar: undefined
  },
  {
    id: 'room-102',
    name: 'Room 102',
    status: 'Dirty',
    assignedTo: null,
    lastCleanedBy: 'Chloe Nguyen',
    avatar: undefined,
    guest: null
  },
  {
    id: 'room-103',
    name: 'Lodge 5A',
    status: 'Ready',
    assignedTo: null,
    lastCleanedBy: 'Liam Gallagher',
    guest: 'Sophia Loren',
    avatar: undefined
  },
  {
    id: 'room-201',
    name: 'Room 201',
    status: 'Cleaning in Progress',
    assignedTo: 'Liam Gallagher',
    lastCleanedBy: 'Maria Garcia',
    avatar: placeholderImages.find((p) => p.id === 'user-avatar-3')?.imageUrl,
    guest: null
  },
  {
    id: 'room-202',
    name: 'Suite 4B',
    status: 'Dirty',
    assignedTo: null,
    lastCleanedBy: 'Chloe Nguyen',
    avatar: undefined,
    guest: null
  },
  {
    id: 'room-203',
    name: 'Room 203',
    status: 'Ready',
    assignedTo: null,
    lastCleanedBy: 'Maria Garcia',
    guest: null,
    avatar: undefined
  },
   {
    id: 'room-301',
    name: 'Room 301',
    status: 'Pending Approval',
    assignedTo: 'Maria Garcia',
    lastCleanedBy: 'Liam Gallagher',
    guest: 'Eleanor Vance',
    avatar: placeholderImages.find((p) => p.id === 'user-avatar-2')?.imageUrl
  },
  {
    id: 'room-302',
    name: 'Lodge 2C',
    status: 'Dirty',
    assignedTo: null,
    lastCleanedBy: 'Maria Garcia',
    guest: 'Marcus Thorne',
    avatar: undefined
  },
];

const staffList: { name: StaffName, avatarId: string }[] = [
    { name: 'Maria Garcia', avatarId: 'user-avatar-2' },
    { name: 'Liam Gallagher', avatarId: 'user-avatar-3' },
    { name: 'Chloe Nguyen', avatarId: 'user-avatar-1' },
];

const cleaningChecklist = [
    { id: 'beds', label: 'Make beds' },
    { id: 'surfaces', label: 'Dust all surfaces' },
    { id: 'bathroom', label: 'Clean and disinfect bathroom' },
    { id: 'towels', label: 'Replace towels' },
    { id: 'trash', label: 'Empty trash bins' },
    { id: 'minibar', label: 'Restock minibar' },
];


const statusConfig: {
  [key in RoomStatus]: {
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ReactNode;
    label: string;
  };
} = {
  Ready: {
    variant: 'default',
    icon: <ShieldCheck className="text-green-500" />,
    label: 'Ready',
  },
  Dirty: {
    variant: 'destructive',
    icon: <Trash2 className="text-red-500" />,
    label: 'Needs Cleaning',
  },
  'Cleaning in Progress': {
    variant: 'secondary',
    icon: <Clock className="text-yellow-500" />,
    label: 'Cleaning',
  },
  'Pending Approval': {
    variant: 'outline',
    icon: <Eye className="text-purple-500" />,
    label: 'Pending Approval',
  },
  Maintenance: {
    variant: 'outline',
    icon: <Wrench className="text-blue-500" />,
    label: 'Maintenance',
  }
};

function HousekeepingPage() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [filter, setFilter] = useState('All');
  const [activeDialog, setActiveDialog] = useState<'assign' | 'maintenance' | 'checklist' | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffName | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { addMaintenanceTask } = useContext(BookingContext);

  const handleAssignConfirm = () => {
    if (!selectedRoom || !selectedStaff) return;
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      const assignedStaffMember = staffList.find(s => s.name === selectedStaff);
      
      setRooms(prevRooms => prevRooms.map(room => {
        if (room.id === selectedRoom.id) {
          toast({
            title: `Room ${room.name} Assigned`,
            description: `${selectedStaff} has been assigned to clean the room.`,
          });
          return { 
            ...room, 
            status: 'Cleaning in Progress', 
            assignedTo: selectedStaff, 
            avatar: placeholderImages.find((p) => p.id === assignedStaffMember?.avatarId)?.imageUrl 
          };
        }
        return room;
      }));

      setIsSubmitting(false);
      setActiveDialog(null);
      setSelectedRoom(null);
      setSelectedStaff(null);
    }, 1000);
  };
  
  const handleCompleteCleaning = (roomId: string) => {
    setRooms(prevRooms => prevRooms.map(room => {
        if (room.id === roomId) {
            toast({
                title: `Cleaning for ${room.name} Complete`,
                description: 'The room is now pending supervisor approval.',
                className: 'bg-purple-500 text-white'
            });
            return { 
                ...room, 
                status: 'Pending Approval', 
            };
        }
        return room;
    }));
    setActiveDialog(null);
    setSelectedRoom(null);
  }

  const handleApproveCleaning = (roomId: string) => {
     setRooms(prevRooms => prevRooms.map(room => {
        if (room.id === roomId) {
            toast({
                title: `Room ${room.name} is Ready`,
                description: 'The room is now available for guests.',
                className: 'bg-green-500 text-white'
            });
            return { 
                ...room, 
                status: 'Ready', 
                lastCleanedBy: room.assignedTo, 
                assignedTo: null,
                avatar: undefined 
            };
        }
        return room;
    }));
  }
  
  const handleRequestRework = (roomId: string) => {
     setRooms(prevRooms => prevRooms.map(room => {
        if (room.id === roomId) {
            toast({
                title: `Rework Requested for ${room.name}`,
                description: 'The room has been marked as "Needs Cleaning" again.',
                variant: 'destructive'
            });
            return { 
                ...room, 
                status: 'Dirty',
                assignedTo: null,
                avatar: undefined 
            };
        }
        return room;
    }));
  }

  const handleMaintenanceRequest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRoom) return;

    const formData = new FormData(e.currentTarget);
    const issue = formData.get('issue') as string;

    const newMaintenanceTask: MaintenanceTask = {
      room: selectedRoom.name,
      issue,
      priority: 'High', // Defaulting to high for now
    };
    addMaintenanceTask(newMaintenanceTask);

    setRooms(prevRooms => prevRooms.map(room => {
      if (room.id === selectedRoom.id) {
        return { ...room, status: 'Maintenance' };
      }
      return room;
    }));

    toast({
      title: 'Maintenance Requested',
      description: `An alert for ${issue} in ${selectedRoom.name} has been created.`,
    });

    setActiveDialog(null);
    setSelectedRoom(null);
  };


  const filteredRooms =
    filter === 'All'
      ? rooms
      : rooms.filter((room) => room.status === filter);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline">
              Housekeeping & Maintenance
            </h1>
            <p className="text-muted-foreground">
              Track room cleanliness, maintenance, and staff assignments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select onValueChange={setFilter} value={filter}>
              <SelectTrigger className="w-[200px] bg-card/80 backdrop-blur-sm">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="Dirty">Needs Cleaning</SelectItem>
                <SelectItem value="Cleaning in Progress">Cleaning</SelectItem>
                <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRooms.map((room) => (
            <Card
              key={room.id}
              className="bg-card/60 backdrop-blur-sm border border-border/20 flex flex-col"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-headline">{room.name}</CardTitle>
                   <Badge
                      variant={statusConfig[room.status].variant}
                      className="flex items-center gap-1.5"
                    >
                      {statusConfig[room.status].icon}
                      <span>{statusConfig[room.status].label}</span>
                    </Badge>
                </div>
                <CardDescription>
                  {room.guest ? `Guest: ${room.guest}` : 'Vacant'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                {room.assignedTo ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={room.avatar} alt={room.assignedTo} />
                      <AvatarFallback>
                        {room.assignedTo.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {room.status === 'Cleaning in Progress' ? 'Assigned To' : 'Cleaned By'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {room.assignedTo}
                      </p>
                    </div>
                  </div>
                ) : room.status === 'Ready' && room.lastCleanedBy ? (
                    <div className="text-sm text-muted-foreground italic flex items-center gap-2">
                       <Sparkles className="h-4 w-4 text-green-400" />
                       Cleaned by {room.lastCleanedBy}
                    </div>
                 ) : room.status === 'Maintenance' ? (
                    <div className="text-sm text-blue-400 italic flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" /> Awaiting maintenance
                    </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    Unassigned
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 flex flex-col gap-2">
                
                {/* Actions for Dirty rooms */}
                {room.status === 'Dirty' && (
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    onClick={() => { setSelectedRoom(room); setActiveDialog('assign'); }}
                  >
                    Assign for Cleaning
                  </Button>
                )}

                {/* Actions for Cleaning in Progress */}
                {room.status === 'Cleaning in Progress' && (
                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={() => { setSelectedRoom(room); setActiveDialog('checklist'); }}
                  >
                    <CheckCircle className="mr-2" /> Complete Cleaning
                  </Button>
                )}
                
                {/* Actions for Pending Approval */}
                {room.status === 'Pending Approval' && (
                  <div className="w-full grid grid-cols-2 gap-2">
                    <Button 
                      className="w-full" 
                      variant="destructive"
                      onClick={() => handleRequestRework(room.id)}
                    >
                      <ShieldAlert className="mr-2" /> Rework
                    </Button>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white" 
                      onClick={() => handleApproveCleaning(room.id)}
                    >
                      <ShieldCheck className="mr-2" /> Approve
                    </Button>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full border-blue-500/50 text-blue-500 hover:bg-blue-500/10 hover:text-blue-600"
                  onClick={() => { setSelectedRoom(room); setActiveDialog('maintenance'); }}
                >
                    <Wrench className="mr-2" /> Request Maintenance
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Assign Staff Dialog */}
      <Dialog open={activeDialog === 'assign'} onOpenChange={(isOpen) => !isOpen && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Staff to {selectedRoom?.name}</DialogTitle>
            <DialogDescription>
              Select a staff member to clean this room.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
              <RadioGroup onValueChange={(val: StaffName) => setSelectedStaff(val)}>
                  {staffList.map(staff => (
                      <div key={staff.name} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                          <RadioGroupItem value={staff.name} id={staff.name} />
                          <Avatar className="h-9 w-9">
                              <AvatarImage src={placeholderImages.find(p => p.id === staff.avatarId)?.imageUrl} alt={staff.name} />
                              <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <Label htmlFor={staff.name} className="font-medium">{staff.name}</Label>
                      </div>
                  ))}
              </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
            <Button onClick={handleAssignConfirm} disabled={!selectedStaff || isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
              Confirm Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Maintenance Request Dialog */}
      <Dialog open={activeDialog === 'maintenance'} onOpenChange={(isOpen) => !isOpen && setActiveDialog(null)}>
        <DialogContent>
          <form onSubmit={handleMaintenanceRequest}>
            <DialogHeader>
              <DialogTitle>Request Maintenance for {selectedRoom?.name}</DialogTitle>
              <DialogDescription>
                Describe the issue that needs attention from the maintenance team.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="issue">Maintenance Issue</Label>
              <Textarea id="issue" name="issue" placeholder="e.g., Leaky faucet in the bathroom" required className="mt-2"/>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setActiveDialog(null)}>Cancel</Button>
              <Button type="submit">Submit Request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cleaning Checklist Dialog */}
      <Dialog open={activeDialog === 'checklist'} onOpenChange={(isOpen) => !isOpen && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cleaning Checklist for {selectedRoom?.name}</DialogTitle>
            <DialogDescription>
              Ensure all tasks are completed before marking the room as ready for approval.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {cleaningChecklist.map(item => (
              <div key={item.id} className="flex items-center space-x-3">
                <Checkbox id={item.id} />
                <Label htmlFor={item.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {item.label}
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
            <Button onClick={() => selectedRoom && handleCompleteCleaning(selectedRoom.id)}>
              Submit for Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
}

export default withAuth(HousekeepingPage);

    