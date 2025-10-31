
"use client";

import { useState, useContext } from "react";
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, SlidersHorizontal, Clock, ListTodo, CheckCircle, ArrowRight, CalendarDays, Timer } from "lucide-react";
import withAuth from "@/components/withAuth";
import { AppLayout } from "@/components/layout/app-layout";
import { placeholderImages } from "@/lib/placeholder-images";
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
import { useToast } from "@/hooks/use-toast";
import { BookingContext, StaffTask } from "@/context/BookingContext";
import { format, formatDistanceToNow } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";

type StaffMember = {
  id: string;
  name: string;
  role: string;
  status: "On Duty" | "Off Duty";
  avatar: string | undefined;
  shift: string;
};

const initialStaff: StaffMember[] = [
  {
    id: 'staff-1',
    name: "Maria Garcia",
    role: "Head Housekeeper",
    status: "On Duty",
    avatar: placeholderImages.find((p) => p.id === "user-avatar-2")?.imageUrl,
    shift: "7am - 3pm",
  },
  {
    id: 'staff-2',
    name: "Liam Gallagher",
    role: "Maintenance Lead",
    status: "On Duty",
    avatar: placeholderImages.find((p) => p.id === "user-avatar-3")?.imageUrl,
    shift: "9am - 5pm",
  },
  {
    id: 'staff-3',
    name: "Chloe Nguyen",
    role: "Front Desk",
    status: "Off Duty",
    avatar: placeholderImages.find((p) => p.id === "user-avatar-1")?.imageUrl,
    shift: "3pm - 11pm",
  },
  {
    id: 'staff-4',
    name: "John Doe",
    role: "Chef",
    status: "On Duty",
    avatar: placeholderImages.find((p) => p.id === "user-avatar-4")?.imageUrl,
    shift: "12pm - 8pm",
  },
];

const onDutyStatusVariant: { [key: string]: 'default' | 'secondary' } = {
  "On Duty": "default",
  "Off Duty": "secondary",
};

const taskStatusVariant: { [key in StaffTask['status']]: 'default' | 'secondary' | 'outline' } = {
    'Pending': 'outline',
    'In Progress': 'secondary',
    'Completed': 'default'
};

const nextTaskStatus: { [key in StaffTask['status']]?: StaffTask['status'] } = {
    'Pending': 'In Progress',
    'In Progress': 'Completed',
};

function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [isAssignTaskDialogOpen, setIsAssignTaskDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const { toast } = useToast();
  const { tasks, addTask, updateTaskStatus } = useContext(BookingContext);

  const handleAddStaff = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStaffMember: StaffMember = {
      id: `staff-${Date.now()}`,
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      shift: formData.get('shift') as string,
      status: "Off Duty", // Default status for new staff
      avatar: `https://picsum.photos/seed/staff${Date.now()}/40/40`,
    };

    setStaff(prev => [newStaffMember, ...prev]);
    setIsAddStaffDialogOpen(false);
    toast({
      title: 'Staff Member Added',
      description: `${newStaffMember.name} has been added to the team.`,
    });
  };
  
  const handleToggleStatus = (staffId: string) => {
    setStaff(prevStaff => {
        const updatedStaff = prevStaff.map(member => {
            if (member.id === staffId) {
                const newStatus = member.status === "On Duty" ? "Off Duty" : "On Duty";
                toast({
                    title: `${member.name}'s status updated`,
                    description: `They are now ${newStatus}.`,
                });
                return { ...member, status: newStatus };
            }
            return member;
        });
        return updatedStaff;
    });
  };

  const handleOpenAssignTask = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setIsAssignTaskDialogOpen(true);
  }

  const handleAssignTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStaff) return;

    const formData = new FormData(e.currentTarget);
    const dueDate = formData.get('dueDate');

    const newTask: Omit<StaffTask, 'id' | 'status'> = {
      title: formData.get('title') as string,
      assignedToId: selectedStaff.id,
      dueDate: dueDate ? format(new Date(dueDate as string), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    };
    
    addTask(newTask);
    setIsAssignTaskDialogOpen(false);
    setSelectedStaff(null);
    toast({
      title: 'Task Assigned',
      description: `"${newTask.title}" assigned to ${selectedStaff.name}.`
    });
  };
  
  const handleUpdateTaskStatus = (task: StaffTask) => {
    const next = nextTaskStatus[task.status];
    if (next) {
        updateTaskStatus(task.id, next);
        toast({
            title: 'Task Updated',
            description: `"${task.title}" is now ${next}.`
        });
    }
  };


  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline">
            Staff & Role Management
          </h1>
          <div className="flex items-center gap-2">
             <Button variant="outline" asChild>
                <Link href="/staff/schedule">
                    <CalendarDays className="mr-2" />
                    Shift Scheduler
                </Link>
            </Button>
            <Button variant="outline" asChild>
                <Link href="/staff/attendance">
                    <Timer className="mr-2" />
                    Attendance Log
                </Link>
            </Button>
            <Dialog open={isAddStaffDialogOpen} onOpenChange={setIsAddStaffDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Staff
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddStaff}>
                  <DialogHeader>
                    <DialogTitle>Add New Staff Member</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new staff member.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" placeholder="e.g., Jane Doe" required />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" name="role" placeholder="e.g., Front Desk" required />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="shift">Shift</Label>
                      <Input id="shift" name="shift" placeholder="e.g., 9am - 5pm" required />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsAddStaffDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Staff Member</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Card className="bg-card/60 backdrop-blur-sm border border-border/20">
          <CardHeader>
            <CardTitle>Team and Role Administration</CardTitle>
            <CardDescription>
              Manage employees, roles, attendance, and tasks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {staff.map((member) => {
                const memberTasks = tasks.filter(t => t.assignedToId === member.id && t.status !== 'Completed');
                return (
                    <Card key={member.id} className="flex flex-col transform transition-transform duration-300 hover:-translate-y-1">
                    <CardHeader className="flex-row items-start gap-4">
                        <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                        <CardTitle className="text-xl font-headline">{member.name}</CardTitle>
                        <CardDescription>{member.role}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-grow flex-col justify-between">
                         <div className="flex justify-between items-center mb-4">
                            <Badge variant={onDutyStatusVariant[member.status]}>{member.status}</Badge>
                            <p className="text-sm text-muted-foreground">{member.shift}</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2"><ListTodo className="h-4 w-4"/> Active Tasks</h4>
                            {memberTasks.length > 0 ? (
                                memberTasks.map(task => (
                                    <div key={task.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                        <div>
                                            <div className="text-sm">{task.title}</div>
                                            <div className="text-xs text-muted-foreground">
                                                Due: {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })} | Status: <Badge variant={taskStatusVariant[task.status]} className="px-1.5 py-0">{task.status}</Badge>
                                            </div>
                                        </div>
                                        {task.status !== 'Completed' && (
                                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleUpdateTaskStatus(task)}>
                                                {task.status === 'Pending' ? <ArrowRight className="h-4 w-4"/> : <CheckCircle className="h-4 w-4 text-green-500" />}
                                            </Button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground italic text-center py-2">No active tasks.</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="grid grid-cols-2 gap-2">
                        <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleToggleStatus(member.id)}
                        >
                        <Clock className="mr-2" />
                        Toggle Status
                        </Button>
                         <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => handleOpenAssignTask(member)}
                        >
                        <PlusCircle className="mr-2" />
                        Assign Task
                        </Button>
                    </CardFooter>
                    </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAssignTaskDialogOpen} onOpenChange={setIsAssignTaskDialogOpen}>
        <DialogContent>
            <form onSubmit={handleAssignTask}>
                <DialogHeader>
                <DialogTitle>Assign Task to {selectedStaff?.name}</DialogTitle>
                <DialogDescription>
                    Fill in the details for the new task.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Task Title</Label>
                    <Input id="title" name="title" placeholder="e.g., Restock linen closet" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <DatePicker name="dueDate" />
                </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsAssignTaskDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Assign Task</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

export default withAuth(StaffPage);
