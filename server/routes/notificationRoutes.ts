import { Router } from 'express';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import * as webPush from 'web-push';
import { adminApp, AuthenticatedRequest, verifyToken } from '../middleware/auth.ts';
import firebaseConfig from '../../firebase-applet-config.json';

const router = Router();
const firestore = getFirestore(
  adminApp,
  process.env.FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || '(default)'
);
const users = firestore.collection('users');
const logs = firestore.collection('notificationLogs');
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';

if (vapidPublicKey && process.env.VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@reunite.org', vapidPublicKey, process.env.VAPID_PRIVATE_KEY);
}

function uid(req: AuthenticatedRequest): string {
  return req.firebaseUser!.uid;
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const radians = (value: number) => (value * Math.PI) / 180;
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

router.use(verifyToken);

router.get('/vapid-public-key', (_req, res) => {
  res.json({ success: true, publicKey: vapidPublicKey || null });
});

router.get('/status', async (req: AuthenticatedRequest, res) => {
  try {
    const [profile, subscriptions, unread] = await Promise.all([
      users.doc(uid(req)).get(),
      users.doc(uid(req)).collection('pushSubscriptions').get(),
      logs.where('userId', '==', uid(req)).get(),
    ]);
    const data = profile.data() || {};
    const latitude = typeof data.latitude === 'number' ? data.latitude : null;
    const longitude = typeof data.longitude === 'number' ? data.longitude : null;
    res.json({
      success: true,
      status: {
        latitude,
        longitude,
        locationLabel: data.locationLabel ?? null,
        hasLocation: latitude !== null && longitude !== null,
        notificationsEnabled: data.notificationsEnabled !== false,
        subscriptionCount: subscriptions.size,
        unreadCount: unread.docs.filter((item) => item.data().isRead !== true).length,
      },
    });
  } catch (error) {
    console.error('Notification status lookup failed:', error);
    res.status(500).json({ success: false, message: 'Could not load notification settings.' });
  }
});

router.get('/history', async (req: AuthenticatedRequest, res) => {
  try {
    const snap = await logs.where('userId', '==', uid(req)).limit(100).get();
    const notifications = snap.docs.map((item) => ({ id: item.id, ...item.data() }))
      .sort((a: any, b: any) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    res.json({
      success: true,
      notifications: notifications.map((item: any) => ({
        id: item.id,
        report_id: item.reportId,
        reportName: item.reportName || 'Missing person report',
        message: item.message || '',
        is_read: Boolean(item.isRead),
        createdAt: item.createdAt || null,
      })),
      unreadCount: notifications.filter((item: any) => !item.isRead).length,
    });
  } catch (error) {
    console.error('Notification history lookup failed:', error);
    res.status(500).json({ success: false, message: 'Could not load notification history.' });
  }
});

router.post('/location-preferences', async (req: AuthenticatedRequest, res) => {
  const { latitude, longitude, location_label, notifications_enabled } = req.body || {};
  if ((latitude !== undefined && !Number.isFinite(Number(latitude))) || (longitude !== undefined && !Number.isFinite(Number(longitude)))) {
    res.status(400).json({ success: false, message: 'Latitude and longitude must be valid numbers.' });
    return;
  }
  try {
    const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (latitude !== undefined) updates.latitude = Number(latitude);
    if (longitude !== undefined) updates.longitude = Number(longitude);
    if (location_label !== undefined) updates.locationLabel = location_label ? String(location_label).slice(0, 255) : null;
    if (notifications_enabled !== undefined) updates.notificationsEnabled = Boolean(notifications_enabled);
    await users.doc(uid(req)).set(updates, { merge: true });
    res.json({ success: true, message: 'Notification preferences saved.' });
  } catch (error) {
    console.error('Saving notification preferences failed:', error);
    res.status(500).json({ success: false, message: 'Could not save notification preferences.' });
  }
});

router.post('/subscribe', async (req: AuthenticatedRequest, res) => {
  const subscription = req.body;
  if (!subscription?.endpoint || !subscription?.keys?.auth || !subscription?.keys?.p256dh) {
    res.status(400).json({ success: false, message: 'A valid browser push subscription is required.' });
    return;
  }
  try {
    await users.doc(uid(req)).collection('pushSubscriptions').doc(encodeURIComponent(subscription.endpoint)).set({ ...subscription, createdAt: FieldValue.serverTimestamp() });
    res.json({ success: true, message: 'Push subscription saved.' });
  } catch (error) {
    console.error('Saving push subscription failed:', error);
    res.status(500).json({ success: false, message: 'Could not save push subscription.' });
  }
});

router.delete('/subscribe', async (req: AuthenticatedRequest, res) => {
  try {
    const subscriptions = users.doc(uid(req)).collection('pushSubscriptions');
    const endpoint = req.body?.endpoint;
    if (endpoint) await subscriptions.doc(encodeURIComponent(String(endpoint))).delete();
    else {
      const existing = await subscriptions.get();
      await Promise.all(existing.docs.map((item) => item.ref.delete()));
    }
    res.json({ success: true, message: 'Push subscription removed.' });
  } catch (error) {
    console.error('Removing push subscription failed:', error);
    res.status(500).json({ success: false, message: 'Could not remove push subscription.' });
  }
});

router.patch('/read-all', async (req: AuthenticatedRequest, res) => {
  try {
    const unread = await logs.where('userId', '==', uid(req)).get();
    const batch = firestore.batch();
    unread.docs.filter((item) => item.data().isRead !== true).forEach((item) => batch.update(item.ref, { isRead: true }));
    await batch.commit();
    res.json({ success: true });
  } catch (error) {
    console.error('Marking notifications read failed:', error);
    res.status(500).json({ success: false, message: 'Could not update notifications.' });
  }
});

router.patch('/:id/read', async (req: AuthenticatedRequest, res) => {
  try {
    const item = await logs.doc(req.params.id).get();
    if (!item.exists || item.data()?.userId !== uid(req)) {
      res.status(404).json({ success: false, message: 'Notification not found.' });
      return;
    }
    await item.ref.update({ isRead: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Marking notification read failed:', error);
    res.status(500).json({ success: false, message: 'Could not update notification.' });
  }
});

router.get('/reports/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const report = await firestore.collection('reports').doc(req.params.id).get();
    if (!report.exists) {
      res.status(404).json({ success: false, message: 'Report not found.' });
      return;
    }
    const data = report.data()!;
    if (data.status === 'Pending' && data.userId !== uid(req) && req.user?.role !== 'admin') {
      const alert = await logs.where('userId', '==', uid(req)).get();
      const receivedAlert = alert.docs.some((item) => item.data().reportId === report.id);
      if (!receivedAlert) {
        res.status(403).json({ success: false, message: 'This report is not available.' });
        return;
      }
    }
    res.json({ success: true, report: { id: report.id, ...data } });
  } catch (error) {
    console.error('Alert report lookup failed:', error);
    res.status(500).json({ success: false, message: 'Could not load report.' });
  }
});

router.post('/dispatch-nearby', async (req: AuthenticatedRequest, res) => {
  const report = req.body || {};
  const latitude = Number(report.latitude);
  const longitude = Number(report.longitude);
  if (!report.reportId || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    res.status(400).json({ success: false, message: 'A report ID and valid coordinates are required.' });
    return;
  }
  try {
    const profiles = await users.where('notificationsEnabled', '==', true).get();
    const recipients = profiles.docs.filter((profile) => {
      if (profile.id === uid(req)) return false;
      const data = profile.data();
      return Number.isFinite(data.latitude) && Number.isFinite(data.longitude) && distanceKm(latitude, longitude, data.latitude, data.longitude) <= 10;
    });
    const payload = JSON.stringify({ title: 'Missing person reported nearby', body: `${report.name || 'A person'} was reported missing near ${report.location || 'your saved location'}.`, url: `/?reportId=${encodeURIComponent(String(report.reportId))}`, reportId: String(report.reportId) });
    let pushCount = 0;
    for (const recipient of recipients) {
      const data = recipient.data();
      const userLogs = await logs.add({ userId: recipient.id, reportId: String(report.reportId), reportName: report.name || 'Missing person report', message: `A missing person was reported within 10 km of ${data.locationLabel || 'your saved location'}.`, isRead: false, createdAt: new Date().toISOString() });
      void userLogs;
      const subscriptions = await recipient.ref.collection('pushSubscriptions').get();
      for (const subscription of subscriptions.docs) {
        try {
          await webPush.sendNotification(subscription.data() as webPush.PushSubscription, payload);
          pushCount += 1;
        } catch (error: any) {
          if (error?.statusCode === 404 || error?.statusCode === 410) await subscription.ref.delete();
          else console.warn('Push delivery failed:', error?.message || error);
        }
      }
    }
    res.json({ success: true, summary: { matchedUsers: recipients.length, notificationsSent: pushCount } });
  } catch (error) {
    console.error('Nearby notification dispatch failed:', error);
    res.status(500).json({ success: false, message: 'Could not dispatch nearby alerts.' });
  }
});

export default router;
