import React, { useState, useEffect } from 'react';
import { 
  Bell, Save, CheckCircle2, X, Eye, EyeOff, 
  Sparkles, Calendar, ExternalLink, Image as ImageIcon 
} from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { useAdminAuth } from '../context/AdminAuthContext';
import { logAdminActivity } from '../utils/auditLogger';
import { PopupAnnouncement } from '../../types';

const DEFAULT_POPUP: PopupAnnouncement = {
  id: 'main-announcement',
  heading: 'Now Offering Onsite Diagnostic Blood Testing & Rapid EKGs',
  description: 'Schedule your comprehensive annual wellness exam with Dr. Gadhvi. Same-week appointments are currently open for new patients.',
  imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
  ctaText: 'Book Appointment Online',
  ctaLink: '/appointments',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  isEnabled: false
};

export default function PopupManager() {
  const { user } = useAdminAuth();
  const [popup, setPopup] = useState<PopupAnnouncement>(DEFAULT_POPUP);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadPopup() {
      try {
        const db = getDb();
        const snap = await getDoc(doc(db, 'settings', 'popup'));
        if (snap.exists()) {
          setPopup({ ...DEFAULT_POPUP, ...snap.data() as PopupAnnouncement });
        }
      } catch (err) {
        console.warn('Popup load fallback:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPopup();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const db = getDb();
      const toSave = {
        ...popup,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'settings', 'popup'), toSave, { merge: true });

      await logAdminActivity(
        user?.email || 'admin@newarkmed.com',
        user?.displayName || 'Admin',
        popup.isEnabled ? `Activated Website Popup: "${popup.heading}"` : `Deactivated Website Popup`,
        'homepage'
      );

      setToastMessage('Popup announcement updated successfully!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toastMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button type="button" onClick={() => setToastMessage(null)}><X size={14} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-bold mb-2">
            <Bell size={13} />
            <span>Visitor Alert System</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Website Popup & Announcements</h1>
          <p className="text-xs text-slate-500">
            Publish prominent modal banners for special announcements, holiday clinic hours, or seasonal flu vaccination clinics.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50 transition-all"
        >
          <Save size={15} />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Enable / Disable Switch */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">Announcement Modal Status</h3>
            <p className="text-xs text-slate-500">
              When enabled, visitors will see this modal card upon arriving on the homepage.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPopup(p => ({ ...p, isEnabled: !p.isEnabled }))}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              popup.isEnabled
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {popup.isEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>{popup.isEnabled ? 'Popup is Active' : 'Popup is Disabled'}</span>
          </button>
        </div>

        {/* Content Configuration */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Popup Content & Details</h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Banner Heading</label>
            <input
              type="text"
              required
              value={popup.heading}
              onChange={(e) => setPopup({ ...popup, heading: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
              placeholder="e.g. Seasonal Flu Clinics Now Open"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Description</label>
            <textarea
              rows={3}
              required
              value={popup.description}
              onChange={(e) => setPopup({ ...popup, description: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
              placeholder="Detailed notification copy for patients..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">CTA Button Text</label>
              <input
                type="text"
                value={popup.ctaText || ''}
                onChange={(e) => setPopup({ ...popup, ctaText: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                placeholder="e.g. Book Appointment"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">CTA Target Link</label>
              <input
                type="text"
                value={popup.ctaLink || ''}
                onChange={(e) => setPopup({ ...popup, ctaLink: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                placeholder="e.g. /appointments or tel:(973) 412-9404"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={popup.startDate || ''}
                onChange={(e) => setPopup({ ...popup, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Date (Auto-expire)</label>
              <input
                type="date"
                value={popup.endDate || ''}
                onChange={(e) => setPopup({ ...popup, endDate: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Optional Feature Image URL</label>
              <input
                type="text"
                value={popup.imageUrl || ''}
                onChange={(e) => setPopup({ ...popup, imageUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-400">Live Modal Visual Preview</span>
          <div className="bg-white text-slate-900 rounded-2xl p-6 max-w-lg mx-auto shadow-2xl space-y-4">
            {popup.imageUrl && (
              <img src={popup.imageUrl} alt="Announcement preview" className="w-full h-36 object-cover rounded-xl" />
            )}
            <h4 className="text-base font-bold text-slate-900">{popup.heading}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{popup.description}</p>
            {popup.ctaText && (
              <button type="button" className="w-full py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold shadow-sm">
                {popup.ctaText}
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Publishing...' : 'Save & Publish Announcement'}
          </button>
        </div>
      </form>
    </div>
  );
}
