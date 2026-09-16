import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, Plus, Edit2, Trash2, Check, X, 
  Search, Image as ImageIcon, ShieldCheck, HeartPulse, 
  Activity, FlaskConical, Scale, Eye, EyeOff, Save, 
  Loader2, Layers, Sparkles 
} from 'lucide-react';
import { 
  collection, onSnapshot, doc, setDoc, deleteDoc, 
  serverTimestamp, query, orderBy 
} from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { ServiceItem } from '../../types';
import { DEFAULT_SERVICES } from '../../data/defaultCmsData';
import MediaPickerModal from '../components/MediaPickerModal';

const CATEGORIES = [
  'Primary Care',
  'Preventive Medicine',
  'Diagnostic Solutions',
  'Chronic Care',
  'Specialized Services'
] as const;

const AVAILABLE_ICONS = [
  { name: 'Stethoscope', label: 'Stethoscope' },
  { name: 'ShieldCheck', label: 'Shield / Prevention' },
  { name: 'HeartPulse', label: 'Heart / Cardio' },
  { name: 'Activity', label: 'Activity / Pulse' },
  { name: 'FlaskConical', label: 'Lab / Phlebotomy' },
  { name: 'Scale', label: 'Scale / Weight Loss' }
];

export default function ServicesManager() {
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Modal & Editing state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<ServiceItem>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newFeatureText, setNewFeatureText] = useState('');

  useEffect(() => {
    setLoading(true);
    try {
      const db = getDb();
      const q = query(collection(db, 'services'), orderBy('displayOrder', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: ServiceItem[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
          setServices(list);
        } else {
          setServices(DEFAULT_SERVICES);
        }
        setLoading(false);
      }, (err) => {
        console.warn('Services subscription caught:', err);
        setServices(DEFAULT_SERVICES);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch {
      setServices(DEFAULT_SERVICES);
      setLoading(false);
    }
  }, []);

  const handleOpenAdd = () => {
    const newId = `srv-${Date.now()}`;
    setEditingService({
      id: newId,
      name: '',
      slug: `service-${Date.now()}`,
      category: 'Primary Care',
      shortDescription: '',
      description: '',
      iconName: 'Stethoscope',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
      keyFeatures: ['Comprehensive Evaluation', 'Personalized Plan', 'Follow-up Monitoring'],
      preparationTips: 'Please arrive 15 minutes before your scheduled appointment.',
      displayOrder: services.length + 1,
      isActive: true,
      seoTitle: 'Medical Service in Newark NJ',
      metaDescription: 'High-quality medical service provided by Newark Medical Associates.'
    });
    setNewFeatureText('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: ServiceItem) => {
    setEditingService({ ...s, keyFeatures: s.keyFeatures ? [...s.keyFeatures] : [] });
    setNewFeatureText('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.name?.trim()) return;

    setIsSaving(true);
    try {
      const db = getDb();
      const id = editingService.id || `service-${Date.now()}`;
      const payload = {
        ...editingService,
        id,
        slug: editingService.slug || editingService.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'services', id), payload, { merge: true });

      setServices(prev => {
        const index = prev.findIndex(s => s.id === id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = payload as ServiceItem;
          return updated;
        }
        return [...prev, payload as ServiceItem];
      });

      setIsModalOpen(false);
      setEditingService({});
    } catch (err) {
      console.error('Error saving service:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const db = getDb();
      await deleteDoc(doc(db, 'services', id));
      setServices(prev => prev.filter(s => s.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Delete service error:', err);
    }
  };

  const handleToggleActive = async (s: ServiceItem) => {
    try {
      const db = getDb();
      await setDoc(doc(db, 'services', s.id), { isActive: !s.isActive }, { merge: true });
      setServices(prev => prev.map(item => item.id === s.id ? { ...item, isActive: !item.isActive } : item));
    } catch (e) {
      console.error('Toggle service error:', e);
    }
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    const current = editingService.keyFeatures || [];
    setEditingService({ ...editingService, keyFeatures: [...current, newFeatureText.trim()] });
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    const current = editingService.keyFeatures || [];
    setEditingService({ ...editingService, keyFeatures: current.filter((_, i) => i !== index) });
  };

  const filtered = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Services & Diagnostics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage clinical offerings, diagnostic procedures, key features, and preparation guidelines.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search clinical services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-2" />
          <p className="text-xs">Loading services...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white py-16 text-center rounded-2xl border border-slate-200">
          <Stethoscope size={40} className="mx-auto text-slate-300 mb-2" />
          <p className="text-base font-semibold text-slate-800">No services found</p>
          <p className="text-xs text-slate-500 mt-1">Try another category filter or add a service.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((service) => (
            <div
              key={service.id}
              className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden flex flex-col ${
                service.isActive ? 'border-slate-200 hover:shadow-md' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              {/* Photo & Category Tag */}
              <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/10">
                  {service.category}
                </span>
                <span className="absolute top-3 right-3 bg-white text-primary-700 text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md">
                  #{service.displayOrder}
                </span>
              </div>

              {/* Service Info */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {service.shortDescription}
                  </p>
                </div>

                {/* Key features bullet count */}
                {service.keyFeatures && service.keyFeatures.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{service.keyFeatures.length} Clinical Highlights</span>
                    <ul className="mt-1.5 space-y-1">
                      {service.keyFeatures.slice(0, 2).map((kf, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-slate-600 truncate">
                          <Check size={12} className="text-primary-600 shrink-0" />
                          <span className="truncate">{kf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(service)}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                    service.isActive 
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {service.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{service.isActive ? 'Active' : 'Hidden'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(service)}
                    className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                    title="Edit service"
                  >
                    <Edit2 size={15} />
                  </button>

                  {deleteConfirmId === service.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(service.id)}
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
                      onClick={() => setDeleteConfirmId(service.id)}
                      className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      title="Delete service"
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
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                  <Stethoscope size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingService.name ? `Edit: ${editingService.name}` : 'Add New Clinical Service'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure descriptions, clinical bullet points, and photo assets</p>
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

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Banner Image Preview */}
              <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="w-24 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                  <img
                    src={editingService.imageUrl || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800'}
                    alt="Service preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 mb-0.5">Service Cover Photo</h4>
                  <p className="text-xs text-slate-500 mb-2.5">High-quality image showing clinical care or equipment</p>
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-xs"
                  >
                    <ImageIcon size={14} />
                    <span>Select from Media Library</span>
                  </button>
                </div>
              </div>

              {/* Name & Category */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingService.name || ''}
                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                    placeholder="e.g. In-Office Diagnostic Ultrasound"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Clinical Category
                  </label>
                  <select
                    value={editingService.category || 'Primary Care'}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Icon & Display Order */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Service Icon
                  </label>
                  <select
                    value={editingService.iconName || 'Stethoscope'}
                    onChange={(e) => setEditingService({ ...editingService, iconName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    {AVAILABLE_ICONS.map(i => (
                      <option key={i.name} value={i.name}>{i.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingService.displayOrder || 1}
                    onChange={(e) => setEditingService({ ...editingService, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Short Summary (Homepage & Grid Cards)
                </label>
                <textarea
                  rows={2}
                  value={editingService.shortDescription || ''}
                  onChange={(e) => setEditingService({ ...editingService, shortDescription: e.target.value })}
                  placeholder="Brief 1-2 sentence overview of the clinical service..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Extended Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Detailed Description (Services Details Page)
                </label>
                <textarea
                  rows={4}
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  placeholder="In-depth explanation of benefits, conditions diagnosed, and clinical protocol..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Key Features List Manager */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-900">
                  Key Highlights & Included Procedures
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    placeholder="e.g. Immediate 12-lead EKG with doctor interpretation"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
                  >
                    Add Highlight
                  </button>
                </div>
                <div className="space-y-1.5 mt-2">
                  {editingService.keyFeatures?.map((feature, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs">
                      <span className="text-slate-800">{feature}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patient Preparation Tips */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Patient Preparation Instructions
                </label>
                <input
                  type="text"
                  value={editingService.preparationTips || ''}
                  onChange={(e) => setEditingService({ ...editingService, preparationTips: e.target.value })}
                  placeholder="e.g. Fast for 8 hours prior to lab work. Bring insurance card and photo ID."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Active Toggle */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingService.isActive ?? true}
                    onChange={(e) => setEditingService({ ...editingService, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span>Publish & Display on Public Website</span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  <span>Save Service Changes</span>
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
        title="Select Service Cover Image"
        onSelectImage={(imageUrl) => {
          setEditingService(prev => ({ ...prev, imageUrl }));
        }}
      />
    </div>
  );
}
