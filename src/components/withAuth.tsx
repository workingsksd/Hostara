
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, type AppUser } from '@/firebase';

type Role = AppUser['profile']['role'];

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

const defaultRoutes: { [key in Exclude<Role, null | undefined>]: string } = {
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
      const userRole = user.profile.role;
      const organisationType = user.profile.organisationType;

      const defaultRoute = userRole ? defaultRoutes[userRole] : '/';

      if (isAuthPage) {
        // If logged-in user is on an auth page, redirect them away
        router.replace(defaultRoute);
        return;
      }
      
      // Special redirect for non-admin restaurant roles from the main dashboard
      if (organisationType === 'Restaurant' && pathname === '/' && userRole !== 'Admin') {
          router.replace('/restaurant');
          return;
      }

      // Find the base path for permission checking
      // This allows /staff/schedule to match the /staff permission key
      const basePath = Object.keys(pagePermissions).find(key => key !== '/' && pathname.startsWith(key)) || pathname;
      
      const allowedRoles = pagePermissions[basePath];

      // If there's no specific rule for the page, deny access by default unless admin.
      // Admin can access everything within their org type (handled by sidebar logic).
      if (!allowedRoles && userRole !== 'Admin') {
          console.warn(`No specific permissions set for '${pathname}'. Redirecting to default.`);
          router.replace(defaultRoute);
          return;
      }

      if (allowedRoles && !allowedRoles.includes(userRole) && userRole !== 'Admin') {
          console.warn(`Redirecting: Role '${userRole}' does not have access to '${pathname}'. Redirecting to '${defaultRoute}'`);
          router.replace(defaultRoute);
      }

    }, [router, pathname, user, loading]);


    if (loading || !user && !(pathname.startsWith('/login') || pathname.startsWith('/register'))) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-lg font-semibold">Loading...</div>
            </div>
        );
    }
    
    // Render the component if all checks pass
    return <WrappedComponent {...props} />;
  };

  AuthComponent.displayName = `withAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;

  return AuthComponent;
};

export default withAuth;
