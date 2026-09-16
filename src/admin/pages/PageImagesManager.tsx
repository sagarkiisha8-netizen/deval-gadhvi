import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Image as ImageIcon, Search, Check, Copy, ExternalLink, 
  RotateCcw, Save, Upload, Sparkles, Filter, Eye, AlertCircle,
  CheckCircle2, Globe, Layout, Layers, ShieldCheck, HeartPulse,
  BookOpen, Compass, Stethoscope, MapPin, Tag, Sliders, ChevronRight,
  Activity, Loader2, ArrowUpRight
} from 'lucide-react';
import { useCmsData } from '../../context/CmsContext';
import { SiteMediaItem } from '../../types';
import { DEFAULT_SITE_MEDIA } from '../../data/defaultSiteMedia';
import MediaPickerModal from '../components/MediaPickerModal';
import { uploadMediaFile } from '../../utils/mediaStorage';
import { getProviderImage } from '../../utils/providerImages';

export type PageSectionKey = 'homepage' | 'about' | 'services' | 'diagnostics' | 'providers' | 'contact' | 'gallery';

interface PageSectionConfig {
  key: PageSectionKey;
  label: string;
  badge: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  liveUrl: string;
  title: string;
  description: string;
}

const PAGE_SECTIONS: PageSectionConfig[] = [
  {
    key: 'homepage',
    label: 'Home Page',
    badge: 'Flagship',
    icon: Layout,
    liveUrl: '/',
    title: 'Home Page Images',
    description: 'Images displayed on the Newark Medical Associates homepage, including the hero physician portrait, about overview, and care philosophy.'
  },
  {
    key: 'about',
    label: 'About Page',
    badge: 'Heritage',
    icon: BookOpen,
    liveUrl: '/about',
    title: 'About Practice Images',
    description: 'Images displayed on the About Us page (/about), including the clinical facility landscape banner and practice heritage narrative.'
  },
  {
    key: 'services',
    label: 'Services Page',
    badge: 'Clinical',
    icon: Stethoscope,
    liveUrl: '/services',
    title: 'Services & Treatments Images',
    description: 'Images displayed across the Clinical Services directory (/services) and individual service detail pages.'
  },
  {
    key: 'diagnostics',
    label: 'Diagnostics Page',
    badge: 'Lab & EKG',
    icon: Activity,
    liveUrl: '/diagnostics',
    title: 'In-Office Diagnostics Images',
    description: 'Images displayed on the Diagnostics page (/diagnostics) for EKGs, echocardiograms, ultrasound, and on-site lab draws.'
  },
  {
    key: 'providers',
    label: 'Doctor Portraits',
    badge: 'Physicians',
    icon: HeartPulse,
    liveUrl: '/providers',
    title: 'Doctor & Physician Portraits',
    description: 'Official clinical portraits for Dr. Deval Gadhvi, Dr. Prahlad Gadhavi, and Dr. Sankalp Pathak across the website and blog.'
  },
  {
    key: 'contact',
    label: 'Contact & Location',
    badge: 'Newark Clinic',
    icon: MapPin,
    liveUrl: '/contact',
    title: 'Contact & Location Images',
    description: 'Images displayed on Contact Us (/contact) and the Newark Location Guide (/newark-nj) showing the 337 Bloomfield Ave clinic exterior and reception.'
  },
  {
    key: 'gallery',
    label: 'Facility Gallery',
    badge: 'Suites',
    icon: ImageIcon,
    liveUrl: '/gallery',
    title: 'Clinic Suite & Facility Gallery',
    description: 'Photographs of examination suites, cardiac diagnostic rooms, phlebotomy stations, and patient areas.'
  }
];

export default function PageImagesManager() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPageParam = searchParams.get('page') as PageSectionKey | null;
  const initialPage = rawPageParam && PAGE_SECTIONS.some(p => p.key === rawPageParam) ? rawPageParam : 'homepage';

  const [activePage, setActivePage] = useState<PageSectionKey>(initialPage);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    siteMedia, 
    updateSiteMediaItem, 
    resetSiteMediaItem,
    homeContent,
    updateHomePageContent,
    aboutContent,
    updateAboutPageContent,
    providers,
    updateProvider
  } = useCmsData();

  // Sync state with URL search param
  useEffect(() => {
    if (rawPageParam && rawPageParam !== activePage && PAGE_SECTIONS.some(p => p.key === rawPageParam)) {
      setActivePage(rawPageParam);
    }
  }, [rawPageParam]);

  const handleSelectPage = (pageKey: PageSectionKey) => {
    setActivePage(pageKey);
    setSearchParams({ page: pageKey });
  };

  // Media Picker state
  const [pickerTargetId, setPickerTargetId] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Full-size image preview modal
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string; alt: string } | null>(null);

  // Saving states & draft values
  const [draftEdits, setDraftEdits] = useState<Record<string, Partial<SiteMediaItem>>>({});
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});
  const [savedSuccessIds, setSavedSuccessIds] = useState<Record<string, boolean>>({});
  const [uploadingTargetId, setUploadingTargetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Merge default items with context items
  const allItems: SiteMediaItem[] = useMemo(() => {
    const registry: Record<string, SiteMediaItem> = { ...DEFAULT_SITE_MEDIA, ...siteMedia };
    return Object.values(registry);
  }, [siteMedia]);

  // Active section config
  const activeConfig = useMemo(() => {
    return PAGE_SECTIONS.find(p => p.key === activePage) || PAGE_SECTIONS[0];
  }, [activePage]);

  // Filter items for current active page
  const pageItems = useMemo(() => {
    return allItems.filter(item => {
      if (item.pageKey !== activePage) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.label.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.altText.toLowerCase().includes(q)
      );
    });
  }, [allItems, activePage, searchQuery]);

  // Get item value with draft fallback
  const getItemValue = (item: SiteMediaItem): SiteMediaItem => {
    const draft = draftEdits[item.id];
    return {
      ...item,
      ...draft
    };
  };

  const handleDraftChange = (id: string, updates: Partial<SiteMediaItem>) => {
    setDraftEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...updates
      }
    }));
  };

  // Save changes
  const handleSaveItem = async (item: SiteMediaItem) => {
    const current = getItemValue(item);
    setSavingIds(prev => ({ ...prev, [item.id]: true }));

    try {
      await updateSiteMediaItem(item.id, {
        url: current.url,
        altText: current.altText,
        title: current.title,
        objectFit: current.objectFit,
        position: current.position
      });

      // Synchronize with specific page CMS structures if applicable
      if (item.id === 'home-hero-main' && updateHomePageContent) {
        await updateHomePageContent({
          hero: {
            ...homeContent?.hero,
            heroImage: current.url
          } as any
        });
      } else if (item.id === 'about-facility-main' && updateAboutPageContent) {
        await updateAboutPageContent({
          facilityImageUrl: current.url
        } as any);
      } else if (item.id.startsWith('provider-') && providers && updateProvider) {
        const matchingProv = providers.find(p => 
          item.id.includes(p.slug || '') || 
          p.name.toLowerCase().includes(item.imageKey.toLowerCase().replace(/-/g, ' '))
        );
        if (matchingProv) {
          await updateProvider(matchingProv.id, { image: current.url });
        }
      }

      setSavedSuccessIds(prev => ({ ...prev, [item.id]: true }));
      showToast(`Saved "${item.label}" and updated live website!`);
      setTimeout(() => {
        setSavedSuccessIds(prev => ({ ...prev, [item.id]: false }));
      }, 3000);
    } catch (err: any) {
      alert(`Save error: ${err?.message || 'Check database connection'}`);
    } finally {
      setSavingIds(prev => ({ ...prev, [item.id]: false }));
    }
  };

  // Reset to default image
  const handleResetItem = async (item: SiteMediaItem) => {
    if (!confirm(`Reset "${item.label}" back to its default clinical image?`)) return;
    setSavingIds(prev => ({ ...prev, [item.id]: true }));
    try {
      await resetSiteMediaItem(item.id);
      setDraftEdits(prev => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
      showToast(`"${item.label}" reset to default.`);
    } catch (err: any) {
      alert(`Reset error: ${err?.message || 'Error'}`);
    } finally {
      setSavingIds(prev => ({ ...prev, [item.id]: false }));
    }
  };

  // File upload
  const handleTriggerUpload = (targetId: string) => {
    setUploadingTargetId(targetId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingTargetId) return;

    try {
      const res = await uploadMediaFile(file, {
        folder: `pages/${activePage}`,
        maxWidth: 2000,
        maxHeight: 2000,
        quality: 0.92
      });

      handleDraftChange(uploadingTargetId, { url: res.url });
      
      const targetItem = allItems.find(i => i.id === uploadingTargetId);
      if (targetItem) {
        await updateSiteMediaItem(uploadingTargetId, { url: res.url });
        showToast(`Uploaded & assigned new image for "${targetItem.label}"!`);
      }
    } catch (err: any) {
      alert(`Upload error: ${err?.message || 'Error uploading file'}`);
    } finally {
      setUploadingTargetId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Website Image Management</span>
            <span>/</span>
            <span className="text-primary-600 font-bold">{activeConfig.label}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <ImageIcon className="text-primary-600" size={24} />
            <span>Page-by-Page Website Images</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Manage, replace, and upload the exact images displayed on each public website page. Changes update in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={activeConfig.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>View {activeConfig.label} Live</span>
            <ArrowUpRight size={14} className="text-slate-400" />
          </a>
        </div>
      </div>

      {/* Page Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {PAGE_SECTIONS.map((page) => {
          const Icon = page.icon;
          const isActive = page.key === activePage;
          const count = allItems.filter(i => i.pageKey === page.key).length;

          return (
            <button
              key={page.key}
              type="button"
              onClick={() => handleSelectPage(page.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-primary-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={15} />
              <span>{page.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                isActive ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Section Info Banner */}
      <div className="bg-gradient-to-r from-primary-900 via-slate-900 to-primary-950 text-white p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/10 text-primary-200 backdrop-blur-xs">
              {activeConfig.badge}
            </span>
            <span className="text-xs text-slate-300 font-mono">
              Live Route: {activeConfig.liveUrl}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">
            {activeConfig.title} ({pageItems.length} Active {pageItems.length === 1 ? 'Image' : 'Images'})
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
            {activeConfig.description}
          </p>
        </div>

        {/* Search within section */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search images on this page..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
      </div>

      {/* Image Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pageItems.map((item) => {
          const current = getItemValue(item);
          const isSaving = Boolean(savingIds[item.id]);
          const isSaved = Boolean(savedSuccessIds[item.id]);
          const isCustom = current.url !== item.defaultUrl;

          return (
            <div 
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-primary-200 transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-primary-50 text-primary-800 border border-primary-100">
                        📍 {item.pageKey.toUpperCase()} • {item.sectionKey.toUpperCase()}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 font-semibold">
                        {item.recommendedDimensions || '1200 × 800 px'}
                      </span>
                      {isCustom && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Custom Upload
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.label}
                    </h3>
                  </div>

                  <a
                    href={item.pageRoute || activeConfig.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-colors shrink-0"
                    title="View live section on website"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Image Preview & Controls Body */}
              <div className="p-5 space-y-4">
                {/* Visual Preview */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/9] max-h-[260px] group">
                  <img
                    src={current.url || item.defaultUrl}
                    alt={current.altText || item.label}
                    className="w-full h-full cursor-pointer group-hover:scale-102 transition-transform duration-300"
                    style={{
                      objectFit: (current.objectFit as any) || 'cover',
                      objectPosition: current.position || 'center'
                    }}
                    onClick={() => setPreviewImage({ url: current.url || item.defaultUrl, title: item.label, alt: current.altText })}
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute('src', item.defaultUrl);
                    }}
                  />

                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                    <span className="px-3 py-1.5 bg-white/90 text-slate-900 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5">
                      <Eye size={13} />
                      <span>Click to Enlarge</span>
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {item.aspectRatio || '16:9'}
                  </div>
                </div>

                {/* Quick Action Upload / Choose Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleTriggerUpload(item.id)}
                    className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Upload size={14} />
                    <span>Upload New Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPickerTargetId(item.id);
                      setIsPickerOpen(true);
                    }}
                    className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ImageIcon size={14} />
                    <span>Media Library</span>
                  </button>

                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => handleResetItem(item)}
                      className="py-2 px-2.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                      title="Reset to default image"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                </div>

                {/* Direct Image URL & Alt Text Form */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Direct Image URL or Asset Path
                    </label>
                    <input
                      type="text"
                      value={current.url || ''}
                      onChange={(e) => handleDraftChange(item.id, { url: e.target.value })}
                      placeholder="https://... or /image.webp"
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Alt Text & Image Title (SEO & Google Accessibility)
                    </label>
                    <input
                      type="text"
                      value={current.altText || ''}
                      onChange={(e) => handleDraftChange(item.id, { altText: e.target.value })}
                      placeholder="Descriptive text for clinical context and search engines..."
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer: Save & Status */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {isSaved ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      <span>Live on Website</span>
                    </span>
                  ) : (
                    <span>Updates live site instantly</span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => handleSaveItem(item)}
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : isSaved ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save size={13} />
                      <span>Save & Apply</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {pageItems.length === 0 && (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400 space-y-2">
          <ImageIcon size={36} className="mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">No images found for this filter</p>
          <p className="text-xs text-slate-400">Try clearing your search query or select another page tab.</p>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => {
          setIsPickerOpen(false);
          setPickerTargetId(null);
        }}
        title="Choose from Website Media Library"
        onSelectImage={(url) => {
          if (pickerTargetId) {
            handleDraftChange(pickerTargetId, { url });
            const targetItem = allItems.find(i => i.id === pickerTargetId);
            if (targetItem) {
              updateSiteMediaItem(pickerTargetId, { url });
              showToast(`Selected new image for "${targetItem.label}"!`);
            }
          }
          setIsPickerOpen(false);
          setPickerTargetId(null);
        }}
      />

      {/* Full Size Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{previewImage.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-1">{previewImage.alt}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-slate-900 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={previewImage.url}
                alt={previewImage.alt}
                className="max-h-[65vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
