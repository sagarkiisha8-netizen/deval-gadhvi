import React, { useState, useMemo, useRef } from 'react';
import { 
  Image as ImageIcon, Search, Check, Copy, ExternalLink, 
  RotateCcw, Save, Upload, Sparkles, Filter, Eye, AlertCircle,
  CheckCircle2, Globe, Layout, Layers, ShieldCheck, HeartPulse,
  BookOpen, Compass, Stethoscope, MapPin, Tag, Sliders, ChevronRight
} from 'lucide-react';
import { useCmsData } from '../../context/CmsContext';
import { SiteMediaItem, SiteMediaCategory } from '../../types';
import { DEFAULT_SITE_MEDIA } from '../../data/defaultSiteMedia';
import MediaPickerModal from '../components/MediaPickerModal';

interface CategoryTab {
  key: SiteMediaCategory;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}

const CATEGORY_TABS: CategoryTab[] = [
  { key: 'all', label: 'All Website Images', icon: Globe, description: 'Complete centralized media catalog for the entire Newark Medical Associates website.' },
  { key: 'homepage', label: 'Homepage', icon: Layout, description: 'Hero visual, practice overview, doctor philosophy portrait, and panoramic breaks.' },
  { key: 'about', label: 'About Practice', icon: BookOpen, description: 'Clinical facility suites, heritage narrative, and physician collaboration photos.' },
  { key: 'services', label: 'Clinical Services', icon: Stethoscope, description: 'Service directory header, primary care, preventive care, diagnostics, and lab cards.' },
  { key: 'providers', label: 'Physicians & Doctors', icon: HeartPulse, description: 'Board-certified provider portraits and medical team banners.' },
  { key: 'blogs', label: 'Blog & Patient Library', icon: Layers, description: 'Health article banners, default covers, and medical reviewer avatars.' },
  { key: 'resources', label: 'Patient Resources', icon: Compass, description: 'Patient intake desk, check-in guides, and appointment checklist visuals.' },
  { key: 'contact', label: 'Contact & Location', icon: MapPin, description: '337 Bloomfield Ave exterior building photo, reception lobby, and clinic entrance.' },
  { key: 'banners', label: 'CTAs & Banners', icon: Sliders, description: 'Universal appointment booking invitations and popup scheduling headers.' },
  { key: 'backgrounds', label: 'Atmosphere & Textures', icon: Tag, description: 'Subtle clinical patterns for dark footer and light editorial sections.' },
  { key: 'gallery', label: 'Clinic Suite Gallery', icon: ImageIcon, description: 'Exam suites, cardiac ultrasound room, phlebotomy lab, and patient lounge.' },
  { key: 'branding', label: 'Logo & Identity', icon: ShieldCheck, description: 'Primary clinic logo, inverted white logo, tab favicon, and heritage seals.' },
  { key: 'seo', label: 'SEO & Social Share', icon: Globe, description: 'OpenGraph preview cards (1200x630), Twitter cards, and Google Knowledge Graph photo.' },
];

export default function WebsiteMediaManager() {
  const { siteMedia, updateSiteMediaItem, resetSiteMediaItem } = useCmsData();

  // Active category & search
  const [selectedCategory, setSelectedCategory] = useState<SiteMediaCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'custom' | 'default'>('all');

  // Media Picker state
  const [pickerTargetId, setPickerTargetId] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Full-size preview modal
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string; alt: string } | null>(null);

  // Per-item saving states and copy feedbacks
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});
  const [savedSuccessIds, setSavedSuccessIds] = useState<Record<string, boolean>>({});
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);

  // Local draft edits
  const [draftEdits, setDraftEdits] = useState<Record<string, Partial<SiteMediaItem>>>({});

  // File input ref for quick direct upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);

  // Merge default items with context items
  const allItems: SiteMediaItem[] = useMemo(() => {
    const registry: Record<string, SiteMediaItem> = { ...DEFAULT_SITE_MEDIA, ...siteMedia };
    return Object.values(registry);
  }, [siteMedia]);

  // Filter items
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.pageKey !== selectedCategory) {
        return false;
      }
      // Status filter
      const isCustom = item.url && item.url !== item.defaultUrl;
      if (filterMode === 'custom' && !isCustom) return false;
      if (filterMode === 'default' && isCustom) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.label.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.altText.toLowerCase().includes(q) ||
        item.pageKey.toLowerCase().includes(q) ||
        item.sectionKey.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q)
      );
    });
  }, [allItems, selectedCategory, filterMode, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allItems.length };
    allItems.forEach(item => {
      counts[item.pageKey] = (counts[item.pageKey] || 0) + 1;
    });
    return counts;
  }, [allItems]);

  // Draft change handler
  const handleDraftChange = (id: string, field: keyof SiteMediaItem, value: any) => {
    setDraftEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  // Get current active value for a field (draft or context item)
  const getItemValue = <K extends keyof SiteMediaItem>(item: SiteMediaItem, field: K): SiteMediaItem[K] => {
    if (draftEdits[item.id] && draftEdits[item.id][field] !== undefined) {
      return draftEdits[item.id][field] as SiteMediaItem[K];
    }
    return item[field];
  };

  // Save single item
  const handleSaveItem = async (item: SiteMediaItem) => {
    const edits = draftEdits[item.id];
    setSavingIds(prev => ({ ...prev, [item.id]: true }));
    try {
      const payload: Partial<SiteMediaItem> = {
        ...edits
      };
      await updateSiteMediaItem(item.id, payload);
      
      // Clear draft for this item
      setDraftEdits(prev => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });

      // Show success feedback
      setSavedSuccessIds(prev => ({ ...prev, [item.id]: true }));
      setTimeout(() => {
        setSavedSuccessIds(prev => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
      }, 3000);
    } catch (err) {
      console.error('Failed to save media item:', err);
    } finally {
      setSavingIds(prev => ({ ...prev, [item.id]: false }));
    }
  };

  // Reset single item
  const handleResetItem = async (item: SiteMediaItem) => {
    if (!window.confirm(`Reset "${item.label}" back to default image?`)) return;
    setSavingIds(prev => ({ ...prev, [item.id]: true }));
    try {
      await resetSiteMediaItem(item.id);
      setDraftEdits(prev => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
      setSavedSuccessIds(prev => ({ ...prev, [item.id]: true }));
      setTimeout(() => {
        setSavedSuccessIds(prev => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
      }, 2000);
    } finally {
      setSavingIds(prev => ({ ...prev, [item.id]: false }));
    }
  };

  // Copy image URL
  const handleCopyUrl = (id: string, url: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedUrlId(id);
    setTimeout(() => setCopiedUrlId(null), 2000);
  };

  // Open Media Picker for an item
  const handleOpenPicker = (item: SiteMediaItem) => {
    setPickerTargetId(item.id);
    setIsPickerOpen(true);
  };

  // Callback from Media Picker
  const handlePickerSelect = (imageUrl: string, altText?: string) => {
    if (!pickerTargetId) return;
    const target = allItems.find(i => i.id === pickerTargetId);
    if (!target) return;

    handleDraftChange(pickerTargetId, 'url', imageUrl);
    if (altText && altText.trim() !== '') {
      handleDraftChange(pickerTargetId, 'altText', altText);
    }
    setIsPickerOpen(false);
    setPickerTargetId(null);
  };

  // Direct file upload from computer
  const handleTriggerDirectUpload = (id: string) => {
    setUploadTargetId(id);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetId) return;

    let finalUrl = '';
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/.netlify/functions/upload-provider-image?providerId=${encodeURIComponent(uploadTargetId)}`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const json = await res.json();
        if (json.imageUrl) {
          finalUrl = json.imageUrl;
        }
      }
    } catch (err) {
      console.warn('R2 upload endpoint fallback in media manager:', err);
    }

    if (!finalUrl) {
      finalUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    handleDraftChange(uploadTargetId, 'url', finalUrl);
    setUploadTargetId(null);
  };

  // Save all modified items in view
  const handleSaveAll = async () => {
    const modifiedIds = Object.keys(draftEdits);
    if (modifiedIds.length === 0) return;
    setBulkSaving(true);
    try {
      for (const id of modifiedIds) {
        const edits = draftEdits[id];
        await updateSiteMediaItem(id, edits);
      }
      setDraftEdits({});
      alert(`Successfully saved all ${modifiedIds.length} modified image(s)!`);
    } catch (err) {
      console.error('Bulk save failed:', err);
      alert('Error saving some images. Please check your connection.');
    } finally {
      setBulkSaving(false);
    }
  };

  const activeCategoryMeta = CATEGORY_TABS.find(t => t.key === selectedCategory) || CATEGORY_TABS[0];
  const pendingEditsCount = Object.keys(draftEdits).length;

  return (
    <div className="space-y-6 pb-20">
      {/* Hidden File Input for Direct Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif" 
        className="hidden" 
      />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100">
                <Sparkles size={13} />
                Centralized CMS Media Control
              </span>
              <span className="text-xs font-medium text-slate-500">
                {allItems.length} Managed Images Across Website
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Website Media Manager
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl leading-relaxed">
              Every photo, hero visual, service card, doctor portrait, and background used on the public website is managed here. Changes save to persistent storage and update the live site instantly without touching code.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {pendingEditsCount > 0 && (
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={bulkSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
              >
                <Save size={16} />
                {bulkSaving ? 'Saving Changes...' : `Save All (${pendingEditsCount} Pending)`}
              </button>
            )}

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition-colors"
            >
              <ExternalLink size={15} />
              Open Live Website
            </a>
          </div>
        </div>

        {/* Global Live Sync Guarantee Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-700">Real-Time Database Sync Active:</span>
            <span>Edits automatically reflect on all public pages, tabs, and devices.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <CheckCircle2 size={14} className="text-emerald-500" />
              Fallback Safe (Zero Broken Links)
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <CheckCircle2 size={14} className="text-emerald-500" />
              SEO & Accessibility Alt-Tags
            </span>
          </div>
        </div>
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
          {CATEGORY_TABS.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.key;
            const count = categoryCounts[cat.key] || 0;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected 
                    ? 'bg-primary-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={15} className={isSelected ? 'text-white' : 'text-slate-400'} />
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isSelected ? 'bg-primary-500/40 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Subtitle & Search / Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>{activeCategoryMeta.label}</span>
            <span className="text-xs font-normal text-slate-500">
              ({filteredItems.length} of {categoryCounts[selectedCategory] || 0} shown)
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeCategoryMeta.description}
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search label, URL, alt text..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
            />
          </div>

          {/* Filter Mode */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('custom')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterMode === 'custom' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Customized
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('default')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterMode === 'default' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Default
            </button>
          </div>
        </div>
      </div>

      {/* Media Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <ImageIcon size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No images found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchQuery 
              ? `No images matched "${searchQuery}". Try clearing your search term.` 
              : 'There are no images registered under this category yet.'}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredItems.map((item) => {
            const currentUrl = getItemValue(item, 'url') || '';
            const currentAlt = getItemValue(item, 'altText') || '';
            const currentTitle = getItemValue(item, 'title') || '';
            const currentFit = getItemValue(item, 'objectFit') || 'cover';
            const currentPos = getItemValue(item, 'position') || 'center';

            const hasDraftEdits = draftEdits[item.id] !== undefined;
            const isSaving = savingIds[item.id] || false;
            const isSaved = savedSuccessIds[item.id] || false;
            const isCustomized = currentUrl !== item.defaultUrl;

            return (
              <div 
                key={item.id}
                id={`media-item-${item.id}`}
                className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
                  hasDraftEdits 
                    ? 'border-amber-300 ring-2 ring-amber-100' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header Bar for Item */}
                <div className="bg-slate-50/75 px-6 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-600"></span>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {item.label}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-200/80 text-slate-600">
                      ID: {item.id}
                    </span>
                    {isCustomized ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Customized
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        Default Photo
                      </span>
                    )}
                  </div>

                  {/* Location and Live Section Link */}
                  <div className="flex items-center gap-3 text-xs">
                    {item.pageRoute && (
                      <a
                        href={item.pageRoute}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-semibold hover:underline"
                        title="View this image live on public page"
                      >
                        <Eye size={14} />
                        View Live on Website
                      </a>
                    )}
                  </div>
                </div>

                {/* Main Content Layout */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Image Preview Box */}
                    <div className="lg:col-span-4 flex flex-col justify-between">
                      <div>
                        <div className="relative group rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-4/3 flex items-center justify-center">
                          {currentUrl ? (
                            <img
                              src={currentUrl}
                              alt={currentAlt || item.label}
                              className="w-full h-full transition-transform duration-300 group-hover:scale-105"
                              style={{ 
                                objectFit: currentFit, 
                                objectPosition: currentPos 
                              }}
                              onError={(e) => {
                                // Fallback if link is broken
                                (e.target as HTMLImageElement).src = item.defaultUrl;
                              }}
                            />
                          ) : (
                            <div className="p-6 text-center text-slate-400">
                              <ImageIcon size={36} className="mx-auto mb-2 text-slate-300" />
                              <span className="text-xs font-medium block">No custom image provided</span>
                              <span className="text-[10px] text-slate-400 block mt-1">(Using clinic vector badge)</span>
                            </div>
                          )}

                          {/* Hover Overlay with Preview Zoom */}
                          {currentUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewImage({ url: currentUrl, title: item.label, alt: currentAlt })}
                              className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 text-xs font-semibold backdrop-blur-xs"
                            >
                              <Eye size={16} />
                              Enlarge Preview
                            </button>
                          )}
                        </div>

                        {/* Dimensions & Specs Badge */}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                            📐 Recommended: {item.recommendedDimensions || 'Responsive'}
                          </span>
                          {item.aspectRatio && (
                            <span className="text-slate-400 font-mono">
                              Ratio: {item.aspectRatio}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Image Action Buttons */}
                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenPicker(item)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold text-xs rounded-xl transition-colors border border-primary-100"
                        >
                          <ImageIcon size={14} />
                          Media Library
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTriggerDirectUpload(item.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-colors"
                        >
                          <Upload size={14} />
                          Upload File
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Editable Metadata & Controls */}
                    <div className="lg:col-span-8 space-y-4">
                      {/* Description & Website placement */}
                      {item.description && (
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                          <span className="font-semibold text-slate-800">Placement Note: </span>
                          {item.description}
                        </div>
                      )}

                      {/* Active Image URL Field */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Image Source URL (Direct URL or Media Asset)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={currentUrl}
                            onChange={(e) => handleDraftChange(item.id, 'url', e.target.value)}
                            placeholder="https://images.unsplash.com/... or /path-to-image.webp"
                            className="flex-1 px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          />
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(item.id, currentUrl)}
                            title="Copy URL to clipboard"
                            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                          >
                            {copiedUrlId === item.id ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                          </button>
                          {currentUrl && (
                            <a
                              href={currentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open image in new tab"
                              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Alt Text & Caption */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                            <span>Image Alt Text</span>
                            <span className="text-[10px] text-emerald-600 font-semibold">Accessibility & SEO</span>
                          </label>
                          <input
                            type="text"
                            value={currentAlt}
                            onChange={(e) => handleDraftChange(item.id, 'altText', e.target.value)}
                            placeholder="Descriptive text for visually impaired and search engines..."
                            className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Title / Caption (Optional)
                          </label>
                          <input
                            type="text"
                            value={currentTitle}
                            onChange={(e) => handleDraftChange(item.id, 'title', e.target.value)}
                            placeholder="Internal label or hover tooltip..."
                            className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          />
                        </div>
                      </div>

                      {/* Framing & Position Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Object Fit (Crop Style)
                          </label>
                          <select
                            value={currentFit}
                            onChange={(e) => handleDraftChange(item.id, 'objectFit', e.target.value)}
                            className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-primary-500"
                          >
                            <option value="cover">Cover (Fill & Crop edges proportionally)</option>
                            <option value="contain">Contain (Fit entirely without cropping)</option>
                            <option value="fill">Fill (Stretch to container)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Focal Alignment / Position
                          </label>
                          <select
                            value={currentPos}
                            onChange={(e) => handleDraftChange(item.id, 'position', e.target.value)}
                            className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-primary-500"
                          >
                            <option value="center">Center</option>
                            <option value="center top">Center Top (Best for headshots/portraits)</option>
                            <option value="center bottom">Center Bottom</option>
                            <option value="left center">Left Center</option>
                            <option value="right center">Right Center</option>
                            <option value="center 35%">Upper Third (Cinematic banners)</option>
                          </select>
                        </div>
                      </div>

                      {/* Save & Reset Action Bar */}
                      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleResetItem(item)}
                            disabled={isSaving}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          >
                            <RotateCcw size={13} />
                            Reset to Default
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          {isSaved && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 animate-fade-in">
                              <CheckCircle2 size={15} />
                              Saved Live!
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleSaveItem(item)}
                            disabled={isSaving}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all ${
                              hasDraftEdits
                                ? 'bg-primary-600 hover:bg-primary-700 text-white ring-2 ring-primary-200'
                                : 'bg-slate-900 hover:bg-slate-800 text-white'
                            }`}
                          >
                            <Save size={14} />
                            {isSaving ? 'Saving...' : hasDraftEdits ? 'Save Changes' : 'Update & Re-sync'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Media Picker Modal */}
      {isPickerOpen && (
        <MediaPickerModal
          isOpen={isPickerOpen}
          onClose={() => {
            setIsPickerOpen(false);
            setPickerTargetId(null);
          }}
          onSelectImage={handlePickerSelect}
          title="Select or Upload New Website Image"
        />
      )}

      {/* Enlarge Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{previewImage.title}</h4>
                <p className="text-xs text-slate-500">{previewImage.alt}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center overflow-auto max-h-[75vh]">
              <img
                src={previewImage.url}
                alt={previewImage.alt}
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="truncate max-w-xl font-mono">{previewImage.url}</span>
              <a
                href={previewImage.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:underline shrink-0"
              >
                Open Full Size <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
