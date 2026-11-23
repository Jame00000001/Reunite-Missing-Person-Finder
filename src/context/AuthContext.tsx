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
    const profile = await ensureUserProfile(fbUser);

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
        message: err?.message || 'Google Sign-In failed. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const profile = await loadUserProfile(credential.user);
      return { success: true, message: 'Logged in successfully.', user: profile };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Unable to sign in.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; phone: string; password: string }): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
      await updateProfile(credential.user, { displayName: data.name.trim() });
      const profile = await loadUserProfile(credential.user);
      const savedProfile = await updateUserLocationPreferencesInFirestore(profile.id, {
        name: data.name,
        phone: data.phone,
      });
      setUser(savedProfile);
      return { success: true, message: 'Registration successful.', user: savedProfile };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Unable to register.' };
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
