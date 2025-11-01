
'use client';

import {
  useEffect,
  useState,
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useFirebase } from '@/firebase/provider';
import { getUserProfile } from '@/services/user-service';
import type { UserProfile } from '@/context/BookingContext';

// This new type combines Firebase Auth user with our custom Firestore profile
export type AppUser = {
  firebaseUser: User;
  profile: UserProfile;
};

const UserContext = createContext<{
  user: AppUser | null;
  loading: boolean;
}>({ user: null, loading: true });

export function UserProvider({ children }: { children: ReactNode }) {
  const { auth, firestore } = useFirebase();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !firestore) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, now fetch their profile from Firestore
        const profile = await getUserProfile(firestore, firebaseUser.uid);
        if (profile) {
          setUser({ firebaseUser, profile });
        } else {
          // Profile doesn't exist yet, this might happen during registration
          // For now, treat as logged out until profile is created.
          setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  return useContext(UserContext);
};
