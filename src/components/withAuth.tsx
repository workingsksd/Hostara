
"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

// Define page permissions based on roles
const pagePermissions: { [key: string]: string[] } = {
    '/': ['manager', 'staff', 'chef', 'guest'], // Everyone can see the dashboard
    '/guests': ['manager', 'staff'],
    '/guests/kyc': ['manager', 'staff'],
    '/housekeeping': ['manager', 'staff'],
    '/restaurant': ['manager', 'chef', 'staff'],
    '/restaurant/orders': ['manager', 'chef', 'staff'],
    '/inventory': ['manager', 'chef'],
    '/staff': ['manager'],
    '/billing': ['manager'],
    '/reporting': ['manager'],
    '/integrations': ['manager'],
    '/security': ['manager', 'staff'],
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

      if (isAuthPage) {
        if (user) {
          router.replace('/');
        }
      } else {
        if (!user) {
          router.replace('/login');
        } else {
          const userRole = localStorage.getItem('userRole') as string | null;
          // Check role-based permissions
          const allowedRoles = pagePermissions[pathname] || ['manager']; // Default to manager only for unknown routes
          if (!userRole || !allowedRoles.includes(userRole)) {
            // If user does not have permission, redirect to dashboard
            console.warn(`Redirecting: Role '${userRole}' does not have access to '${pathname}'.`);
            router.replace('/');
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
        const userRole = localStorage.getItem('userRole');
        const allowedRoles = pagePermissions[pathname] || ['manager'];
        if (userRole && allowedRoles.includes(userRole)) {
          return <WrappedComponent {...props} />;
        }
    }

    return null; // Render nothing during loading or redirects
  };

  AuthComponent.displayName = `withAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;

  return AuthComponent;
};

export default withAuth;
