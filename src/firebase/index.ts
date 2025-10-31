
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from 'firebase/firestore';

import { firebaseConfig } from './config';
import {
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
} from './provider';
import { FirebaseClientProvider } from './client-provider';
import { useUser } from './auth/use-user';

export function initializeFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} {
  const apps = getApps();
  const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  if (process.env.NEXT_PUBLIC_EMULATOR_HOST) {
    const host = process.env.NEXT_PUBLIC_EMULATOR_HOST;
    // Important: Re-route requests from the browser to the emulator
    // This will only happen in a dev environment
    connectAuthEmulator(auth, `http://${host}:9099`, {
      disableWarnings: true,
    });
    connectFirestoreEmulator(firestore, host, 8080);
  }
  return { app, auth, firestore };
}

export {
  FirebaseProvider,
  FirebaseClientProvider,
  useUser,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
};
