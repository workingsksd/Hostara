
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
  CookingPot,
  ClipboardList
} from "lucide-react"
import { usePathname } from "next/navigation";
import { AppSidebar as AppSidebarWrapper } from './sidebar-wrapper';
import { useUser } from "@/firebase";
import type { UserProfile } from "@/context/BookingContext";

type Role = UserProfile['role'];
type OrganisationType = UserProfile['organisationType'];

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
      label: "Restaurant POS", 
      roles: ['Admin', 'Restaurant Manager', 'Chef', 'Waiter'], 
      entities: ['Restaurant'],
    },
    { href: "/restaurant/orders", icon: CookingPot, label: "Kitchen Display", roles: ['Admin', 'Restaurant Manager', 'Chef', 'Waiter'], entities: ['Restaurant']},
    { href: "/restaurant/menu", icon: ClipboardList, label: "Menu Management", roles: ['Admin', 'Restaurant Manager'], entities: ['Restaurant']},
    { href: "/guests", icon: Users, label: "Front Office", roles: ['Admin', 'Front Office Staff', 'Receptionist'], entities: ['Hotel', 'Lodge']},
    { href: "/guests/kyc", icon: Shield, label: "KYC Scanner", roles: ['Admin', 'Front Office Staff', 'Receptionist'], entities: ['Hotel', 'Lodge']},
    { href: "/housekeeping", icon: BedDouble, label: "Housekeeping", roles: ['Admin', 'Housekeeping'], entities: ['Hotel', 'Lodge']},
    { href: "/inventory", icon: Warehouse, label: "Procurement", roles: ['Admin', 'Inventory Manager', 'Restaurant Manager'], entities: ['Hotel', 'Lodge', 'Restaurant'] },
    { 
        href: "/staff", 
        icon: UsersRound, 
        label: "HR Management", 
        roles: ['Admin', 'HR Manager'], 
        entities: ['Hotel', 'Lodge', 'Restaurant']
    },
    { href: "/billing", icon: CreditCard, label: "Finance", roles: ['Admin', 'Finance Manager', 'Finance'], entities: ['Hotel', 'Lodge']},
    { href: "/revenue", icon: TrendingUp, label: "Revenue", roles: ['Admin', 'Finance Manager'], entities: ['Hotel', 'Lodge']},
    { href: "/guest-portal", icon: HeartPulse, label: "Guest Loyalty", roles: ['Admin'], entities: ['Hotel', 'Lodge'] },
    { href: "/security", icon: Shield, label: "Security", roles: ['Admin', 'Security Staff'], entities: ['Hotel', 'Lodge']},
    { href: "/reporting", icon: LineChart, label: "Analytics", roles: ['Admin', 'Finance Manager', 'Restaurant Manager'], entities: ['Hotel', 'Lodge', 'Restaurant']},
    { href: "/integrations", icon: Plug, label: "Integrations", roles: ['Admin', 'Restaurant Manager'], entities: ['Hotel', 'Lodge', 'Restaurant'] },
];


export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const userRole = user?.profile.role;
  const organisationType = user?.profile.organisationType;

  const hasAccess = (link: NavLink) => {
    if (!userRole || !organisationType) {
      return false; // Don't show anything if user profile is not loaded
    }

    // 1. Check if the link's allowed entities includes the user's organization type
    if (!link.entities.includes(organisationType)) {
      return false;
    }
    
    // 2. Admin role has access to all links within their entity type
    if (userRole === 'Admin') {
      return true;
    }

    // 3. For non-admins, check if their role is in the link's allowed roles list
    if (link.roles.includes(userRole)) {
      return true;
    }

    // 4. Deny access by default
    return false;
  };

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
          {user && navLinks.map(link => {
            if (!hasAccess(link)) {
              return null;
            }

            const isSubActive = link.subItems?.some(sub => pathname.startsWith(sub.href)) ?? false;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href) && !isSubActive);
            
            // Special case for root, so it's not always active for parent routes
            const finalIsActive = link.href === '/' ? pathname === '/' : isActive;

            return (
                <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton 
                      asChild={!link.subItems}
                      tooltip={link.label} 
                      isActive={finalIsActive || isSubActive}
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
          })}
        </SidebarMenu>
      </SidebarContent>
    </AppSidebarWrapper>
  )
}

    