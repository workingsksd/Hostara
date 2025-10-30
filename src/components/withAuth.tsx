
"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

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
    const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

    useEffect(() => {
      const authenticated = localStorage.getItem('authenticated') === 'true';
      const userRole = localStorage.getItem('userRole') as string | null;
      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

      if (isAuthPage) {
        if (authenticated) {
          router.replace('/');
          setAuthStatus('authenticated');
        } else {
          setAuthStatus('unauthenticated');
        }
      } else {
        if (!authenticated) {
          router.replace('/login');
          setAuthStatus('unauthenticated');
        } else {
          // Check role-based permissions
          const allowedRoles = pagePermissions[pathname] || ['manager']; // Default to manager only for unknown routes
          if (userRole && allowedRoles.includes(userRole)) {
            setAuthStatus('authenticated');
          } else {
            // If user does not have permission, redirect to dashboard
            console.warn(`Redirecting: Role '${userRole}' does not have access to '${pathname}'.`);
            router.replace('/');
            // Keep loading status to prevent rendering while redirecting
          }
        }
      }
    }, [router, pathname]);

    if (authStatus === 'loading') {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <p>Loading...</p>
        </div>
      );
    }
    
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
    if (isAuthPage && authStatus === 'unauthenticated') {
        return <WrappedComponent {...props} />;
    }

    if (!isAuthPage && authStatus === 'authenticated') {
        return <WrappedComponent {...props} />;
    }

    return null; // Render nothing during redirects
  };

  AuthComponent.displayName = `withAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;

  return AuthComponent;
};

export default withAuth;
