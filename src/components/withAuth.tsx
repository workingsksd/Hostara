
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

type Role = 'Admin' | 'Front Office Staff' | 'Housekeeping' | 'Maintenance Team' | 'Inventory Manager' | 'HR Manager' | 'Finance Manager' | 'Security Staff' | 'Guest' | 'Receptionist' | 'Finance' | null;

// Define page permissions based on roles
const pagePermissions: { [key: string]: Role[] } = {
    '/': ['Admin'], // Only admin can see the main dashboard
    '/guests': ['Admin', 'Front Office Staff', 'Receptionist'],
    '/guests/kyc': ['Admin', 'Front Office Staff', 'Receptionist'],
    '/housekeeping': ['Admin', 'Housekeeping'],
    '/inventory': ['Admin', 'Inventory Manager'],
    '/staff': ['Admin', 'HR Manager', 'Maintenance Team'],
    '/staff/schedule': ['Admin', 'HR Manager'],
    '/staff/attendance': ['Admin', 'HR Manager'],
    '/billing': ['Admin', 'Finance Manager', 'Finance'],
    '/revenue': ['Admin', 'Finance Manager'],
    '/reporting': ['Admin', 'Finance Manager', 'Finance'],
    '/integrations': ['Admin'],
    '/security': ['Admin', 'Security Staff'],
    '/guest-portal': ['Admin'],
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
    // Lodge specific
    'Receptionist': '/guests',
    'Finance': '/billing',
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
      const defaultRoute = userRole ? defaultRoutes[userRole] : '/';

      if (isAuthPage) {
        router.replace(defaultRoute);
        return;
      }
      
      const organisationType = localStorage.getItem('organisationType');
      if (organisationType === 'Lodge' && userRole !== 'Admin' && pathname === '/') {
          router.replace(defaultRoute);
          return;
      }

      // Find the base path for permission checking
      const pageKey = Object.keys(pagePermissions).find(key => pathname.startsWith(key) && key !== '/');
      const basePath = pageKey || '/';
      
      const allowedRoles = pagePermissions[basePath];

      if (!userRole || !(allowedRoles?.includes(userRole) || userRole === 'Admin')) {
          console.warn(`Redirecting: Role '${userRole}' does not have access to '${pathname}'.`);
          router.replace(defaultRoute);
      }

    }, [router, pathname, user, loading]);

    // Determine what to render
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-lg font-semibold">Loading...</div>
        </div>
      );
    }

    if (!user && !isAuthPage) {
        // Being redirected to login, show loading to prevent flashing content
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
              <div className="text-lg font-semibold">Loading...</div>
            </div>
        );
    }
    
    if (user && isAuthPage) {
        // Being redirected to dashboard, show loading
         return (
            <div className="flex items-center justify-center min-h-screen bg-background">
              <div className="text-lg font-semibold">Loading...</div>
            </div>
        );
    }

    // If all checks pass, render the component
    return <WrappedComponent {...props} />;
  };

  AuthComponent.displayName = `withAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;

  return AuthComponent;
};

export default withAuth;
