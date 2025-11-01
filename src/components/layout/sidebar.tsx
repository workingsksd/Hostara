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
  UtensilsCrossed,
  Warehouse,
  UsersRound,
  CreditCard,
  Building2,
  LineChart,
  Plug,
  Shield,
  HeartPulse,
  TrendingUp,
  CalendarClock,
  Timer,
} from "lucide-react"
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AppSidebar as AppSidebarWrapper } from './sidebar-wrapper';

type Role = 'Admin' | 'Front Office Staff' | 'Housekeeping' | 'Maintenance Team' | 'Restaurant Staff' | 'Chef/Kitchen' | 'Inventory Manager' | 'HR Manager' | 'Finance Manager' | 'Security Staff' | 'Guest' | 'Receptionist' | 'Finance' | 'Chef' | 'Staff';
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
    { href: "/", icon: LayoutDashboard, label: "Dashboard", roles: ['Admin'], entities: ['Hotel', 'Lodge', 'Restaurant']},
    { href: "/guests", icon: Users, label: "Front Office", roles: ['Admin', 'Front Office Staff', 'Receptionist'], entities: ['Hotel', 'Lodge']},
    { href: "/housekeeping", icon: BedDouble, label: "Housekeeping", roles: ['Admin', 'Housekeeping'], entities: ['Hotel', 'Lodge']},
    { 
        href: "/restaurant", 
        icon: UtensilsCrossed, 
        label: "Restaurant & F&B", 
        roles: ['Admin', 'Restaurant Staff', 'Chef/Kitchen', 'Chef', 'Staff'], 
        entities: ['Hotel', 'Restaurant'],
        subItems: [
            { href: "/restaurant/orders", icon: UtensilsCrossed, label: "Kitchen Display", roles: ['Admin', 'Chef/Kitchen', 'Chef'], entities: ['Hotel', 'Restaurant'] }
        ]
    },
    { href: "/inventory", icon: Warehouse, label: "Procurement", roles: ['Admin', 'Inventory Manager'], entities: ['Hotel', 'Lodge', 'Restaurant'] },
    { 
        href: "/staff", 
        icon: UsersRound, 
        label: "HR Management", 
        roles: ['Admin', 'HR Manager', 'Maintenance Team'], 
        entities: ['Hotel', 'Lodge', 'Restaurant']
    },
    { href: "/billing", icon: CreditCard, label: "Finance", roles: ['Admin', 'Finance Manager', 'Finance'], entities: ['Hotel', 'Lodge', 'Restaurant']},
    { href: "/revenue", icon: TrendingUp, label: "Revenue", roles: ['Admin', 'Finance Manager'], entities: ['Hotel', 'Lodge']},
    { href: "/guest-portal", icon: HeartPulse, label: "Guest Loyalty", roles: ['Admin'], entities: ['Hotel', 'Lodge', 'Restaurant'] },
    { href: "/security", icon: Shield, label: "Security", roles: ['Admin', 'Security Staff'], entities: ['Hotel', 'Lodge']},
    { href: "/reporting", icon: LineChart, label: "Analytics", roles: ['Admin', 'Finance Manager'], entities: ['Hotel', 'Lodge', 'Restaurant']},
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
    if (!userRole || !organisationType || !link.entities.includes(organisationType)) {
      return false;
    }
    if (organisationType === 'Lodge' && userRole !== 'Admin' && link.href === '/') {
        return false;
    }
    if (userRole === 'Admin') return true;
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
                const isSubActive = link.subItems?.some(sub => pathname.startsWith(sub.href)) ?? false;
                const isActive = (link.href !== '/' && pathname.startsWith(link.href)) || pathname === link.href;
                return (
                    <SidebarMenuItem key={link.href}>
                        <SidebarMenuButton 
                          asChild={!link.subItems}
                          tooltip={link.label} 
                          isActive={isActive}
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
