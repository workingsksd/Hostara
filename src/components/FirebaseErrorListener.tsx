
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

// This is a client component that will listen for 'permission-error' events
// and throw them as uncaught exceptions to be displayed by Next.js's error overlay.
// It should be placed within a client-side provider, like FirebaseProvider.

export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: Error) => {
      // Throwing the error here will cause it to be caught by Next.js's
      // development error overlay, which is exactly what we want for debugging.
      // In production, this would be caught by a top-level error boundary.
      throw error;
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // This component does not render anything to the DOM.
  return null;
}
