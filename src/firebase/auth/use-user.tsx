
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
import { errorEmitter } from '../error-emitter';

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
      if(auth === null || firestore === null){
        // Firebase is not yet initialized. We wait.
        return;
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // User is signed in, now fetch their profile from Firestore
          const profile = await getUserProfile(firestore, firebaseUser.uid);
          if (profile) {
            setUser({ firebaseUser, profile });
          } else {
            // This can happen if the profile document hasn't been created yet.
            // We'll log the user out to force a clean state.
            console.warn("User profile not found, logging out.");
            auth.signOut();
            setUser(null);
          }
        } catch (error: any) {
            // If getUserProfile throws a FirestorePermissionError, emit it.
            errorEmitter.emit('permission-error', error);
            // Treat as logged out since we can't get their profile/permissions
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
