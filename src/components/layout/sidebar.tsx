
'use client';

import Link from "next/link";
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Users,
  BedDouble,
  Warehouse,
  UsersRound,
  CreditCard,
  Building2,
  LineChart,
  Plug,
  Shield,
  HeartPulse,
  TrendingUp,
  CalendarDays,
  Timer,
  Utensils,
  CookingPot
} from "lucide-react"
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AppSidebar as AppSidebarWrapper } from './sidebar-wrapper';

type Role = 'Admin' | 'Front Office Staff' | 'Housekeeping' | 'Maintenance Team' | 'Inventory Manager' | 'HR Manager' | 'Finance Manager' | 'Security Staff' | 'Guest' | 'Receptionist' | 'Finance' | 'Waiter' | 'Chef' | 'Restaurant Manager';
type OrganisationType = 'Hotel' | 'Lodge' | 'Restaurant' | null;

type NavLink = {
    href: string;
    icon: React.ElementType;
    label: string;
    roles: Role[];
    entities: OrganisationType[];
    subItems?: NavLink[];
};

const navLinks: NavLink[] = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard", roles: ['Admin'], entities: ['Hotel', 'Lodge']},
    { 
      href: "/restaurant", 
      icon: Utensils, 
      label: "Restaurant & F&B", 
      roles: ['Admin', 'Restaurant Manager', 'Chef', 'Waiter'], 
      entities: ['Restaurant'],
      subItems: [
           { href: "/restaurant/orders", icon: CookingPot, label: "Kitchen Display", roles: ['Admin', 'Restaurant Manager', 'Chef', 'Waiter'], entities: ['Restaurant']},
      ]
    },
    { href: "/guests", icon: Users, label: "Front Office", roles: ['Admin', 'Front Office Staff', 'Receptionist'], entities: ['Hotel', 'Lodge']},
    { href: "/housekeeping", icon: BedDouble, label: "Housekeeping", roles: ['Admin', 'Housekeeping'], entities: ['Hotel', 'Lodge']},
    { href: "/inventory", icon: Warehouse, label: "Procurement", roles: ['Admin', 'Inventory Manager', 'Restaurant Manager'], entities: ['Hotel', 'Lodge', 'Restaurant'] },
    { 
        href: "/staff", 
        icon: UsersRound, 
        label: "HR Management", 
        roles: ['Admin', 'HR Manager'], 
        entities: ['Hotel', 'Lodge', 'Restaurant'],
        subItems: [
             { href: "/staff/schedule", icon: CalendarDays, label: "Shift Scheduler", roles: ['Admin', 'HR Manager'], entities: ['Hotel', 'Lodge', 'Restaurant']},
             { href: "/staff/attendance", icon: Timer, label: "Attendance Log", roles: ['Admin', 'HR Manager'], entities: ['Hotel', 'Lodge', 'Restaurant']}
        ]
    },
    { href: "/billing", icon: CreditCard, label: "Finance", roles: ['Admin', 'Finance Manager', 'Finance'], entities: ['Hotel', 'Lodge']},
    { href: "/revenue", icon: TrendingUp, label: "Revenue", roles: ['Admin', 'Finance Manager'], entities: ['Hotel', 'Lodge']},
    { href: "/guest-portal", icon: HeartPulse, label: "Guest Loyalty", roles: ['Admin'], entities: ['Hotel', 'Lodge'] },
    { href: "/security", icon: Shield, label: "Security", roles: ['Admin', 'Security Staff'], entities: ['Hotel', 'Lodge']},
    { href: "/reporting", icon: LineChart, label: "Analytics", roles: ['Admin', 'Finance Manager', 'Restaurant Manager'], entities: ['Hotel', 'Lodge', 'Restaurant']},
    { href: "/integrations", icon: Plug, label: "Integrations", roles: ['Admin'], entities: ['Hotel', 'Lodge', 'Restaurant'] },
];


export function AppSidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [organisationType, setOrganisationType] = useState<OrganisationType>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") as Role);
    setOrganisationType(localStorage.getItem("organisationType") as OrganisationType);
    setIsClient(true);
  }, []);

  const hasAccess = (link: NavLink) => {
    // Basic requirement: user must have a role and be in an organization
    if (!userRole || !organisationType) {
      return false;
    }

    // Check if the link is applicable to the user's organization type
    if (!link.entities.includes(organisationType)) {
      return false;
    }

    // Admin role has universal access to their organization's applicable links
    if (userRole === 'Admin') {
      return true;
    }

    // For non-admin roles, check if their role is explicitly listed in the link's roles
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
            // Special case for restaurant dashboard: only show to restaurant orgs
            if (organisationType !== 'Restaurant' && link.href === '/restaurant') {
              return null;
            }
            // Special case for hotel/lodge dashboard: hide from restaurant orgs
            if (organisationType === 'Restaurant' && link.href === '/') {
              return null;
            }

            if (hasAccess(link)) {
                const isSubActive = link.subItems?.some(sub => pathname.startsWith(sub.href)) ?? false;
                const isActive = (link.href !== '/' && pathname.startsWith(link.href)) || pathname === link.href;
                
                return (
                    <SidebarMenuItem key={link.href}>
                        <SidebarMenuButton 
                          asChild={!link.subItems}
                          tooltip={link.label} 
                          isActive={isActive || isSubActive}
                          >
                          <Link href={link.href}>
                              <link.icon />
                              <span>{link.label}</span>
                          </Link>
                        </SidebarMenuButton>
                        {link.subItems && (
                          <SidebarMenuSub>
                              {link.subItems.map(subLink => {
                                  if(hasAccess(subLink)) {
                                      return (
                                          <SidebarMenuSubItem key={subLink.href}>
                                              <SidebarMenuSubButton asChild isActive={pathname.startsWith(subLink.href)}>
                                                  <Link href={subLink.href}>{subLink.label}</Link>
                                              </SidebarMenuSubButton>
                                          </SidebarMenuSubItem>
                                      );
                                  }
                                  return null;
                              })}
                          </SidebarMenuSub>
                        )}
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
