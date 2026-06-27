import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Safely import client config (Vite resolves this path because we created the file)
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase dynamically to prevent crash if keys are not configured yet
const hasConfig = !!(firebaseConfig && firebaseConfig.apiKey);

const app = getApps().length === 0 
  ? initializeApp(
      hasConfig 
        ? firebaseConfig 
        : {
            apiKey: "dummy-key-for-compilation-purposes",
            authDomain: "ai-krushi-mitra-applet.firebaseapp.com",
            projectId: "ai-krushi-mitra-applet",
            storageBucket: "ai-krushi-mitra-applet.appspot.com",
            messagingSenderId: "1234567890",
            appId: "1:1234567890:web:1234567890"
          }
    )
  : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

export const analytics = (hasConfig && firebaseConfig.measurementId && typeof window !== 'undefined')
  ? getAnalytics(app)
  : null;

// =============================================================================
// ERROR HANDLER (MANDATORY per Integration Skill, Section 3)
// =============================================================================

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed Info: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
