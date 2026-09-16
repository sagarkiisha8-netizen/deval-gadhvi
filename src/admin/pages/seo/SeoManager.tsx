import React, { useState } from 'react';
import { 
  Search, Globe, Share2, Save, Loader2, 
  CheckCircle2, Eye, Code, ExternalLink, Sparkles, 
  FileText, ShieldCheck, Rss, Layers, Check, AlertCircle 
} from 'lucide-react';
import { useCmsData } from '../../../context/CmsContext';
import { SiteSettings, PageSeoItem } from '../../../types';
import MediaPickerModal from '../../components/MediaPickerModal';

export default function SeoManager() {
  const { 
    siteSettings, 
    updateSiteSettings, 
    pageSeoList, 
    updatePageSeo 
  } = useCmsData();

  const [formData, setFormData] = useState<SiteSettings>(siteSettings);
  const [activeMainTab, setActiveMainTab] = useState<'pages' | 'global' | 'google' | 'sitemaps' | 'schema'>('pages');
  const [selectedPageKey, setSelectedPageKey] = useState<string>('home');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  React.useEffect(() => {
    setFormData(siteSettings);
  }, [siteSettings]);

  // Current page SEO item
  const currentPageSeo = pageSeoList.find((p) => p.pageKey === selectedPageKey) || {
    id: `page-${selectedPageKey}`,
    pageKey: selectedPageKey,
    pageName: selectedPageKey.charAt(0).toUpperCase() + selectedPageKey.slice(1),
    path: selectedPageKey === 'home' ? '/' : `/${selectedPageKey}`,
    title: `${selectedPageKey.charAt(0).toUpperCase() + selectedPageKey.slice(1)} | Newark Medical Associates`,
    metaDescription: 'Internal medicine and diagnostics in Newark, NJ.',
    canonicalUrl: `https://newarkmed.com${selectedPageKey === 'home' ? '' : '/' + selectedPageKey}`,
    indexRobots: true,
    ogImage: siteSettings.seo?.ogImage || ''
  };

  const handlePageSeoChange = (updates: Partial<PageSeoItem>) => {
    updatePageSeo(selectedPageKey, updates);
  };

  const handleSaveGlobal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateSiteSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating SEO:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "name": formData.practiceName,
    "description": formData.seo?.defaultDescription || "Comprehensive internal medicine and diagnostics in Newark, NJ.",
    "telephone": formData.phone,
    "url": "https://newarkmed.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": formData.address,
      "addressLocality": formData.city,
      "addressRegion": formData.state,
      "postalCode": formData.zipCode,
      "addressCountry": "US"
    },
    "medicalSpecialty": [
      "PrimaryCare",
      "InternalMedicine",
      "Cardiovascular",
      "DiagnosticServices"
    ],
    "openingHours": [
      "Mo-Fr 08:00-18:00",
      "Sa 09:00-14:00"
    ]
  };

  const publicPages = [
    { key: 'home', name: 'Home Page', path: '/' },
    { key: 'about', name: 'About Us', path: '/about' },
    { key: 'services', name: 'Services & Care', path: '/services' },
    { key: 'diagnostics', name: 'Diagnostic Testing', path: '/diagnostics' },
    { key: 'providers', name: 'Clinical Team', path: '/providers' },
    { key: 'process', name: 'Patient Process', path: '/process' },
    { key: 'contact', name: 'Contact & Clinic Location', path: '/contact' },
    { key: 'blog', name: 'Health Journal & Articles', path: '/blog' },
    { key: 'appointments', name: 'Appointment Request', path: '/appointments' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-primary-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Globe size={15} />
            <span>Search Optimization & Webmaster Center</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            SEO & Google News Architecture
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl">
            Configure page-by-page meta tags, canonical URLs, Google Search Console, Open Graph cards, dynamic sitemaps, and robots.txt.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSaveGlobal()}
          disabled={isSaving}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer shrink-0"
        >
          {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          <span>Save All SEO Settings</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>SEO settings updated and synchronized with Firestore!</span>
        </div>
      )}

      {/* Main Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        {[
          { id: 'pages', label: 'Page-by-Page SEO Tags' },
          { id: 'global', label: 'Global Metadata' },
          { id: 'google', label: 'Google Search & Analytics' },
          { id: 'sitemaps', label: 'XML Sitemaps & RSS' },
          { id: 'schema', label: 'Structured Data (Schema.org)' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveMainTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMainTab === tab.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Page-by-Page SEO */}
      {activeMainTab === 'pages' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Pages List */}
          <div className="lg:col-span-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              Select Public Page ({publicPages.length})
            </h3>
            <div className="space-y-1">
              {publicPages.map((p) => {
                const isSelected = selectedPageKey === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setSelectedPageKey(p.key)}
                    className={`w-full text-left p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-primary-50 text-primary-900 border border-primary-200 shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{p.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">{p.path}</div>
                    </div>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-primary-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Page SEO Editor & SERP Preview */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700">
                    Editing Page SEO
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    {currentPageSeo.pageName} ({currentPageSeo.path})
                  </h2>
                </div>
                <a
                  href={currentPageSeo.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5"
                >
                  <ExternalLink size={13} />
                  <span>View Live</span>
                </a>
              </div>

              {/* Title Tag */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    SEO Meta Title Tag *
                  </label>
                  <span className={`text-[11px] font-mono ${
                    (currentPageSeo.title?.length || 0) > 60 ? 'text-rose-600 font-bold' : 'text-slate-400'
                  }`}>
                    {currentPageSeo.title?.length || 0} / 60 chars
                  </span>
                </div>
                <input
                  type="text"
                  value={currentPageSeo.title || ''}
                  onChange={(e) => handlePageSeoChange({ title: e.target.value })}
                  placeholder="e.g. Newark Medical Associates | Internal Medicine & Diagnostics"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                />
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Meta Description *
                  </label>
                  <span className={`text-[11px] font-mono ${
                    (currentPageSeo.metaDescription?.length || 0) > 160 ? 'text-rose-600 font-bold' : 'text-slate-400'
                  }`}>
                    {currentPageSeo.metaDescription?.length || 0} / 160 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={currentPageSeo.metaDescription || ''}
                  onChange={(e) => handlePageSeoChange({ metaDescription: e.target.value })}
                  placeholder="Concise overview summarizing this page in search engine snippet cards..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none leading-relaxed resize-none"
                />
              </div>

              {/* Canonical URL */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={currentPageSeo.canonicalUrl || ''}
                  onChange={(e) => handlePageSeoChange({ canonicalUrl: e.target.value })}
                  placeholder="https://newarkmed.com/about"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none"
                />
              </div>

              {/* Robots Index / Noindex */}
              <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Robots Indexing</span>
                  <span className="text-[11px] text-slate-500">Allow search engine crawlers to index this page</span>
                </div>
                <input
                  type="checkbox"
                  checked={currentPageSeo.indexRobots !== undefined ? currentPageSeo.indexRobots : true}
                  onChange={(e) => handlePageSeoChange({ indexRobots: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded-sm"
                />
              </label>

              {/* Google SERP Live Snippet Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Google Search Snippet Preview
                </div>
                <div className="text-xs text-slate-700 font-mono truncate">
                  https://newarkmed.com &gt; {selectedPageKey === 'home' ? '' : selectedPageKey}
                </div>
                <div className="text-sm font-bold text-blue-700 hover:underline line-clamp-1">
                  {currentPageSeo.title || 'Newark Medical Associates'}
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {currentPageSeo.metaDescription || 'Internal medicine practice and advanced diagnostic testing in Newark, NJ.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Global Metadata & OpenGraph Defaults */}
      {activeMainTab === 'global' && (
        <form onSubmit={handleSaveGlobal} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">Global SEO & Brand Defaults</h2>
            <p className="text-xs text-slate-500 mt-0.5">Applied across all pages when custom page meta is not specified.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Default Site Title
              </label>
              <input
                type="text"
                value={formData.seo?.defaultTitle || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  seo: { ...prev.seo, defaultTitle: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Practice Brand Name
              </label>
              <input
                type="text"
                value={formData.practiceName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, practiceName: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Default Open Graph (OG) Share Image
            </label>
            <div className="flex items-center gap-3">
              <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                <img
                  src={formData.seo?.ogImage || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600'}
                  alt="OG Image Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={formData.seo?.ogImage || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    seo: { ...prev.seo, ogImage: e.target.value }
                  }))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Choose From Media Library
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Save Global SEO
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Google Search & Analytics */}
      {activeMainTab === 'google' && (
        <form onSubmit={handleSaveGlobal} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              Google Webmaster & Tracking IDs
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your official measurement and verification tokens for Google Search Console, GA4, and Google News.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Google Search Console Verification Token
              </label>
              <input
                type="text"
                placeholder="google-site-verification=abc123xyz"
                value={formData.googleSearchConsoleVerification || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, googleSearchConsoleVerification: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">Inserted in &lt;head&gt; meta tags for instant domain verification.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Google Analytics 4 Measurement ID
              </label>
              <input
                type="text"
                placeholder="G-XXXXXXXXXX"
                value={formData.googleAnalyticsId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">Used for tracking visitor traffic and pageviews.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Google Tag Manager Container ID
              </label>
              <input
                type="text"
                placeholder="GTM-XXXXXXX"
                value={formData.googleTagManagerId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, googleTagManagerId: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Google News / Publisher Center ID
              </label>
              <input
                type="text"
                placeholder="pub-xxxxxxxx"
                value={formData.googleNewsPublisherId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, googleNewsPublisherId: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Save Google Webmaster Settings
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: XML Sitemaps, RSS & Robots.txt */}
      {activeMainTab === 'sitemaps' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                XML Sitemaps, Google News Feed & RSS Endpoints
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All feeds and sitemaps are generated dynamically to keep search engines and Google News updated.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Standard XML Sitemap</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">/sitemap.xml</div>
                </div>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1"
                >
                  <span>Open Feed</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-purple-950">Google News XML Sitemap</div>
                  <div className="text-[11px] text-purple-700 font-mono mt-0.5">/news-sitemap.xml</div>
                </div>
                <a
                  href="/news-sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 inline-flex items-center gap-1"
                >
                  <span>Open News Feed</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-950">RSS 2.0 Article Feed</div>
                  <div className="text-[11px] text-amber-700 font-mono mt-0.5">/rss.xml</div>
                </div>
                <a
                  href="/rss.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 inline-flex items-center gap-1"
                >
                  <span>Open RSS</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Robots.txt Directive</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">/robots.txt</div>
                </div>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1"
                >
                  <span>View File</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* Dynamic Robots.txt Editor */}
          <form onSubmit={handleSaveGlobal} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Robots.txt Configuration
            </h3>
            <textarea
              rows={6}
              value={formData.seo?.robotsTxt || `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/*\n\nSitemap: https://newarkmed.com/sitemap.xml\nSitemap: https://newarkmed.com/news-sitemap.xml`}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                seo: { ...prev.seo, robotsTxt: e.target.value }
              }))}
              className="w-full p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-xs focus:outline-none leading-relaxed"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Save Robots.txt
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: Schema.org Structured Data */}
      {activeMainTab === 'schema' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Schema.org MedicalClinic Structured Data
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically generated JSON-LD schema injected in document head for Google Knowledge Graph and Rich Snippets.
              </p>
            </div>
            <a
              href="https://validator.schema.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
            >
              <span>Schema Validator</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed max-h-[400px]">
            {JSON.stringify(jsonLdSchema, null, 2)}
          </pre>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        title="Select Default Open Graph (OG) Image"
        onSelectImage={(url) => {
          setFormData(prev => ({
            ...prev,
            seo: { ...prev.seo, ogImage: url }
          }));
          setIsMediaModalOpen(false);
        }}
      />
    </div>
  );
}
