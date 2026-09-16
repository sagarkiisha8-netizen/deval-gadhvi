import React, { useState } from 'react';
import { 
  Globe, Share2, Code2, Search, Smartphone, Monitor, 
  Sparkles, Check, AlertCircle, Eye, RefreshCw
} from 'lucide-react';
import { BlogPost, BlogAuthor } from '../../types';

interface BlogSeoPanelProps {
  post: Partial<BlogPost>;
  author?: BlogAuthor;
  siteName?: string;
  baseUrl?: string;
  onChange: (updates: Partial<BlogPost>) => void;
}

export default function BlogSeoPanel({
  post,
  author,
  siteName = 'Newark Medical Clinic',
  baseUrl = window.location.origin,
  onChange
}: BlogSeoPanelProps) {
  const [activePreview, setActivePreview] = useState<'google' | 'social' | 'schema'>('google');
  const [googleDevice, setGoogleDevice] = useState<'desktop' | 'mobile'>('desktop');

  const slug = post.slug || 'article-slug';
  const seoTitle = post.seoTitle || post.title || '';
  const metaDescription = post.metaDescription || post.excerpt || '';
  const primaryKeyword = post.primaryKeyword || '';
  const secondaryKeywords = post.secondaryKeywords || [];
  const [newKeyword, setNewKeyword] = useState('');
  const canonicalUrl = post.canonicalUrl || `${baseUrl}/blog/${slug}`;
  const ogImage = post.ogImage || post.coverImage || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200';

  // Keyword in title / description helpers
  const kwInTitle = primaryKeyword && seoTitle.toLowerCase().includes(primaryKeyword.toLowerCase());
  const kwInDesc = primaryKeyword && metaDescription.toLowerCase().includes(primaryKeyword.toLowerCase());

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    const clean = newKeyword.trim().toLowerCase();
    if (!secondaryKeywords.includes(clean)) {
      onChange({ secondaryKeywords: [...secondaryKeywords, clean] });
    }
    setNewKeyword('');
  };

  const handleRemoveKeyword = (kw: string) => {
    onChange({ secondaryKeywords: secondaryKeywords.filter(k => k !== kw) });
  };

  // Structured Data (JSON-LD) simulation for preview
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': post.schemaType || 'NewsArticle',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    'headline': seoTitle,
    'description': metaDescription,
    'image': [ogImage],
    'datePublished': post.publishDate ? `${post.publishDate}T09:00:00+00:00` : new Date().toISOString(),
    'dateModified': new Date().toISOString(),
    'author': {
      '@type': author?.authorType === 'Doctor' ? 'Physician' : 'Person',
      'name': author?.name || post.author || 'Medical Staff',
      'jobTitle': author?.designation || 'Healthcare Professional',
      'url': author?.profileUrl || `${baseUrl}/providers`
    },
    'publisher': {
      '@type': 'MedicalClinic',
      'name': siteName,
      'url': baseUrl,
      'logo': {
        '@type': 'ImageObject',
        'url': `${baseUrl}/logo.png`
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Console Meta Fields */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Technical SEO Configuration</h3>
            <p className="text-xs text-slate-500">Configure indexing, title tags, and search engine directives.</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={Boolean(post.noIndex)}
                onChange={(e) => onChange({ noIndex: e.target.checked })}
                className="rounded text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
              />
              <span>noindex (Hide from search)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={Boolean(post.noFollow)}
                onChange={(e) => onChange({ noFollow: e.target.checked })}
                className="rounded text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
              />
              <span>nofollow</span>
            </label>
          </div>
        </div>

        {/* Primary Keyword */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Focus Keyword
            </label>
            <input
              type="text"
              value={primaryKeyword}
              onChange={(e) => onChange({ primaryKeyword: e.target.value })}
              placeholder="e.g., adult hypertension symptoms"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {primaryKeyword && (
              <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                <span className={kwInTitle ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                  {kwInTitle ? '✓ in title' : '○ missing from title'}
                </span>
                <span className={kwInDesc ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                  {kwInDesc ? '✓ in description' : '○ missing from description'}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Secondary / Semantic Keywords
            </label>
            <form onSubmit={handleAddKeyword} className="flex gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add keyword & press Enter"
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Add
              </button>
            </form>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {secondaryKeywords.map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-[11px] flex items-center gap-1"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* SEO Title */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              SEO Meta Title ({seoTitle.length}/60 chars)
            </label>
            <span className={`text-[11px] font-mono ${
              seoTitle.length >= 45 && seoTitle.length <= 60 
                ? 'text-emerald-600 font-semibold' 
                : seoTitle.length > 60 
                ? 'text-rose-500 font-semibold' 
                : 'text-slate-400'
            }`}>
              {seoTitle.length > 60 ? 'Too Long (Truncated on Google)' : seoTitle.length < 35 ? 'A bit short' : 'Ideal length'}
            </span>
          </div>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => onChange({ seoTitle: e.target.value })}
            placeholder="e.g. Hypertension Symptoms, Diagnosis & Clinical Treatments | Newark Medical"
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
          />
          <div className="w-full bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full transition-all ${
                seoTitle.length > 60 ? 'bg-rose-500' : seoTitle.length >= 45 ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, (seoTitle.length / 60) * 100)}%` }}
            />
          </div>
        </div>

        {/* Meta Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Meta Description ({metaDescription.length}/160 chars)
            </label>
            <span className={`text-[11px] font-mono ${
              metaDescription.length >= 120 && metaDescription.length <= 160 
                ? 'text-emerald-600 font-semibold' 
                : metaDescription.length > 160 
                ? 'text-rose-500 font-semibold' 
                : 'text-slate-400'
            }`}>
              {metaDescription.length > 160 ? 'Too Long (Truncated)' : metaDescription.length < 100 ? 'Needs more detail' : 'Ideal length'}
            </span>
          </div>
          <textarea
            rows={3}
            value={metaDescription}
            onChange={(e) => onChange({ metaDescription: e.target.value })}
            placeholder="Summarize the core clinical takeaways, prevention strategies, and diagnostic insights for patients..."
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed"
          />
          <div className="w-full bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full transition-all ${
                metaDescription.length > 160 ? 'bg-rose-500' : metaDescription.length >= 120 ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, (metaDescription.length / 160) * 100)}%` }}
            />
          </div>
        </div>

        {/* Schema Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Schema.org Structured Data Type
            </label>
            <select
              value={post.schemaType || 'NewsArticle'}
              onChange={(e) => onChange({ schemaType: e.target.value as any })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white font-medium"
            >
              <option value="NewsArticle">NewsArticle (Recommended for Health News & Timely Guides)</option>
              <option value="MedicalScholarlyArticle">MedicalScholarlyArticle (Clinical & Diagnostic Focus)</option>
              <option value="BlogPosting">BlogPosting (General Wellness & Lifestyle Articles)</option>
              <option value="Article">Article (Standard Generic Editorial)</option>
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              Injected into the HTML header for Google Rich Snippets and Google News parsers.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Social Sharing Image (OG Image)
            </label>
            <input
              type="url"
              value={post.ogImage || post.coverImage || ''}
              onChange={(e) => onChange({ ogImage: e.target.value })}
              placeholder="https://... (1200x630 recommended)"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-slate-600"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Falls back to the article cover image if left blank.
            </p>
          </div>
        </div>

        {/* Canonical URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Canonical URL
          </label>
          <input
            type="url"
            value={canonicalUrl}
            onChange={(e) => onChange({ canonicalUrl: e.target.value })}
            placeholder="https://yourclinic.com/blog/article-slug"
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-slate-600"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            Points search crawlers to the authoritative master copy of this article.
          </p>
        </div>
      </div>

      {/* Live SERP & Social Sharing Previews */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Preview Tabs */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActivePreview('google')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activePreview === 'google' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search size={14} className="text-blue-500" />
              <span>Google SERP</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePreview('social')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activePreview === 'social' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Share2 size={14} className="text-primary-500" />
              <span>Social Card</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePreview('schema')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activePreview === 'schema' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 size={14} className="text-emerald-500" />
              <span>Schema JSON-LD</span>
            </button>
          </div>

          {activePreview === 'google' && (
            <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setGoogleDevice('desktop')}
                className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                  googleDevice === 'desktop' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                <Monitor size={12} />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setGoogleDevice('mobile')}
                className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                  googleDevice === 'mobile' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                <Smartphone size={12} />
                <span>Mobile</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Google Preview */}
          {activePreview === 'google' && (
            <div className={`p-4 bg-white border border-slate-100 rounded-xl shadow-2xs ${
              googleDevice === 'mobile' ? 'max-w-sm mx-auto' : 'max-w-2xl'
            }`}>
              <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-700">
                <div className="w-4 h-4 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-[9px]">
                  N
                </div>
                <span className="font-semibold text-slate-900">{siteName}</span>
                <span className="text-slate-400">› blog › {slug}</span>
              </div>
              <h4 className="text-blue-800 hover:underline cursor-pointer font-medium text-base line-clamp-1 mb-1 font-sans">
                {seoTitle || 'Article Title - Official Healthcare Clinic Blog'}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-sans">
                {metaDescription || 'Detailed medical information, symptoms, and clinical advice written by certified healthcare practitioners.'}
              </p>
            </div>
          )}

          {/* Social Preview */}
          {activePreview === 'social' && (
            <div className="max-w-md mx-auto border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
              <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
                <img
                  src={ogImage}
                  alt="OG Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 bg-slate-50/70 border-t border-slate-100">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1 font-mono">
                  {baseUrl.replace(/^https?:\/\//, '')}
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">
                  {seoTitle || 'Healthcare Article Title'}
                </h4>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {metaDescription || 'Read our clinical health guide by our certified doctors.'}
                </p>
              </div>
            </div>
          )}

          {/* Schema JSON-LD Preview */}
          {activePreview === 'schema' && (
            <div className="relative">
              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto max-h-72 leading-relaxed">
                {JSON.stringify(jsonLdData, null, 2)}
              </pre>
              <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                <Sparkles size={13} className="text-emerald-600" />
                <span>Automatically embedded as JSON-LD schema into the &lt;head&gt; of the public article page.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
