
'use client';

import {
  useEffect,
  useState,
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User, type Auth } from 'firebase/auth';
import { useFirebase } from '@/firebase/provider';
import type { FirebaseApp } from 'firebase/app';

const UserContext = createContext<{
  user: User | null;
  app: FirebaseApp | null;
  auth: Auth | null;
  loading: boolean;
}>({ user: null, app: null, auth: null, loading: true });

export function UserProvider({ children }: { children: ReactNode }) {
  const { auth, app } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <UserContext.Provider value={{ user, app, auth, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  return useContext(UserContext);
};
