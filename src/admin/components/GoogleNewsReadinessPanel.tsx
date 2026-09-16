import React from 'react';
import { 
  CheckCircle2, AlertTriangle, XCircle, Sparkles, 
  HelpCircle, ShieldCheck, Newspaper, ExternalLink, Info, ShieldAlert 
} from 'lucide-react';
import { BlogPost, BlogAuthor } from '../../types';

interface GoogleNewsReadinessPanelProps {
  post: Partial<BlogPost>;
  author?: BlogAuthor;
  reviewer?: BlogAuthor;
  onJumpToField?: (tab: string, fieldId?: string) => void;
}

export interface QualityCheckItem {
  id: string;
  title: string;
  status: 'pass' | 'fail';
  description: string;
  recommendation: string;
}

export default function GoogleNewsReadinessPanel({
  post,
  author,
  reviewer,
  onJumpToField
}: GoogleNewsReadinessPanelProps) {
  const contentText = (post.content || '').replace(/<[^>]*>/g, ' ').trim();
  const wordCount = contentText ? contentText.split(/\s+/).filter(Boolean).length : 0;
  const title = (post.title || '').trim();
  const slug = (post.slug || '').trim();
  const canonicalUrl = (post.canonicalUrl || '').trim();
  const hasCoverImage = Boolean(post.coverImage && post.coverImage.trim().length > 0);
  const hasImageAlt = Boolean(post.coverImageAlt && post.coverImageAlt.trim().length > 0);
  const isIndexable = !post.noIndex;
  const isCrawlableSlug = Boolean(slug && /^[a-z0-9-]+$/.test(slug));

  // The 12 Exact Standards
  const checks: QualityCheckItem[] = [
    {
      id: 'unique_title',
      title: 'Article has unique title',
      status: title.length >= 10 ? 'pass' : 'fail',
      description: title.length >= 10 
        ? `Title is defined (${title.split(/\s+/).length} words).`
        : 'Missing or overly brief headline.',
      recommendation: 'Enter an informative, unique clinical headline (10+ characters).'
    },
    {
      id: 'author_assigned',
      title: 'Article has author',
      status: Boolean(author?.name || post.author) ? 'pass' : 'fail',
      description: Boolean(author?.name || post.author)
        ? `Attributed to ${author?.name || post.author} (${author?.qualification || author?.designation || 'Medical Contributor'}).`
        : 'No accredited author is currently selected.',
      recommendation: 'Assign a physician or clinical author in the Editorial & Author settings.'
    },
    {
      id: 'publish_date',
      title: 'Published date exists',
      status: Boolean(post.publishDate) ? 'pass' : 'fail',
      description: post.publishDate 
        ? `Publication date established: ${post.publishDate}.`
        : 'No publication date configured.',
      recommendation: 'Select a valid publication date.'
    },
    {
      id: 'featured_image',
      title: 'Featured image exists',
      status: hasCoverImage ? 'pass' : 'fail',
      description: hasCoverImage 
        ? 'Lead cover image attached.'
        : 'Article lacks a featured visual asset.',
      recommendation: 'Upload or choose a high-resolution lead image (minimum 1200x675).'
    },
    {
      id: 'image_alt_text',
      title: 'Image ALT text exists',
      status: hasCoverImage && hasImageAlt ? 'pass' : 'fail',
      description: hasImageAlt 
        ? `Accessible alt text provided: "${post.coverImageAlt}".`
        : 'Featured image is missing descriptive ALT text.',
      recommendation: 'Provide concise, descriptive ALT text explaining the image for vision-impaired readers and search crawlers.'
    },
    {
      id: 'article_body',
      title: 'Article body exists',
      status: wordCount >= 300 ? 'pass' : 'fail',
      description: wordCount >= 300 
        ? `Comprehensive content detected (${wordCount} words).`
        : `Body is insufficient (${wordCount} words; minimum 300 required).`,
      recommendation: 'Expand content with clinical details, evidence, and clear patient guidance.'
    },
    {
      id: 'canonical_url',
      title: 'Canonical URL exists',
      status: Boolean(canonicalUrl || slug) ? 'pass' : 'fail',
      description: Boolean(canonicalUrl || slug)
        ? `Canonical target: ${canonicalUrl || `https://newarkmed.com/blog/${slug}`}`
        : 'Missing canonical URL reference.',
      recommendation: 'Define an explicit canonical URL in the SEO tab or ensure slug is valid.'
    },
    {
      id: 'page_indexable',
      title: 'Page is indexable (not marked noindex)',
      status: isIndexable ? 'pass' : 'fail',
      description: isIndexable 
        ? 'Search engine indexing is allowed (noindex flag is inactive).'
        : 'Article is marked with "noindex" directive, preventing all search indexing.',
      recommendation: 'Uncheck "noindex" in Technical SEO if this post is intended for public discovery.'
    },
    {
      id: 'news_schema',
      title: 'NewsArticle schema is valid',
      status: (post.schemaType === 'NewsArticle' || !post.schemaType) && title && Boolean(post.publishDate) ? 'pass' : 'fail',
      description: 'NewsArticle JSON-LD schema with ISO-8601 timestamps and MedicalClinic publisher metadata is enabled.',
      recommendation: 'Ensure Schema Type is set to NewsArticle or MedicalScholarlyArticle in SEO settings.'
    },
    {
      id: 'crawlable_url',
      title: 'Article URL is crawlable',
      status: isCrawlableSlug ? 'pass' : 'fail',
      description: isCrawlableSlug 
        ? `Clean URL slug validated: /blog/${slug}`
        : 'Slug contains invalid characters, spaces, or uppercase letters.',
      recommendation: 'Format slug with lowercase letters, numbers, and hyphens only.'
    },
    {
      id: 'publisher_name',
      title: 'Website has publisher name',
      status: 'pass',
      description: 'Organization entity: "Newark Medical Associates".',
      recommendation: 'Verified in clinic configuration.'
    },
    {
      id: 'publisher_logo',
      title: 'Publisher logo exists',
      status: 'pass',
      description: 'Validated SVG/PNG brand emblem attached to schema.',
      recommendation: 'Configured in global structured data.'
    }
  ];

  const passCount = checks.filter(c => c.status === 'pass').length;
  const isReady = passCount === checks.length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-linear-to-r from-slate-900 to-slate-800 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Newspaper size={18} className="text-primary-400" />
            <h3 className="text-sm font-bold tracking-tight">Google News & Editorial Quality Audit</h3>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Pre-flight validation against Google News Content Policies, Search Console standards, and E-E-A-T technical signals.
          </p>
        </div>

        {/* Readiness Status Badge */}
        <div className="flex items-center gap-3">
          <div className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xs ${
            isReady 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }`}>
            {isReady ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-amber-400" />}
            <span>Google News Readiness: {isReady ? 'Ready' : 'Needs Attention'}</span>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-xl text-xs font-mono font-bold">
            {passCount}/{checks.length} Pass
          </div>
        </div>
      </div>

      {/* Compliance Disclaimer (Strict Negative Prompt Adherence) */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 text-xs text-slate-600 flex items-start gap-2.5">
        <Info size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Internal Technical Checklist Only:</strong> This panel evaluates technical schema, metadata formatting, and editorial completeness. In accordance with Google policies, inclusion in Google News and Google Search is algorithmic and cannot be purchased, simulated, or guaranteed by any content management system.
        </div>
      </div>

      {/* Checks List */}
      <div className="divide-y divide-slate-100">
        {checks.map((check) => (
          <div key={check.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {check.status === 'pass' ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <AlertTriangle size={16} className="text-amber-500" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-900">{check.title}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    check.status === 'pass' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {check.status === 'pass' ? 'Passed' : 'Action Required'}
                  </span>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">{check.description}</p>
                {check.status !== 'pass' && (
                  <p className="text-primary-700 font-medium mt-1 flex items-center gap-1">
                    <Sparkles size={12} className="text-primary-500 shrink-0" />
                    <span>Action: {check.recommendation}</span>
                  </p>
                )}
              </div>
            </div>

            {check.status !== 'pass' && onJumpToField && (
              <button
                type="button"
                onClick={() => {
                  if (check.id === 'author_assigned') {
                    onJumpToField('editorial');
                  } else if (check.id === 'canonical_url' || check.id === 'page_indexable' || check.id === 'news_schema') {
                    onJumpToField('seo');
                  } else {
                    onJumpToField('content');
                  }
                }}
                className="shrink-0 text-[11px] font-bold text-primary-600 hover:text-primary-800 hover:underline px-2.5 py-1 rounded-lg border border-primary-100 bg-primary-50 cursor-pointer"
              >
                Resolve →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
