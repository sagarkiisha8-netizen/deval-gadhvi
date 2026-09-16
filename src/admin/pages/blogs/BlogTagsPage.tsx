import React, { useState } from 'react';
import { 
  Tag, Plus, Search, Edit2, Trash2, Check, 
  ExternalLink, BookOpen, ArrowLeft, Sparkles 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCmsData } from '../../../context/CmsContext';
import { BlogTag } from '../../../types';

export default function BlogTagsPage() {
  const { blogTags, createTag, updateTag, deleteTag, blogs } = useCmsData();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [tagName, setTagName] = useState('');
  const [tagSlug, setTagSlug] = useState('');
  const [tagDesc, setTagDesc] = useState('');

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
    setTagName(val);
    setTagSlug(slugify(val));
  };

  const handleStartAdd = () => {
    setEditingId(null);
    setTagName('');
    setTagSlug('');
    setTagDesc('');
    setIsAdding(true);
  };

  const handleStartEdit = (tag: BlogTag) => {
    setEditingId(tag.id);
    setTagName(tag.name);
    setTagSlug(tag.slug);
    setTagDesc(tag.description || '');
    setIsAdding(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) {
      alert('Tag name is required.');
      return;
    }

    const cleanSlug = tagSlug.trim() || slugify(tagName);

    try {
      if (editingId) {
        await updateTag(editingId, {
          name: tagName.trim(),
          slug: cleanSlug,
          description: tagDesc.trim()
        });
        showToast(`Tag "${tagName}" updated.`);
        setEditingId(null);
      } else {
        await createTag({
          name: tagName.trim(),
          slug: cleanSlug,
          description: tagDesc.trim()
        });
        showToast(`Tag "${tagName}" created.`);
        setIsAdding(false);
      }
    } catch (err: any) {
      alert(`Failed to save tag: ${err?.message || 'Database error'}`);
    }
  };

  const handleDelete = async (tag: BlogTag) => {
    const articleCount = blogs.filter(b => b.tags && b.tags.some(t => t.toLowerCase() === tag.name.toLowerCase())).length;
    if (articleCount > 0) {
      if (!confirm(`Warning: "${tag.name}" is attached to ${articleCount} articles. Removing will untag those articles. Proceed?`)) {
        return;
      }
    } else {
      if (!confirm(`Delete tag "${tag.name}"?`)) {
        return;
      }
    }
    await deleteTag(tag.id);
    showToast(`Tag "${tag.name}" deleted.`);
    if (editingId === tag.id) setEditingId(null);
  };

  const filteredTags = blogTags.filter(t =>
    !searchTerm ||
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <span className="font-semibold text-slate-700">Tag Management</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Tag className="text-primary-600" size={24} />
            <span>Clinical Topic Tags</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize articles with granular health keywords for internal cross-linking and user discovery.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartAdd}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Add New Tag</span>
        </button>
      </div>

      {/* Search & Suggested Tags Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tags or slugs..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Suggested Clinical Tags */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Recommended Topics:</span>
          {['Diabetes Prevention', 'Blood Pressure', 'Heart Health', 'Sleep', 'Smoking', 'Nutrition'].map((sug) => {
            const alreadyExists = blogTags.some(t => t.name.toLowerCase() === sug.toLowerCase());
            return (
              <button
                key={sug}
                type="button"
                disabled={alreadyExists}
                onClick={() => {
                  setTagName(sug);
                  setTagSlug(slugify(sug));
                  setTagDesc(`Articles and clinical insights regarding ${sug.toLowerCase()}.`);
                  setEditingId(null);
                  setIsAdding(true);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  alreadyExists 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-100'
                }`}
                title={alreadyExists ? 'Already added' : `Add ${sug}`}
              >
                + {sug}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Form + Tags Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Editor Form Column */}
        {(isAdding || editingId) && (
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-primary-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit2 size={15} className="text-primary-600" />
                <span>{editingId ? 'Edit Tag' : 'Create Topic Tag'}</span>
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
                  Tag Name *
                </label>
                <input
                  type="text"
                  required
                  value={tagName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Diabetes Prevention"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tag URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={tagSlug}
                  onChange={(e) => setTagSlug(slugify(e.target.value))}
                  placeholder="e.g. diabetes-prevention"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={tagDesc}
                  onChange={(e) => setTagDesc(e.target.value)}
                  placeholder="Brief clinical summary of this topic..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingId ? 'Save Tag Updates' : 'Create Tag'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tags List Column */}
        <div className={`space-y-4 ${isAdding || editingId ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="p-4">Tag Name & Slug</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-center">Tagged Articles</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTags.map((tag) => {
                    const articleCount = blogs.filter(b => b.tags && b.tags.some(t => t.toLowerCase() === tag.name.toLowerCase())).length;

                    return (
                      <tr key={tag.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-primary-50 text-primary-700 rounded-lg">
                              <Tag size={12} />
                            </span>
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{tag.name}</div>
                              <div className="font-mono text-[11px] text-slate-400">/blog?tag={encodeURIComponent(tag.name)}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-slate-600 max-w-xs truncate">
                          {tag.description || <span className="text-slate-300 italic">No description</span>}
                        </td>

                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-full text-[11px]">
                            <BookOpen size={12} className="text-slate-400" />
                            {articleCount}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <a
                              href={`/blog?tag=${encodeURIComponent(tag.name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-colors"
                              title="View Tag in Public Journal"
                            >
                              <ExternalLink size={14} />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(tag)}
                              className="p-2 hover:bg-slate-100 text-slate-500 hover:text-primary-600 rounded-xl transition-colors cursor-pointer"
                              title="Edit Tag"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(tag)}
                              className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                              title="Delete Tag"
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

            {filteredTags.length === 0 && (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Tag size={32} className="mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">No tags found</p>
                <p className="text-xs text-slate-400">Create a new tag or click one of the suggested topics above.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
