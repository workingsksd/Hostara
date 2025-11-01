
import { doc, setDoc, getDoc, Firestore } from 'firebase/firestore';
import type { UserProfile } from '@/context/BookingContext';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';


/**
 * Creates or updates a user's profile document in Firestore.
 * @param firestore - The Firestore instance.
 * @param uid - The user's unique ID.
 * @param data - The user profile data to save.
 */
export function createUserProfile(firestore: Firestore, uid: string, data: UserProfile) {
    const userProfileRef = doc(firestore, 'users', uid);
    
    // Don't await. Let the UI proceed and catch errors in the background.
    setDoc(userProfileRef, data, { merge: true })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userProfileRef.path,
          operation: 'create', // Explicitly 'create' for registration
          requestResourceData: data,
        } satisfies SecurityRuleContext);

        // Emit the specialized error for the listener to catch
        errorEmitter.emit('permission-error', permissionError);
      });
}

/**
 * Fetches a user's profile from Firestore.
 * @param firestore - The Firestore instance.
 * @param uid - The user's unique ID.
 * @returns The user profile data, or null if not found.
 */
export async function getUserProfile(firestore: Firestore, uid: string): Promise<UserProfile | null> {
    const userProfileRef = doc(firestore, 'users', uid);
    
    try {
        const docSnap = await getDoc(userProfileRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        } else {
            console.warn(`No user profile found for UID: ${uid}`);
            return null;
        }
    } catch (serverError) {
         // This catch block handles potential security rule errors on read.
         const permissionError = new FirestorePermissionError({
          path: userProfileRef.path,
          operation: 'get',
        } satisfies SecurityRuleContext);
        
        // Throw the specialized error. The `useUser` hook will catch it.
        throw permissionError;
    }
}
