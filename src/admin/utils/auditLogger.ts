import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { ActivityLog } from '../../types';

export async function logAdminActivity(
  userEmail: string,
  userName: string,
  action: string,
  category: ActivityLog['category'] = 'general',
  details?: string
) {
  try {
    const db = getDb();
    await addDoc(collection(db, 'admin_activities'), {
      user: userName || userEmail || 'Administrator',
      userEmail: userEmail || 'admin@newarkmed.com',
      action,
      category,
      details: details || '',
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.warn('Activity logging fallback/offline:', err);
  }
}
