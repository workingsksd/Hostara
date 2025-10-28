"use client"

import {
  Search,
  User,
  Settings,
  LogOut,
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
import { placeholderImages } from "@/lib/placeholder-images"

export function AppHeader() {
  const managerAvatar = placeholderImages.find(p => p.id === 'user-avatar-4');
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={managerAvatar?.imageUrl} alt="Manager Avatar" data-ai-hint={managerAvatar?.imageHint} />
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
