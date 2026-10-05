import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Edit2, Trash2, Check, X, 
  Search, Image as ImageIcon, Star, Phone, Mail, 
  Globe, Eye, EyeOff, Save, Loader2, Sparkles, ArrowUpDown,
  Upload, AlertCircle, ExternalLink, RotateCcw
} from 'lucide-react';
import { 
  collection, onSnapshot, doc, setDoc, deleteDoc, 
  serverTimestamp, query, orderBy, addDoc 
} from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { Provider } from '../../types';
import { DEFAULT_PROVIDERS } from '../../data/defaultCmsData';
import { normalizeProviderKey, DEFAULT_PROVIDER_IMAGES, getProviderImage } from '../../utils/providerImages';
import MediaPickerModal from '../components/MediaPickerModal';

export default function ProvidersManager() {
  const [providers, setProviders] = useState<Provider[]>(DEFAULT_PROVIDERS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal & Editing state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'profile' | 'homepage'>('profile');
  const [editingProvider, setEditingProvider] = useState<Partial<Provider> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);

  const handleDirectPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'profile' | 'homepage' = 'profile') => {
    const file = e.target.files?.[0];
    if (!file || !editingProvider) return;

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      setPhotoUploadError('Please select a valid image (JPG, PNG, WebP, AVIF).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPhotoUploadError('File exceeds 10 MB limit.');
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoUploadError(null);

    try {
      let finalUrl = '';

      // 1. Try uploading to Cloudflare R2
      try {
        const formData = new FormData();
        formData.append('file', file);
        const pid = editingProvider.id || 'dr-deval-gadhvi';
        const res = await fetch(`/.netlify/functions/upload-provider-image?providerId=${encodeURIComponent(pid)}`, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const json = await res.json();
          if (json.imageUrl) {
            finalUrl = json.imageUrl;
          }
        }
      } catch (r2Err) {
        console.warn('R2 direct endpoint unavailable, using local client preview:', r2Err);
      }

      // 2. Client-side local reader fallback if cloud endpoint is not active
      if (!finalUrl) {
        finalUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      if (target === 'homepage') {
        setEditingProvider(prev => prev ? { ...prev, homepageImageOverride: finalUrl } : null);
      } else {
        setEditingProvider(prev => prev ? { ...prev, imageUrl: finalUrl, photoUrl: finalUrl, profileImage: finalUrl } : null);
      }

      try {
        const db = getDb();
        await addDoc(collection(db, 'media_library'), {
          name: file.name,
          url: finalUrl,
          size: file.size,
          type: file.type,
          altText: editingProvider.name || file.name.split('.')[0],
          source: finalUrl.startsWith('data:') ? 'local-upload' : 'r2',
          createdAt: serverTimestamp(),
        });
      } catch (e) {
        console.warn('Media library log skipped:', e);
      }
    } catch (err: any) {
      console.error('Direct photo upload error:', err);
      setPhotoUploadError(err.message || 'Failed to read image from device.');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  // Subscriptions & deduplication
  useEffect(() => {
    setLoading(true);
    try {
      const db = getDb();
      const q = query(collection(db, 'providers'), orderBy('displayOrder', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const canonicalMap = new Map<string, Provider>();
          snapshot.forEach((d) => {
            const raw = { id: d.id, ...(d.data() as any) } as Provider;
            const key = normalizeProviderKey(raw.id || raw.slug || raw.name || '');

            // Data sanitization: Dr. Prahlad must never hold the swapped female Framer image
            if ((key === 'prahlad-gadhavi' || key === 'prahlad-gadhvi') && (
              raw.imageUrl?.includes('aU1QUlSKO9mpYg2rCyxW7d2q0') || 
              raw.profileImage?.includes('aU1QUlSKO9mpYg2rCyxW7d2q0') || 
              raw.photoUrl?.includes('aU1QUlSKO9mpYg2rCyxW7d2q0')
            )) {
              raw.imageUrl = '/uploads/providers/prahlad-gadhavi-1789541233283.webp';
              raw.profileImage = '/uploads/providers/prahlad-gadhavi-1789541233283.webp';
              raw.photoUrl = '/uploads/providers/prahlad-gadhavi-1789541233283.webp';
            }

            if (!canonicalMap.has(key)) {
              canonicalMap.set(key, raw);
            } else {
              const existing = canonicalMap.get(key)!;
              const existingTime = new Date(existing.updatedAt || 0).getTime();
              const currTime = new Date(raw.updatedAt || 0).getTime();
              if (currTime > existingTime || (!existing.imageUrl && raw.imageUrl)) {
                canonicalMap.set(key, { ...existing, ...raw });
              }
            }
          });
          const list = Array.from(canonicalMap.values());
          list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
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
      imageUrl: '/uploads/site-media/providers-dr-sankalp.png',
      profileImage: '/uploads/site-media/providers-dr-sankalp.png',
      homepageImageOverride: '',
      altText: '',
      experienceYears: 10,
      education: ['Doctor of Medicine (MD)'],
      certifications: ['American Board of Internal Medicine'],
      languages: ['English', 'Spanish'],
      insuranceAccepted: ['Medicare', 'Medicaid', 'Horizon BCBS', 'Aetna', 'Cigna', 'UnitedHealthcare'],
      rating: 4.9,
      reviewsCount: 50,
      isAcceptingPatients: true,
      showOnHomepage: true,
      showOnProvidersPage: true,
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
    setEditingProvider({ 
      ...p,
      profileImage: p.profileImage || p.imageUrl || p.photoUrl,
      imageUrl: p.imageUrl || p.photoUrl || p.profileImage,
      showOnHomepage: p.showOnHomepage !== false,
      showOnProvidersPage: p.showOnProvidersPage !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvider || !editingProvider.name?.trim()) return;

    setIsSaving(true);
    try {
      const db = getDb();
      const id = editingProvider.id || `provider-${Date.now()}`;
      const canonicalKey = normalizeProviderKey(id || editingProvider.slug || editingProvider.name);
      const isPrahlad = canonicalKey === 'prahlad-gadhavi' || canonicalKey === 'prahlad-gadhvi';
      const canonicalId = isPrahlad ? 'dr-prahlad-gadhvi' : id;

      const payload: Partial<Provider> = {
        ...editingProvider,
        id: canonicalId,
        slug: editingProvider.slug || (isPrahlad ? 'dr-prahlad-gadhvi' : editingProvider.name.toLowerCase().replace(/[^a-z0-9]/g, '-')),
        profileImage: editingProvider.profileImage || editingProvider.imageUrl || editingProvider.photoUrl,
        imageUrl: editingProvider.imageUrl || editingProvider.profileImage || editingProvider.photoUrl,
        photoUrl: editingProvider.imageUrl || editingProvider.profileImage || editingProvider.photoUrl,
        homepageImageOverride: editingProvider.homepageImageOverride?.trim() || '',
        altText: editingProvider.altText?.trim() || editingProvider.name,
        showOnHomepage: editingProvider.showOnHomepage ?? true,
        showOnProvidersPage: editingProvider.showOnProvidersPage ?? true,
        isActive: editingProvider.isActive ?? true,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'providers', canonicalId), payload, { merge: true });

      // Clean up orphaned duplicates and keep doctor_profile synchronized
      if (isPrahlad) {
        try {
          await deleteDoc(doc(db, 'providers', 'dr-prahlad-gadhavi'));
        } catch (e) {}
        try {
          await setDoc(doc(db, 'doctor_profile', 'main'), {
            photoUrl: payload.imageUrl,
            name: payload.name,
            designation: payload.title,
            qualification: payload.credentials,
            speciality: payload.specialty,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (e) {}
      }
      
      // Update local state optimistic
      setProviders(prev => {
        const canonicalKey = normalizeProviderKey(canonicalId);
        const filtered = prev.filter(p => normalizeProviderKey(p.id || p.slug || p.name) !== canonicalKey);
        const next = [...filtered, payload as Provider];
        next.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
        return next;
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
      const canonicalKey = normalizeProviderKey(id);
      setProviders(prev => prev.filter(p => normalizeProviderKey(p.id || p.slug || p.name) !== canonicalKey));
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Providers & Doctors Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Centralized hub for doctor headshots, homepage overrides, credentials, ordering, and clinical biographies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/providers"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <ExternalLink size={14} />
            <span>View Providers Page</span>
          </a>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add New Provider</span>
          </button>
        </div>
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
          {filtered.map((provider) => {
            const resolvedImg = getProviderImage(provider);
            const hasHomepageOverride = Boolean(provider.homepageImageOverride);

            return (
              <div 
                key={provider.id}
                className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden flex flex-col ${
                  provider.isActive ? 'border-slate-200 hover:shadow-md' : 'border-slate-200 opacity-60 bg-slate-50'
                }`}
              >
                {/* Card Header with Photo */}
                <div className="p-6 flex items-start gap-4 border-b border-slate-100">
                  <div className="w-18 h-18 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 relative group">
                    <img
                      src={resolvedImg}
                      alt={provider.altText || provider.name}
                      className="w-full h-full object-cover"
                    />
                    {hasHomepageOverride && (
                      <span className="absolute bottom-1 right-1 bg-amber-500 text-white text-[9px] font-bold px-1 rounded shadow-xs" title="Has dedicated homepage photo">
                        HP
                      </span>
                    )}
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
                      {provider.title || provider.designation || 'Physician'}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {provider.specialty}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {provider.showOnHomepage !== false && (
                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Homepage Team
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Order: #{provider.displayOrder ?? 1}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {provider.bio || provider.shortBio || 'No biography entered yet.'}
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
                      <span className="text-slate-400">Live Profile:</span>
                      <a
                        href={`/providers/${provider.slug || provider.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-600 hover:text-primary-800 font-semibold inline-flex items-center gap-1"
                      >
                        <span>View Page</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(provider)}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
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
                      className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                      title="Edit provider profile & photos"
                    >
                      <Edit2 size={15} />
                    </button>

                    {deleteConfirmId === provider.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(provider.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs font-bold cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="p-1 text-slate-500 hover:text-slate-700 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(provider.id)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete provider"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
                  <p className="text-xs text-slate-500">Configure doctor headshots, homepage override portrait, and biographies</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); setEditingProvider(null); }}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Image Control Section 1: Main Provider Photo */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="w-24 h-28 rounded-2xl bg-slate-200 overflow-hidden shrink-0 border-2 border-white shadow-sm relative">
                    <img
                      src={editingProvider.imageUrl || editingProvider.profileImage || '/uploads/site-media/providers-dr-sankalp.png'}
                      alt="Provider preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Primary Provider Portrait (Profile & Directory)</h4>
                      {editingProvider.imageUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            const key = normalizeProviderKey(editingProvider.id || editingProvider.slug || editingProvider.name);
                            const def = DEFAULT_PROVIDER_IMAGES[key] || '/uploads/site-media/providers-dr-sankalp.png';
                            setEditingProvider(prev => prev ? { ...prev, imageUrl: def, photoUrl: def, profileImage: def } : null);
                          }}
                          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                          title="Reset to default authentic doctor portrait"
                        >
                          <RotateCcw size={12} />
                          <span>Reset to Default</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Official clinical portrait stored permanently in Cloudflare R2 and displayed across the website.</p>
                    
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all">
                        {isUploadingPhoto ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        <span>{isUploadingPhoto ? 'Uploading...' : '📁 Choose from PC / Computer'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          onChange={(e) => handleDirectPhotoUpload(e, 'profile')}
                          disabled={isUploadingPhoto}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMediaPickerTarget('profile');
                          setIsMediaPickerOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-xs cursor-pointer"
                      >
                        <ImageIcon size={14} />
                        <span>Media Library</span>
                      </button>
                    </div>

                    {/* Direct Image URL input */}
                    <div className="pt-1">
                      <input
                        type="text"
                        value={editingProvider.imageUrl || ''}
                        onChange={(e) => setEditingProvider({ 
                          ...editingProvider, 
                          imageUrl: e.target.value, 
                          photoUrl: e.target.value, 
                          profileImage: e.target.value 
                        })}
                        placeholder="Or paste external/hosted image URL here..."
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {photoUploadError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{photoUploadError}</span>
                  </div>
                )}
              </div>

              {/* Image Control Section 2: Homepage Override Portrait */}
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="w-20 h-24 rounded-2xl bg-slate-200 overflow-hidden shrink-0 border border-amber-300 relative">
                    {editingProvider.homepageImageOverride ? (
                      <img
                        src={editingProvider.homepageImageOverride}
                        alt="Homepage Override preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-slate-400 bg-amber-50">
                        <ImageIcon size={20} className="mb-1 text-amber-500" />
                        <span className="text-[10px] text-amber-700 font-semibold leading-tight">Using Profile Photo</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Homepage Portrait Override (Optional)</h4>
                      {editingProvider.homepageImageOverride && (
                        <button
                          type="button"
                          onClick={() => setEditingProvider(prev => prev ? { ...prev, homepageImageOverride: '' } : null)}
                          className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <Trash2 size={12} />
                          <span>Remove Override</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      If you want a dedicated 4:5 crop or alternative portrait specifically for the Homepage "Our Medical Team" section, upload or select it here. If left blank, the Primary Provider Portrait is used.
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all">
                        {isUploadingPhoto ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                        <span>Upload Homepage Photo</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          onChange={(e) => handleDirectPhotoUpload(e, 'homepage')}
                          disabled={isUploadingPhoto}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMediaPickerTarget('homepage');
                          setIsMediaPickerOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-xs cursor-pointer"
                      >
                        <ImageIcon size={13} />
                        <span>Pick from Library</span>
                      </button>
                    </div>

                    <div className="pt-1">
                      <input
                        type="text"
                        value={editingProvider.homepageImageOverride || ''}
                        onChange={(e) => setEditingProvider({ ...editingProvider, homepageImageOverride: e.target.value })}
                        placeholder="Or paste custom homepage image URL..."
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Alt Text & Traceability */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Image Alt Text (Accessibility & SEO)
                  </label>
                  <input
                    type="text"
                    value={editingProvider.altText || ''}
                    onChange={(e) => setEditingProvider({ ...editingProvider, altText: e.target.value })}
                    placeholder={`e.g. ${editingProvider.name || 'Doctor'} - Internal Medicine Physician at Newark Medical`}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={editingProvider.slug || ''}
                    onChange={(e) => setEditingProvider({ ...editingProvider, slug: e.target.value })}
                    placeholder="e.g. dr-deval-gadhvi"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
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
                    placeholder="e.g. Medical Director & Primary Care Physician"
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
                    placeholder="e.g. Adult Primary Care & Diagnostic Medicine"
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
                  placeholder="Summary of clinical dedication and patient approach..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Full Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Extended Biography (For Provider Directory & Detail Page)
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
                    Display Order (1 = First on Homepage)
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

              {/* Visibility Checkbox Toggles */}
              <div className="flex flex-wrap gap-6 pt-3 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingProvider.showOnHomepage ?? true}
                    onChange={(e) => setEditingProvider({ ...editingProvider, showOnHomepage: e.target.checked })}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span>Show on Homepage ("Our Medical Team" section)</span>
                </label>

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
                  className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
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
        title={mediaPickerTarget === 'homepage' ? 'Select Dedicated Homepage Photo' : 'Select Provider Profile Photo'}
        providerId={editingProvider?.id || 'dr-deval-gadhvi'}
        onSelectImage={(imageUrl) => {
          if (editingProvider) {
            if (mediaPickerTarget === 'homepage') {
              setEditingProvider({ ...editingProvider, homepageImageOverride: imageUrl });
            } else {
              setEditingProvider({ ...editingProvider, imageUrl, photoUrl: imageUrl, profileImage: imageUrl });
            }
          }
        }}
      />
    </div>
  );
}
