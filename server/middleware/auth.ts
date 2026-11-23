import { Request, Response, NextFunction } from 'express';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const adminApp = getApps().length
  ? getApp()
  : initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId,
    });

const adminAuth = getAuth(adminApp);

export interface FirebaseAuthenticatedUser {
  uid: string;
  email?: string;
  emailVerified: boolean;
}

export interface AuthenticatedRequest extends Request {
  firebaseUser?: FirebaseAuthenticatedUser;
  user?: { id: number; email: string; name: string; role: 'user' | 'admin' };
}

// Kept for the legacy SQL controllers; the active API authenticates with Firebase ID tokens.
export const JWT_SECRET = process.env.JWT_SECRET || 'reunite-development-only-secret';

export const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.firebaseUser = {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: Boolean(decoded.email_verified),
    };
    req.user = {
      id: Number(decoded.id ?? 0),
      email: decoded.email ?? '',
      name: decoded.name ?? '',
      role: decoded.role === 'admin' ? 'admin' : 'user',
    };
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired Firebase session. Please sign in again.',
    });
  }
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.headers.authorization) {
    next();
    return;
  }
  void verifyToken(req, res, next);
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Administrator access required.' });
    return;
  }
  next();
};
