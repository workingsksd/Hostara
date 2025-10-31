
'use client';

import Link from "next/link";
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Users,
  BedDouble,
  UtensilsCrossed,
  Warehouse,
  UsersRound,
  CreditCard,
  Building2,
  LineChart,
  Plug,
  Shield,
  Camera,
} from "lucide-react"
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AppSidebar as AppSidebarWrapper } from './sidebar-wrapper';

type Role = 'manager' | 'staff' | 'chef' | 'guest' | null;
type EntityType = 'Hotel' | 'Lodge' | 'Restaurant' | null;

const navLinks = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard", roles: ['manager', 'staff', 'chef', 'guest'], entities: ['Hotel', 'Lodge', 'Restaurant'] },
    { href: "/guests", icon: Users, label: "Front Desk", roles: ['manager', 'staff'], entities: ['Hotel', 'Lodge'] },
    { href: "/guests/kyc", icon: Camera, label: "KYC Scanner", roles: ['manager', 'staff'], entities: ['Hotel', 'Lodge'] },
    { href: "/housekeeping", icon: BedDouble, label: "Housekeeping", roles: ['manager', 'staff'], entities: ['Hotel', 'Lodge'] },
    { href: "/restaurant", icon: UtensilsCrossed, label: "Restaurant", roles: ['manager', 'chef', 'staff'], entities: ['Hotel', 'Restaurant'] },
    { href: "/restaurant/orders", icon: UtensilsCrossed, label: "Kitchen", roles: ['manager', 'chef', 'staff'], entities: ['Hotel', 'Restaurant'] },
    { href: "/inventory", icon: Warehouse, label: "Inventory", roles: ['manager', 'chef'], entities: ['Hotel', 'Lodge', 'Restaurant'] },
    { href: "/staff", icon: UsersRound, label: "Staff", roles: ['manager'], entities: ['Hotel', 'Lodge', 'Restaurant'] },
    { href: "/billing", icon: CreditCard, label: "Billing", roles: ['manager'], entities: ['Hotel', 'Lodge', 'Restaurant'] },
    { href: "/reporting", icon: LineChart, label: "Reporting", roles: ['manager'], entities: ['Hotel', 'Lodge', 'Restaurant'] },
    { href: "/integrations", icon: Plug, label: "Integrations", roles: ['manager'], entities: ['Hotel', 'Lodge', 'Restaurant'] },
    { href: "/security", icon: Shield, label: "Security", roles: ['manager', 'staff'], entities: ['Hotel', 'Lodge'] },
];


export function AppSidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<Role>(null);
  const [entityType, setEntityType] = useState<EntityType>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Reading from localStorage should only happen on the client
    setUserRole(localStorage.getItem("userRole") as Role);
    setEntityType(localStorage.getItem("entityType") as EntityType);
    setIsClient(true);
  }, []);

  return (
    <AppSidebarWrapper>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Building2 className="size-7 text-accent" />
            <h1 className="font-headline text-xl font-bold text-primary-foreground group-data-[collapsible=icon]:hidden">
                OptiServe
            </h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {isClient && navLinks.map(link => {
            const hasRole = userRole && link.roles.includes(userRole);
            const hasEntity = entityType && link.entities.includes(entityType);

            if (userRole === 'manager' || (hasRole && hasEntity)) {
                return (
                    <SidebarMenuItem key={link.href}>
                        <SidebarMenuButton asChild tooltip={link.label} isActive={pathname === link.href}>
                        <Link href={link.href}>
                            <link.icon />
                            <span>{link.label}</span>
                        </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            }
            return null;
          })}
        </SidebarMenu>
      </SidebarContent>
    </AppSidebarWrapper>
  )
}
