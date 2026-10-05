import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Clock, ShieldCheck, Share2, 
  Link as LinkIcon, Check, ChevronRight, ArrowLeft, 
  ArrowRight, BookOpen, Sparkles, ExternalLink, 
  FileText, Printer, ListTree, ChevronDown, 
  ChevronUp, User, HeartPulse, Stethoscope,
  Facebook, Linkedin, Mail, Twitter
} from 'lucide-react';
import { useCmsData } from '../context/CmsContext';
import { BlogPost } from '../types';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { blogs, providers, siteSettings, loading, trackPageView, getMediaUrl } = useCmsData();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [copiedToast, setCopiedToast] = useState(false);
  const [isTocOpenMobile, setIsTocOpenMobile] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // Find the article by slug or id
  const rawArticle = useMemo(() => {
    return blogs.find((b) => b.slug === slug || b.id === slug);
  }, [blogs, slug]);

  // Draft protection: public users can NEVER view unpublished drafts or archived posts
  const article = useMemo(() => {
    if (!rawArticle) return null;
    if (rawArticle.status === 'published') return rawArticle;
    // If article is not published, only authenticated staff can view it
    if (currentUser) return rawArticle;
    return null;
  }, [rawArticle, currentUser]);

  const isStaffPreview = rawArticle && rawArticle.status !== 'published' && !!currentUser;

  // Track page view & scroll to top
  useEffect(() => {
    if (slug) {
      trackPageView(`/blog/${slug}`);
      window.scrollTo(0, 0);
    }
  }, [slug]);

  // Match provider data for author if available
  const authorProvider = useMemo(() => {
    if (!article) return null;
    return providers.find(
      (p) => p.name.toLowerCase().includes(article.author.toLowerCase()) ||
             article.author.toLowerCase().includes(p.name.toLowerCase())
    );
  }, [providers, article]);

  // Related articles (same category or shared tags, excluding current article)
  const relatedArticles = useMemo(() => {
    if (!article) return [];
    const published = blogs.filter((b) => b.status === 'published' && b.id !== article.id);
    
    // Priority 1: Same category
    const sameCategory = published.filter(
      (b) => b.category.toLowerCase() === article.category.toLowerCase() || b.categoryId === article.categoryId
    );
    
    // Priority 2: Shared tags
    const sharedTags = published.filter((b) => 
      !sameCategory.some((sc) => sc.id === b.id) &&
      b.tags && article.tags && b.tags.some((t) => article.tags.includes(t))
    );
    
    // Priority 3: Remaining latest articles
    const remaining = published.filter(
      (b) => !sameCategory.some((sc) => sc.id === b.id) && !sharedTags.some((st) => st.id === b.id)
    );

    return [...sameCategory, ...sharedTags, ...remaining].slice(0, 3);
  }, [blogs, article]);

  // Parse HTML content and generate Table of Contents
  const { processedContent, tocList } = useMemo(() => {
    if (!article?.content) return { processedContent: '', tocList: [] };

    const toc: TocItem[] = [];
    let headingIndex = 0;

    // Inject id attributes to h2 and h3
    const processed = article.content.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (match, levelStr, attrs, innerText) => {
      headingIndex++;
      const cleanText = innerText.replace(/<[^>]+>/g, '').trim();
      const slugId = `section-${headingIndex}-${cleanText.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 35)}`;
      
      let newAttrs = attrs;
      if (/id=["'][^"']+["']/i.test(attrs)) {
        const matchId = attrs.match(/id=["']([^"']+)["']/i);
        const existingId = matchId ? matchId[1] : slugId;
        toc.push({ id: existingId, text: cleanText, level: parseInt(levelStr, 10) });
        return match;
      } else {
        newAttrs = `${attrs} id="${slugId}"`;
        toc.push({ id: slugId, text: cleanText, level: parseInt(levelStr, 10) });
        return `<h${levelStr}${newAttrs}>${innerText}</h${levelStr}>`;
      }
    });

    return { processedContent: processed, tocList: toc };
  }, [article?.content]);

  // Dynamic SEO meta, canonical, document title
  useEffect(() => {
    if (article) {
      document.title = article.seoTitle || `${article.title} | ${siteSettings.practiceName || 'Newark Medical Associates'}`;
      
      // Update canonical link
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = article.canonicalUrl || `${window.location.origin}/blog/${article.slug}`;

      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = article.metaDescription || article.excerpt || '';

      // Update robots meta tag
      let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.name = 'robots';
        document.head.appendChild(robotsMeta);
      }
      if (article.noIndex || article.status !== 'published') {
        robotsMeta.content = 'noindex, nofollow';
      } else {
        robotsMeta.content = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
      }
    }
    return () => {
      document.title = 'Newark Medical Associates | Primary Care & Diagnostics';
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta) robotsMeta.setAttribute('content', 'index, follow');
    };
  }, [article, siteSettings]);

  // Intersection Observer for Active TOC Heading highlighting
  useEffect(() => {
    if (tocList.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    );

    tocList.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [tocList]);

  // Copy link handler
  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://newarkmed.com/blog/${article?.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setIsTocOpenMobile(false);
    }
  };

  // If article not found and loading complete
  if (!article && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-32">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200/80 shadow-md text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <FileText size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Article Not Found</h1>
          <p className="text-sm text-slate-600 mb-8 leading-relaxed">
            The health article you are looking for might have been moved, updated, or unpublished.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/blog"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-xs font-semibold shadow-xs transition-all"
            >
              <ArrowLeft size={14} />
              <span>Back to Health Insights</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-6 py-2.5 rounded-full text-xs font-semibold transition-all"
            >
              <span>Go to Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 pt-36 pb-20 px-6 max-w-4xl mx-auto">
        <div className="space-y-6 animate-pulse">
          <div className="w-32 h-6 bg-slate-200 rounded-full" />
          <div className="w-full h-12 bg-slate-200 rounded-xl" />
          <div className="w-3/4 h-12 bg-slate-200 rounded-xl" />
          <div className="aspect-video bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  // Check if modified date differs from published date
  const isUpdated = article.modifiedDate && article.modifiedDate !== article.publishDate;

  // JSON-LD Structured Data for Google News & Search Engine Crawlers
  const structuredData = {
    "@context": "https://schema.org",
    "@type": article.schemaType || "MedicalScholarlyArticle",
    "headline": article.seoTitle || article.title,
    "description": article.metaDescription || article.excerpt,
    "image": [
      article.featuredImage || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200"
    ],
    "datePublished": article.publishDate || "2026-01-01",
    "dateModified": article.modifiedDate || article.publishDate || "2026-01-01",
    "author": {
      "@type": "Person",
      "name": article.author,
      "jobTitle": article.authorTitle || "Physician",
      "image": article.authorAvatar
    },
    ...(article.medicallyReviewedBy ? {
      "reviewedBy": {
        "@type": "Person",
        "name": article.medicallyReviewedBy,
        "jobTitle": article.reviewerTitle || "Medical Reviewer"
      }
    } : {}),
    "publisher": {
      "@type": "MedicalClinic",
      "name": siteSettings.practiceName || "Newark Medical Associates",
      "logo": {
        "@type": "ImageObject",
        "url": "https://newarkmed.com/logo.png"
      },
      "url": "https://newarkmed.com"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.canonicalUrl || `https://newarkmed.com/blog/${article.slug}`
    },
    ...(article.references && article.references.length > 0 ? {
      "citation": article.references.map(r => r.title || r.source)
    } : {})
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://newarkmed.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Health Insights",
        "item": "https://newarkmed.com/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.category,
        "item": `https://newarkmed.com/blog?category=${encodeURIComponent(article.category)}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": article.title,
        "item": `https://newarkmed.com/blog/${article.slug}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Schema.org Injections */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Copy Link Toast Notification */}
      <AnimatePresence>
        {copiedToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-800 text-xs font-semibold flex items-center gap-2"
          >
            <Check size={15} className="text-emerald-400" />
            <span>Article URL copied to clipboard</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 9. Article Header Section */}
      {isStaffPreview && (
        <div className="bg-amber-600 text-white py-2.5 px-6 text-center text-xs font-semibold flex items-center justify-center gap-2 pt-24">
          <ShieldCheck size={16} />
          <span>
            Clinical Draft Preview Mode — Status: <strong>{article.status.toUpperCase()}</strong>. This unpublished draft is protected from public visitors and search engine crawlers (noindex active).
          </span>
        </div>
      )}

      <header className={`bg-white border-b border-slate-200/80 ${isStaffPreview ? 'pt-8' : 'pt-32 md:pt-40'} pb-10 md:pb-14`}>
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          {/* Breadcrumb Navigation: Home / Health Insights / Category / Article */}
          <nav className="flex items-center flex-wrap gap-2 text-xs text-slate-500 mb-6 font-medium">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight size={13} className="text-slate-300" />
            <Link to="/blog" className="hover:text-blue-600 transition-colors">Health Insights</Link>
            <ChevronRight size={13} className="text-slate-300" />
            <Link 
              to={`/blog?category=${encodeURIComponent(article.category)}`}
              className="hover:text-blue-600 transition-colors font-semibold text-slate-700"
            >
              {article.category}
            </Link>
          </nav>

          {/* Category Badge */}
          <div className="inline-block px-3.5 py-1 bg-blue-50 text-blue-700 font-semibold text-xs rounded-full uppercase tracking-wider mb-4 border border-blue-100">
            {article.category}
          </div>

          {/* Article Title (Controlled Width for Readability) */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15] max-w-4xl">
            {article.title}
          </h1>

          {/* Short Excerpt */}
          {article.excerpt && (
            <p className="mt-5 text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl font-normal">
              {article.excerpt}
            </p>
          )}

          {/* Author Metadata Bar & Medical Review */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              {article.authorAvatar ? (
                <img
                  src={article.authorAvatar}
                  alt={article.author}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 shadow-2xs shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-base shrink-0">
                  {article.author.charAt(0)}
                </div>
              )}
              <div>
                <div className="text-sm font-bold text-slate-900">
                  Written by {article.author}
                </div>
                <div className="text-xs text-slate-500">{article.authorTitle || 'Attending Physician'}</div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>{article.publishDate}</span>
                  {isUpdated && (
                    <>
                      <span>•</span>
                      <span className="text-slate-600 font-medium">Last updated: {article.modifiedDate}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{article.readTimeMinutes} min read</span>
                </div>
              </div>
            </div>

            {/* 15. Medical Review Block */}
            {(article.reviewedByDoctor || article.medicallyReviewedBy) && (
              <div className="bg-blue-50/80 border border-blue-100/80 rounded-2xl p-3 sm:p-3.5 max-w-sm flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-blue-900 block">Medically Reviewed</span>
                    {article.factCheckStatus === 'verified' && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Verified
                      </span>
                    )}
                  </div>
                  <span className="text-slate-700">
                    By {article.reviewedByDoctor || article.medicallyReviewedBy}
                    {article.reviewerTitle && ` (${article.reviewerTitle})`}
                    {(article.medicalReviewDate || article.medicallyReviewedDate) && ` • ${article.medicalReviewDate || article.medicallyReviewedDate}`}
                  </span>
                  {article.clinicalVerificationBoard && (
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {article.clinicalVerificationBoard}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 10. Featured Article Image with Caption & Credit */}
      {(() => {
        const featImg = getMediaUrl('blog', article.id, 'thumbnail') || 
          getMediaUrl('blog', article.slug, 'thumbnail') || 
          article.coverImage || 
          article.featuredImage;
        if (!featImg) return null;
        return (
          <figure className="max-w-5xl mx-auto px-6 md:px-12 -mt-4 md:-mt-6 mb-12">
            <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 aspect-[16/9] max-h-[480px] w-full bg-slate-100">
              <img
                src={featImg}
                alt={article.coverImageAlt || article.featuredImageAlt || article.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            {(article.coverImageCaption || article.coverImageCredit) && (
              <figcaption className="mt-2 text-center text-xs text-slate-500 italic">
                {article.coverImageCaption}
                {article.coverImageCredit && (
                  <span className="text-slate-400 not-italic ml-1.5 text-[11px]">
                    (Photo credit: {article.coverImageCredit})
                  </span>
                )}
              </figcaption>
            )}
          </figure>
        );
      })()}

      {/* 11. Article Content Layout: Main Text Column + Sticky Side Panel */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 pb-20">
        {/* Mobile Collapsible Table of Contents */}
        {tocList.length >= 2 && (
          <div className="lg:hidden mb-8 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <button
              onClick={() => setIsTocOpenMobile(!isTocOpenMobile)}
              className="w-full flex items-center justify-between font-bold text-sm text-slate-900 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ListTree size={16} className="text-blue-600" />
                <span>In This Article ({tocList.length} sections)</span>
              </div>
              {isTocOpenMobile ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {isTocOpenMobile && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-slate-100 space-y-2 overflow-hidden"
                >
                  {tocList.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToHeading(item.id)}
                      className={`w-full text-left text-xs py-1 transition-colors block ${
                        item.level === 3 ? 'pl-4 text-slate-500' : 'font-medium text-slate-800'
                      } ${activeHeadingId === item.id ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}
                    >
                      {idx + 1}. {item.text}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Article Body Column */}
          <main className="lg:col-span-8">
            {/* 19. Social Share Bar */}
            <div className="flex items-center justify-between py-3.5 border-y border-slate-200/80 mb-8 text-xs text-slate-500">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <Share2 size={15} className="text-blue-600" />
                <span>Share this article:</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy Article Link"
                >
                  <LinkIcon size={12} />
                  <span>Copy Link</span>
                </button>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                  title="Share on X / Twitter"
                  aria-label="Share on Twitter"
                >
                  <Twitter size={13} />
                </a>

                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                  title="Share on LinkedIn"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin size={13} />
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                  title="Share on Facebook"
                  aria-label="Share on Facebook"
                >
                  <Facebook size={13} />
                </a>

                <a
                  href={`mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(`Read this medical article from Newark Medical Associates: ${currentUrl}`)}`}
                  className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                  title="Share via Email"
                  aria-label="Share via Email"
                >
                  <Mail size={13} />
                </a>

                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors hidden sm:block"
                  title="Print Article"
                  aria-label="Print Article"
                >
                  <Printer size={13} />
                </button>
              </div>
            </div>

            {/* 12. Article Typography Content (Sanitized via DOMPurify) */}
            <article className="bg-white p-6 sm:p-10 md:p-12 rounded-3xl border border-slate-200/80 shadow-2xs">
              <div
                className="prose prose-slate max-w-none text-slate-800 leading-relaxed
                  prose-headings:font-bold prose-headings:text-slate-900 prose-headings:tracking-tight
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pt-4 prose-h2:border-t prose-h2:border-slate-100
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2
                  prose-p:mb-5 prose-p:leading-relaxed prose-p:text-slate-700 prose-p:text-base
                  prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:py-3.5 prose-blockquote:px-5 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-slate-800
                  prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-5 prose-ul:space-y-1.5
                  prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-5 prose-ol:space-y-1.5
                  prose-li:text-slate-700
                  prose-strong:text-slate-900 prose-strong:font-bold
                  prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
                  prose-img:rounded-2xl prose-img:shadow-sm prose-img:border prose-img:border-slate-200 prose-img:my-8"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(processedContent, {
                    ALLOWED_TAGS: [
                      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em', 'u', 's',
                      'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'br', 'hr', 'table', 'thead',
                      'tbody', 'tr', 'th', 'td', 'code', 'pre', 'figure', 'figcaption', 'div'
                    ],
                    ALLOWED_ATTR: [
                      'id', 'href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'width', 'height', 'loading'
                    ]
                  })
                }}
              />

              {/* Tags List */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-10 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tags:</span>
                    {article.tags.map((t) => (
                      <Link
                        key={t}
                        to={`/blog?tag=${encodeURIComponent(t)}`}
                        className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-medium rounded-full transition-colors"
                      >
                        #{t}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* 17. Scientific References / Sources Section */}
            {article.references && article.references.length > 0 && (
              <section className="mt-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck size={16} />
                  <span>Clinical Evidence</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">
                  References
                </h3>
                <ol className="space-y-3 list-decimal pl-5 text-xs text-slate-600">
                  {article.references.map((ref, idx) => (
                    <li key={ref.id || idx} className="leading-relaxed">
                      <span className="font-semibold text-slate-800">{ref.title}</span>
                      {(ref.journalOrSource || ref.source) && (
                        <span className="text-slate-500"> — {ref.journalOrSource || ref.source}</span>
                      )}
                      {ref.year && <span className="text-slate-400"> ({ref.year})</span>}
                      {ref.url && (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-0.5"
                        >
                          <span>[View Source]</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* 18. Medical Disclaimer */}
            <section className="mt-8 bg-slate-100/70 p-6 rounded-2xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800 block mb-1">Medical Disclaimer</span>
              <p>
                This article is for informational and educational purposes only and should not be considered a substitute for professional medical advice, diagnosis or treatment. Always consult a qualified healthcare professional regarding your individual health concerns.
              </p>
            </section>

            {/* 21. Appointment CTA Inside Blog */}
            <section className="mt-10 bg-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-lg z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                  <HeartPulse size={13} className="text-blue-400" />
                  <span>Clinical Care</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {article.ctaTitle || 'Have questions about your health?'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {article.ctaDescription || 'Our healthcare team is here to help you understand your symptoms, preventive care options, and next steps.'}
                </p>
              </div>

              <div className="z-10 shrink-0">
                <Link
                  to={article.ctaButtonUrl || '/contact'}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-7 py-3 rounded-full shadow-lg shadow-blue-600/30 hover:scale-105 transition-all"
                >
                  <span>{article.ctaButtonText || 'Book an Appointment'}</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </section>

            {/* 20. Related Articles Section */}
            {relatedArticles.length > 0 && (
              <section className="mt-14 pt-10 border-t border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    You May Also Like
                  </h3>
                  <Link
                    to={`/blog?category=${encodeURIComponent(article.category)}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>View More in {article.category}</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {relatedArticles.map((rel) => (
                    <article
                      key={rel.id}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                    >
                      <div>
                        <Link to={`/blog/${rel.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-slate-100">
                          <img
                            src={rel.featuredImage}
                            alt={rel.featuredImageAlt || rel.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </Link>
                        <div className="p-4 space-y-2">
                          <div className="text-[11px] text-slate-400">{rel.publishDate} • {rel.readTimeMinutes} min read</div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                            <Link to={`/blog/${rel.slug}`}>{rel.title}</Link>
                          </h4>
                        </div>
                      </div>

                      <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-slate-100">
                        <span className="text-[11px] font-medium text-slate-600 truncate max-w-[120px]">{rel.author}</span>
                        <Link
                          to={`/blog/${rel.slug}`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                        >
                          <span>Read</span>
                          <ChevronRight size={13} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Sticky Side Panel: Table of Contents + Author Information */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-28 space-y-6">
            {/* 13. Automatic Table of Contents ("In This Article") */}
            {tocList.length >= 2 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-4 pb-3 border-b border-slate-100">
                  <ListTree size={16} className="text-blue-600" />
                  <span>In This Article</span>
                </div>
                <nav className="space-y-2 text-xs">
                  {tocList.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToHeading(item.id)}
                      className={`w-full text-left py-1 px-2 rounded-lg transition-colors block cursor-pointer ${
                        item.level === 3 ? 'pl-5 text-slate-500' : 'font-medium text-slate-700'
                      } ${
                        activeHeadingId === item.id 
                          ? 'bg-blue-50 text-blue-700 font-bold' 
                          : 'hover:bg-slate-50 hover:text-blue-600'
                      }`}
                    >
                      {idx + 1}. {item.text}
                    </button>
                  ))}
                </nav>
              </div>
            )}

            {/* 14. Professional Author Information Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                About The Author
              </div>
              <div className="flex items-center gap-3.5 mb-3.5">
                {article.authorAvatar ? (
                  <img
                    src={article.authorAvatar}
                    alt={article.author}
                    className="w-14 h-14 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                    {article.author.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{article.author}</h4>
                  <p className="text-xs text-blue-600 font-medium">{article.authorTitle || 'Staff Physician'}</p>
                  {authorProvider && (
                    <p className="text-[11px] text-slate-500 mt-0.5">{authorProvider.specialty}</p>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {authorProvider?.bio || 
                  `Dr. ${article.author.replace(/^Dr\.\s*/, '')} is a dedicated physician at Newark Medical Associates, committed to delivering compassionate primary care, clinical diagnostics, and evidence-based preventive health in Newark, NJ.`}
              </p>

              <Link
                to="/providers"
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2.5 px-4 rounded-full transition-all"
              >
                <User size={13} />
                <span>View Clinical Profile</span>
              </Link>
            </div>

            {/* Quick Clinic Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-teal-50/40 p-6 rounded-3xl border border-blue-100 shadow-2xs text-xs text-slate-700 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Stethoscope size={16} className="text-blue-600" />
                <span>Need Medical Attention?</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                We welcome new patients and same-day walk-ins for physicals, diagnostic tests, and acute care in Newark.
              </p>
              <div className="pt-2">
                <Link
                  to="/contact"
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-full shadow-xs transition-all"
                >
                  <span>Book Visit Now</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
