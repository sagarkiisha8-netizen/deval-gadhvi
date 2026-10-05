import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, Search, Filter, BookOpen, Layers, Edit3, Trash2, 
  Copy, ExternalLink, CheckCircle2, Clock, FileText, 
  Eye, Calendar, Check, AlertCircle, ShieldCheck, Rss, Globe,
  MoreVertical, ArrowUpRight, UserCheck, Tag, Newspaper
} from 'lucide-react';
import { useCmsData } from '../../../context/CmsContext';
import { BlogPost } from '../../../types';
import BlogCategoriesModal from '../../components/BlogCategoriesModal';
import BlogAuthorsModal from '../../components/BlogAuthorsModal';
import BlogTagsModal from '../../components/BlogTagsModal';
import BlogDevicePreviewModal from '../../components/BlogDevicePreviewModal';
import DeleteBlogConfirmModal from '../../components/DeleteBlogConfirmModal';

export default function BlogsList() {
  const navigate = useNavigate();
  const { blogs, blogCategories, blogAuthors, blogTags, deleteBlog, duplicateBlog, updateBlog } = useCmsData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'scheduled' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewCandidate, setPreviewCandidate] = useState<BlogPost | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered list
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchesSearch = 
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter || b.categoryId === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [blogs, searchTerm, statusFilter, categoryFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: blogs.length,
      published: blogs.filter(b => b.status === 'published').length,
      drafts: blogs.filter(b => b.status === 'draft').length,
      scheduled: blogs.filter(b => b.status === 'scheduled').length,
      categoriesCount: blogCategories.length
    };
  }, [blogs, blogCategories]);

  const handleTogglePublish = async (blog: BlogPost) => {
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    await updateBlog(blog.id, { 
      status: newStatus,
      publishDate: newStatus === 'published' && !blog.publishDate ? new Date().toISOString().split('T')[0] : blog.publishDate 
    });
    showToast(`Article status updated to ${newStatus}`);
  };

  const handleDuplicate = async (id: string) => {
    try {
      const copy = await duplicateBlog(id);
      showToast(`Duplicated article: "${copy.title}"`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (blog: BlogPost) => {
    setDeleteCandidate(blog);
  };

  const handleArchiveCandidate = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await updateBlog(deleteCandidate.id, {
        status: 'archived',
        updatedAt: new Date().toISOString()
      });
      showToast(`Article "${deleteCandidate.title}" safely moved to archive`);
      setDeleteCandidate(null);
    } catch (err: any) {
      alert(`Archive failed: ${err?.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeletePermanently = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await deleteBlog(deleteCandidate.id);
      showToast('Article permanently deleted from database');
      setDeleteCandidate(null);
    } catch (err: any) {
      alert(`Delete failed: ${err?.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-800 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-primary-700 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen size={15} />
            <span>Editorial & Publication Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Blog & Medical Articles
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Publish clinical insights, preventive health guides, and Google News-ready healthcare updates with full YMYL compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Taxonomy & Contributors Management Links */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <Link
              to="/admin/blog-authors"
              className="px-3 py-1.5 hover:bg-white hover:shadow-xs text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all"
              title="Manage Medical Authors & Fact-Checkers"
            >
              <UserCheck size={13} className="text-primary-600" />
              <span>Authors ({blogAuthors.length})</span>
            </Link>

            <Link
              to="/admin/blog-categories"
              className="px-3 py-1.5 hover:bg-white hover:shadow-xs text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all"
              title="Manage Clinical Categories"
            >
              <Layers size={13} className="text-primary-600" />
              <span>Categories ({blogCategories.length})</span>
            </Link>

            <Link
              to="/admin/blog-tags"
              className="px-3 py-1.5 hover:bg-white hover:shadow-xs text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all"
              title="Manage Medical Tags"
            >
              <Tag size={13} className="text-primary-600" />
              <span>Tags ({blogTags.length})</span>
            </Link>
          </div>
          
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            title="XML Sitemap"
          >
            <Globe size={13} />
            <span className="hidden sm:inline">Sitemap</span>
          </a>

          <a
            href="/sitemap-news.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            title="Google News XML Sitemap"
          >
            <Newspaper size={13} />
            <span className="hidden sm:inline">News Sitemap</span>
          </a>

          <button
            onClick={() => navigate('/admin/blogs/new')}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} />
            <span>New Article</span>
          </button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-slate-400 text-xs font-medium mb-1">Total Articles</div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.total}</div>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-slate-400 text-xs font-medium mb-1">Published Live</div>
          <div className="text-2xl font-extrabold text-emerald-600 flex items-center gap-1.5">
            <span>{stats.published}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-slate-400 text-xs font-medium mb-1">Drafts / In Review</div>
          <div className="text-2xl font-extrabold text-amber-600">{stats.drafts}</div>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-slate-400 text-xs font-medium mb-1">Scheduled</div>
          <div className="text-2xl font-extrabold text-purple-600">{stats.scheduled}</div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles by title, author, category, or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {(['all', 'published', 'draft', 'scheduled'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  statusFilter === s
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Categories</option>
            {blogCategories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles List Table / Grid */}
      {filteredBlogs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <FileText size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No articles found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your search query or filters to find what you are looking for.'
              : 'Start your medical knowledge hub by creating your first clinical article.'}
          </p>
          <button
            onClick={() => navigate('/admin/blogs/new')}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus size={15} />
            <span>Create New Article</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredBlogs.map((blog) => {
              const isPublished = blog.status === 'published';
              const isDraft = blog.status === 'draft';
              const isScheduled = blog.status === 'scheduled';

              return (
                <div
                  key={blog.id}
                  className="p-5 md:p-6 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left Column: Image + Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative group">
                      <img
                        src={blog.coverImage || blog.featuredImage || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=300'}
                        alt={blog.coverImageAlt || blog.featuredImageAlt || blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {blog.isFeatured && (
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-extrabold uppercase">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Meta & Title */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                            isPublished
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isDraft
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : isScheduled
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPublished ? 'bg-emerald-500' : isDraft ? 'bg-amber-500' : isScheduled ? 'bg-purple-500' : 'bg-slate-400'
                            }`}
                          />
                          {blog.status}
                        </span>

                        {/* Category */}
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {blog.category}
                        </span>

                        {/* Medical Review Badge */}
                        {(blog.reviewedByDoctor || blog.medicallyReviewedBy) && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 inline-flex items-center gap-1">
                            <ShieldCheck size={11} className="text-blue-600" />
                            <span>Reviewed by {blog.reviewedByDoctor || blog.medicallyReviewedBy}</span>
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-slate-900 hover:text-primary-700 transition-colors line-clamp-1">
                        <Link to={`/admin/blogs/${blog.id}`}>{blog.title}</Link>
                      </h3>

                      {/* Excerpt snippet */}
                      <p className="text-xs text-slate-500 line-clamp-1">{blog.excerpt || 'No excerpt configured.'}</p>

                      {/* Author & Date metadata */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          {blog.authorAvatar ? (
                            <img src={blog.authorAvatar} alt={blog.author} className="w-4 h-4 rounded-full object-cover" />
                          ) : null}
                          <span>{blog.author}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{blog.publishDate || 'Not published'}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{blog.readTimeMinutes || 4} min read</span>
                        </div>
                        <span>•</span>
                        <span className="font-mono text-slate-400 text-[10px]">/blog/{blog.slug}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 justify-end shrink-0">
                    {/* Device Sandboxed Preview */}
                    <button
                      onClick={() => setPreviewCandidate(blog)}
                      className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      title="Interactive multi-device preview"
                    >
                      <Eye size={15} className="text-primary-600" />
                      <span className="hidden sm:inline">Preview</span>
                    </button>

                    {/* View Live URL if published */}
                    {isPublished && (
                      <a
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-colors"
                        title="Open live public URL"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}

                    {/* Quick Publish / Unpublish Toggle */}
                    <button
                      onClick={() => handleTogglePublish(blog)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isPublished
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isPublished ? 'Unpublish' : 'Publish'}
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={() => handleDuplicate(blog.id)}
                      className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
                      title="Duplicate article"
                    >
                      <Copy size={15} />
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => navigate(`/admin/blogs/${blog.id}`)}
                      className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(blog)}
                      className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                      title="Delete or archive article"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories Management Modal */}
      <BlogCategoriesModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* Authors Management Modal */}
      <BlogAuthorsModal
        isOpen={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
      />

      {/* Tags Management Modal */}
      <BlogTagsModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
      />

      {/* Multi-Device Sandboxed Preview Modal */}
      {previewCandidate && (
        <BlogDevicePreviewModal
          isOpen={!!previewCandidate}
          onClose={() => setPreviewCandidate(null)}
          post={previewCandidate}
          author={blogAuthors.find(a => a.id === previewCandidate.authorId || a.name === previewCandidate.author)}
          reviewer={blogAuthors.find(a => a.id === previewCandidate.medicalReviewerId || a.name === previewCandidate.reviewedByDoctor)}
        />
      )}

      {/* Delete Safety Confirmation Modal */}
      {deleteCandidate && (
        <DeleteBlogConfirmModal
          isOpen={!!deleteCandidate}
          onClose={() => setDeleteCandidate(null)}
          blog={deleteCandidate}
          isProcessing={isDeleting}
          onArchiveInstead={handleArchiveCandidate}
          onDeletePermanently={handleDeletePermanently}
        />
      )}
    </div>
  );
}
