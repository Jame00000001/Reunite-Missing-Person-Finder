export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
  return isPushSupported() ? Notification.permission : 'unsupported';
}

function decodeVapidKey(value: string): Uint8Array {
  const padded = value + '='.repeat((4 - (value.length % 4)) % 4);
  const decoded = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(decoded, (char) => char.charCodeAt(0));
}

export async function subscribeUserToPush(publicKey: string): Promise<PushSubscriptionJSON> {
  if (!isPushSupported()) throw new Error('Browser push notifications are not supported.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission was not granted.');
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decodeVapidKey(publicKey) });
  return subscription.toJSON();
}

export async function unsubscribeUserFromPush(): Promise<string | null> {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return null;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  return endpoint;
}

export async function detectCurrentGpsPosition(): Promise<{ latitude: number; longitude: number }> {
  if (!navigator.geolocation) throw new Error('Location services are unavailable in this browser.');
  return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(
    ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
    (error) => reject(new Error(error.message || 'Unable to detect your location.')),
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
  ));
}
