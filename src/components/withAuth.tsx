
"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

type Role = 'Admin' | 'Front Office Staff' | 'Housekeeping' | 'Maintenance Team' | 'Restaurant Staff' | 'Chef/Kitchen' | 'Inventory Manager' | 'HR Manager' | 'Finance Manager' | 'Security Staff' | 'Guest' | 'Receptionist' | 'Finance' | 'Chef' | 'Staff' | null;

// Define page permissions based on roles
const pagePermissions: { [key: string]: Role[] } = {
    '/': ['Admin'], // Only admin can see the main dashboard
    '/guests': ['Admin', 'Front Office Staff', 'Receptionist'],
    '/guests/kyc': ['Admin', 'Front Office Staff', 'Receptionist'],
    '/housekeeping': ['Admin', 'Housekeeping', 'Maintenance Team'],
    '/restaurant': ['Admin', 'Restaurant Staff', 'Chef/Kitchen', 'Chef', 'Staff'],
    '/restaurant/orders': ['Admin', 'Chef/Kitchen', 'Chef'],
    '/inventory': ['Admin', 'Inventory Manager'],
    '/staff': ['Admin', 'HR Manager'],
    '/billing': ['Admin', 'Finance Manager', 'Finance'],
    '/revenue': ['Admin', 'Finance Manager'],
    '/reporting': ['Admin', 'Finance Manager', 'Finance'],
    '/integrations': ['Admin'],
    '/security': ['Admin', 'Security Staff'],
    '/guest-portal': ['Guest'],
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

    useEffect(() => {
      if (loading) {
        return; // Wait until user status is resolved
      }

      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
      const userRole = localStorage.getItem('userRole') as Role;
      const organisationType = localStorage.getItem('organisationType');

      if (isAuthPage) {
        if (user) {
          const defaultRoute = userRole ? defaultRoutes[userRole] : '/';
          router.replace(defaultRoute || '/');
        }
      } else {
        if (!user) {
          router.replace('/login');
          return;
        } 
        
        if (organisationType === 'Lodge' && userRole && userRole !== 'Admin' && pathname === '/') {
            const defaultRoute = defaultRoutes[userRole] || '/';
            router.replace(defaultRoute);
            return;
        }

        const allowedRoles = pagePermissions[pathname] || ['Admin']; // Default to Admin only
        if (!userRole || !allowedRoles.includes(userRole)) {
            console.warn(`Redirecting: Role '${userRole}' does not have access to '${pathname}'.`);
            const defaultRoute = userRole ? defaultRoutes[userRole] : '/login';
            // Safety check for defaultRoute
            if (defaultRoute) {
                router.replace(defaultRoute);
            } else {
                router.replace('/login');
            }
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
        const allowedRoles = pagePermissions[pathname] || ['Admin'];
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
