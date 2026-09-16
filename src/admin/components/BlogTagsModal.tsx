import React, { useState } from 'react';
import { X, Plus, Tag as TagIcon, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { useCmsData } from '../../context/CmsContext';
import { BlogTag } from '../../types';

interface BlogTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags?: string[];
  onToggleTag?: (tagName: string) => void;
}

export default function BlogTagsModal({
  isOpen,
  onClose,
  selectedTags = [],
  onToggleTag
}: BlogTagsModalProps) {
  const { blogTags, createTag, deleteTag, blogs } = useCmsData();
  const [newTagName, setNewTagName] = useState('');
  const [newTagDesc, setNewTagDesc] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) {
      setErrorMsg('Tag name cannot be empty.');
      return;
    }
    setErrorMsg('');
    const cleanName = newTagName.trim();
    await createTag({
      name: cleanName,
      slug: cleanName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: newTagDesc.trim()
    });
    if (onToggleTag && !selectedTags.includes(cleanName)) {
      onToggleTag(cleanName);
    }
    setNewTagName('');
    setNewTagDesc('');
  };

  const handleDelete = async (tagId: string, tagName: string) => {
    if (confirm(`Delete tag "${tagName}"?`)) {
      await deleteTag(tagId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <TagIcon size={18} className="text-primary-600" />
            <h2 className="text-sm font-bold text-slate-900">Manage Blog Topic Tags</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Create */}
          <form onSubmit={handleCreate} className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-700">Create New Topic Tag</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="e.g. Hypertension, Telehealth, Nutrition"
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Tag</span>
              </button>
            </div>
          </form>

          {/* Tags List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Available Clinical Tags ({blogTags.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {blogTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.name);
                const count = blogs.filter(b => (b.tags || []).includes(tag.name)).length;
                return (
                  <div
                    key={tag.id}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                      isSelected 
                        ? 'bg-primary-50 border-primary-300 text-primary-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onToggleTag && onToggleTag(tag.name)}
                      className="cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{tag.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({count})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tag.id, tag.name)}
                      className="text-slate-300 hover:text-rose-600 ml-1 transition-colors"
                      title="Delete tag"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
