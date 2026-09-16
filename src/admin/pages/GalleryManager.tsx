import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, Plus, Search, Trash2, CheckCircle2, 
  X, Save, Upload, Tag, AlertCircle, Edit2 
} from 'lucide-react';
import { 
  collection, onSnapshot, doc, setDoc, deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { useAdminAuth } from '../context/AdminAuthContext';
import { logAdminActivity } from '../utils/auditLogger';
import { GalleryItem } from '../../types';
import { uploadMediaFile, uploadBase64Image, isBase64Image } from '../../utils/mediaStorage';

const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Consultation Suite & Diagnostic Bay',
    category: 'clinic',
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800',
    caption: 'Private patient exam room equipped with modern diagnostic monitoring and ultrasound systems.',
    altText: 'Modern private medical consultation room at Newark Medical Associates',
    displayOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'gal-2',
    title: 'On-Site Diagnostic Laboratory',
    category: 'clinic',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
    caption: 'Certified clinical laboratory providing rapid blood chemistry, HbA1c, and lipid panels.',
    altText: 'Certified on-site laboratory for rapid clinical testing',
    displayOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'gal-3',
    title: 'Dr. Prahlad Gadhvi, MD, FACP',
    category: 'doctor',
    imageUrl: 'https://framerusercontent.com/images/aU1QUlSKO9mpYg2rCyxW7d2q0.png?width=898&height=1194',
    caption: 'Founder & Medical Director conducting clinical rounds.',
    altText: 'Dr. Prahlad Gadhvi portrait in clinical coat',
    displayOrder: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'gal-4',
    title: 'Top Physician Honors Plaque',
    category: 'awards',
    imageUrl: 'https://images.unsplash.com/photo-1578496781985-452d4a934d50?auto=format&fit=crop&q=80&w=800',
    caption: 'Annual recognition by New Jersey Monthly for clinical excellence in Internal Medicine.',
    altText: 'Medical excellence and top physician award certificate',
    displayOrder: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: 'gal-5',
    title: 'American College of Physicians Fellowship',
    category: 'certificates',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
    caption: 'FACP board fellowship credential recognizing clinical mastery and ethical leadership.',
    altText: 'American College of Physicians Fellowship Credential',
    displayOrder: 5,
    createdAt: new Date().toISOString()
  }
];

export default function GalleryManager() {
  const { user } = useAdminAuth();
  const [items, setItems] = useState<GalleryItem[]>(DEFAULT_GALLERY);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const categories = [
    { key: 'all', label: 'All Photos' },
    { key: 'clinic', label: 'Clinic & Suites' },
    { key: 'doctor', label: 'Doctor & Staff' },
    { key: 'awards', label: 'Awards & Honors' },
    { key: 'events', label: 'Events & Community' },
    { key: 'certificates', label: 'Board Certifications' },
    { key: 'media', label: 'Press & Media' }
  ];

  useEffect(() => {
    try {
      const db = getDb();
      const unsub = onSnapshot(collection(db, 'gallery'), (snap) => {
        if (!snap.empty) {
          const list: GalleryItem[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() as any }));
          list.sort((a, b) => a.displayOrder - b.displayOrder);
          setItems(list);
        }
      }, () => {});
      return () => unsub();
    } catch {
      // offline fallback
    }
  }, []);

  const handleCreateNew = () => {
    setEditingItem({
      id: `gal-${Date.now()}`,
      title: '',
      category: 'clinic',
      imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800',
      caption: '',
      altText: '',
      displayOrder: items.length + 1,
      createdAt: new Date().toISOString()
    });
    setIsCreating(true);
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.title.trim()) return;

    setSaving(true);
    try {
      let finalImageUrl = editingItem.imageUrl;
      if (isBase64Image(finalImageUrl)) {
        try {
          finalImageUrl = await uploadBase64Image(finalImageUrl, `gallery/${Date.now()}`);
        } catch (uploadErr) {
          console.warn('Could not upload base64 gallery image:', uploadErr);
        }
      }

      const db = getDb();
      const toSave = {
        ...editingItem,
        imageUrl: finalImageUrl,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'gallery', editingItem.id), toSave, { merge: true });

      await logAdminActivity(
        user?.email || 'admin@newarkmed.com',
        user?.displayName || 'Admin',
        isCreating ? `Added Gallery Image: ${editingItem.title}` : `Updated Gallery Image: ${editingItem.title}`,
        'general'
      );

      setToastMessage(isCreating ? 'Photo added to gallery!' : 'Photo details updated!');
      setTimeout(() => setToastMessage(null), 3000);
      setEditingItem(null);
      setIsCreating(false);
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingItem) {
      setIsUploading(true);
      try {
        const permanentUrl = await uploadMediaFile(file, `gallery/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
        setEditingItem((prev) => prev ? { ...prev, imageUrl: permanentUrl } : null);
      } catch (err: any) {
        alert('Upload failed: ' + (err.message || 'Unknown error'));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const db = getDb();
      await deleteDoc(doc(db, 'gallery', id));
      setItems(items.filter(i => i.id !== id));
      await logAdminActivity(
        user?.email || 'admin@newarkmed.com',
        user?.displayName || 'Admin',
        `Deleted Gallery Image: ${id}`,
        'general'
      );
      setToastMessage('Image deleted.');
      setTimeout(() => setToastMessage(null), 3000);
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const filtered = items.filter(i => selectedCategory === 'all' || i.category === selectedCategory);

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
            <ImageIcon size={13} />
            <span>Practice Media Showcase</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Clinic Photo & Awards Gallery</h1>
          <p className="text-xs text-slate-500">
            Upload, categorize, caption, and display clinic imagery, physician awards, and certificates.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all"
        >
          <Plus size={16} />
          <span>Upload Gallery Asset</span>
        </button>
      </div>

      {/* Where this displays banner */}
      <div className="p-4 bg-primary-50 border border-primary-200 rounded-2xl space-y-1">
        <div className="flex items-center gap-1.5 text-primary-800 text-xs font-bold uppercase tracking-wider">
          <span>📍 Where Gallery Photos Display</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Photos uploaded here appear across the <strong>About Us Practice Facility Tour</strong>, <strong>Doctor Credential Honors</strong>, and the <strong>Interactive Clinic Showcase</strong> modal.
        </p>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200">
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              selectedCategory === cat.key
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between group">
            <div className="h-48 w-full relative overflow-hidden bg-slate-100">
              <img
                src={item.imageUrl}
                alt={item.altText || item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {item.category}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-2 flex-1">
              <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h3>
              {item.caption && (
                <p className="text-xs text-slate-500 line-clamp-2">{item.caption}</p>
              )}
              {item.altText && (
                <p className="text-[11px] text-slate-400 truncate">Alt: {item.altText}</p>
              )}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Order #{item.displayOrder}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => { setEditingItem(item); setIsCreating(false); }}
                  className="p-1.5 text-slate-600 hover:text-primary-600 rounded-lg hover:bg-white transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                >
                  <Trash2 size={14} />
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
              <h3 className="text-base font-bold text-slate-900">Delete Photo?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this image from the clinic gallery?
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
                {isCreating ? 'Upload Gallery Asset' : 'Edit Asset Details'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Diagnostic Suite"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 bg-white"
                  >
                    <option value="clinic">Clinic & Suites</option>
                    <option value="doctor">Doctor & Staff</option>
                    <option value="awards">Awards & Honors</option>
                    <option value="events">Events & Community</option>
                    <option value="certificates">Board Certifications</option>
                    <option value="media">Press & Media</option>
                  </select>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  required
                  value={editingItem.imageUrl}
                  onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 mb-2"
                />
                <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer">
                  <Upload size={13} />
                  <span>Choose Local File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Caption / Description</label>
                <textarea
                  rows={2}
                  value={editingItem.caption}
                  onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="Optional descriptive caption..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alt Text (Accessibility & SEO)</label>
                <input
                  type="text"
                  value={editingItem.altText}
                  onChange={(e) => setEditingItem({ ...editingItem, altText: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="Describe image for screen readers"
                />
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
                  <span>{saving ? 'Saving...' : 'Save Asset'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
