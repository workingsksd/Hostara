
"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

type Role = 'manager' | 'staff' | 'chef' | 'guest' | 'finance' | 'housekeeping' | 'receptionist' | null;

// Define page permissions based on roles
const pagePermissions: { [key: string]: Role[] } = {
    '/': ['manager'], // Only manager can see the main dashboard
    '/guests': ['manager', 'receptionist', 'staff'],
    '/guests/kyc': ['manager', 'receptionist', 'staff'],
    '/housekeeping': ['manager', 'housekeeping', 'staff'],
    '/restaurant': ['manager', 'chef', 'staff'],
    '/restaurant/orders': ['manager', 'chef', 'staff'],
    '/inventory': ['manager', 'chef'],
    '/staff': ['manager'],
    '/billing': ['manager', 'finance'],
    '/reporting': ['manager', 'finance'],
    '/integrations': ['manager'],
    '/security': ['manager', 'receptionist', 'staff'],
    '/guest-portal': ['guest'],
};

const defaultRoutes: { [key in Exclude<Role, null>]: string } = {
    manager: '/',
    staff: '/housekeeping', // Default for general staff
    receptionist: '/guests',
    housekeeping: '/housekeeping',
    finance: '/billing',
    chef: '/restaurant/orders',
    guest: '/guest-portal',
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
      const userRole = localStorage.getItem('userRole') as Role;
      const entityType = localStorage.getItem('entityType');

      if (isAuthPage) {
        if (user) {
          router.replace('/');
        }
      } else {
        if (!user) {
          router.replace('/login');
          return;
        } 
        
        if (entityType === 'Lodge' && userRole && userRole !== 'manager' && pathname === '/') {
            const defaultRoute = defaultRoutes[userRole] || '/';
            router.replace(defaultRoute);
            return;
        }

        const allowedRoles = pagePermissions[pathname] || ['manager']; // Default to manager only
        if (!userRole || !allowedRoles.includes(userRole)) {
            console.warn(`Redirecting: Role '${userRole}' does not have access to '${pathname}'.`);
            const defaultRoute = userRole ? defaultRoutes[userRole] : '/login';
            router.replace(defaultRoute);
        }
      }
    }, [router, pathname, user, loading]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <p>Loading...</p>
        </div>
      );
    }
    
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
    if (isAuthPage && !user) {
        return <WrappedComponent {...props} />;
    }

    if (!isAuthPage && user) {
        const userRole = localStorage.getItem('userRole') as Role;
        const allowedRoles = pagePermissions[pathname] || ['manager'];
        if (userRole && allowedRoles.includes(userRole)) {
          return <WrappedComponent {...props} />;
        }
    }

    // Render nothing while redirecting or if access is not yet confirmed.
    return null;
  };

  AuthComponent.displayName = `withAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;

  return AuthComponent;
};

export default withAuth;
