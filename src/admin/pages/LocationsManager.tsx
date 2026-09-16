import React, { useState, useEffect } from 'react';
import { 
  MapPin, Plus, Search, Edit2, Trash2, CheckCircle2, 
  X, Save, Phone, Clock, ExternalLink, AlertCircle, Upload 
} from 'lucide-react';
import { 
  collection, onSnapshot, doc, setDoc, deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { useAdminAuth } from '../context/AdminAuthContext';
import { logAdminActivity } from '../utils/auditLogger';
import { ClinicLocation } from '../../types';

const DEFAULT_LOCATIONS: ClinicLocation[] = [
  {
    id: 'newark-main',
    name: 'Newark Medical Associates – Main Clinical Center',
    address: '235 Chestnut St, Newark, NJ 07105',
    phone: '(973) 412-9404',
    mapsLink: 'https://maps.google.com/?q=235+Chestnut+St,+Newark,+NJ+07105',
    timings: 'Monday – Friday: 8:00 AM – 5:00 PM | Saturday: 9:00 AM – 1:00 PM',
    appointmentLink: '/appointments',
    imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800',
    isActive: true,
    displayOrder: 1
  },
  {
    id: 'ironbound-annex',
    name: 'Ironbound Diagnostics & Primary Care Suite',
    address: '172 Ferry St, Newark, NJ 07105',
    phone: '(973) 412-9404',
    mapsLink: 'https://maps.google.com/?q=172+Ferry+St,+Newark,+NJ+07105',
    timings: 'Tuesday & Thursday: 9:00 AM – 4:00 PM',
    appointmentLink: '/appointments',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
    isActive: true,
    displayOrder: 2
  }
];

export default function LocationsManager() {
  const { user } = useAdminAuth();
  const [locations, setLocations] = useState<ClinicLocation[]>(DEFAULT_LOCATIONS);
  const [editingItem, setEditingItem] = useState<ClinicLocation | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const db = getDb();
      const unsub = onSnapshot(collection(db, 'locations'), (snap) => {
        if (!snap.empty) {
          const list: ClinicLocation[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() as any }));
          list.sort((a, b) => a.displayOrder - b.displayOrder);
          setLocations(list);
        }
      }, () => {});
      return () => unsub();
    } catch {
      // offline fallback
    }
  }, []);

  const handleCreateNew = () => {
    setEditingItem({
      id: `loc-${Date.now()}`,
      name: '',
      address: '',
      phone: '(973) 412-9404',
      mapsLink: '',
      timings: 'Monday – Friday: 8:00 AM – 5:00 PM',
      appointmentLink: '/appointments',
      imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800',
      isActive: true,
      displayOrder: locations.length + 1
    });
    setIsCreating(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name.trim()) return;

    setSaving(true);
    try {
      const db = getDb();
      const toSave = {
        ...editingItem,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'locations', editingItem.id), toSave, { merge: true });

      await logAdminActivity(
        user?.email || 'admin@newarkmed.com',
        user?.displayName || 'Admin',
        isCreating ? `Created Clinic Location: ${editingItem.name}` : `Updated Clinic Location: ${editingItem.name}`,
        'settings'
      );

      setToastMessage(isCreating ? 'Location created successfully!' : 'Location updated successfully!');
      setTimeout(() => setToastMessage(null), 3000);
      setEditingItem(null);
      setIsCreating(false);
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const db = getDb();
      await deleteDoc(doc(db, 'locations', id));
      setLocations(locations.filter(l => l.id !== id));
      await logAdminActivity(
        user?.email || 'admin@newarkmed.com',
        user?.displayName || 'Admin',
        `Deleted Clinic Location: ${id}`,
        'settings'
      );
      setToastMessage('Location deleted.');
      setTimeout(() => setToastMessage(null), 3000);
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
            <MapPin size={13} />
            <span>Practice Facilities & Outpatient Suites</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Clinic Locations Management</h1>
          <p className="text-xs text-slate-500">
            Manage multi-office branches, consultation suites, parking directions, and Google Maps links.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all"
        >
          <Plus size={16} />
          <span>Add New Location</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {locations.map((loc) => (
          <div key={loc.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="h-44 w-full relative overflow-hidden bg-slate-100">
              <img
                src={loc.imageUrl}
                alt={loc.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs ${
                  loc.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'
                }`}>
                  {loc.isActive ? 'Active Office' : 'Temporarily Closed'}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-3 flex-1">
              <h3 className="text-base font-bold text-slate-900">{loc.name}</h3>
              
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-primary-600 shrink-0 mt-0.5" />
                  <span>{loc.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-primary-600 shrink-0" />
                  <span>{loc.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock size={14} className="text-primary-600 shrink-0 mt-0.5" />
                  <span>{loc.timings}</span>
                </div>
              </div>

              {loc.mapsLink && (
                <div className="pt-2">
                  <a
                    href={loc.mapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:underline"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Order: #{loc.displayOrder}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setEditingItem(loc); setIsCreating(false); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-primary-700 bg-white border border-slate-200 rounded-xl transition-colors"
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(loc.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Clinic Location?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this office location from public listings?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {isCreating ? 'Add New Clinic Location' : 'Edit Location Info'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinic Name</label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Newark Medical Associates – Main Office"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Physical Address</label>
                <input
                  type="text"
                  required
                  value={editingItem.address}
                  onChange={(e) => setEditingItem({ ...editingItem, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="e.g. 235 Chestnut St, Newark, NJ 07105"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingItem.phone}
                    onChange={(e) => setEditingItem({ ...editingItem, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingItem.displayOrder}
                    onChange={(e) => setEditingItem({ ...editingItem, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Operating Hours & Consultation Days</label>
                <input
                  type="text"
                  value={editingItem.timings}
                  onChange={(e) => setEditingItem({ ...editingItem, timings: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Google Maps Link</label>
                <input
                  type="text"
                  value={editingItem.mapsLink}
                  onChange={(e) => setEditingItem({ ...editingItem, mapsLink: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="https://maps.google.com/?q=..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinic Photo URL</label>
                <input
                  type="text"
                  value={editingItem.imageUrl}
                  onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveLoc"
                  checked={editingItem.isActive}
                  onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
                />
                <label htmlFor="isActiveLoc" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Location is Open & Accepting Patients
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{saving ? 'Saving...' : 'Save Location'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
