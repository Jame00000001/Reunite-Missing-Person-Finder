import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';

import { User, AuthResponse } from '../types/index.ts';

import {
  auth,
  googleAuthProvider,
  BOOTSTRAPPED_ADMIN_EMAIL,
} from '../lib/firebase.ts';

import {
  ensureUserProfile,
  updateUserLocationPreferencesInFirestore,
} from '../services/firestoreService.ts';
import { api } from '../services/api.ts';

function getAuthErrorMessage(error: any, action: 'sign in' | 'register'): string {
  switch (error?.code) {
    case 'auth/operation-not-allowed':
    case 'auth/admin-restricted-operation':
      return 'Email and password sign-in is disabled for this Firebase project. Enable Email/Password in Firebase Console → Authentication → Sign-in method.';
    case 'auth/unauthorized-domain':
      return 'This site domain is not authorized for Firebase Authentication. Add the hostname (for example, localhost) in Firebase Console → Authentication → Settings → Authorized domains.';
    case 'auth/configuration-not-found':
      return 'Firebase Authentication is not initialized for the configured project. Deploy the auth section of firebase.json or enable Authentication in that project’s Firebase Console.';
    case 'auth/invalid-api-key':
    case 'auth/project-not-found':
      return 'Firebase is configured with an invalid or unavailable project. Check the VITE_FIREBASE_* values in .env and restart the dev server.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return action === 'sign in'
        ? 'Email or password is incorrect. The old MySQL demo accounts are not Firebase accounts; create an account here or use credentials registered in Firebase.'
        : 'These credentials could not be used to create an account. Check your email and password, then try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Sign in instead.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/weak-password':
      return 'Choose a password with at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact the project administrator.';
    case 'auth/too-many-requests':
      return 'Sign-in is temporarily blocked after too many attempts. Wait a little and try again.';
    default:
      return error?.message || `Unable to ${action}. Please try again.`;
  }
}

const pendingPhoneKey = (uid: string) => `reunite-pending-phone:${uid}`;

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<AuthResponse>;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadUserProfile = useCallback(async (fbUser: FirebaseUser) => {
    let profile = await ensureUserProfile(fbUser);
    const pendingPhone = localStorage.getItem(pendingPhoneKey(fbUser.uid));
    if (pendingPhone && !profile.phone) {
      profile = await updateUserLocationPreferencesInFirestore(profile.id, {
        phone: pendingPhone,
      });
      localStorage.removeItem(pendingPhoneKey(fbUser.uid));
    }

    setUser(profile);

    if (profile.latitude != null && profile.longitude != null) {
      api.notifications
        .syncLocationPreferences({
          latitude: profile.latitude,
          longitude: profile.longitude,
          location_label: profile.location_label ?? null,
          notifications_enabled: profile.notifications_enabled ?? true,
        })
        .catch(() => {});
    }

    return profile;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (!fbUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const isPasswordAccount = fbUser.providerData.some(
        (provider) => provider.providerId === 'password'
      );
      if (isPasswordAccount && !fbUser.emailVerified) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        await loadUserProfile(fbUser);
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [loadUserProfile]);

  const refreshUser = async () => {
    const current = auth.currentUser;

    if (!current) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      await loadUserProfile(current);
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<AuthResponse> => {
    setIsLoading(true);

    try {
      const credential = await signInWithPopup(auth, googleAuthProvider);
      const profile = await loadUserProfile(credential.user);

      return {
        success: true,
        message: 'Signed in successfully with Google.',
        user: profile,
      };
    } catch (err: any) {
      const code = err?.code || '';

      if (code === 'auth/popup-closed-by-user') {
        return {
          success: false,
          message:
            'Sign-in popup was closed before completing authentication.',
        };
      }

      if (code === 'auth/popup-blocked') {
        return {
          success: false,
          message:
            'Sign-in popup was blocked by your browser. Please allow popups for this site.',
        };
      }

      return {
        success: false,
        message: getAuthErrorMessage(err, 'sign in'),
      };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!credential.user.emailVerified) {
        await sendEmailVerification(credential.user);
        await signOut(auth);
        return {
          success: false,
          message: 'Verify your email before signing in. We sent a new verification link; check your inbox and spam folder.',
        };
      }
      const profile = await loadUserProfile(credential.user);
      return { success: true, message: 'Logged in successfully.', user: profile };
    } catch (err: any) {
      return { success: false, message: getAuthErrorMessage(err, 'sign in') };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; phone: string; password: string }): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
      await updateProfile(credential.user, { displayName: data.name.trim() });
      localStorage.setItem(pendingPhoneKey(credential.user.uid), data.phone.trim());
      await sendEmailVerification(credential.user);
      await signOut(auth);
      return {
        success: true,
        requiresEmailVerification: true,
        message: 'Account created. Verify your email using the link we sent, then sign in to finish setting up your profile.',
      };
    } catch (err: any) {
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        await signOut(auth).catch(() => {});
      }
      return { success: false, message: getAuthErrorMessage(err, 'register') };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } finally {
      setFirebaseUser(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const isBootstrappedVerifiedAdmin = Boolean(
    firebaseUser?.emailVerified &&
      firebaseUser.email?.toLowerCase() ===
        BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()
  );

  const isAdmin = Boolean(
    user && (user.role === 'admin' || isBootstrappedVerifiedAdmin)
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        isAdmin,
        isAuthenticated: !!user,
        signInWithGoogle,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
