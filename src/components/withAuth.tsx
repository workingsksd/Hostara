
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

type Role = 'Admin' | 'Front Office Staff' | 'Housekeeping' | 'Maintenance Team' | 'Inventory Manager' | 'HR Manager' | 'Finance Manager' | 'Security Staff' | 'Guest' | 'Receptionist' | 'Finance' | 'Waiter' | 'Chef' | 'Restaurant Manager' | null;

// Define page permissions based on roles
const pagePermissions: { [key: string]: Role[] } = {
    '/': ['Admin'],
    '/guests': ['Admin', 'Front Office Staff', 'Receptionist'],
    '/guests/kyc': ['Admin', 'Front Office Staff', 'Receptionist'],
    '/housekeeping': ['Admin', 'Housekeeping'],
    '/inventory': ['Admin', 'Inventory Manager', 'Restaurant Manager'],
    '/staff': ['Admin', 'HR Manager'],
    '/staff/schedule': ['Admin', 'HR Manager'],
    '/staff/attendance': ['Admin', 'HR Manager'],
    '/billing': ['Admin', 'Finance Manager', 'Finance'],
    '/revenue': ['Admin', 'Finance Manager'],
    '/reporting': ['Admin', 'Finance Manager', 'Restaurant Manager'],
    '/integrations': ['Admin', 'Restaurant Manager'],
    '/security': ['Admin', 'Security Staff'],
    '/guest-portal': ['Admin'],
    '/restaurant': ['Admin', 'Restaurant Manager', 'Chef', 'Waiter'],
    '/restaurant/orders': ['Admin', 'Restaurant Manager', 'Chef', 'Waiter'],
};

const defaultRoutes: { [key in Exclude<Role, null>]: string } = {
    'Admin': '/',
    'Front Office Staff': '/guests',
    'Housekeeping': '/housekeeping',
    'Maintenance Team': '/staff',
    'Inventory Manager': '/inventory',
    'HR Manager': '/staff',
    'Finance Manager': '/billing',
    'Security Staff': '/security',
    'Guest': '/guest-portal',
    'Receptionist': '/guests',
    'Finance': '/billing',
    // Restaurant roles
    'Restaurant Manager': '/restaurant',
    'Chef': '/restaurant/orders',
    'Waiter': '/restaurant',
};

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const AuthComponent = (props: P) => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading } = useUser();
    
    useEffect(() => {
      if (loading) {
        return; // Wait until user status is resolved
      }

      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

      if (!user) {
        if (!isAuthPage) {
          router.replace('/login');
        }
        return;
      }

      // User is logged in
      const userRole = localStorage.getItem('userRole') as Role;
      const organisationType = localStorage.getItem('organisationType');
      const defaultRoute = userRole ? defaultRoutes[userRole] : '/';

      if (isAuthPage) {
        router.replace(defaultRoute);
        return;
      }
      
      // Special redirect for non-admin restaurant roles from the main dashboard
      if (organisationType === 'Restaurant' && pathname === '/' && userRole !== 'Admin') {
          router.replace(defaultRoute);
          return;
      }

      // Find the base path for permission checking
      // This allows /staff/schedule to match the /staff permission key
      const basePath = Object.keys(pagePermissions).find(key => key !== '/' && pathname.startsWith(key)) || '/';
      
      const allowedRoles = pagePermissions[basePath];

      if (!userRole || !(allowedRoles?.includes(userRole) || userRole === 'Admin')) {
          console.warn(`Redirecting: Role '${userRole}' does not have access to '${pathname}'. Redirecting to '${defaultRoute}'`);
          router.replace(defaultRoute);
      }

    }, [router, pathname, user, loading]);

    // Show a loading screen while authentication is in progress.
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-lg font-semibold">Loading...</div>
            </div>
        );
    }
    
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

    // If user is not logged in and not on an auth page, we are redirecting, so show loading.
    if (!user && !isAuthPage) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-lg font-semibold">Loading...</div>
            </div>
        );
    }

    // If user is logged in and on an auth page, we are redirecting, so show loading.
    if (user && isAuthPage) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-lg font-semibold">Loading...</div>
            </div>
        );
    }
    
    // If all checks pass, render the requested component.
    return <WrappedComponent {...props} />;
  };

  AuthComponent.displayName = `withAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;

  return AuthComponent;
};

export default withAuth;
