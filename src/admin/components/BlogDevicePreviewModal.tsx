import React, { useState } from 'react';
import { 
  X, Monitor, Tablet, Smartphone, ExternalLink, Calendar, 
  Clock, UserCheck, ShieldAlert, ArrowLeft, Share2, Tag, 
  Bookmark, CheckCircle2 
} from 'lucide-react';
import { BlogPost, BlogAuthor } from '../../types';

interface BlogDevicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Partial<BlogPost>;
  author?: BlogAuthor;
  reviewer?: BlogAuthor;
}

export default function BlogDevicePreviewModal({
  isOpen,
  onClose,
  post,
  author,
  reviewer
}: BlogDevicePreviewModalProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  if (!isOpen) return null;

  const readingTime = post.readTimeMinutes || 4;
  const isDraft = post.status !== 'published';
  const displayDate = post.publishDate || new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 text-white rounded-3xl w-full max-w-6xl h-[94vh] flex flex-col shadow-2xl border border-slate-800 overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600/20 text-primary-400 rounded-xl border border-primary-500/30">
              <Monitor size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Live Multi-Device Preview</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isDraft ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {post.status || 'Draft'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Non-indexed sandboxed preview of layout, typography, and responsive reading experience.
              </p>
            </div>
          </div>

          {/* Device Toggles */}
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-2xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                device === 'desktop' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor size={14} />
              <span>Desktop (100%)</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice('tablet')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                device === 'tablet' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet size={14} />
              <span>Tablet (768px)</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                device === 'mobile' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone size={14} />
              <span>Mobile (375px)</span>
            </button>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Close Preview"
          >
            <X size={20} />
          </button>
        </div>

        {/* Draft Notice Banner */}
        {isDraft && (
          <div className="bg-amber-950/40 border-b border-amber-900/40 px-4 py-2 text-xs text-amber-200 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <ShieldAlert size={15} className="text-amber-400 shrink-0" />
              <span>
                <strong>Draft Protection Active:</strong> This preview is strictly inaccessible to search bots (<code className="bg-amber-900/50 px-1 py-0.5 rounded text-[10px]">noindex, nofollow</code>) and will return 404 for unauthenticated public visitors.
              </span>
            </div>
            <span className="text-[10px] text-amber-400/80 font-mono hidden sm:inline">Protected Admin Session</span>
          </div>
        )}

        {/* Preview Frame Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-950/60 scrollbar-thin scrollbar-thumb-slate-700">
          <div 
            className={`transition-all duration-300 bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 ${
              device === 'desktop' ? 'w-full max-w-4xl' :
              device === 'tablet' ? 'w-[768px] max-w-full' :
              'w-[390px] max-w-full'
            }`}
          >
            {/* Simulated Browser Bar */}
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="px-3 py-1 bg-white rounded-lg border border-slate-200 text-[11px] font-mono text-slate-600 truncate max-w-xs">
                https://newarkmed.com/blog/{post.slug || 'untitled-article'}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">
                {device}
              </div>
            </div>

            {/* Public Article Content Mockup */}
            <div className="p-6 sm:p-10 space-y-8 flex-1 overflow-y-auto">
              
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium flex-wrap">
                <span>Home</span>
                <span>/</span>
                <span>Health Journal</span>
                <span>/</span>
                <span className="text-primary-600 font-semibold">{post.category || 'Clinical Articles'}</span>
              </div>

              {/* Category Badge & Metadata */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full border border-primary-100">
                    {post.category || 'General Health'}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar size={13} />
                    <span>{displayDate}</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock size={13} />
                    <span>{readingTime} min read</span>
                  </div>
                </div>

                {/* Page H1 Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                  {post.title || 'Untitled Clinical Guide'}
                </h1>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed border-l-4 border-primary-500 pl-4 py-1">
                    {post.excerpt}
                  </p>
                )}
              </div>

              {/* Author & Reviewer Info Bar */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={author?.profilePhoto || post.authorAvatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'}
                    alt={author?.name || post.author || 'Doctor'}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">Written by</span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {author?.name || post.author || 'Dr. Prahlad Gadhvi'}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      {author?.qualification || author?.designation || post.authorTitle || 'MD, FACP – Medical Director'}
                    </p>
                  </div>
                </div>

                {/* Medical Review Badge */}
                {(post.reviewedByDoctor || post.medicallyReviewedBy || reviewer) && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-emerald-700">Medically Reviewed By</span>
                      <span className="block">{post.reviewedByDoctor || post.medicallyReviewedBy || reviewer?.name}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Featured Lead Image */}
              {(post.coverImage || post.featuredImage) && (
                <figure className="space-y-2">
                  <img
                    src={post.coverImage || post.featuredImage}
                    alt={post.coverImageAlt || post.featuredImageAlt || post.title || 'Clinical illustration'}
                    className="w-full h-auto max-h-[420px] object-cover rounded-2xl shadow-sm border border-slate-200"
                  />
                  {(post.coverImageCaption || post.coverImageCredit) && (
                    <figcaption className="text-xs text-slate-500 text-center italic">
                      {post.coverImageCaption} {post.coverImageCredit && `(Source: ${post.coverImageCredit})`}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Sanitized Article Body */}
              <div 
                className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg sm:prose-h3:text-xl prose-p:leading-relaxed prose-p:text-slate-700 prose-li:text-slate-700 prose-blockquote:border-l-primary-500 prose-blockquote:text-slate-700 prose-blockquote:font-medium prose-img:rounded-2xl"
                dangerouslySetInnerHTML={{ __html: post.content || '<p class="text-slate-400 italic">No article content written yet.</p>' }}
              />

              {/* References Section */}
              {post.references && post.references.length > 0 && (
                <div className="pt-6 border-t border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Scientific & Clinical References
                  </h3>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600">
                    {post.references.map((ref, idx) => (
                      <li key={ref.id || idx}>
                        <span className="font-semibold text-slate-800">{ref.title}</span>
                        {ref.source && <span className="text-slate-500"> — {ref.source}</span>}
                        {ref.year && <span className="text-slate-400"> ({ref.year})</span>}
                        {ref.url && (
                          <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline ml-1.5 font-mono text-[11px]">
                            [Link]
                          </a>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-4">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Tag size={13} /> Tags:
                  </span>
                  {post.tags.map((t) => (
                    <span key={t} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Clinic Call-To-Action Banner */}
              <div className="bg-linear-to-r from-primary-900 to-slate-900 text-white p-6 rounded-3xl space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary-300">
                  Newark Medical Clinic Care Team
                </span>
                <h3 className="text-lg font-bold">
                  {post.ctaTitle || 'Have questions about your personal health?'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {post.ctaDescription || 'Our board-certified physicians in Newark NJ are available for comprehensive physical checkups, chronic disease management, and on-site diagnostics.'}
                </p>
                <div className="pt-2">
                  <button type="button" className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-xs">
                    {post.ctaButtonText || 'Book an Appointment'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Viewport dimensions: {device === 'desktop' ? 'Responsive 100%' : device === 'tablet' ? '768px' : '390px'}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors cursor-pointer"
          >
            Exit Preview
          </button>
        </div>

      </div>
    </div>
  );
}
