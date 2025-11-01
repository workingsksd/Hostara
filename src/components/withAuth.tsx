
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
        setIsRenderAllowed(false);
        return; 
      }

      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
      
      if (!user) {
        // Not logged in
        if (isAuthPage) {
            setIsRenderAllowed(true);
        } else {
            router.replace('/login');
        }
        return;
      }

      // User is logged in
      const userRole = localStorage.getItem('userRole') as Role;
      const defaultRoute = userRole ? defaultRoutes[userRole] : '/';

      if (isAuthPage) {
        // Logged in user on an auth page, redirect to their default route
        router.replace(defaultRoute);
        return;
      }
      
      const organisationType = localStorage.getItem('organisationType');
      if (organisationType === 'Lodge' && userRole !== 'Admin' && pathname === '/') {
          router.replace(defaultRoute);
          return;
      }

      const allowedRoles = Object.keys(pagePermissions).find(key => pathname.startsWith(key)) 
          ? pagePermissions[Object.keys(pagePermissions).find(key => pathname.startsWith(key))!] 
          : ['Admin'];


      if (userRole && (allowedRoles.includes(userRole) || userRole === 'Admin')) {
          setIsRenderAllowed(true);
      } else {
          console.warn(`Redirecting: Role '${userRole}' does not have access to '${pathname}'.`);
          router.replace(defaultRoute);
      }

    }, [router, pathname, user, loading]);

    if (loading || !isRenderAllowed) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-lg font-semibold">Loading...</div>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };

  AuthComponent.displayName = `withAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;

  return AuthComponent;
};

export default withAuth;
