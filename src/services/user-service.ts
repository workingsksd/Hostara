
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
    
    setDoc(userProfileRef, data, { merge: true })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userProfileRef.path,
          operation: 'create',
          requestResourceData: data,
        } satisfies SecurityRuleContext);

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
    const docSnap = await getDoc(userProfileRef);

    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    } else {
        console.warn(`No user profile found for UID: ${uid}`);
        return null;
    }
}
