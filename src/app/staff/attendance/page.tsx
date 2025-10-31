
'use client';

import { useState, useContext } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import withAuth from '@/components/withAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BookingContext } from '@/context/BookingContext';
import { format, formatDistanceStrict, parseISO } from 'date-fns';
import { FileDown, LogIn, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from "jspdf";
import "jspdf-autotable";

function AttendanceLogPage() {
  const { staff, attendanceLog } = useContext(BookingContext);
  const { toast } = useToast();

  const getDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) return 'In Progress';
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    return formatDistanceStrict(end, start);
  };
  
  const handleExportReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Staff Attendance Report", 14, 22);

    doc.setFontSize(12);
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 14, 32);

    const tableData = attendanceLog.map(log => {
      const staffMember = staff.find(s => s.id === log.staffId);
      return [
        staffMember?.name || 'Unknown Staff',
        format(parseISO(log.clockInTime), 'PP'),
        format(parseISO(log.clockInTime), 'p'),
        log.clockOutTime ? format(parseISO(log.clockOutTime), 'p') : 'N/A',
        getDuration(log.clockInTime, log.clockOutTime),
      ];
    });

    (doc as any).autoTable({
        startY: 40,
        head: [['Staff Member', 'Date', 'Clock In', 'Clock Out', 'Duration']],
        body: tableData,
        headStyles: { fillColor: [11, 19, 43] },
        styles: { font: 'Inter' },
    });

    doc.save(`attendance-report-${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
        title: "Report Generated",
        description: "Your PDF attendance report has been downloaded.",
    });
  }


  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">Staff Attendance Log</h1>
            <p className="text-muted-foreground">A complete history of staff clock-in and clock-out times.</p>
          </div>
          <Button onClick={handleExportReport}>
            <FileDown className="mr-2"/> Export Report
          </Button>
        </div>

        <Card className="bg-card/60 backdrop-blur-sm border-border/20">
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>View all recorded work sessions for your team.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Total Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceLog.map(log => {
                  const staffMember = staff.find(s => s.id === log.staffId);
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={staffMember?.avatar} />
                                <AvatarFallback>{staffMember?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{staffMember?.name}</p>
                                <p className="text-xs text-muted-foreground">{staffMember?.role}</p>
                            </div>
                        </div>
                      </TableCell>
                      <TableCell>{format(parseISO(log.clockInTime), 'PP')}</TableCell>
                      <TableCell>{format(parseISO(log.clockInTime), 'p')}</TableCell>
                      <TableCell>{log.clockOutTime ? format(parseISO(log.clockOutTime), 'p') : '---'}</TableCell>
                      <TableCell className="font-mono">{getDuration(log.clockInTime, log.clockOutTime)}</TableCell>
                       <TableCell>
                        {log.clockOutTime ? (
                            <Badge variant="secondary"><LogOut className="mr-1.5 h-3 w-3"/>Logged Out</Badge>
                        ): (
                            <Badge><LogIn className="mr-1.5 h-3 w-3"/>On Duty</Badge>
                        )}
                       </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default withAuth(AttendanceLogPage);
