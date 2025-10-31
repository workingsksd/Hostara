
'use client';

import { useState, useContext } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import withAuth from '@/components/withAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookingContext, Shift } from '@/context/BookingContext';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Copy, Printer } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

function ShiftSchedulerPage() {
  const { staff, shifts, schedule, updateSchedule } = useContext(BookingContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ staffId: string; date: Date } | null>(null);
  const { toast } = useToast();

  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  const handleDateChange = (offset: number) => {
    setCurrentDate(addDays(currentDate, offset));
  };

  const handleAssignClick = (staffId: string, date: Date) => {
    setSelectedCell({ staffId, date });
    setIsAssignDialogOpen(true);
  };
  
  const handleAssignShift = (shiftId: string | null) => {
    if (!selectedCell) return;
    
    const dateString = format(selectedCell.date, 'yyyy-MM-dd');
    updateSchedule(dateString, selectedCell.staffId, shiftId);
    
    const staffMember = staff.find(s => s.id === selectedCell.staffId);
    const shift = shifts.find(s => s.id === shiftId);
    toast({
        title: 'Shift Assigned',
        description: `${staffMember?.name} has been assigned to the ${shift ? shift.name : 'Off'} shift.`
    })
    
    setIsAssignDialogOpen(false);
    setSelectedCell(null);
  }

  const handleCopyWeek = () => {
    // In a real app, this would involve more complex logic to copy shifts to the next week.
    toast({
        title: "Week Copied (Demo)",
        description: "This would copy the current schedule to the next week."
    });
  }

  const handlePrintSchedule = () => {
    window.print();
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">Staff Shift Scheduler</h1>
            <p className="text-muted-foreground">Manage and publish weekly staff rosters.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCopyWeek}><Copy className="mr-2"/> Copy Week</Button>
            <Button variant="outline" onClick={handlePrintSchedule}><Printer className="mr-2"/> Print</Button>
          </div>
        </div>

        <Card className="bg-card/60 backdrop-blur-sm border-border/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Weekly Roster</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => handleDateChange(-7)}>
                <ChevronLeft />
              </Button>
              <span className="font-medium text-lg">
                {format(start, 'd MMM')} - {format(end, 'd MMM yyyy')}
              </span>
              <Button variant="outline" size="icon" onClick={() => handleDateChange(7)}>
                <ChevronRight />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[250px] sticky left-0 bg-card z-10">Staff Member</TableHead>
                    {weekDays.map(day => (
                        <TableHead key={day.toISOString()} className="text-center min-w-[150px]">
                        {format(day, 'EEE')} <br /> {format(day, 'd MMM')}
                        </TableHead>
                    ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {staff.map(member => (
                    <TableRow key={member.id}>
                        <TableCell className="font-medium sticky left-0 bg-card z-10">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p>{member.name}</p>
                                    <p className="text-xs text-muted-foreground">{member.role}</p>
                                </div>
                            </div>
                        </TableCell>
                        {weekDays.map(day => {
                        const dateString = format(day, 'yyyy-MM-dd');
                        const shiftId = schedule[dateString]?.[member.id] || null;
                        const shift = shifts.find(s => s.id === shiftId);
                        
                        return (
                            <TableCell 
                                key={day.toISOString()} 
                                className="text-center cursor-pointer hover:bg-muted/50"
                                onClick={() => handleAssignClick(member.id, day)}
                            >
                            {shift ? (
                                <div className={`p-2 rounded-md ${shift.color}`}>
                                    <p className="font-semibold">{shift.name}</p>
                                    {shift.startTime && <p className="text-xs">{shift.startTime} - {shift.endTime}</p>}
                                </div>
                            ) : (
                                <div className="p-2 rounded-md bg-muted/20 text-muted-foreground">
                                    Assign Shift
                                </div>
                            )}
                            </TableCell>
                        );
                        })}
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Assign Shift</DialogTitle>
                <DialogDescription>
                    Assign a shift for {staff.find(s => s.id === selectedCell?.staffId)?.name} on {selectedCell?.date ? format(selectedCell.date, 'PPPP') : ''}.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                {shifts.map(shift => (
                    <Button
                        key={shift.id}
                        className={`w-full justify-start ${shift.color}`}
                        onClick={() => handleAssignShift(shift.id)}
                    >
                        {shift.name} ({shift.startTime ? `${shift.startTime} - ${shift.endTime}` : 'No hours'})
                    </Button>
                ))}
                 <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleAssignShift(null)}
                >
                    Clear Assignment
                </Button>
            </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

export default withAuth(ShiftSchedulerPage);
