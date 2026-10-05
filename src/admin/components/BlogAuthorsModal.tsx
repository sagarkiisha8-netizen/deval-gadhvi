import React, { useState } from 'react';
import { 
  X, Plus, UserCheck, Edit2, Trash2, Check, 
  AlertCircle, Shield, Sparkles, Image as ImageIcon, ExternalLink 
} from 'lucide-react';
import { useCmsData } from '../../context/CmsContext';
import { BlogAuthor } from '../../types';
import MediaPickerModal from './MediaPickerModal';

interface BlogAuthorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAuthor?: (author: BlogAuthor) => void;
}

export default function BlogAuthorsModal({
  isOpen,
  onClose,
  onSelectAuthor
}: BlogAuthorsModalProps) {
  const { blogAuthors, createAuthor, updateAuthor, deleteAuthor, blogs } = useCmsData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  // Form State
  const [authorForm, setAuthorForm] = useState<Partial<BlogAuthor>>({
    name: '',
    designation: 'Staff Physician',
    qualification: 'MD, FACP',
    bio: '',
    profilePhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
    profileUrl: '',
    authorType: 'Doctor',
    isActive: true
  });

  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleStartEdit = (author: BlogAuthor) => {
    setEditingId(author.id);
    setAuthorForm(author);
    setIsAdding(false);
  };

  const handleStartAdd = () => {
    setEditingId(null);
    setAuthorForm({
      name: '',
      designation: 'Clinical Specialist',
      qualification: 'MD',
      bio: '',
      profilePhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
      profileUrl: '',
      authorType: 'Doctor',
      isActive: true
    });
    setIsAdding(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorForm.name?.trim()) {
      setErrorMsg('Author name is required.');
      return;
    }
    setErrorMsg('');

    if (editingId) {
      await updateAuthor(editingId, authorForm);
      setEditingId(null);
    } else {
      const created = await createAuthor(authorForm);
      if (onSelectAuthor) {
        onSelectAuthor(created);
      }
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const articleCount = blogs.filter(b => b.authorId === id || b.author === name).length;
    if (articleCount > 0) {
      if (!confirm(`This author has ${articleCount} published articles. Delete anyway?`)) {
        return;
      }
    } else if (!confirm(`Delete author "${name}"?`)) {
      return;
    }
    await deleteAuthor(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck size={20} className="text-primary-600" />
              <h2 className="text-base font-bold text-slate-900">Medical Authors & Reviewers</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage clinical contributors, credentials (MD/DO/MS), and reviewer profiles for Google E-E-A-T.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Add / Edit Form */}
          {(isAdding || editingId) ? (
            <form onSubmit={handleSave} className="p-5 border border-primary-100 bg-primary-50/20 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-primary-900 uppercase tracking-wider">
                  {editingId ? 'Edit Author Profile' : 'Add New Medical Author'}
                </h3>
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); setEditingId(null); }}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name & Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorForm.name || ''}
                    onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })}
                    placeholder="e.g. Dr. Prahlad Gadhvi"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Degree / Qualification *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorForm.qualification || ''}
                    onChange={(e) => setAuthorForm({ ...authorForm, qualification: e.target.value })}
                    placeholder="e.g. MD, FACP, MBBS"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation / Specialty
                  </label>
                  <input
                    type="text"
                    value={authorForm.designation || ''}
                    onChange={(e) => setAuthorForm({ ...authorForm, designation: e.target.value })}
                    placeholder="e.g. Internal Medicine & Preventative Cardiology"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Author Category
                  </label>
                  <select
                    value={authorForm.authorType || 'Doctor'}
                    onChange={(e) => setAuthorForm({ ...authorForm, authorType: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Doctor">Doctor / Physician (YMYL Authoritative)</option>
                    <option value="Nurse Practitioner">Nurse Practitioner / Specialist</option>
                    <option value="Medical Reviewer">Medical Reviewer / Fact Checker</option>
                    <option value="Staff Writer">Staff Writer / Health Journalist</option>
                    <option value="Guest Specialist">Guest Specialist</option>
                  </select>
                </div>
              </div>

              {/* Photo & Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Profile Photo URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={authorForm.profilePhoto || ''}
                    onChange={(e) => setAuthorForm({ ...authorForm, profilePhoto: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMediaOpen(true)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <ImageIcon size={14} />
                    <span>Media</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Author Biography (E-E-A-T background)
                </label>
                <textarea
                  rows={3}
                  value={authorForm.bio || ''}
                  onChange={(e) => setAuthorForm({ ...authorForm, bio: e.target.value })}
                  placeholder="Clinical experience, hospital affiliations, research interests..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Provider Profile Page URL (Optional)
                </label>
                <input
                  type="text"
                  value={authorForm.profileUrl || ''}
                  onChange={(e) => setAuthorForm({ ...authorForm, profileUrl: e.target.value })}
                  placeholder="/providers or https://..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); setEditingId(null); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {editingId ? 'Save Changes' : 'Create Author'}
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={handleStartAdd}
              className="w-full py-3 border-2 border-dashed border-slate-300 hover:border-primary-400 bg-slate-50/50 hover:bg-primary-50/30 rounded-2xl text-xs font-bold text-slate-700 hover:text-primary-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Add New Medical Author</span>
            </button>
          )}

          {/* Authors List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Existing Contributors ({blogAuthors.length})
            </h3>
            {blogAuthors.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No authors recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {blogAuthors.map((author) => {
                  const articleCount = blogs.filter(b => b.authorId === author.id || b.author === author.name).length;
                  return (
                    <div
                      key={author.id}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={author.profilePhoto}
                          alt={author.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          onError={(e) => {
                            (e.target as HTMLElement).setAttribute(
                              'src',
                              'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800'
                            );
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">{author.name}</h4>
                            <span className="px-1.5 py-0.5 bg-primary-50 text-primary-700 font-mono text-[10px] rounded font-semibold">
                              {author.qualification || 'MD'}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              • {author.authorType || 'Doctor'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {author.designation || 'Staff Physician'} • {articleCount} articles
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {onSelectAuthor && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectAuthor(author);
                              onClose();
                            }}
                            className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl text-xs font-semibold transition-colors"
                          >
                            Select
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(author)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-colors"
                          title="Edit Author"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(author.id, author.name)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete Author"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
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

      {/* Media Picker for Author Photo */}
      <MediaPickerModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        title="Select Author Headshot"
        onSelectImage={(url) => {
          setAuthorForm({ ...authorForm, profilePhoto: url });
          setIsMediaOpen(false);
        }}
      />
    </div>
  );
}
