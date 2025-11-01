
"use client"

import {
  Search,
  User,
  Settings,
  LogOut,
  Clock,
} from "lucide-react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useUser } from "@/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import { BookingContext } from "@/context/BookingContext"
import { useToast } from "@/hooks/use-toast"
import { useFirebase } from "@/firebase"


export function AppHeader() {
  const { user, loading } = useUser();
  const { auth } = useFirebase();
  const { clockIn, clockOut, attendanceLog } = useContext(BookingContext);
  const { toast } = useToast();
  const router = useRouter();

  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  const currentUserAttendance = user ? attendanceLog.find(a => a.staffId === user.profile.uid && !a.clockOutTime) : null;

  useEffect(() => {
    if (currentUserAttendance) {
      setSessionStartTime(new Date(currentUserAttendance.clockInTime).getTime());
    } else {
      setSessionStartTime(null);
      setElapsedTime('00:00:00');
    }
  }, [currentUserAttendance]);


  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (sessionStartTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const diff = now - sessionStartTime;
        const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
        const minutes = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0');
        const seconds = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
        setElapsedTime(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStartTime]);


  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    // No longer need to manage localStorage here
    router.push("/login");
  };

  const handleClockIn = () => {
    if (!user) return;
    clockIn(user.profile.uid);
    toast({
        title: 'Clocked In',
        description: 'Your shift has started.'
    });
  }

  const handleClockOut = () => {
    if (!user || !currentUserAttendance) return;
    clockOut(currentUserAttendance.id);
    toast({
        title: 'Clocked Out',
        description: `Your shift has ended. Total time: ${elapsedTime}`,
    });
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-gradient-to-r from-primary via-primary to-accent/80 px-4 md:px-6">
      <SidebarTrigger className="h-8 w-8 text-primary-foreground/70 hover:text-primary-foreground" />
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background/80 pl-8 md:w-[200px] lg:w-[320px] backdrop-blur-sm"
        />
      </div>

       {user && (
         <div className="flex items-center gap-2">
            {currentUserAttendance ? (
                <Button onClick={handleClockOut} variant="destructive" size="sm">
                    <Clock className="mr-2" />
                    <span className="font-mono text-sm">{elapsedTime}</span>
                </Button>
            ) : (
                <Button onClick={handleClockIn} variant="secondary" size="sm">
                    <Clock className="mr-2" /> Clock In
                </Button>
            )}
         </div>
       )}


      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.firebaseUser.photoURL || ''} alt={user?.profile.displayName || 'User'} />
              <AvatarFallback>{user?.profile.displayName?.charAt(0) || user?.firebaseUser.email?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>{user?.profile.displayName || user?.firebaseUser.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
