import React, { useState } from 'react';
import { 
  X, Plus, Tag, Edit2, Trash2, Check, AlertCircle, 
  Layers, ArrowUpDown 
} from 'lucide-react';
import { useCmsData } from '../../context/CmsContext';
import { BlogCategory } from '../../types';

interface BlogCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BlogCategoriesModal({ isOpen, onClose }: BlogCategoriesModalProps) {
  const { blogCategories, createCategory, updateCategory, deleteCategory, blogs } = useCmsData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDesc, setEditDesc] = useState('');
  
  // New category form
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (val: string) => {
    setNewName(val);
    setNewSlug(slugify(val));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setErrorMsg('Category name is required.');
      return;
    }
    setErrorMsg('');
    await createCategory({
      name: newName.trim(),
      slug: newSlug.trim() || slugify(newName),
      description: newDesc.trim(),
      displayOrder: blogCategories.length + 1
    });
    setNewName('');
    setNewSlug('');
    setNewDesc('');
    setIsAdding(false);
  };

  const startEdit = (cat: BlogCategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditDesc(cat.description || '');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    await updateCategory(id, {
      name: editName.trim(),
      slug: editSlug.trim() || slugify(editName),
      description: editDesc.trim()
    });
    setEditingId(null);
  };

  const handleDelete = async (id: string, name: string) => {
    const usageCount = blogs.filter(b => b.category === name || b.categoryId === id).length;
    if (usageCount > 0) {
      if (!confirm(`Warning: ${usageCount} article(s) currently use category "${name}". Are you sure you want to delete it?`)) {
        return;
      }
    } else {
      if (!confirm(`Delete category "${name}"?`)) return;
    }
    await deleteCategory(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Blog Categories</h2>
              <p className="text-xs text-slate-500">Organize and taxonomy your clinical publications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* New Category Toggle / Form */}
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-primary-200 hover:border-primary-400 bg-primary-50/50 hover:bg-primary-50 text-primary-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Create New Category</span>
            </button>
          ) : (
            <form onSubmit={handleCreate} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">New Category Details</h4>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cardiology & Heart Care"
                    value={newName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">URL Slug</label>
                  <input
                    type="text"
                    placeholder="cardiology-heart-care"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Short Description (optional)</label>
                <input
                  type="text"
                  placeholder="Articles regarding preventive cardiology, ECGs, blood pressure management..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary-600 text-white rounded-xl text-xs font-semibold hover:bg-primary-700 shadow-xs cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          )}

          {/* Categories List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Existing Categories ({blogCategories.length})
            </h4>

            {blogCategories.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No categories created yet.</p>
            ) : (
              <div className="space-y-2">
                {blogCategories.map((cat) => {
                  const articleCount = blogs.filter(b => b.category === cat.name || b.categoryId === cat.id).length;
                  const isEditing = editingId === cat.id;

                  if (isEditing) {
                    return (
                      <div key={cat.id} className="p-3.5 bg-primary-50/50 border border-primary-200 rounded-2xl space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Category Name"
                            className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                          />
                          <input
                            type="text"
                            value={editSlug}
                            onChange={(e) => setEditSlug(e.target.value)}
                            placeholder="Slug"
                            className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                          />
                        </div>
                        <input
                          type="text"
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          placeholder="Description"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 text-slate-600 text-xs hover:bg-slate-200 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(cat.id)}
                            className="px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={cat.id}
                      className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:border-slate-300 transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                          <Tag size={15} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{cat.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">/{cat.slug}</span>
                          </div>
                          {cat.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{cat.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          {articleCount} {articleCount === 1 ? 'article' : 'articles'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(cat)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
