import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  db,
  OperationType,
  handleFirestoreError,
  BOOTSTRAPPED_ADMIN_EMAIL,
} from '../lib/firebase.ts';
import {
  User,
  Report,
  ReportStatus,
  ReportType,
  Gender,
} from '../types/index.ts';

function toIsoString(val: unknown): string | undefined {
  if (!val) return undefined;
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string') return val;
  if (typeof (val as any)?.toDate === 'function') {
    return (val as any).toDate().toISOString();
  }
  return undefined;
}

function toNullableNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

function mapUserDoc(id: string, data: Record<string, any>): User {
  const email = String(data.email || '');
  const isBootAdmin = email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();
  const role = isBootAdmin || data.role === 'admin' ? 'admin' : 'user';

  return {
    id,
    uid: String(data.uid || id),
    name: String(data.name || 'User'),
    email,
    phone: String(data.phone || ''),
    role,
    latitude: toNullableNumber(data.latitude),
    longitude: toNullableNumber(data.longitude),
    location_label: data.locationLabel ?? null,
    notifications_enabled:
      data.notificationsEnabled === undefined ? true : Boolean(data.notificationsEnabled),
    location_updated_at: toIsoString(data.locationUpdatedAt) ?? null,
    created_at: toIsoString(data.createdAt),
    updated_at: toIsoString(data.updatedAt),
  };
}

function mapReportDoc(id: string, data: Record<string, any>): Report {
  return {
    id,
    user_id: String(data.userId || ''),
    reporter_name: String(data.reporterName || 'Community Member'),
    report_type: (data.reportType === 'found' ? 'found' : 'missing') as ReportType,
    name: data.name ?? null,
    age: Number(data.age ?? 0),
    gender: (data.gender as Gender) || 'Other',
    photo_url: String(data.photoUrl || ''),
    location: String(data.location || ''),
    latitude: toNullableNumber(data.latitude),
    longitude: toNullableNumber(data.longitude),
    place_id: data.placeId ?? null,
    report_date: String(data.reportDate || ''),
    report_time: data.reportTime ?? null,
    clothing_description: data.clothingDescription ?? null,
    additional_info: data.additionalInfo ?? null,
    contact_phone: String(data.contactPhone || ''),
    status: (data.status as ReportStatus) || 'Pending',
    admin_notes: data.adminNotes ?? null,
    created_at: toIsoString(data.createdAt),
    updated_at: toIsoString(data.updatedAt),
  };
}

function sortByCreatedDesc(items: Report[]): Report[] {
  return [...items].sort((a, b) => {
    const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return tB - tA;
  });
}

export async function ensureUserProfile(firebaseUser: FirebaseUser): Promise<User> {
  const path = `users/${firebaseUser.uid}`;
  const userRef = doc(db, 'users', firebaseUser.uid);

  let snap;
  try {
    snap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  if (snap.exists()) {
    const mapped = mapUserDoc(snap.id, snap.data());
    const isBootAdmin =
      firebaseUser.emailVerified &&
      firebaseUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();
    if (isBootAdmin) {
      mapped.role = 'admin';
    }
    return mapped;
  }

  const displayName = (firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Reunite User').slice(0, 150);
  const email = (firebaseUser.email || '').slice(0, 150);

  const newDoc = {
    uid: firebaseUser.uid,
    name: displayName,
    email,
    phone: (firebaseUser.phoneNumber || '').slice(0, 50),
    role: 'user',
    latitude: null,
    longitude: null,
    locationLabel: null,
    notificationsEnabled: true,
    locationUpdatedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(userRef, newDoc);
    const createdSnap = await getDoc(userRef);
    if (createdSnap.exists()) {
      return mapUserDoc(createdSnap.id, createdSnap.data());
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }

  return mapUserDoc(firebaseUser.uid, {
    ...newDoc,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function updateUserLocationPreferencesInFirestore(
  uid: string,
  updates: {
    latitude?: number | null;
    longitude?: number | null;
    location_label?: string | null;
    notifications_enabled?: boolean;
    phone?: string;
    name?: string;
  }
): Promise<User> {
  const path = `users/${uid}`;
  const userRef = doc(db, 'users', uid);

  const payload: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };

  if (updates.latitude !== undefined && updates.longitude !== undefined) {
    payload.latitude = updates.latitude;
    payload.longitude = updates.longitude;
    if (updates.latitude !== null && updates.longitude !== null) {
      payload.locationUpdatedAt = serverTimestamp();
    } else {
      payload.locationUpdatedAt = null;
    }
  }
  if (updates.location_label !== undefined) {
    payload.locationLabel = updates.location_label
      ? String(updates.location_label).trim().slice(0, 255)
      : null;
  }
  if (updates.notifications_enabled !== undefined) {
    payload.notificationsEnabled = Boolean(updates.notifications_enabled);
  }
  if (updates.phone !== undefined) {
    payload.phone = String(updates.phone).trim().slice(0, 50);
  }
  if (updates.name !== undefined && updates.name.trim()) {
    payload.name = String(updates.name).trim().slice(0, 150);
  }

  try {
    await updateDoc(userRef, payload);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      throw new Error('User profile not found after update.');
    }
    return mapUserDoc(snap.id, snap.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function getAllUsersFromFirestore(): Promise<User[]> {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => mapUserDoc(d.id, d.data()));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getPublicReportsFromFirestore(filters?: {
  search?: string;
  type?: string;
  gender?: string;
  status?: string;
  location?: string;
}): Promise<Report[]> {
  const path = 'reports';
  try {
    const q = query(
      collection(db, 'reports'),
      where('status', 'in', ['Missing', 'Found', 'Reunited', 'Closed'])
    );
    const snap = await getDocs(q);
    let results = snap.docs.map((d) => mapReportDoc(d.id, d.data()));

    if (filters?.type && filters.type !== 'all') {
      results = results.filter((r) => r.report_type === filters.type);
    }
    if (filters?.gender && filters.gender !== 'all') {
      results = results.filter(
        (r) => r.gender.toLowerCase() === filters.gender!.toLowerCase()
      );
    }
    if (filters?.status && filters.status !== 'all') {
      results = results.filter(
        (r) => r.status.toLowerCase() === filters.status!.toLowerCase()
      );
    }
    if (filters?.location) {
      const loc = filters.location.toLowerCase();
      results = results.filter((r) => r.location.toLowerCase().includes(loc));
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      results = results.filter(
        (r) =>
          (r.name && r.name.toLowerCase().includes(s)) ||
          r.location.toLowerCase().includes(s) ||
          (r.clothing_description && r.clothing_description.toLowerCase().includes(s)) ||
          (r.additional_info && r.additional_info.toLowerCase().includes(s))
      );
    }

    return sortByCreatedDesc(results);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getAllReportsAdminFromFirestore(): Promise<Report[]> {
  const path = 'reports';
  try {
    const snap = await getDocs(collection(db, 'reports'));
    return sortByCreatedDesc(snap.docs.map((d) => mapReportDoc(d.id, d.data())));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getMyReportsFromFirestore(uid: string): Promise<Report[]> {
  const path = 'reports';
  try {
    const q = query(collection(db, 'reports'), where('userId', '==', uid));
    const snap = await getDocs(q);
    return sortByCreatedDesc(snap.docs.map((d) => mapReportDoc(d.id, d.data())));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getReportByIdFromFirestore(id: string): Promise<Report | null> {
  const path = `reports/${id}`;
  try {
    const snap = await getDoc(doc(db, 'reports', id));
    if (!snap.exists()) return null;
    return mapReportDoc(snap.id, snap.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createReportInFirestore(
  uid: string,
  reporterName: string,
  data: Partial<Report>,
  isAdminUser = false
): Promise<Report> {
  const path = 'reports';
  const payload = {
    userId: uid,
    reporterName: (reporterName || 'Community Member').slice(0, 150),
    reportType: data.report_type === 'found' ? 'found' : 'missing',
    name: data.name ? String(data.name).trim().slice(0, 150) : null,
    age: Number(data.age ?? 0),
    gender: (data.gender || 'Other') as Gender,
    photoUrl: String(data.photo_url || '').slice(0, 900000),
    location: String(data.location || '').trim().slice(0, 300),
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    placeId: data.place_id ? String(data.place_id).slice(0, 255) : null,
    reportDate: String(data.report_date || '').slice(0, 30),
    reportTime: data.report_time ? String(data.report_time).trim().slice(0, 30) : null,
    clothingDescription: data.clothing_description
      ? String(data.clothing_description).trim().slice(0, 2000)
      : null,
    additionalInfo: data.additional_info
      ? String(data.additional_info).trim().slice(0, 2000)
      : null,
    contactPhone: String(data.contact_phone || '').trim().slice(0, 50),
    status: isAdminUser && data.status ? data.status : 'Pending',
    adminNotes: isAdminUser && data.admin_notes ? String(data.admin_notes).slice(0, 2000) : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, 'reports'), payload);
    const createdSnap = await getDoc(docRef);
    if (createdSnap.exists()) {
      return mapReportDoc(createdSnap.id, createdSnap.data());
    }
    return mapReportDoc(docRef.id, {
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateReportInFirestore(
  id: string,
  updates: Partial<Report>,
  isAdminUser = false
): Promise<Report> {
  const path = `reports/${id}`;
  const docRef = doc(db, 'reports', id);

  const payload: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };

  // If a non-admin is strictly marking a report as Reunited, send only status + updatedAt
  const updateKeys = Object.keys(updates).filter((k) => updates[k as keyof Report] !== undefined);
  if (!isAdminUser && updateKeys.length === 1 && updates.status === 'Reunited') {
    payload.status = 'Reunited';
  } else {
    if (updates.name !== undefined) {
      payload.name = updates.name ? String(updates.name).trim().slice(0, 150) : null;
    }
    if (updates.age !== undefined) payload.age = Number(updates.age);
    if (updates.gender !== undefined) payload.gender = updates.gender;
    if (updates.photo_url !== undefined) {
      payload.photoUrl = String(updates.photo_url).trim().slice(0, 900000);
    }
    if (updates.location !== undefined) {
      payload.location = String(updates.location).trim().slice(0, 300);
    }
    if (updates.latitude !== undefined && updates.longitude !== undefined) {
      payload.latitude = updates.latitude;
      payload.longitude = updates.longitude;
    }
    if (updates.place_id !== undefined) {
      payload.placeId = updates.place_id ? String(updates.place_id).slice(0, 255) : null;
    }
    if (updates.report_date !== undefined) {
      payload.reportDate = String(updates.report_date).slice(0, 30);
    }
    if (updates.report_time !== undefined) {
      payload.reportTime = updates.report_time
        ? String(updates.report_time).trim().slice(0, 30)
        : null;
    }
    if (updates.clothing_description !== undefined) {
      payload.clothingDescription = updates.clothing_description
        ? String(updates.clothing_description).trim().slice(0, 2000)
        : null;
    }
    if (updates.additional_info !== undefined) {
      payload.additionalInfo = updates.additional_info
        ? String(updates.additional_info).trim().slice(0, 2000)
        : null;
    }
    if (updates.contact_phone !== undefined) {
      payload.contactPhone = String(updates.contact_phone).trim().slice(0, 50);
    }
    if (isAdminUser) {
      if (updates.report_type !== undefined) payload.reportType = updates.report_type;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.admin_notes !== undefined) {
        payload.adminNotes = updates.admin_notes
          ? String(updates.admin_notes).trim().slice(0, 2000)
          : null;
      }
    }
  }

  try {
    await updateDoc(docRef, payload);
    const updatedSnap = await getDoc(docRef);
    if (!updatedSnap.exists()) {
      throw new Error('Report not found after update.');
    }
    return mapReportDoc(updatedSnap.id, updatedSnap.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteReportInFirestore(id: string): Promise<void> {
  const path = `reports/${id}`;
  try {
    await deleteDoc(doc(db, 'reports', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function seedSampleReportsAdmin(uid: string, reporterName: string): Promise<number> {
  const samples: Array<Partial<Report>> = [
    {
      report_type: 'missing',
      name: 'Lucas Davis',
      age: 7,
      gender: 'Male',
      photo_url:
        'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=600&auto=format&fit=crop&q=80',
      location: 'Greenwood Central Park Playground, Springfield',
      latitude: 39.79245,
      longitude: -89.6552,
      place_id: null,
      report_date: '2026-08-14',
      report_time: '04:30 PM',
      clothing_description: 'Blue dinosaur t-shirt, beige cargo shorts, red light-up sneakers',
      additional_info:
        'Speaks English and basic Spanish. Friendly, has a small birthmark on his left forearm.',
      contact_phone: '+1 (555) 234-5678',
      status: 'Missing',
      admin_notes: 'Verified with local police station incident report #2026-SP-882.',
    },
    {
      report_type: 'missing',
      name: 'Eleanor Vance',
      age: 78,
      gender: 'Female',
      photo_url:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
      location: 'Oakridge Senior Living & Market Square, Downtown',
      latitude: 39.7765,
      longitude: -89.6584,
      place_id: null,
      report_date: '2026-08-15',
      report_time: '11:15 AM',
      clothing_description:
        'Floral lilac cardigan, dark grey trousers, brown orthopedic shoes, gold-rimmed glasses',
      additional_info:
        'Diagnosed with mild Alzheimer’s and short-term memory disorientation.',
      contact_phone: '+1 (555) 876-5432',
      status: 'Missing',
      admin_notes: 'Urgent medical care needed. Broadcast sent to city transit operators.',
    },
    {
      report_type: 'found',
      name: 'Unknown Toddler (Responds to Emma)',
      age: 4,
      gender: 'Female',
      photo_url:
        'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&auto=format&fit=crop&q=80',
      location: 'Metro Subway Station Entrance - North Line',
      latitude: 39.8012,
      longitude: -89.6438,
      place_id: null,
      report_date: '2026-08-16',
      report_time: '08:00 AM',
      clothing_description: 'Yellow hooded jacket with duck cartoon, polka dot leggings, pink boots',
      additional_info:
        'Currently in safe care at Metro Transit Police Station Booth 4.',
      contact_phone: '+1 (555) 999-1122',
      status: 'Found',
      admin_notes: 'Report verified by Metro Transit safety officer on duty.',
    },
    {
      report_type: 'missing',
      name: 'David Miller',
      age: 12,
      gender: 'Male',
      photo_url:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
      location: 'Lincoln Middle School Sports Ground',
      latitude: 39.7861,
      longitude: -89.6713,
      place_id: null,
      report_date: '2026-08-12',
      report_time: '03:45 PM',
      clothing_description: 'School navy hoodie, black jeans, white Nike backpack',
      additional_info: 'Located safely with family.',
      contact_phone: '+1 (555) 345-9876',
      status: 'Reunited',
      admin_notes: 'Family confirmed David returned home safely.',
    },
    {
      report_type: 'missing',
      name: 'Robert Chen',
      age: 82,
      gender: 'Male',
      photo_url:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
      location: 'Sunnydale Community Pharmacy, East Wing',
      latitude: 39.7798,
      longitude: -89.6295,
      place_id: null,
      report_date: '2026-08-15',
      report_time: '02:00 PM',
      clothing_description: 'Navy blue windbreaker, khaki slacks, grey walking cap',
      additional_info: 'Speaks Cantonese and English. Walks with a slight limp using a dark cane.',
      contact_phone: '+1 (555) 456-1122',
      status: 'Pending',
      admin_notes: 'Pending administrator verification.',
    },
  ];

  let createdCount = 0;
  for (const sample of samples) {
    await createReportInFirestore(uid, reporterName, sample, true);
    createdCount++;
  }
  return createdCount;
}
