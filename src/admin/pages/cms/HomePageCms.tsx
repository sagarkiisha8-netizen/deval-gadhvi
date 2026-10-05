import React, { useState } from 'react';
import { 
  Home, Save, Loader2, Image as ImageIcon, Eye, 
  CheckCircle2, Plus, Trash2, HelpCircle, Layers, 
  Sparkles, ExternalLink 
} from 'lucide-react';
import { useCmsData } from '../../../context/CmsContext';
import { HomePageContent, FaqItem } from '../../../types';
import MediaPickerModal from '../../components/MediaPickerModal';

export default function HomePageCms() {
  const { homeContent, updateHomePageContent } = useCmsData();
  const [formData, setFormData] = useState<HomePageContent>(homeContent);
  const [activeTab, setActiveTab] = useState<'hero' | 'stats' | 'about' | 'faq' | 'cta' | 'visibility'>('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  
  // FAQ editing
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // Sync if context updates
  React.useEffect(() => {
    setFormData(homeContent);
  }, [homeContent]);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateHomePageContent(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving home content:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    const newItem: FaqItem = {
      id: `faq-${Date.now()}`,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      displayOrder: (formData.faq.items?.length || 0) + 1
    };
    setFormData({
      ...formData,
      faq: {
        ...formData.faq,
        items: [...(formData.faq.items || []), newItem]
      }
    });
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleRemoveFaq = (id: string) => {
    setFormData({
      ...formData,
      faq: {
        ...formData.faq,
        items: formData.faq.items.filter(item => item.id !== id)
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Homepage CMS Editor</h1>
          <p className="text-sm text-slate-500 mt-1">
            Customize heroes, statistics, FAQ lists, and section visibility with real-time updates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <ExternalLink size={14} />
            <span>View Live Site</span>
          </a>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Homepage updates saved to Firestore successfully! Live website refreshed.</span>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        {[
          { id: 'hero', label: 'Hero Banner' },
          { id: 'stats', label: 'Key Statistics' },
          { id: 'about', label: 'About Preview' },
          { id: 'faq', label: 'FAQ Accordion' },
          { id: 'cta', label: 'Bottom CTA' },
          { id: 'visibility', label: 'Section Visibility' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* HERO SECTION */}
        {activeTab === 'hero' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Hero Banner Configuration
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Left Column: Headline & Texts */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Eyebrow Subtitle (e.g. PRIMARY CARE IN NEWARK)
                  </label>
                  <input
                    type="text"
                    value={formData.hero.heroSubtitle || formData.hero.badgeText}
                    onChange={(e) => setFormData({
                      ...formData,
                      hero: { 
                        ...formData.hero, 
                        heroSubtitle: e.target.value,
                        badgeText: e.target.value 
                      }
                    })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Hero Main Headline (Title)
                  </label>
                  <input
                    type="text"
                    placeholder="Medicine That Feels Personal."
                    value={formData.hero.heroTitle || `${formData.hero.headline} ${formData.hero.highlightedHeadline}`.trim()}
                    onChange={(e) => setFormData({
                      ...formData,
                      hero: { 
                        ...formData.hero, 
                        heroTitle: e.target.value,
                        headline: e.target.value
                      }
                    })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Hero Description / Supporting Copy
                  </label>
                  <textarea
                    rows={3}
                    value={formData.hero.heroDescription || formData.hero.subtitle}
                    onChange={(e) => setFormData({
                      ...formData,
                      hero: { 
                        ...formData.hero, 
                        heroDescription: e.target.value,
                        subtitle: e.target.value 
                      }
                    })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.hero.showInlineAppointmentForm}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: {
                          ...formData.hero,
                          showInlineAppointmentForm: e.target.checked
                        }
                      })}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      Enable Inline Appointment Form (defaults to Modal booking)
                    </span>
                  </label>
                </div>
              </div>

              {/* Right Column: Hero Image & CTAs */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Doctor / Physician Portrait (Right Side)
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Transparent PNG / WebP portrait
                    </span>
                  </div>
                  <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#0B2545] via-[#0E3B64] to-[#0D6D8C] border border-slate-200 relative mb-3 flex items-center justify-center">
                    {(formData.hero.heroImage || formData.hero.heroImageUrl) ? (
                      <img
                        src={formData.hero.heroImage || formData.hero.heroImageUrl}
                        alt={formData.hero.heroImageAlt || 'Hero physician preview'}
                        className="w-full h-full object-contain object-bottom"
                      />
                    ) : (
                      <div className="p-4 text-center text-cyan-100 text-xs">
                        <Sparkles size={24} className="mx-auto mb-2 text-cyan-300 opacity-80" />
                        <p className="font-semibold text-white">Abstract Medical Visual (Active)</p>
                        <p className="text-[11px] text-cyan-200/80 mt-0.5">
                          No portrait uploaded yet. Gradient placeholder is automatically rendered.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="mb-3 space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Quick Portrait Presets:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          hero: {
                            ...formData.hero,
                            heroImage: '/newark_internal_medicine_4.webp',
                            heroImageUrl: '/newark_internal_medicine_4.webp'
                          }
                        })}
                        className={`px-3 py-2 text-left rounded-xl text-xs font-semibold border transition-all ${
                          (formData.hero.heroImage === '/newark_internal_medicine_4.webp' || formData.hero.heroImageUrl === '/newark_internal_medicine_4.webp')
                            ? 'bg-primary-50 border-primary-500 text-primary-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block font-bold">Portrait 2 (Current)</span>
                        <span className="text-[10px] text-slate-500">Unrounded sharp cut</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          hero: {
                            ...formData.hero,
                            heroImage: '/newark_internal_medicine_3.webp',
                            heroImageUrl: '/newark_internal_medicine_3.webp'
                          }
                        })}
                        className={`px-3 py-2 text-left rounded-xl text-xs font-semibold border transition-all ${
                          (formData.hero.heroImage === '/newark_internal_medicine_3.webp' || formData.hero.heroImageUrl === '/newark_internal_medicine_3.webp')
                            ? 'bg-primary-50 border-primary-500 text-primary-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block font-bold">Portrait 1 (Alternate)</span>
                        <span className="text-[10px] text-slate-500">First clinic portrait</span>
                      </button>
                    </div>
                  </div>

                  {/* Direct Image URL Input */}
                  <div className="mb-3">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Or Paste Image / Portrait URL:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. /newark_internal_medicine_4.webp or https://..."
                      value={formData.hero.heroImage || formData.hero.heroImageUrl || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: {
                          ...formData.hero,
                          heroImage: e.target.value,
                          heroImageUrl: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <ImageIcon size={14} />
                      <span>{(formData.hero.heroImage || formData.hero.heroImageUrl) ? 'Change Portrait (Media Library)' : 'Upload Portrait'}</span>
                    </button>
                    {(formData.hero.heroImage || formData.hero.heroImageUrl) && (
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          hero: {
                            ...formData.hero,
                            heroImage: '',
                            heroImageUrl: ''
                          }
                        })}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-medium transition-colors"
                      >
                        <Trash2 size={13} />
                        <span>Remove (Use Abstract)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Hero Video Configuration */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Hero Clinic Video (Optional)
                    </label>
                    <span className="text-[10px] text-slate-500">YouTube, Vimeo, or MP4</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Video URL
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://www.youtube.com/watch?v=... or https://.../video.mp4"
                      value={formData.hero.videoUrl || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, videoUrl: e.target.value }
                      })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Video Button Label
                      </label>
                      <input
                        type="text"
                        placeholder="Watch Clinic Video"
                        value={formData.hero.videoTitle || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          hero: { ...formData.hero, videoTitle: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Video Mode
                      </label>
                      <select
                        value={formData.hero.videoMode || 'modal'}
                        onChange={(e) => setFormData({
                          ...formData,
                          hero: { ...formData.hero, videoMode: e.target.value as any }
                        })}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
                      >
                        <option value="modal">Modal Pop-Up Player</option>
                        <option value="embed">Embedded in Right Stage</option>
                      </select>
                    </div>
                  </div>

                  {formData.hero.videoUrl && (
                    <div className="pt-2">
                      <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                        Video linked and ready. Click "Save All Changes" to publish.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Portrait Alt Text (Accessibility & SEO)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Prahlad Gadhvi, Board-Certified Physician"
                    value={formData.hero.heroImageAlt || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      hero: { ...formData.hero, heroImageAlt: e.target.value }
                    })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Primary CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.hero.primaryCtaText}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, primaryCtaText: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Secondary CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.hero.secondaryCtaText}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, secondaryCtaText: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Floating Stat Number
                    </label>
                    <input
                      type="text"
                      value={formData.hero.statNumber}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, statNumber: e.target.value }
                      })}
                      placeholder="e.g. 1,000+"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Floating Stat Label
                    </label>
                    <input
                      type="text"
                      value={formData.hero.statLabel}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, statLabel: e.target.value }
                      })}
                      placeholder="e.g. Appointments Completed"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STATS SECTION */}
        {activeTab === 'stats' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Practice Metric Highlights
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['stat1', 'stat2', 'stat3', 'stat4'] as const).map((key, index) => (
                <div key={key} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-[11px] font-bold text-primary-700 uppercase tracking-wider">
                    Stat #{index + 1}
                  </span>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Metric / Number
                    </label>
                    <input
                      type="text"
                      value={formData.stats[key].number}
                      onChange={(e) => setFormData({
                        ...formData,
                        stats: {
                          ...formData.stats,
                          [key]: { ...formData.stats[key], number: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={formData.stats[key].label}
                      onChange={(e) => setFormData({
                        ...formData,
                        stats: {
                          ...formData.stats,
                          [key]: { ...formData.stats[key], label: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.stats[key].desc}
                      onChange={(e) => setFormData({
                        ...formData,
                        stats: {
                          ...formData.stats,
                          [key]: { ...formData.stats[key], desc: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT PREVIEW */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              About Practice Section (Homepage Preview)
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Section Pill Tag
                </label>
                <input
                  type="text"
                  value={formData.aboutPreview.tag}
                  onChange={(e) => setFormData({
                    ...formData,
                    aboutPreview: { ...formData.aboutPreview, tag: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Years of Experience Badge
                </label>
                <input
                  type="text"
                  value={formData.aboutPreview.experienceYears}
                  onChange={(e) => setFormData({
                    ...formData,
                    aboutPreview: { ...formData.aboutPreview, experienceYears: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Section Heading Title
              </label>
              <input
                type="text"
                value={formData.aboutPreview.title}
                onChange={(e) => setFormData({
                  ...formData,
                  aboutPreview: { ...formData.aboutPreview, title: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description Paragraph
              </label>
              <textarea
                rows={3}
                value={formData.aboutPreview.description}
                onChange={(e) => setFormData({
                  ...formData,
                  aboutPreview: { ...formData.aboutPreview, description: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            {/* About Section Image & Media */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                About Section Landscape Photography
              </label>
              
              {formData.aboutPreview.imageUrl && (
                <div className="aspect-[16/9] w-full max-w-md rounded-xl overflow-hidden border border-slate-200 bg-slate-100 mb-2">
                  <img
                    src={formData.aboutPreview.imageUrl}
                    alt="About Section Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. https://images.unsplash.com/... or local file"
                  value={formData.aboutPreview.imageUrl || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    aboutPreview: { ...formData.aboutPreview, imageUrl: e.target.value }
                  })}
                  className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Browse Media
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQ ACCORDION */}
        {activeTab === 'faq' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              FAQ Questions & Answers Manager
            </h2>

            {/* Add FAQ Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800">Add New FAQ Question</h4>
              <div>
                <input
                  type="text"
                  placeholder="e.g. Do you accept Medicare and Medicaid?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                />
              </div>
              <div>
                <textarea
                  rows={2}
                  placeholder="Detailed answer explanation..."
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                />
              </div>
              <button
                type="button"
                onClick={handleAddFaq}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Add Question</span>
              </button>
            </div>

            {/* FAQ List */}
            <div className="space-y-3">
              {formData.faq.items?.map((item) => (
                <div key={item.id} className="p-4 border border-slate-200 rounded-2xl bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <HelpCircle size={14} className="text-primary-600" />
                      <span>{item.question}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-5">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA BANNER */}
        {activeTab === 'cta' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Bottom Call-to-Action Banner
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Headline Text
              </label>
              <input
                type="text"
                value={formData.ctaBanner.headline}
                onChange={(e) => setFormData({
                  ...formData,
                  ctaBanner: { ...formData.ctaBanner, headline: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Subtitle Description
              </label>
              <input
                type="text"
                value={formData.ctaBanner.subtitle}
                onChange={(e) => setFormData({
                  ...formData,
                  ctaBanner: { ...formData.ctaBanner, subtitle: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Button Text
                </label>
                <input
                  type="text"
                  value={formData.ctaBanner.buttonText}
                  onChange={(e) => setFormData({
                    ...formData,
                    ctaBanner: { ...formData.ctaBanner, buttonText: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Direct Phone Subtext
                </label>
                <input
                  type="text"
                  value={formData.ctaBanner.phoneText}
                  onChange={(e) => setFormData({
                    ...formData,
                    ctaBanner: { ...formData.ctaBanner, phoneText: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION VISIBILITY */}
        {activeTab === 'visibility' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Section Visibility Toggles
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Enable or disable individual sections of the homepage without removing content.
            </p>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(formData.sectionVisibility).map(([sectionKey, isVisible]) => (
                <label
                  key={sectionKey}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs font-semibold text-slate-800"
                >
                  <span className="capitalize">{sectionKey.replace(/([A-Z])/g, ' $1')}</span>
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={(e) => setFormData({
                      ...formData,
                      sectionVisibility: {
                        ...formData.sectionVisibility,
                        [sectionKey]: e.target.checked
                      }
                    })}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Floating Bottom Save Action */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save Homepage Changes</span>
          </button>
        </div>
      </form>

      {/* Media Picker */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        title="Select Hero Banner Image"
        onSelectImage={(url) => {
          setFormData(prev => ({
            ...prev,
            hero: { ...prev.hero, heroImage: url, heroImageUrl: url }
          }));
        }}
      />
    </div>
  );
}
