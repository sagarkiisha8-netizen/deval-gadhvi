import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Save, Eye, Send, Trash2, Copy, Sparkles, 
  Image as ImageIcon, Tag, Check, AlertCircle, Calendar, 
  Clock, ShieldCheck, BookOpen, Globe, Link2, Share2, 
  Plus, X, ExternalLink, HelpCircle, Layers, FileText,
  CheckCircle2, AlertTriangle, Newspaper, UserCheck, Stethoscope,
  ChevronDown, Archive, Undo2
} from 'lucide-react';
import { useCmsData } from '../../../context/CmsContext';
import { BlogPost, BlogReference, BlogAuthor, BlogCategory } from '../../../types';
import RichTextEditor from '../../components/RichTextEditor';
import FeaturedImageUploader from '../../components/FeaturedImageUploader';
import BlogSeoPanel from '../../components/BlogSeoPanel';
import GoogleNewsReadinessPanel from '../../components/GoogleNewsReadinessPanel';
import BlogCategoriesModal from '../../components/BlogCategoriesModal';
import BlogAuthorsModal from '../../components/BlogAuthorsModal';
import BlogTagsModal from '../../components/BlogTagsModal';
import BlogDevicePreviewModal from '../../components/BlogDevicePreviewModal';
import DeleteBlogConfirmModal from '../../components/DeleteBlogConfirmModal';
import { getAuthorAvatar } from '../../../utils/providerImages';

export default function BlogEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const { 
    blogs, 
    blogCategories, 
    blogAuthors,
    blogTags,
    providers, 
    createBlog, 
    updateBlog, 
    deleteBlog, 
    duplicateBlog,
    checkSlugUnique,
    siteSettings 
  } = useCmsData();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'content' | 'editorial' | 'seo' | 'google_news' | 'taxonomy'>('content');

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDevicePreviewOpen, setIsDevicePreviewOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Editor states
  const [slugLocked, setSlugLocked] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Primary Form State
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    author: 'Dr. Prahlad Gadhvi',
    authorId: '',
    authorTitle: 'MD, FACP - Internal Medicine',
    authorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
    category: 'Preventive Care',
    categoryId: 'cat-preventive-care',
    tags: ['Preventive Care', 'Wellness'],
    excerpt: '',
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200',
    coverImageAlt: 'Physician examining patient resting blood pressure',
    content: '<p>Start typing your clinical health guide here...</p>',
    status: 'draft',
    publishDate: new Date().toISOString().split('T')[0],
    scheduledPublishDate: '',
    readTimeMinutes: 4,
    reviewedByDoctor: '',
    medicalReviewerId: '',
    medicalReviewDate: '',
    factCheckStatus: 'unverified',
    clinicalVerificationBoard: '',
    references: [],
    seoTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    noIndex: false,
    noFollow: false,
    primaryKeyword: '',
    secondaryKeywords: [],
    originalReportingScore: 8,
    isFeatured: false,
    relatedArticleIds: [],
    ctaTitle: 'Schedule a Comprehensive Consultation',
    ctaDescription: 'Speak with our board-certified internal medicine specialists at Newark Medical Clinic.',
    ctaButtonText: 'Book Appointment Online',
    ctaButtonUrl: '/contact'
  });

  // Load existing article if editing
  useEffect(() => {
    if (!isNew && id) {
      const existing = blogs.find((b) => b.id === id);
      if (existing) {
        setFormData(existing);
        setLastSavedTime(new Date().toLocaleTimeString());
      }
    }
  }, [id, isNew, blogs]);

  // Synchronize author details if authorId changes or if default author selected
  const activeAuthor = useMemo(() => {
    return blogAuthors.find(a => a.id === formData.authorId || a.name === formData.author) || blogAuthors[0];
  }, [blogAuthors, formData.authorId, formData.author]);

  const activeReviewer = useMemo(() => {
    return blogAuthors.find(a => a.id === formData.medicalReviewerId || a.name === formData.reviewedByDoctor);
  }, [blogAuthors, formData.medicalReviewerId, formData.reviewedByDoctor]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const isCurrentSlugUnique = useMemo(() => {
    if (!formData.slug) return true;
    return checkSlugUnique(formData.slug, id);
  }, [formData.slug, id, checkSlugUnique]);

  const handleTitleChange = (val: string) => {
    setHasUnsavedChanges(true);
    setFormData((prev) => {
      const updated = { ...prev, title: val };
      if (slugLocked && (isNew || !prev.slug)) {
        updated.slug = slugify(val);
      }
      if (!prev.seoTitle || prev.seoTitle === prev.title) {
        updated.seoTitle = `${val} | ${siteSettings?.general?.clinicName || 'Newark Medical Clinic'}`;
      }
      return updated;
    });
  };

  // Word count & read time auto calculate
  useEffect(() => {
    const plainText = (formData.content || '').replace(/<[^>]*>/g, ' ').trim();
    const words = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
    const calcReadTime = Math.max(1, Math.ceil(words / 200));
    setFormData(prev => ({
      ...prev,
      readTimeMinutes: calcReadTime
    }));
  }, [formData.content]);

  // Debounced auto-save for existing articles / drafts
  useEffect(() => {
    if (isNew || !id || !hasUnsavedChanges || isSaving) return;

    const timer = setTimeout(async () => {
      setAutoSaveStatus('saving');
      try {
        await updateBlog(id, {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        setHasUnsavedChanges(false);
        const timeStr = new Date().toLocaleTimeString();
        setLastSavedTime(timeStr);
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      } catch (err) {
        console.error('Auto-save error:', err);
        setAutoSaveStatus('idle');
      }
    }, 30000); // 30s debounced autosave

    return () => clearTimeout(timer);
  }, [formData, hasUnsavedChanges, isNew, id, isSaving, updateBlog]);

  // References management
  const handleAddReference = () => {
    const newRef: BlogReference = {
      id: `ref-${Date.now()}`,
      title: '',
      url: '',
      source: '',
      year: new Date().getFullYear().toString()
    };
    setHasUnsavedChanges(true);
    setFormData(prev => ({
      ...prev,
      references: [...(prev.references || []), newRef]
    }));
  };

  const handleUpdateReference = (refId: string, updates: Partial<BlogReference>) => {
    setHasUnsavedChanges(true);
    setFormData(prev => ({
      ...prev,
      references: (prev.references || []).map(r => r.id === refId ? { ...r, ...updates } : r)
    }));
  };

  const handleRemoveReference = (refId: string) => {
    setHasUnsavedChanges(true);
    setFormData(prev => ({
      ...prev,
      references: (prev.references || []).filter(r => r.id !== refId)
    }));
  };

  // Tag helper
  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (('key' in e && (e.key === 'Enter' || e.key === ',')) || e.type === 'click') {
      if ('preventDefault' in e) e.preventDefault();
      const clean = tagInput.trim().replace(/^,|,$/g, '');
      if (clean && !(formData.tags || []).includes(clean)) {
        setHasUnsavedChanges(true);
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), clean]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setHasUnsavedChanges(true);
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tagToRemove)
    }));
  };

  // Save logic with zero premature claim
  const handleSave = async (statusOverride?: 'draft' | 'published' | 'scheduled' | 'archived') => {
    if (!formData.title?.trim()) {
      alert('Please enter an article title before saving.');
      return;
    }

    const cleanSlug = formData.slug?.trim() || slugify(formData.title);
    if (!checkSlugUnique(cleanSlug, id)) {
      alert(`The URL slug "${cleanSlug}" is already taken by another article. Please use a unique slug.`);
      return;
    }

    setIsSaving(true);
    try {
      const finalStatus = statusOverride || formData.status || 'draft';
      const nowIso = new Date().toISOString();
      const todayDate = nowIso.split('T')[0];

      const payload: Partial<BlogPost> = {
        ...formData,
        status: finalStatus,
        slug: cleanSlug,
        canonicalUrl: formData.canonicalUrl || `${window.location.origin}/blog/${cleanSlug}`,
        seoTitle: formData.seoTitle || `${formData.title} | ${siteSettings?.general?.clinicName || 'Newark Medical Clinic'}`,
        metaDescription: formData.metaDescription || formData.excerpt || '',
        publishDate: finalStatus === 'published' && !formData.publishDate ? todayDate : formData.publishDate || todayDate,
        updatedAt: nowIso
      };

      if (isNew) {
        const created = await createBlog(payload);
        setHasUnsavedChanges(false);
        setLastSavedTime(new Date().toLocaleTimeString());
        showToast(`Article successfully published as ${finalStatus}!`);
        navigate(`/admin/blogs/${created.id}`, { replace: true });
      } else if (id) {
        await updateBlog(id, payload);
        setHasUnsavedChanges(false);
        setLastSavedTime(new Date().toLocaleTimeString());
        showToast(`Article saved to Firestore (${finalStatus})!`);
      }
    } catch (e: any) {
      console.error('Firestore save failed:', e);
      alert(`Failed to save article: ${e?.message || 'Database connection error'}`);
    } finally {
      setIsSaving(false);
      setIsScheduleModalOpen(false);
    }
  };

  const handleDeleteArticle = () => {
    if (!id || isNew) return;
    setIsDeleteModalOpen(true);
  };

  const handleArchiveInstead = async () => {
    if (!id || isNew) return;
    setIsSaving(true);
    try {
      await updateBlog(id, { 
        status: 'archived', 
        updatedAt: new Date().toISOString() 
      });
      setFormData(prev => ({ ...prev, status: 'archived' }));
      showToast('Article safely moved to Archive.');
      setIsDeleteModalOpen(false);
    } catch (e: any) {
      alert(`Archive error: ${e?.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePermanently = async () => {
    if (!id || isNew) return;
    setIsSaving(true);
    try {
      await deleteBlog(id);
      setIsDeleteModalOpen(false);
      navigate('/admin/blogs');
    } catch (e: any) {
      alert(`Delete error: ${e?.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicateArticle = async () => {
    if (!id || isNew) return;
    try {
      const copy = await duplicateBlog(id);
      showToast('Article duplicated as a fresh draft!');
      navigate(`/admin/blogs/${copy.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Action Header Bar */}
      <div className="bg-white p-4 md:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-4 z-40 backdrop-blur-md bg-white/95">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/blogs')}
            className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors cursor-pointer"
            title="Back to Blog Management"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                formData.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                formData.status === 'scheduled' ? 'bg-purple-100 text-purple-800' :
                formData.status === 'archived' ? 'bg-slate-100 text-slate-700' :
                'bg-amber-100 text-amber-800'
              }`}>
                {formData.status || 'Draft'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {isNew ? 'New Clinical Post' : `ID: ${id}`}
              </span>
              {autoSaveStatus === 'saving' && (
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-md border border-blue-200 animate-pulse">
                  Auto-saving to Firestore...
                </span>
              )}
              {autoSaveStatus === 'saved' && (
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-md border border-emerald-200">
                  ✓ Auto-saved
                </span>
              )}
              {lastSavedTime && (
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  • Saved {lastSavedTime}
                </span>
              )}
              {hasUnsavedChanges && autoSaveStatus !== 'saving' && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-semibold rounded-md border border-amber-200">
                  Unsaved edits
                </span>
              )}
            </div>
            <h1 className="text-base md:text-lg font-bold text-slate-900 line-clamp-1 mt-0.5">
              {formData.title || 'Untitled Clinical Guide'}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Interactive Multi-Device Preview */}
          <button
            type="button"
            onClick={() => setIsDevicePreviewOpen(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Interactive Multi-Device Preview (Desktop, Tablet, Mobile)"
          >
            <Eye size={14} className="text-primary-600" />
            <span>Device Preview</span>
          </button>

          {/* Public Preview */}
          {!isNew && (
            <a
              href={`/blog/${formData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              title="Preview on Public Website"
            >
              <ExternalLink size={12} className="text-slate-400" />
              <span>Public Page</span>
            </a>
          )}

          {!isNew && (
            <button
              onClick={handleDuplicateArticle}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
              title="Duplicate Article"
            >
              <Copy size={15} />
            </button>
          )}

          {!isNew && (
            <button
              onClick={handleDeleteArticle}
              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
              title="Delete Article"
            >
              <Trash2 size={15} />
            </button>
          )}

          {/* Save Draft */}
          <button
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          {/* Schedule Button */}
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar size={14} />
            <span>Schedule</span>
          </button>

          {/* Publish / Update Live */}
          <button
            onClick={() => handleSave('published')}
            disabled={isSaving}
            className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send size={14} />
            <span>{isNew || formData.status !== 'published' ? 'Publish Now' : 'Update Published'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-1.5 flex flex-wrap items-center gap-1 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'content' ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText size={15} />
          <span>Article Content</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('editorial')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'editorial' ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <UserCheck size={15} />
          <span>Editorial & Medical Review</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'seo' ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Globe size={15} />
          <span>SEO & Social Sharing</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('google_news')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'google_news' ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Newspaper size={15} />
          <span>Google News Readiness</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('taxonomy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'taxonomy' ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers size={15} />
          <span>Categories & Tags</span>
        </button>
      </div>

      {/* TAB 1: ARTICLE CONTENT */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Slug */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Managing Hypertension: Clinical Diagnosis, Risks, & Prevention Strategies"
                  className="w-full px-4 py-3 text-base font-bold text-slate-900 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Slug with Uniqueness indicator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <span>URL Slug</span>
                    <button
                      type="button"
                      onClick={() => setSlugLocked(!slugLocked)}
                      className="text-[11px] text-primary-600 hover:underline ml-2"
                    >
                      {slugLocked ? 'Edit manually' : 'Lock to title'}
                    </button>
                  </label>
                  <span className={`text-[11px] font-semibold ${isCurrentSlugUnique ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isCurrentSlugUnique ? '✓ Slug is available' : '⚠ Slug already exists in database'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 hidden sm:inline">
                    /blog/
                  </span>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    disabled={slugLocked}
                    onChange={(e) => {
                      setHasUnsavedChanges(true);
                      setFormData({ ...formData, slug: slugify(e.target.value) });
                    }}
                    placeholder="article-url-slug"
                    className={`flex-1 px-3 py-2 text-xs font-mono border rounded-xl focus:outline-none focus:ring-2 ${
                      isCurrentSlugUnique 
                        ? 'border-slate-200 focus:ring-primary-500 bg-white' 
                        : 'border-rose-300 bg-rose-50/50 focus:ring-rose-500'
                    } disabled:bg-slate-50 disabled:text-slate-500`}
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Abstract / Short Excerpt
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt || ''}
                  onChange={(e) => {
                    setHasUnsavedChanges(true);
                    setFormData({ ...formData, excerpt: e.target.value });
                  }}
                  placeholder="A clear 1-2 sentence clinical summary displayed on archive cards and search previews..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed"
                />
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Article Body
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Use H2 and H3 subheadings for clinical sections. Main title is strictly reserved as H1.
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  Est. Read: {formData.readTimeMinutes} min
                </div>
              </div>

              <RichTextEditor
                value={formData.content || ''}
                onChange={(cleanHtml) => {
                  setHasUnsavedChanges(true);
                  setFormData(prev => ({ ...prev, content: cleanHtml }));
                }}
                minHeight="420px"
              />
            </div>

            {/* In-Article Call to Action (CTA) Box */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    In-Article Patient Call-to-Action (CTA)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Displays at the conclusion of the article to guide patients to schedule appointments or consultations.
                  </p>
                </div>
                <Stethoscope size={18} className="text-primary-600" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CTA Heading
                  </label>
                  <input
                    type="text"
                    value={formData.ctaTitle || ''}
                    onChange={(e) => {
                      setHasUnsavedChanges(true);
                      setFormData({ ...formData, ctaTitle: e.target.value });
                    }}
                    placeholder="e.g. Concerned about hypertension?"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={formData.ctaButtonText || ''}
                    onChange={(e) => {
                      setHasUnsavedChanges(true);
                      setFormData({ ...formData, ctaButtonText: e.target.value });
                    }}
                    placeholder="Book Appointment Online"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CTA Description
                  </label>
                  <input
                    type="text"
                    value={formData.ctaDescription || ''}
                    onChange={(e) => {
                      setHasUnsavedChanges(true);
                      setFormData({ ...formData, ctaDescription: e.target.value });
                    }}
                    placeholder="Schedule a consultation with our board-certified clinical team today."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Featured Image & Quick Controls */}
          <div className="space-y-6">
            {/* Featured Image Uploader */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Featured Lead Image
                </h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                  16:9 Banner
                </span>
              </div>

              <FeaturedImageUploader
                imageUrl={formData.coverImage || ''}
                altText={formData.coverImageAlt || ''}
                caption={formData.coverImageCaption || ''}
                credit={formData.coverImageCredit || ''}
                onChange={({ imageUrl, altText, caption, credit }) => {
                  setHasUnsavedChanges(true);
                  setFormData(prev => ({
                    ...prev,
                    coverImage: imageUrl,
                    coverImageAlt: altText,
                    coverImageCaption: caption,
                    coverImageCredit: credit
                  }));
                }}
              />
            </div>

            {/* Quick Status & Publishing Box */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Publication Workflow
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Status
                </label>
                <select
                  value={formData.status || 'draft'}
                  onChange={(e) => {
                    setHasUnsavedChanges(true);
                    setFormData({ ...formData, status: e.target.value as any });
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                >
                  <option value="draft">Draft (Not indexed / Hidden from public)</option>
                  <option value="published">Published (Live & Indexed in sitemaps)</option>
                  <option value="scheduled">Scheduled for Future Release</option>
                  <option value="archived">Archived (Unindexed, preserved in records)</option>
                </select>
              </div>

              {formData.status === 'scheduled' && (
                <div>
                  <label className="block text-xs font-semibold text-purple-800 mb-1 flex items-center gap-1">
                    <Clock size={13} />
                    <span>Scheduled Publish Timestamp</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledPublishDate || ''}
                    onChange={(e) => {
                      setHasUnsavedChanges(true);
                      setFormData({ ...formData, scheduledPublishDate: e.target.value });
                    }}
                    className="w-full px-3 py-2 text-xs border border-purple-300 bg-purple-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Publication Date
                </label>
                <input
                  type="date"
                  value={formData.publishDate || ''}
                  onChange={(e) => {
                    setHasUnsavedChanges(true);
                    setFormData({ ...formData, publishDate: e.target.value });
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isFeatured)}
                    onChange={(e) => {
                      setHasUnsavedChanges(true);
                      setFormData({ ...formData, isFeatured: e.target.checked });
                    }}
                    className="rounded text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
                  />
                  <span>Pin as Featured Hero Article</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EDITORIAL & MEDICAL REVIEW */}
      {activeTab === 'editorial' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Author Selection */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Primary Medical Author
                </h3>
                <p className="text-[11px] text-slate-500">
                  Assign a certified doctor or healthcare contributor for Google E-E-A-T transparency.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthorModalOpen(true)}
                className="px-2.5 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>Manage Authors</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Author Profile
              </label>
              <select
                value={formData.authorId || formData.author || ''}
                onChange={(e) => {
                  const selId = e.target.value;
                  const auth = blogAuthors.find(a => a.id === selId || a.name === selId);
                  setHasUnsavedChanges(true);
                  if (auth) {
                    const dynamicAvatar = getAuthorAvatar(auth, providers, blogAuthors);
                    setFormData(prev => ({
                      ...prev,
                      authorId: auth.id,
                      author: auth.name,
                      authorTitle: `${auth.qualification || 'MD'} - ${auth.designation || 'Medical Contributor'}`,
                      authorAvatar: dynamicAvatar
                    }));
                  } else {
                    setFormData(prev => ({ ...prev, author: selId, authorId: '' }));
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
              >
                {blogAuthors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name} ({author.qualification || 'MD'} • {author.designation || 'Specialist'})
                  </option>
                ))}
              </select>
            </div>

            {/* Author Card Preview */}
            {activeAuthor && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                <img
                  src={getAuthorAvatar(formData.authorAvatar ? { name: formData.author || activeAuthor.name, profilePhoto: formData.authorAvatar } : activeAuthor, providers, blogAuthors)}
                  alt={formData.author || activeAuthor.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-300"
                  onError={(e) => {
                    (e.target as HTMLElement).setAttribute('src', '/newark_internal_medicine_4.webp');
                  }}
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {formData.author || activeAuthor.name}
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    {formData.authorTitle || `${activeAuthor.qualification} - ${activeAuthor.designation}`}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                    {activeAuthor.bio || 'Board-certified medical practitioner.'}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Original Reporting & Depth Score (1-10)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.originalReportingScore || 8}
                  onChange={(e) => {
                    setHasUnsavedChanges(true);
                    setFormData({ ...formData, originalReportingScore: parseInt(e.target.value) });
                  }}
                  className="flex-1"
                />
                <span className="font-mono font-bold text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-md">
                  {formData.originalReportingScore || 8} / 10
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Google News algorithms prioritize primary investigative health insights, first-hand clinical cases, and original data over syndicated aggregation.
              </p>
            </div>
          </div>

          {/* Medical Peer Review & Clinical Sign-off */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Medical Review & Fact-Checking Board
                </h3>
                <p className="text-[11px] text-slate-500">
                  Complies with Google YMYL (Your Money Your Life) health content quality guidelines.
                </p>
              </div>
              <ShieldCheck size={20} className="text-emerald-600" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designated Medical Reviewer
              </label>
              <select
                value={formData.medicalReviewerId || formData.reviewedByDoctor || ''}
                onChange={(e) => {
                  const selVal = e.target.value;
                  const reviewer = blogAuthors.find(a => a.id === selVal || a.name === selVal);
                  setHasUnsavedChanges(true);
                  if (reviewer) {
                    setFormData(prev => ({
                      ...prev,
                      medicalReviewerId: reviewer.id,
                      reviewedByDoctor: reviewer.name
                    }));
                  } else {
                    setFormData(prev => ({ ...prev, reviewedByDoctor: selVal, medicalReviewerId: '' }));
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
              >
                <option value="">None (Unreviewed)</option>
                {blogAuthors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}, {author.qualification || 'MD'} ({author.designation || 'Specialist'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medical Review Date
                </label>
                <input
                  type="date"
                  value={formData.medicalReviewDate || ''}
                  onChange={(e) => {
                    setHasUnsavedChanges(true);
                    setFormData({ ...formData, medicalReviewDate: e.target.value });
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fact Check Verification Status
                </label>
                <select
                  value={formData.factCheckStatus || 'verified'}
                  onChange={(e) => {
                    setHasUnsavedChanges(true);
                    setFormData({ ...formData, factCheckStatus: e.target.value as any });
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="verified">Verified by Clinical Board</option>
                  <option value="pending_review">Pending Clinical Audit</option>
                  <option value="needs_revision">Needs Physician Revision</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Board Entity Name
              </label>
              <input
                type="text"
                value={formData.clinicalVerificationBoard || ''}
                onChange={(e) => {
                  setHasUnsavedChanges(true);
                  setFormData({ ...formData, clinicalVerificationBoard: e.target.value });
                }}
                placeholder="e.g. Newark Medical Clinical Review Board"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Peer-Reviewed Scientific References */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Scientific Citations & Peer-Reviewed References (PubMed / DOI)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Medical articles citing PubMed, JAMA, Lancet, or CDC sources receive significantly higher Google News trust scores.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddReference}
                className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Citation</span>
              </button>
            </div>

            {(formData.references || []).length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                No citations added yet. Click &quot;Add Citation&quot; to cite peer-reviewed clinical studies.
              </div>
            ) : (
              <div className="space-y-3">
                {(formData.references || []).map((ref, idx) => (
                  <div
                    key={ref.id || idx}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Reference #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveReference(ref.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Study Title / Citation Text *
                        </label>
                        <input
                          type="text"
                          value={ref.title}
                          onChange={(e) => handleUpdateReference(ref.id, { title: e.target.value })}
                          placeholder="e.g. Whelton PK, et al. 2017 ACC/AHA High Blood Pressure Clinical Practice Guideline."
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Publication Source / Journal
                        </label>
                        <input
                          type="text"
                          value={ref.source || ''}
                          onChange={(e) => handleUpdateReference(ref.id, { source: e.target.value })}
                          placeholder="e.g. Journal of the American College of Cardiology"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          PubMed / DOI URL
                        </label>
                        <input
                          type="url"
                          value={ref.url || ''}
                          onChange={(e) => handleUpdateReference(ref.id, { url: e.target.value })}
                          placeholder="https://pubmed.ncbi.nlm.nih.gov/..."
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Year
                        </label>
                        <input
                          type="text"
                          value={ref.year || ''}
                          onChange={(e) => handleUpdateReference(ref.id, { year: e.target.value })}
                          placeholder="2024"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SEO & SOCIAL SHARING */}
      {activeTab === 'seo' && (
        <BlogSeoPanel
          post={formData}
          author={activeAuthor}
          siteName={siteSettings?.general?.clinicName || 'Newark Medical Clinic'}
          baseUrl={window.location.origin}
          onChange={(updates) => {
            setHasUnsavedChanges(true);
            setFormData(prev => ({ ...prev, ...updates }));
          }}
        />
      )}

      {/* TAB 4: GOOGLE NEWS READINESS PANEL */}
      {activeTab === 'google_news' && (
        <GoogleNewsReadinessPanel
          post={formData}
          author={activeAuthor}
          reviewer={activeReviewer}
          onJumpToField={(tab) => {
            if (tab === 'editorial') setActiveTab('editorial');
            else if (tab === 'seo') setActiveTab('seo');
            else setActiveTab('content');
          }}
        />
      )}

      {/* TAB 5: TAXONOMY (CATEGORIES, TAGS, RELATED) */}
      {activeTab === 'taxonomy' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categories */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Primary Category
                </h3>
                <p className="text-[11px] text-slate-500">
                  Assign this article to a clinical subject hierarchy for search categorization.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-2.5 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>Categories</span>
              </button>
            </div>

            <div className="space-y-2">
              {blogCategories.map((cat) => {
                const isSelected = formData.categoryId === cat.id || formData.category === cat.name;
                return (
                  <label
                    key={cat.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-primary-50/50 border-primary-300 ring-2 ring-primary-500/20' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="primary_category"
                        checked={isSelected}
                        onChange={() => {
                          setHasUnsavedChanges(true);
                          setFormData({
                            ...formData,
                            category: cat.name,
                            categoryId: cat.id
                          });
                        }}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{cat.name}</span>
                        {cat.description && (
                          <span className="text-[11px] text-slate-500 block">{cat.description}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      /blog/category/{cat.slug}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Topic Tags
                </h3>
                <p className="text-[11px] text-slate-500">
                  Granular index keywords (e.g. Hypertension, Blood Pressure, Diet).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTagModalOpen(true)}
                className="px-2.5 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>All Tags</span>
              </button>
            </div>

            {/* Quick Tag Adder */}
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag & press Enter"
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-xl text-xs cursor-pointer"
              >
                Add
              </button>
            </div>

            {/* Selected Tags Pills */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {(formData.tags || []).map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 bg-primary-50 text-primary-800 border border-primary-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-primary-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Popular Suggested Tags */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Click to add from existing tags:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {blogTags.filter(bt => !(formData.tags || []).includes(bt.name)).map(bt => (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() => {
                      setHasUnsavedChanges(true);
                      setFormData(prev => ({
                        ...prev,
                        tags: [...(prev.tags || []), bt.name]
                      }));
                    }}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] transition-colors"
                  >
                    + {bt.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Related Articles Selector */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Related Clinical Articles (Internal Linking)
              </h3>
              <p className="text-[11px] text-slate-500">
                Contextual internal links signal domain depth and topic clustering to Google News crawlers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {blogs.filter(b => b.id !== id).slice(0, 8).map((rel) => {
                const isLinked = (formData.relatedArticleIds || []).includes(rel.id);
                return (
                  <label
                    key={rel.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isLinked 
                        ? 'bg-primary-50/50 border-primary-300 ring-2 ring-primary-500/10' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isLinked}
                        onChange={(e) => {
                          setHasUnsavedChanges(true);
                          const current = formData.relatedArticleIds || [];
                          if (e.target.checked) {
                            setFormData({ ...formData, relatedArticleIds: [...current, rel.id] });
                          } else {
                            setFormData({ ...formData, relatedArticleIds: current.filter(rid => rid !== rel.id) });
                          }
                        }}
                        className="rounded text-primary-600 focus:ring-primary-500"
                      />
                      <div className="truncate max-w-xs">
                        <span className="text-xs font-bold text-slate-900 block truncate">{rel.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{rel.category} • {rel.publishDate}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Publishing Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Schedule Article Publication</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Choose the future release date and time. The article will remain unlisted until this timestamp passes.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Release Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledPublishDate || ''}
                onChange={(e) => setFormData({ ...formData, scheduledPublishDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-purple-300 bg-purple-50/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSave('scheduled')}
                disabled={!formData.scheduledPublishDate}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-50"
              >
                Confirm Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Modal */}
      <BlogCategoriesModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* Authors Modal */}
      <BlogAuthorsModal
        isOpen={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
        onSelectAuthor={(author) => {
          setHasUnsavedChanges(true);
          setFormData(prev => ({
            ...prev,
            authorId: author.id,
            author: author.name,
            authorTitle: `${author.qualification || 'MD'} - ${author.designation || 'Medical Contributor'}`,
            authorAvatar: author.profilePhoto
          }));
        }}
      />

      {/* Tags Modal */}
      <BlogTagsModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        selectedTags={formData.tags}
        onToggleTag={(tagName) => {
          setHasUnsavedChanges(true);
          const current = formData.tags || [];
          if (current.includes(tagName)) {
            setFormData({ ...formData, tags: current.filter(t => t !== tagName) });
          } else {
            setFormData({ ...formData, tags: [...current, tagName] });
          }
        }}
      />

      {/* Multi-Device Sandboxed Preview Modal */}
      <BlogDevicePreviewModal
        isOpen={isDevicePreviewOpen}
        onClose={() => setIsDevicePreviewOpen(false)}
        post={formData}
        author={blogAuthors.find(a => a.id === formData.authorId || a.name === formData.author)}
        reviewer={blogAuthors.find(a => a.id === formData.medicalReviewerId || a.name === formData.reviewedByDoctor)}
      />

      {/* Delete Safety Confirmation Modal */}
      <DeleteBlogConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        blog={formData}
        isProcessing={isSaving}
        onArchiveInstead={handleArchiveInstead}
        onDeletePermanently={handleDeletePermanently}
      />
    </div>
  );
}
