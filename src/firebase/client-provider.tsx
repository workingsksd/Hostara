
'use client';

import { ReactNode } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from '.';
import { UserProvider } from './auth/use-user';

let app: ReturnType<typeof initializeFirebase>;

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  if (!app) {
    app = initializeFirebase();
  }

  return (
    <FirebaseProvider {...app}>
      <UserProvider>{children}</UserProvider>
    </FirebaseProvider>
  );
}
