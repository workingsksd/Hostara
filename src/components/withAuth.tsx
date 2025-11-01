
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, type AppUser } from '@/firebase';

type Role = AppUser['profile']['role'];
type OrganisationType = AppUser['profile']['organisationType'];

// Define page permissions based on roles and entities
const pagePermissions: { [key: string]: { roles: Role[], entities: OrganisationType[] } } = {
    '/': { roles: ['Admin'], entities: ['Hotel', 'Lodge'] },
    '/restaurant': { roles: ['Admin', 'Restaurant Manager', 'Chef', 'Waiter'], entities: ['Restaurant'] },
    '/restaurant/orders': { roles: ['Admin', 'Restaurant Manager', 'Chef', 'Waiter'], entities: ['Restaurant'] },
    '/guests': { roles: ['Admin', 'Front Office Staff', 'Receptionist'], entities: ['Hotel', 'Lodge'] },
    '/guests/kyc': { roles: ['Admin', 'Front Office Staff', 'Receptionist'], entities: ['Hotel', 'Lodge'] },
    '/housekeeping': { roles: ['Admin', 'Housekeeping'], entities: ['Hotel', 'Lodge'] },
    '/inventory': { roles: ['Admin', 'Inventory Manager', 'Restaurant Manager'], entities: ['Hotel', 'Lodge', 'Restaurant'] },
    '/staff': { roles: ['Admin', 'HR Manager'], entities: ['Hotel', 'Lodge', 'Restaurant'] },
    '/staff/schedule': { roles: ['Admin', 'HR Manager'], entities: ['Hotel', 'Lodge', 'Restaurant'] },
    '/staff/attendance': { roles: ['Admin', 'HR Manager'], entities: ['Hotel', 'Lodge', 'Restaurant'] },
    '/billing': { roles: ['Admin', 'Finance Manager', 'Finance'], entities: ['Hotel', 'Lodge'] },
    '/revenue': { roles: ['Admin', 'Finance Manager'], entities: ['Hotel', 'Lodge'] },
    '/guest-portal': { roles: ['Admin'], entities: ['Hotel', 'Lodge'] },
    '/security': { roles: ['Admin', 'Security Staff'], entities: ['Hotel', 'Lodge'] },
    '/reporting': { roles: ['Admin', 'Finance Manager', 'Restaurant Manager'], entities: ['Hotel', 'Lodge', 'Restaurant'] },
    '/integrations': { roles: ['Admin', 'Restaurant Manager'], entities: ['Hotel', 'Lodge', 'Restaurant'] },
};


const defaultRoutes: { [key in Exclude<Role, null | undefined>]: string } = {
    'Admin': '/', // Default for Admin, will be overridden by org type below
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

      let defaultRoute = userRole ? defaultRoutes[userRole] : '/';
      if (userRole === 'Admin') {
          defaultRoute = organisationType === 'Restaurant' ? '/restaurant' : '/';
      }

      if (isAuthPage) {
        // If logged-in user is on an auth page, redirect them away
        router.replace(defaultRoute);
        return;
      }
      
      const basePath = Object.keys(pagePermissions).find(key => key !== '/' && pathname.startsWith(key)) || pathname;
      
      const permissions = pagePermissions[basePath];

      if (!permissions) {
          console.warn(`No specific permissions set for '${pathname}'. Redirecting to default.`);
          router.replace(defaultRoute);
          return;
      }

      const hasEntityAccess = permissions.entities.includes(organisationType);
      const hasRoleAccess = userRole === 'Admin' || permissions.roles.includes(userRole);

      if (!hasEntityAccess || !hasRoleAccess) {
          console.warn(`Redirecting: Role '${userRole}' in Org '${organisationType}' does not have access to '${pathname}'. Redirecting to '${defaultRoute}'`);
          router.replace(defaultRoute);
      }

    }, [router, pathname, user, loading]);


    if (loading || (!user && !(pathname.startsWith('/login') || pathname.startsWith('/register')))) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-lg font-semibold">Loading...</div>
            </div>
        );
    }
    
    // If the user's profile is loaded and they are on an auth page, don't render the component
    if (user && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
        return (
             <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-lg font-semibold">Redirecting...</div>
            </div>
        );
    }

    return <WrappedComponent {...props} />;
  };

  AuthComponent.displayName = `withAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;

  return AuthComponent;
};

export default withAuth;
