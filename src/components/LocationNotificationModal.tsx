import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  BellOff,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Navigation,
} from 'lucide-react';
import { NotificationLogItem, NotificationStatus } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { updateUserLocationPreferencesInFirestore } from '../services/firestoreService.ts';
import {
  LocationPickerMap,
  SelectedLocationValue,
} from './maps/LocationPickerMap.tsx';
import {
  isPushSupported,
  getBrowserNotificationPermission,
  subscribeUserToPush,
  unsubscribeUserFromPush,
} from '../utils/pushNotifications.ts';

interface LocationNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReportById: (reportId: string) => void;
  onUnreadCountChange: (count: number) => void;
}

export const LocationNotificationModal: React.FC<
  LocationNotificationModalProps
> = ({
  isOpen,
  onClose,
  onOpenReportById,
  onUnreadCountChange,
}) => {
  const { user, isAuthenticated, updateUser } = useAuth();

  const [locationValue, setLocationValue] = useState<SelectedLocationValue>({
    location: '',
    latitude: null,
    longitude: null,
    place_id: null,
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [status, setStatus] = useState<NotificationStatus | null>(null);
  const [history, setHistory] = useState<NotificationLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingPush, setIsTogglingPush] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!isAuthenticated || !user) return;
    setIsLoading(true);
    setError(null);
    try {
      const [statusRes, historyRes] = await Promise.all([
        api.notifications.getStatus(),
        api.notifications.getHistory(),
      ]);

      if (statusRes.success && statusRes.status) {
        setStatus(statusRes.status);
        setNotificationsEnabled(
          user.notifications_enabled ?? statusRes.status.notificationsEnabled
        );
        setLocationValue({
          location: user.location_label || statusRes.status.locationLabel || '',
          latitude: user.latitude ?? statusRes.status.latitude,
          longitude: user.longitude ?? statusRes.status.longitude,
          place_id: null,
        });
        onUnreadCountChange(statusRes.status.unreadCount);
      } else {
        setNotificationsEnabled(user.notifications_enabled ?? true);
        setLocationValue({
          location: user.location_label || '',
          latitude: user.latitude ?? null,
          longitude: user.longitude ?? null,
          place_id: null,
        });
      }

      if (historyRes.success) {
        setHistory(historyRes.notifications);
        onUnreadCountChange(historyRes.unreadCount);
      }
    } catch {
      setError('Failed to load location and notification settings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      setFeedback(null);
      loadData();
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const handleSaveLocation = async () => {
    if (!user) return;
    setError(null);
    setFeedback(null);

    if (
      locationValue.latitude === null ||
      locationValue.longitude === null ||
      !Number.isFinite(locationValue.latitude) ||
      !Number.isFinite(locationValue.longitude)
    ) {
      setError('Please select a location on the map or detect your GPS position first.');
      return;
    }

    const label =
      locationValue.location.trim() ||
      `${locationValue.latitude.toFixed(4)}, ${locationValue.longitude.toFixed(4)}`;

    setIsSaving(true);
    try {
      const [updatedUser, syncRes] = await Promise.all([
        updateUserLocationPreferencesInFirestore(user.id, {
          latitude: locationValue.latitude,
          longitude: locationValue.longitude,
          location_label: label,
          notifications_enabled: notificationsEnabled,
        }),
        api.notifications.syncLocationPreferences({
          latitude: locationValue.latitude,
          longitude: locationValue.longitude,
          location_label: label,
          notifications_enabled: notificationsEnabled,
        }),
      ]);

      updateUser(updatedUser);
      if (syncRes.success) {
        setFeedback(
          'Your location and 10 km nearby alert preferences have been saved.'
        );
      } else {
        setFeedback('Location saved to your profile.');
      }
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to save location settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnableBrowserPush = async () => {
    if (!user) return;
    setError(null);
    setFeedback(null);
    setIsTogglingPush(true);
    try {
      const vapidRes = await api.notifications.getVapidPublicKey();
      if (!vapidRes.success || !vapidRes.publicKey) {
        const updatedUser = await updateUserLocationPreferencesInFirestore(user.id, {
          notifications_enabled: true,
        });
        await api.notifications.syncLocationPreferences({
          notifications_enabled: true,
        });
        updateUser(updatedUser);
        setNotificationsEnabled(true);
        setFeedback(
          'In-app nearby alerts are enabled. Configure VAPID_PUBLIC_KEY & VAPID_PRIVATE_KEY in .env to also receive OS/browser background push notifications.'
        );
        await loadData();
        return;
      }

      const subJson = await subscribeUserToPush(vapidRes.publicKey);
      const saveSub = await api.notifications.subscribe(subJson);
      if (saveSub.success) {
        const updatedUser = await updateUserLocationPreferencesInFirestore(user.id, {
          notifications_enabled: true,
        });
        updateUser(updatedUser);
        setNotificationsEnabled(true);
        setFeedback(
          'Browser push notifications are active! You will receive instant alerts for missing person reports within 10 km.'
        );
        await loadData();
      } else {
        setError(saveSub.message || 'Failed to save browser push subscription.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to enable browser push notifications.');
    } finally {
      setIsTogglingPush(false);
    }
  };

  const handleDisablePush = async () => {
    if (!user) return;
    setError(null);
    setFeedback(null);
    setIsTogglingPush(true);
    try {
      const removedEndpoint = await unsubscribeUserFromPush();
      await api.notifications.unsubscribe(removedEndpoint || undefined);
      const [updatedUser] = await Promise.all([
        updateUserLocationPreferencesInFirestore(user.id, {
          notifications_enabled: false,
        }),
        api.notifications.syncLocationPreferences({
          notifications_enabled: false,
        }),
      ]);
      updateUser(updatedUser);
      setNotificationsEnabled(false);
      setFeedback('Nearby missing person push notifications have been turned off.');
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to disable push notifications.');
    } finally {
      setIsTogglingPush(false);
    }
  };

  const handleOpenAlertReport = async (item: NotificationLogItem) => {
    if (!item.is_read) {
      await api.notifications.markRead(item.id).catch(() => {});
    }
    onUnreadCountChange(
      Math.max(0, history.filter((h) => !h.is_read && h.id !== item.id).length)
    );
    onClose();
    onOpenReportById(item.report_id);
  };

  const handleMarkAllRead = async () => {
    await api.notifications.markRead().catch(() => {});
    setHistory((prev) => prev.map((item) => ({ ...item, is_read: true })));
    onUnreadCountChange(0);
  };

  const permission = getBrowserNotificationPermission();
  const pushSupported = isPushSupported();
  const hasLocation =
    (status?.hasLocation ?? false) ||
    (user?.latitude !== null &&
      user?.latitude !== undefined &&
      user?.longitude !== null &&
      user?.longitude !== undefined);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                Nearby Alerts & Location (10 km Radius)
              </h2>
              <p className="text-xs text-slate-300">
                Receive instant notifications if someone is reported missing within 10 km
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {feedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{feedback}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 text-center text-slate-500">
              <Loader2 className="w-7 h-7 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-xs font-semibold">Loading alert preferences...</p>
            </div>
          ) : (
            <>
              {/* Push Notification Status Card */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {notificationsEnabled ? (
                        <Bell className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <BellOff className="w-4 h-4 text-slate-400" />
                      )}
                      <span>Push Notification Status</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {!pushSupported
                        ? 'Your browser does not support Web Push notifications; alerts will appear in your inbox below.'
                        : permission === 'denied'
                        ? 'Browser notification permission is blocked. Enable it in browser site settings to receive OS alerts.'
                        : notificationsEnabled && (status?.subscriptionCount || 0) > 0
                        ? `Active on ${status?.subscriptionCount} browser device(s)`
                        : notificationsEnabled
                        ? 'Alert preference is enabled. Click Enable Browser Push to register this device.'
                        : 'Nearby alerts are currently paused for your account.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {notificationsEnabled && (status?.subscriptionCount || 0) > 0 ? (
                      <button
                        type="button"
                        onClick={handleDisablePush}
                        disabled={isTogglingPush}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors disabled:opacity-50"
                      >
                        {isTogglingPush ? 'Updating...' : 'Disable Alerts'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleEnableBrowserPush}
                        disabled={isTogglingPush || permission === 'denied'}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs disabled:opacity-50"
                      >
                        {isTogglingPush ? 'Enabling...' : 'Enable Browser Push'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* User Current Location Picker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span>Your Alert Monitoring Location</span>
                  </h3>
                  {hasLocation && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      10 km Radius Active
                    </span>
                  )}
                </div>

                <LocationPickerMap
                  value={locationValue}
                  onChange={setLocationValue}
                  placeholder="Type your neighborhood (click Search) or click map / Detect My Location..."
                  required={false}
                  heightClass="h-52"
                  pinColor="blue"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveLocation}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save My Alert Location</span>
                  </button>
                </div>
              </div>

              {/* Nearby Alert Inbox */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Recent Nearby Missing Alerts ({history.length})
                  </h3>
                  {history.some((item) => !item.is_read) && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200">
                    <MapPin className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-slate-700">
                      No nearby missing person alerts yet.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Save your location above to automatically receive alerts within 10 km.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleOpenAlertReport(item)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                          item.is_read
                            ? 'bg-white border-slate-200 hover:border-slate-300'
                            : 'bg-rose-50/70 border-rose-200 hover:bg-rose-50'
                        }`}
                      >
                        <img
                          src={item.report_photo_url}
                          alt={item.report_name || 'Missing Person'}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {item.report_name || 'Missing Person'}
                            </span>
                            {!item.is_read && (
                              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                            )}
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                              {item.distance_km} km away
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 truncate mt-0.5">
                            Last seen: {item.report_location}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(item.sent_at).toLocaleString()}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
