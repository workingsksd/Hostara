
'use client';
import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

const FirebaseContext = createContext<{
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}>({
  app: null,
  firestore: null,
  auth: null,
});

type FirebaseProviderProps = {
  children: ReactNode;
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
};

export function FirebaseProvider({
  children,
  app,
  firestore,
  auth,
}: FirebaseProviderProps) {
  return (
    <FirebaseContext.Provider value={{ app, firestore, auth }}>
      {children}
      <FirebaseErrorListener />
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  return useContext(FirebaseContext);
};

export const useFirebaseApp = () => {
  return useContext(FirebaseContext).app;
};

export const useFirestore = () => {
  return useContext(FirebaseContext).firestore;
};

export const useAuth = () => {
  return useContext(FirebaseContext).auth;
};
