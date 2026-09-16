import React, { useState } from 'react';
import { 
  Layers, Plus, Search, Edit2, Trash2, ArrowUpDown, 
  ArrowUp, ArrowDown, Check, AlertCircle, ExternalLink, 
  BookOpen, ArrowLeft, HeartPulse, Tag 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCmsData } from '../../../context/CmsContext';
import { BlogCategory } from '../../../types';

export default function BlogCategoriesPage() {
  const { blogCategories, createCategory, updateCategory, deleteCategory, reorderCategories, blogs } = useCmsData();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<BlogCategory>>({
    name: '',
    slug: '',
    description: '',
    seoTitle: '',
    metaDescription: '',
    displayOrder: 1
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      name: val,
      slug: slugify(val),
      seoTitle: prev.seoTitle || `${val} Articles & Guides | Newark Medical Associates`
    }));
  };

  const handleStartAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      seoTitle: '',
      metaDescription: '',
      displayOrder: blogCategories.length + 1
    });
    setIsAdding(true);
  };

  const handleStartEdit = (cat: BlogCategory) => {
    setEditingId(cat.id);
    setFormData(cat);
    setIsAdding(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Category name is required.');
      return;
    }

    const cleanSlug = formData.slug?.trim() || slugify(formData.name);

    try {
      if (editingId) {
        await updateCategory(editingId, {
          ...formData,
          slug: cleanSlug
        });
        showToast(`Category "${formData.name}" updated.`);
        setEditingId(null);
      } else {
        await createCategory({
          ...formData,
          slug: cleanSlug,
          displayOrder: blogCategories.length + 1
        });
        showToast(`Category "${formData.name}" created.`);
        setIsAdding(false);
      }
    } catch (err: any) {
      alert(`Failed to save category: ${err?.message || 'Database error'}`);
    }
  };

  const handleDelete = async (cat: BlogCategory) => {
    const articleCount = blogs.filter(b => b.categoryId === cat.id || b.category === cat.name).length;
    if (articleCount > 0) {
      if (!confirm(`Warning: There are ${articleCount} articles filed under "${cat.name}". Deleting this category will remove its taxonomy link. Proceed?`)) {
        return;
      }
    } else {
      if (!confirm(`Delete category "${cat.name}"?`)) {
        return;
      }
    }
    await deleteCategory(cat.id);
    showToast(`Category "${cat.name}" deleted.`);
    if (editingId === cat.id) setEditingId(null);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blogCategories.length) return;

    const list = [...blogCategories];
    const temp = list[index];
    list[index] = list[newIndex];
    list[newIndex] = temp;

    const orderedIds = list.map(c => c.id);
    await reorderCategories(orderedIds);
    showToast('Categories reordered.');
  };

  const filteredCategories = blogCategories.filter(c => 
    !searchTerm || 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 text-xs font-semibold flex items-center gap-2">
          <Check size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/admin/blogs" className="hover:text-primary-600 flex items-center gap-1 font-medium">
              <ArrowLeft size={13} />
              <span>Back to Blogs</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-700">Category Management</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Layers className="text-primary-600" size={24} />
            <span>Clinical Blog Categories</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize articles into medical specializations, configure SEO metadata, and reorder public navigation tags.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartAdd}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Search & Suggested Specialties Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories or slugs..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Quick Suggestions for Medical Relevance */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Relevant Specialties:</span>
          {['Heart Health', 'Diabetes', 'Pulmonology', 'Neurology', 'Preventive Care', 'Healthy Lifestyle'].map((spec) => {
            const alreadyExists = blogCategories.some(c => c.name.toLowerCase() === spec.toLowerCase());
            return (
              <button
                key={spec}
                type="button"
                disabled={alreadyExists}
                onClick={() => {
                  setFormData({
                    name: spec,
                    slug: slugify(spec),
                    description: `Clinical guidance, symptoms, and preventive treatments for ${spec.toLowerCase()}.`,
                    seoTitle: `${spec} | Newark Medical Associates Care Guides`,
                    metaDescription: `Explore evidence-based health articles and clinical advice on ${spec.toLowerCase()} from our Newark medical team.`
                  });
                  setEditingId(null);
                  setIsAdding(true);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  alreadyExists 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-100'
                }`}
                title={alreadyExists ? 'Already in category list' : `Click to add ${spec}`}
              >
                + {spec}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Form + Categories Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Editor Form Column */}
        {(isAdding || editingId) && (
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-primary-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit2 size={15} className="text-primary-600" />
                <span>{editingId ? 'Edit Category' : 'Create Category'}</span>
              </h3>
              <button
                type="button"
                onClick={() => { setIsAdding(false); setEditingId(null); }}
                className="text-xs text-slate-400 hover:text-slate-700 font-medium"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Heart Health"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                  placeholder="e.g. heart-health"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary displayed on category archive pages..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              {/* SEO Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={formData.seoTitle || ''}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  placeholder="Heart Health Articles & Tips | Newark Medical Associates"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={2}
                  value={formData.metaDescription || ''}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="Meta description for search results..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingId ? 'Save Category Updates' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List Column */}
        <div className={`space-y-4 ${isAdding || editingId ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="p-4 w-12 text-center">Order</th>
                    <th className="p-4">Category Name & Slug</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-center">Articles</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCategories.map((cat, idx) => {
                    const articleCount = blogs.filter(b => b.categoryId === cat.id || b.category === cat.name).length;

                    return (
                      <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Order Controls */}
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleMove(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 hover:bg-slate-200 text-slate-500 rounded disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <span className="font-mono text-[10px] text-slate-400 font-bold">{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleMove(idx, 'down')}
                              disabled={idx === blogCategories.length - 1}
                              className="p-1 hover:bg-slate-200 text-slate-500 rounded disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        </td>

                        {/* Name & Slug */}
                        <td className="p-4">
                          <div className="font-bold text-slate-900 text-sm">{cat.name}</div>
                          <div className="font-mono text-[11px] text-slate-400">/blog?category={cat.slug}</div>
                        </td>

                        {/* Description */}
                        <td className="p-4 text-slate-600 max-w-xs truncate">
                          {cat.description || <span className="text-slate-300 italic">No description</span>}
                        </td>

                        {/* Articles Count */}
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-full text-[11px]">
                            <BookOpen size={12} className="text-slate-400" />
                            {articleCount}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <a
                              href={`/blog?category=${cat.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-colors"
                              title="View Public Category Archive"
                            >
                              <ExternalLink size={14} />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(cat)}
                              className="p-2 hover:bg-slate-100 text-slate-500 hover:text-primary-600 rounded-xl transition-colors cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(cat)}
                              className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredCategories.length === 0 && (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Layers size={32} className="mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">No categories found</p>
                <p className="text-xs text-slate-400">Add a new category or select one from the suggested medical list above.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
