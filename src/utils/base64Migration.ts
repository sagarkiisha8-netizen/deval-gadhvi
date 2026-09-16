import { collection, getDocs, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getDb } from '../lib/firebase';
import { isBase64Image, uploadBase64Image } from './mediaStorage';
import { normalizeProviderKey } from './providerImages';

export interface MigrationSummary {
  providersMigrated: number;
  doctorProfileMigrated: boolean;
  siteMediaMigrated: number;
  errors: string[];
}

/**
 * Scans Firestore & local storage for any Base64 images and migrates them to persistent URLs.
 */
export async function runBase64ImageMigration(): Promise<MigrationSummary> {
  const summary: MigrationSummary = {
    providersMigrated: 0,
    doctorProfileMigrated: false,
    siteMediaMigrated: 0,
    errors: []
  };

  try {
    const db = getDb();

    // 1. Check & Migrate Providers Collection
    try {
      const providersSnap = await getDocs(collection(db, 'providers'));
      for (const providerDoc of providersSnap.docs) {
        const data = providerDoc.data();
        const rawImg = data.image || data.imageUrl || data.photoUrl;

        if (isBase64Image(rawImg)) {
          const providerKey = normalizeProviderKey(data.id || data.slug || providerDoc.id);
          const filename = `${providerKey}-${Date.now()}.webp`;

          const permanentUrl = await uploadBase64Image(rawImg, {
            folder: 'providers',
            customFilename: filename
          });

          await setDoc(
            doc(db, 'providers', providerDoc.id),
            {
              image: permanentUrl,
              imageUrl: permanentUrl,
              photoUrl: permanentUrl,
              updatedAt: serverTimestamp()
            },
            { merge: true }
          );

          summary.providersMigrated++;
        }
      }
    } catch (e: any) {
      summary.errors.push(`Providers migration error: ${e.message}`);
    }

    // 2. Check & Migrate Doctor Profile ('doctor_profile/main')
    try {
      const docSnap = await getDoc(doc(db, 'doctor_profile', 'main'));
      if (docSnap.exists()) {
        const docData = docSnap.data();
        if (isBase64Image(docData.photoUrl)) {
          const permanentUrl = await uploadBase64Image(docData.photoUrl, {
            folder: 'providers',
            customFilename: `prahlad-gadhavi-${Date.now()}.webp`
          });

          await setDoc(
            doc(db, 'doctor_profile', 'main'),
            {
              photoUrl: permanentUrl,
              updatedAt: serverTimestamp()
            },
            { merge: true }
          );

          summary.doctorProfileMigrated = true;
        }
      }
    } catch (e: any) {
      summary.errors.push(`Doctor profile migration error: ${e.message}`);
    }

    // 3. Check & Migrate Site Media ('site_media')
    try {
      const mediaSnap = await getDocs(collection(db, 'site_media'));
      for (const mediaDoc of mediaSnap.docs) {
        const data = mediaDoc.data();
        if (isBase64Image(data.url)) {
          const permanentUrl = await uploadBase64Image(data.url, {
            folder: 'media',
            customFilename: `site-${mediaDoc.id}-${Date.now()}.webp`
          });

          await setDoc(
            doc(db, 'site_media', mediaDoc.id),
            {
              url: permanentUrl,
              updatedAt: serverTimestamp()
            },
            { merge: true }
          );

          summary.siteMediaMigrated++;
        }
      }
    } catch (e: any) {
      summary.errors.push(`Site media migration error: ${e.message}`);
    }

    // 4. Clean local storage cache
    try {
      const rawCached = localStorage.getItem('newark_cms_providers_v3');
      if (rawCached && rawCached.includes('data:image')) {
        const parsed = JSON.parse(rawCached);
        if (Array.isArray(parsed)) {
          let updatedCache = false;
          for (const item of parsed) {
            if (isBase64Image(item.image) || isBase64Image(item.imageUrl) || isBase64Image(item.photoUrl)) {
              // Clear cache so Firestore stream refreshes with clean URLs
              updatedCache = true;
            }
          }
          if (updatedCache) {
            localStorage.removeItem('newark_cms_providers_v3');
          }
        }
      }
    } catch (_) {}

  } catch (err: any) {
    summary.errors.push(`Global migration error: ${err.message}`);
  }

  return summary;
}
