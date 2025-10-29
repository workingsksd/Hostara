
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
import { Badge } from '@/components/ui/badge';
import withAuth from '@/components/withAuth';
import { AppLayout } from '@/components/layout/app-layout';
import { placeholderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, SlidersHorizontal, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type RoomStatus = 'Ready' | 'Dirty' | 'Cleaning in Progress';
type Staff = 'Maria Garcia' | 'Liam Gallagher' | 'Unassigned';

type Room = {
  id: string;
  name: string;
  status: RoomStatus;
  assignedTo: Staff | null;
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
    assignedTo: 'Maria Garcia',
    avatar: placeholderImages.find((p) => p.id === 'user-avatar-2')?.imageUrl,
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
    assignedTo: 'Maria Garcia',
    avatar: placeholderImages.find((p) => p.id === 'user-avatar-2')?.imageUrl,
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
  const [assigningRoomId, setAssigningRoomId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAssignCleaning = (roomId: string) => {
    setAssigningRoomId(roomId);
    // Simulate API call
    setTimeout(() => {
      setRooms(prevRooms => prevRooms.map(room => {
        if (room.id === roomId) {
          toast({
            title: `Room ${room.name} Assigned`,
            description: "The room is now being cleaned.",
          });
          return { ...room, status: 'Cleaning in Progress', assignedTo: 'Maria Garcia', avatar: placeholderImages.find((p) => p.id === 'user-avatar-2')?.imageUrl };
        }
        return room;
      }));
      setAssigningRoomId(null);
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
                 <Button className="w-full" variant={room.status === "Dirty" ? "secondary" : "outline"} disabled={room.status !== "Dirty" || assigningRoomId !== null} onClick={() => handleAssignCleaning(room.id)}>
                    {assigningRoomId === room.id ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" />
                        Assigning...
                      </>
                    ) : room.status === "Cleaning in Progress" ? "Re-assign" : "Assign for Cleaning"
                    }
                 </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

export default withAuth(HousekeepingPage);
