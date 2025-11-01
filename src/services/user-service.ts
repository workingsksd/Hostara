
import { doc, setDoc, getDoc, Firestore } from 'firebase/firestore';
import type { UserProfile } from '@/context/BookingContext';

/**
 * Creates or updates a user's profile document in Firestore.
 * @param firestore - The Firestore instance.
 * @param uid - The user's unique ID.
 * @param data - The user profile data to save.
 */
export async function createUserProfile(firestore: Firestore, uid: string, data: UserProfile) {
    const userProfileRef = doc(firestore, 'users', uid);
    await setDoc(userProfileRef, data, { merge: true });
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
