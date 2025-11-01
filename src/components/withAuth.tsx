
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

type Role = 'Admin' | 'Front Office Staff' | 'Housekeeping' | 'Maintenance Team' | 'Restaurant Staff' | 'Chef/Kitchen' | 'Inventory Manager' | 'HR Manager' | 'Finance Manager' | 'Security Staff' | 'Guest' | 'Receptionist' | 'Finance' | 'Chef' | 'Staff' | null;

// Define page permissions based on roles
const pagePermissions: { [key: string]: Role[] } = {
    '/': ['Admin'], // Only admin can see the main dashboard
    '/guests': ['Admin', 'Front Office Staff', 'Receptionist'],
    '/guests/kyc': ['Admin', 'Front Office Staff', 'Receptionist'],
    '/housekeeping': ['Admin', 'Housekeeping'],
    '/restaurant': ['Admin', 'Restaurant Staff', 'Chef/Kitchen', 'Chef', 'Staff'],
    '/restaurant/orders': ['Admin', 'Restaurant Staff', 'Chef/Kitchen', 'Chef', 'Staff'],
    '/inventory': ['Admin', 'Inventory Manager'],
    '/staff': ['Admin', 'HR Manager', 'Maintenance Team'],
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
    'Restaurant Staff': '/restaurant',
    'Chef/Kitchen': '/restaurant/orders',
    'Inventory Manager': '/inventory',
    'HR Manager': '/staff',
    'Finance Manager': '/billing',
    'Security Staff': '/security',
    'Guest': '/guest-portal',
    // Lodge specific
    'Receptionist': '/guests',
    'Finance': '/billing',
    // Restaurant specific
    'Chef': '/restaurant/orders',
    'Staff': '/restaurant',
};

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const AuthComponent = (props: P) => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading } = useUser();
    const [isRenderAllowed, setIsRenderAllowed] = useState(false);

    useEffect(() => {
      if (loading) {
        return; // Wait until user status is resolved
      }

      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
      
      if (!user && !isAuthPage) {
        // Not logged in and not on an auth page, redirect to login
        router.replace('/login');
        return;
      }

      if (user) {
         if (isAuthPage) {
            // Logged in user on an auth page, redirect to their default route
            const userRole = localStorage.getItem('userRole') as Role;
            const defaultRoute = userRole ? defaultRoutes[userRole] : '/';
            router.replace(defaultRoute);
            return;
         }

        // Logged-in user on a protected page, check permissions
        const userRole = localStorage.getItem('userRole') as Role;
        const organisationType = localStorage.getItem('organisationType');
        
        // Specific rule for Lodge non-admins on dashboard
        if (organisationType === 'Lodge' && userRole !== 'Admin' && pathname === '/') {
            const defaultRoute = userRole ? defaultRoutes[userRole] : '/';
            router.replace(defaultRoute);
            return;
        }

        const allowedRoles = pagePermissions[pathname] || ['Admin'];
        if (userRole && allowedRoles.includes(userRole)) {
            setIsRenderAllowed(true);
        } else {
            console.warn(`Redirecting: Role '${userRole}' does not have access to '${pathname}'.`);
            const defaultRoute = userRole ? defaultRoutes[userRole] : '/login';
            router.replace(defaultRoute);
            return;
        }
      } else {
        // Not logged in, but on an auth page, so allow render
        setIsRenderAllowed(true);
      }

    }, [router, pathname, user, loading]);

    if (loading || !isRenderAllowed) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <p>Loading...</p>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };

  AuthComponent.displayName = `withAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;

  return AuthComponent;
};

export default withAuth;
