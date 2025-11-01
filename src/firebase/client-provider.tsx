
'use client';

import { ReactNode } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from '.';

let app: ReturnType<typeof initializeFirebase>;

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  if (!app) {
    app = initializeFirebase();
  }

  return (
    <FirebaseProvider {...app}>
      {children}
    </FirebaseProvider>
  );
}
