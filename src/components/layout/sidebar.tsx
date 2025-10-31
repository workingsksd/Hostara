
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
  UserCheck,
} from "lucide-react"
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AppSidebar as AppSidebarWrapper } from './sidebar-wrapper';

type Role = 'manager' | 'staff' | 'chef' | 'guest' | 'finance' | 'housekeeping' | 'receptionist' | null;
type EntityType = 'Hotel' | 'Lodge' | 'Restaurant' | null;

type NavLink = {
    href: string;
    icon: React.ElementType;
    label: string;
    roles: Role[];
    entities: EntityType[];
    lodgeRoles?: Role[]; // Specific roles for Lodge entity
};

const navLinks: NavLink[] = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard", roles: ['manager'], entities: ['Hotel', 'Lodge', 'Restaurant']},
    { href: "/guests", icon: Users, label: "Front Desk", roles: ['manager', 'staff', 'receptionist'], entities: ['Hotel', 'Lodge'], lodgeRoles: ['manager', 'receptionist'] },
    { href: "/guests/kyc", icon: Camera, label: "KYC Scanner", roles: ['manager', 'staff', 'receptionist'], entities: ['Hotel', 'Lodge'], lodgeRoles: ['manager', 'receptionist'] },
    { href: "/housekeeping", icon: BedDouble, label: "Housekeeping", roles: ['manager', 'staff', 'housekeeping'], entities: ['Hotel', 'Lodge'], lodgeRoles: ['manager', 'housekeeping'] },
    { href: "/restaurant", icon: UtensilsCrossed, label: "Restaurant", roles: ['manager', 'chef', 'staff'], entities: ['Hotel', 'Restaurant'] },
    { href: "/restaurant/orders", icon: UtensilsCrossed, label: "Kitchen", roles: ['manager', 'chef', 'staff'], entities: ['Hotel', 'Restaurant'] },
    { href: "/inventory", icon: Warehouse, label: "Inventory", roles: ['manager', 'chef'], entities: ['Hotel', 'Lodge', 'Restaurant'] },
    { href: "/staff", icon: UsersRound, label: "Staff", roles: ['manager'], entities: ['Hotel', 'Lodge', 'Restaurant'] },
    { href: "/billing", icon: CreditCard, label: "Billing", roles: ['manager', 'finance'], entities: ['Hotel', 'Lodge', 'Restaurant'], lodgeRoles: ['manager', 'finance'] },
    { href: "/reporting", icon: LineChart, label: "Reporting", roles: ['manager', 'finance'], entities: ['Hotel', 'Lodge', 'Restaurant'], lodgeRoles: ['manager', 'finance'] },
    { href: "/integrations", icon: Plug, label: "Integrations", roles: ['manager'], entities: ['Hotel', 'Lodge', 'Restaurant'] },
    { href: "/security", icon: Shield, label: "Security", roles: ['manager', 'staff', 'receptionist'], entities: ['Hotel', 'Lodge'], lodgeRoles: ['manager', 'receptionist']},
    { href: "/guest-portal", icon: UserCheck, label: "Guest Portal", roles: ['guest'], entities: ['Hotel', 'Lodge'], lodgeRoles: ['guest'] },
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

  const hasAccess = (link: NavLink) => {
    if (!userRole || !entityType || !link.entities.includes(entityType)) {
      return false;
    }

    if (userRole === 'manager') {
      return true;
    }
    
    if (entityType === 'Lodge' && link.lodgeRoles) {
        return link.lodgeRoles.includes(userRole);
    }

    return link.roles.includes(userRole);
  }

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
            if (hasAccess(link)) {
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
