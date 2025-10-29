
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
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
import { CheckCircle, Clock, SlidersHorizontal, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type RoomStatus = 'Ready' | 'Dirty' | 'Cleaning in Progress';
type StaffName = 'Maria Garcia' | 'Liam Gallagher' | 'Chloe Nguyen' | 'Unassigned';

type Room = {
  id: string;
  name: string;
  status: RoomStatus;
  assignedTo: StaffName | null;
  avatar: string | undefined;
  guest: string | null;
}

const initialRooms: Room[] = [
  {
    id: 'room-101',
    name: 'Room 101',
    status: 'Ready',
    assignedTo: null,
    guest: 'John Doe',
    avatar: undefined
  },
  {
    id: 'room-102',
    name: 'Room 102',
    status: 'Dirty',
    assignedTo: null,
    avatar: undefined,
    guest: null
  },
  {
    id: 'room-103',
    name: 'Lodge 5A',
    status: 'Ready',
    assignedTo: null,
    guest: 'Sophia Loren',
    avatar: undefined
  },
  {
    id: 'room-201',
    name: 'Room 201',
    status: 'Cleaning in Progress',
    assignedTo: 'Liam Gallagher',
    avatar: placeholderImages.find((p) => p.id === 'user-avatar-3')?.imageUrl,
    guest: null
  },
  {
    id: 'room-202',
    name: 'Suite 4B',
    status: 'Dirty',
    assignedTo: null,
    avatar: undefined,
    guest: null
  },
  {
    id: 'room-203',
    name: 'Room 203',
    status: 'Ready',
    assignedTo: null,
    guest: null,
    avatar: undefined
  },
   {
    id: 'room-301',
    name: 'Room 301',
    status: 'Ready',
    assignedTo: null,
    guest: 'Eleanor Vance',
    avatar: undefined
  },
  {
    id: 'room-302',
    name: 'Lodge 2C',
    status: 'Dirty',
    assignedTo: null,
    guest: 'Marcus Thorne',
    avatar: undefined
  },
];

const staffList: { name: StaffName, avatarId: string }[] = [
    { name: 'Maria Garcia', avatarId: 'user-avatar-2' },
    { name: 'Liam Gallagher', avatarId: 'user-avatar-3' },
    { name: 'Chloe Nguyen', avatarId: 'user-avatar-1' },
];

const statusConfig: {
  [key in RoomStatus]: {
    variant: 'default' | 'secondary' | 'destructive';
    icon: React.ReactNode;
    label: string;
  };
} = {
  Ready: {
    variant: 'default',
    icon: <CheckCircle className="text-green-500" />,
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
    label: 'Cleaning in Progress',
  },
};

function HousekeepingPage() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [filter, setFilter] = useState('All');
  const [assigningRoom, setAssigningRoom] = useState<Room | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffName | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const { toast } = useToast();

  const handleAssignConfirm = () => {
    if (!assigningRoom || !selectedStaff) return;
    
    setIsAssigning(true);
    // Simulate API call
    setTimeout(() => {
      const assignedStaffMember = staffList.find(s => s.name === selectedStaff);
      
      setRooms(prevRooms => prevRooms.map(room => {
        if (room.id === assigningRoom.id) {
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

      setIsAssigning(false);
      setAssigningRoom(null);
      setSelectedStaff(null);
    }, 1000);
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
              <SelectTrigger className="w-[180px] bg-card/80 backdrop-blur-sm">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="Dirty">Dirty</SelectItem>
                <SelectItem value="Cleaning in Progress">
                  Cleaning in Progress
                </SelectItem>
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
                      <p className="text-sm font-medium">Assigned To</p>
                      <p className="text-xs text-muted-foreground">
                        {room.assignedTo}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    Unassigned
                  </div>
                )}
              </CardContent>
              <div className="p-6 pt-0">
                <Dialog open={assigningRoom?.id === room.id} onOpenChange={(isOpen) => !isOpen && setAssigningRoom(null)}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      variant={room.status === "Dirty" ? "secondary" : "outline"} 
                      disabled={room.status !== "Dirty"}
                      onClick={() => setAssigningRoom(room)}
                    >
                      Assign for Cleaning
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Staff to {room.name}</DialogTitle>
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
                      <Button variant="outline" onClick={() => setAssigningRoom(null)}>Cancel</Button>
                      <Button onClick={handleAssignConfirm} disabled={!selectedStaff || isAssigning}>
                        {isAssigning && <Loader2 className="mr-2 animate-spin" />}
                        Confirm Assignment
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

export default withAuth(HousekeepingPage);
