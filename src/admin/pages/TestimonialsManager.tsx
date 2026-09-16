import React, { useState, useEffect } from 'react';
import { 
  MessageSquareQuote, Plus, Edit2, Trash2, Check, X, 
  Search, Star, Eye, EyeOff, Save, Loader2, Image as ImageIcon 
} from 'lucide-react';
import { 
  collection, onSnapshot, doc, setDoc, deleteDoc, 
  serverTimestamp, query, orderBy 
} from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { TestimonialItem } from '../../types';
import { DEFAULT_TESTIMONIALS } from '../../data/defaultCmsData';
import MediaPickerModal from '../components/MediaPickerModal';

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(DEFAULT_TESTIMONIALS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal & Editing state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<TestimonialItem>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    try {
      const db = getDb();
      const q = query(collection(db, 'testimonials'), orderBy('displayOrder', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: TestimonialItem[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
          setTestimonials(list);
        } else {
          setTestimonials(DEFAULT_TESTIMONIALS);
        }
        setLoading(false);
      }, (err) => {
        console.warn('Testimonials error caught:', err);
        setTestimonials(DEFAULT_TESTIMONIALS);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch {
      setTestimonials(DEFAULT_TESTIMONIALS);
      setLoading(false);
    }
  }, []);

  const handleOpenAdd = () => {
    const newId = `test-${Date.now()}`;
    setEditingItem({
      id: newId,
      patientName: '',
      location: 'Newark, NJ',
      role: 'Verified Patient',
      rating: 5,
      quote: '',
      date: 'August 2026',
      serviceTag: 'Primary Care & Prevention',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      isFeatured: true,
      displayOrder: testimonials.length + 1,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: TestimonialItem) => {
    setEditingItem({ ...t });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.patientName?.trim() || !editingItem.quote?.trim()) return;

    setIsSaving(true);
    try {
      const db = getDb();
      const id = editingItem.id || `test-${Date.now()}`;
      const payload = {
        ...editingItem,
        id,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'testimonials', id), payload, { merge: true });

      setTestimonials(prev => {
        const index = prev.findIndex(t => t.id === id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = payload as TestimonialItem;
          return updated;
        }
        return [...prev, payload as TestimonialItem];
      });

      setIsModalOpen(false);
      setEditingItem({});
    } catch (err) {
      console.error('Error saving testimonial:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const db = getDb();
      await deleteDoc(doc(db, 'testimonials', id));
      setTestimonials(prev => prev.filter(t => t.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleToggleActive = async (t: TestimonialItem) => {
    try {
      const db = getDb();
      await setDoc(doc(db, 'testimonials', t.id), { isActive: !t.isActive }, { merge: true });
      setTestimonials(prev => prev.map(item => item.id === t.id ? { ...item, isActive: !item.isActive } : item));
    } catch (e) {
      console.error('Toggle error:', e);
    }
  };

  const filtered = testimonials.filter(t => 
    t.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.quote.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Testimonials & Reviews</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage verified patient reviews, ratings, and quotes showcased on the website.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient quotes or names..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total Reviews: <span className="text-slate-900 font-bold">{testimonials.length}</span>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-2" />
          <p className="text-xs">Loading testimonials...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t) => (
            <div
              key={t.id}
              className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden flex flex-col justify-between ${
                t.isActive ? 'border-slate-200 hover:shadow-md' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              <div className="p-6 space-y-4">
                {/* Rating & Service Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  {t.serviceTag && (
                    <span className="text-[11px] font-semibold bg-primary-50 text-primary-700 px-2.5 py-0.5 rounded-full">
                      {t.serviceTag}
                    </span>
                  )}
                </div>

                {/* Quote */}
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "{t.quote}"
                </p>

                {/* Patient Profile */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  {t.avatarUrl ? (
                    <img
                      src={t.avatarUrl}
                      alt={t.patientName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                      {t.patientName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{t.patientName}</h4>
                    <p className="text-[11px] text-slate-500">
                      {t.role || 'Patient'} • {t.location || 'Newark, NJ'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(t)}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                    t.isActive 
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {t.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{t.isActive ? 'Active' : 'Hidden'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(t)}
                    className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    <Edit2 size={15} />
                  </button>

                  {deleteConfirmId === t.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(t.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs font-bold"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-1 text-slate-500 hover:text-slate-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(t.id)}
                      className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                  <MessageSquareQuote size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingItem.patientName ? `Edit: ${editingItem.patientName}` : 'Add Patient Testimonial'}
                  </h3>
                  <p className="text-xs text-slate-500">Add feedback, patient name, and 5-star rating</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.patientName || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, patientName: e.target.value })}
                  placeholder="e.g. Maria Rodriguez"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingItem.location || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                    placeholder="e.g. Newark, NJ"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Role / Relationship
                  </label>
                  <input
                    type="text"
                    value={editingItem.role || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                    placeholder="e.g. Patient of 5 Years"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Service Tag
                </label>
                <input
                  type="text"
                  value={editingItem.serviceTag || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, serviceTag: e.target.value })}
                  placeholder="e.g. Primary Care & Diagnostics"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Patient Quote *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingItem.quote || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, quote: e.target.value })}
                  placeholder="What did the patient say about their clinical care experience..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Star Rating (1 to 5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={editingItem.rating || 5}
                    onChange={(e) => setEditingItem({ ...editingItem, rating: parseInt(e.target.value) || 5 })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingItem.displayOrder || 1}
                    onChange={(e) => setEditingItem({ ...editingItem, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-primary-600 font-semibold hover:underline"
                >
                  <ImageIcon size={14} />
                  <span>Choose Patient Photo</span>
                </button>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingItem.isActive ?? true}
                    onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span>Publish Active</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Save Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        title="Select Patient Avatar"
        onSelectImage={(avatarUrl) => {
          setEditingItem(prev => ({ ...prev, avatarUrl }));
        }}
      />
    </div>
  );
}
