
import { doc, setDoc, Firestore } from 'firebase/firestore';

// A type representing the user profile data we'll store in Firestore
type UserProfile = {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: string;
    organisationType: string;
}

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

    