import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Edit2, Trash2, Check, X, 
  Search, Image as ImageIcon, Star, Phone, Mail, 
  Globe, Eye, EyeOff, Save, Loader2, Sparkles, ArrowUpDown 
} from 'lucide-react';
import { 
  collection, onSnapshot, doc, setDoc, deleteDoc, 
  serverTimestamp, query, orderBy 
} from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { Provider } from '../../types';
import { DEFAULT_PROVIDERS } from '../../data/defaultCmsData';
import MediaPickerModal from '../components/MediaPickerModal';

export default function ProvidersManager() {
  const [providers, setProviders] = useState<Provider[]>(DEFAULT_PROVIDERS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal & Editing state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Partial<Provider> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Subscriptions
  useEffect(() => {
    setLoading(true);
    try {
      const db = getDb();
      const q = query(collection(db, 'providers'), orderBy('displayOrder', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: Provider[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
          setProviders(list);
        } else {
          setProviders(DEFAULT_PROVIDERS);
        }
        setLoading(false);
      }, (err) => {
        console.warn('Providers subscription error:', err);
        setProviders(DEFAULT_PROVIDERS);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch {
      setProviders(DEFAULT_PROVIDERS);
      setLoading(false);
    }
  }, []);

  const handleOpenAdd = () => {
    const newId = `dr-${Date.now()}`;
    setEditingProvider({
      id: newId,
      name: '',
      credentials: 'MD',
      title: 'Primary Care Physician',
      specialty: 'Internal Medicine & Preventative Care',
      bio: '',
      fullBio: '',
      imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
      experienceYears: 10,
      education: ['Doctor of Medicine (MD)'],
      certifications: ['American Board of Internal Medicine'],
      languages: ['English', 'Spanish'],
      insuranceAccepted: ['Medicare', 'Medicaid', 'Horizon BCBS', 'Aetna', 'Cigna', 'UnitedHealthcare'],
      rating: 4.9,
      reviewsCount: 50,
      isAcceptingPatients: true,
      phone: '(973) 412-9404',
      email: 'medicalnewark@gmail.com',
      appointmentDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      displayOrder: providers.length + 1,
      isActive: true,
      slug: `doctor-${Date.now()}`,
      seoTitle: 'Physician at Newark Medical Associates',
      metaDescription: 'Book an appointment at Newark Medical Associates.'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Provider) => {
    setEditingProvider({ ...p });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvider || !editingProvider.name?.trim()) return;

    setIsSaving(true);
    try {
      const db = getDb();
      const id = editingProvider.id || `provider-${Date.now()}`;
      const payload = {
        ...editingProvider,
        id,
        slug: editingProvider.slug || editingProvider.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'providers', id), payload, { merge: true });
      
      // Update local state optimistic
      setProviders(prev => {
        const index = prev.findIndex(p => p.id === id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = payload as Provider;
          return updated;
        }
        return [...prev, payload as Provider];
      });

      setIsModalOpen(false);
      setEditingProvider(null);
    } catch (err) {
      console.error('Error saving provider:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const db = getDb();
      await deleteDoc(doc(db, 'providers', id));
      setProviders(prev => prev.filter(p => p.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Delete provider error:', err);
    }
  };

  const handleToggleActive = async (p: Provider) => {
    try {
      const db = getDb();
      await setDoc(doc(db, 'providers', p.id), { isActive: !p.isActive }, { merge: true });
      setProviders(prev => prev.map(item => item.id === p.id ? { ...item, isActive: !item.isActive } : item));
    } catch (e) {
      console.error('Toggle error:', e);
    }
  };

  const filtered = providers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Providers Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Add, update, or reorder doctors, physicians, and clinical staff displayed on the website.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Provider</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search providers by name, specialty, or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total Providers: <span className="text-slate-900 font-bold">{providers.length}</span> (Active: {providers.filter(p => p.isActive).length})
        </div>
      </div>

      {/* Providers Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-2" />
          <p className="text-xs">Loading medical providers...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white py-16 text-center rounded-2xl border border-slate-200">
          <Users size={40} className="mx-auto text-slate-300 mb-2" />
          <p className="text-base font-semibold text-slate-800">No providers found</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or add a new doctor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((provider) => (
            <div 
              key={provider.id}
              className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden flex flex-col ${
                provider.isActive ? 'border-slate-200 hover:shadow-md' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              {/* Card Header with Photo */}
              <div className="p-6 flex items-start gap-4 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  <img
                    src={provider.imageUrl}
                    alt={provider.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {provider.name}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {provider.credentials}
                    </span>
                  </div>
                  <p className="text-xs text-primary-600 font-semibold truncate mt-0.5">
                    {provider.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {provider.specialty}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {provider.bio}
                </p>

                {/* Badges */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Experience:</span>
                    <span className="font-semibold text-slate-800">{provider.experienceYears || 15}+ Years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Patient Rating:</span>
                    <span className="font-semibold text-amber-600 flex items-center gap-1">
                      <Star size={12} fill="currentColor" />
                      <span>{provider.rating || 4.9} ({provider.reviewsCount || 100}+ reviews)</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Accepting Patients:</span>
                    <span className={`font-semibold ${provider.isAcceptingPatients ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {provider.isAcceptingPatients ? 'Yes (Open)' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(provider)}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                    provider.isActive 
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {provider.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{provider.isActive ? 'Active' : 'Hidden'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(provider)}
                    className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                    title="Edit provider"
                  >
                    <Edit2 size={15} />
                  </button>

                  {deleteConfirmId === provider.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(provider.id)}
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
                      onClick={() => setDeleteConfirmId(provider.id)}
                      className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      title="Delete provider"
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

      {/* Edit / Add Modal */}
      {isModalOpen && editingProvider && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingProvider.name ? `Edit: ${editingProvider.name}` : 'Add New Medical Provider'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure clinical credentials, biographies, and image assets</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); setEditingProvider(null); }}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Photo Selector */}
              <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="w-20 h-20 rounded-2xl bg-slate-200 overflow-hidden shrink-0 border-2 border-white shadow-sm">
                  <img
                    src={editingProvider.imageUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800'}
                    alt="Provider preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Provider Photo</h4>
                  <p className="text-xs text-slate-500 mb-3">Professional high-resolution headshot in medical attire</p>
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-xs"
                  >
                    <ImageIcon size={14} />
                    <span>Choose from Media Library / Upload</span>
                  </button>
                </div>
              </div>

              {/* Row 1: Name & Credentials */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Provider Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProvider.name || ''}
                    onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })}
                    placeholder="e.g. Dr. Prahlad Gadhvi"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Credentials & Post-Nominals
                  </label>
                  <input
                    type="text"
                    value={editingProvider.credentials || ''}
                    onChange={(e) => setEditingProvider({ ...editingProvider, credentials: e.target.value })}
                    placeholder="e.g. MD, FACP"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Row 2: Title & Specialty */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Designation / Clinical Title
                  </label>
                  <input
                    type="text"
                    value={editingProvider.title || ''}
                    onChange={(e) => setEditingProvider({ ...editingProvider, title: e.target.value })}
                    placeholder="e.g. Medical Director & Founder"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Specialty Area
                  </label>
                  <input
                    type="text"
                    value={editingProvider.specialty || ''}
                    onChange={(e) => setEditingProvider({ ...editingProvider, specialty: e.target.value })}
                    placeholder="e.g. Internal Medicine & Preventive Health"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Short Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Short Bio (Displayed on Cards & Homepage)
                </label>
                <textarea
                  rows={2}
                  value={editingProvider.bio || ''}
                  onChange={(e) => setEditingProvider({ ...editingProvider, bio: e.target.value })}
                  placeholder="Summary of experience and approach to patient care..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Full Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Extended Biography (For Provider Directory Page)
                </label>
                <textarea
                  rows={4}
                  value={editingProvider.fullBio || ''}
                  onChange={(e) => setEditingProvider({ ...editingProvider, fullBio: e.target.value })}
                  placeholder="Detailed education, career history, philosophy..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Row 3: Experience, Rating, Display Order */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={editingProvider.experienceYears || 15}
                    onChange={(e) => setEditingProvider({ ...editingProvider, experienceYears: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Star Rating (e.g. 4.9)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={editingProvider.rating || 4.9}
                    onChange={(e) => setEditingProvider({ ...editingProvider, rating: parseFloat(e.target.value) || 4.9 })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingProvider.displayOrder || 1}
                    onChange={(e) => setEditingProvider({ ...editingProvider, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Languages & Phone */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Languages Spoken (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editingProvider.languages?.join(', ') || ''}
                    onChange={(e) => setEditingProvider({ ...editingProvider, languages: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="English, Spanish, Gujarati, Hindi"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Direct Clinical Phone
                  </label>
                  <input
                    type="text"
                    value={editingProvider.phone || '(973) 412-9404'}
                    onChange={(e) => setEditingProvider({ ...editingProvider, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Checkbox Toggles */}
              <div className="flex flex-wrap gap-6 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingProvider.isActive ?? true}
                    onChange={(e) => setEditingProvider({ ...editingProvider, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span>Active & Visible on Website</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingProvider.isAcceptingPatients ?? true}
                    onChange={(e) => setEditingProvider({ ...editingProvider, isAcceptingPatients: e.target.checked })}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span>Accepting New Patients</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingProvider(null); }}
                  className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Save Provider Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        title="Select Provider Profile Photo"
        onSelectImage={(imageUrl) => {
          if (editingProvider) {
            setEditingProvider({ ...editingProvider, imageUrl });
          }
        }}
      />
    </div>
  );
}
