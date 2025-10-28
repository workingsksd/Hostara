
"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const AuthComponent = (props: P) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
      // This is a mock authentication check. In a real app, you'd verify a token.
      const authenticated = localStorage.getItem('authenticated') === 'true';
      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

      if (isAuthPage) {
        if (authenticated) {
          // If user is on login/register but already logged in, redirect to home
          router.replace('/');
        } else {
          // Allow access to login/register if not authenticated
          setIsAuthenticated(false);
        }
      } else {
        if (!authenticated) {
          // If user is not on an auth page and not logged in, redirect to login
          router.replace('/login');
        } else {
          // Allow access to protected page if authenticated
          setIsAuthenticated(true);
        }
      }
    }, [router, pathname]);

    // Render a loading state while checking auth
    if (isAuthenticated === null) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <p>Loading...</p>
        </div>
      );
    }

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

    // If on an auth page and not authenticated, show the page.
    if (isAuthPage && !isAuthenticated) {
        return <WrappedComponent {...props} />;
    }

    // If on a protected page and authenticated, show the page.
    if (!isAuthPage && isAuthenticated) {
        return <WrappedComponent {...props} />;
    }

    // Otherwise, we are likely in a redirect state, so render nothing to avoid flashes.
    return null;
  };

  AuthComponent.displayName = `withAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;

  return AuthComponent;
};

export default withAuth;
