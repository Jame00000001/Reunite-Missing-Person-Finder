import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

const env = import.meta.env;
export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || appletConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId,
  appId: env.VITE_FIREBASE_APP_ID || appletConfig.appId,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || appletConfig.measurementId,
};

export const firestoreDatabaseId =
  env.VITE_FIRESTORE_DATABASE_ID || appletConfig.firestoreDatabaseId || '(default)';

if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
  throw new Error('Firebase configuration is missing. Set the VITE_FIREBASE_* values in .env.');
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app, firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

export const BOOTSTRAPPED_ADMIN_EMAIL = 'hossain241-35-033@diu.edu.bd';

export enum OperationType {
  GET = 'get',
  LIST = 'list',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export function handleFirestoreError(error: unknown, operation: OperationType, path: string): never {
  console.error(`Firestore ${operation} failed for ${path}:`, error);
  throw error instanceof Error ? error : new Error(`Firestore ${operation} failed.`);
}
