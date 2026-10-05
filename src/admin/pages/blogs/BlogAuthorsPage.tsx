import React, { useState } from 'react';
import { 
  UserCheck, Plus, Search, Edit2, Trash2, Shield, 
  ExternalLink, Stethoscope, Sparkles, Check, AlertCircle, 
  Image as ImageIcon, BookOpen, ArrowLeft 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCmsData } from '../../../context/CmsContext';
import { BlogAuthor } from '../../../types';
import MediaPickerModal from '../../components/MediaPickerModal';

export default function BlogAuthorsPage() {
  const { blogAuthors, createAuthor, updateAuthor, deleteAuthor, blogs } = useCmsData();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Doctor' | 'Medical Reviewer' | 'Editorial Team'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<BlogAuthor>>({
    name: '',
    designation: '',
    qualification: '',
    bio: '',
    profilePhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
    profileUrl: '',
    socialLinks: {
      website: '',
      linkedin: '',
      twitter: ''
    },
    authorType: 'Doctor',
    isActive: true
  });

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleStartAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      designation: 'Attending Physician',
      qualification: 'MD',
      bio: '',
      profilePhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
      profileUrl: '',
      socialLinks: {
        website: '',
        linkedin: '',
        twitter: ''
      },
      authorType: 'Doctor',
      isActive: true
    });
    setIsAdding(true);
  };

  const handleStartEdit = (author: BlogAuthor) => {
    setEditingId(author.id);
    setFormData({
      ...author,
      socialLinks: {
        website: author.socialLinks?.website || '',
        linkedin: author.socialLinks?.linkedin || '',
        twitter: author.socialLinks?.twitter || ''
      }
    });
    setIsAdding(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Author name is required.');
      return;
    }

    try {
      if (editingId) {
        await updateAuthor(editingId, formData);
        showToast(`Author "${formData.name}" updated successfully.`);
        setEditingId(null);
      } else {
        await createAuthor(formData);
        showToast(`New author "${formData.name}" created successfully.`);
        setIsAdding(false);
      }
    } catch (err: any) {
      alert(`Error saving author: ${err?.message || 'Check connection'}`);
    }
  };

  const handleDelete = async (author: BlogAuthor) => {
    const articleCount = blogs.filter(b => b.authorId === author.id || b.author === author.name).length;
    if (articleCount > 0) {
      if (!confirm(`Warning: "${author.name}" is attached to ${articleCount} articles. Deleting will unlink their author profile. Proceed?`)) {
        return;
      }
    } else {
      if (!confirm(`Are you sure you want to delete "${author.name}"?`)) {
        return;
      }
    }
    await deleteAuthor(author.id);
    showToast(`Author "${author.name}" removed.`);
    if (editingId === author.id) setEditingId(null);
  };

  const filteredAuthors = blogAuthors.filter(a => {
    const matchesQuery = !searchTerm || 
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.qualification.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || a.authorType === typeFilter;
    return matchesQuery && matchesType;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 text-xs font-semibold flex items-center gap-2">
          <Check size={16} className="text-emerald-400" />
          <span>{statusMessage}</span>
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
            <span className="font-semibold text-slate-700">Author Management</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <UserCheck className="text-primary-600" size={24} />
            <span>Blog Authors & Medical Reviewers</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage authenticated physician contributors, medical review specialists, and editorial staff profiles for Google E-E-A-T and healthcare compliance.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartAdd}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Add New Author</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, credentials, title..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          {(['all', 'Doctor', 'Medical Reviewer', 'Editorial Team'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                typeFilter === t ? 'bg-primary-50 text-primary-700 border border-primary-200 font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t === 'all' ? 'All Roles' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid: Form (if active) + Author Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Editor Form Column (Shown when adding or editing) */}
        {(isAdding || editingId) && (
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-primary-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit2 size={15} className="text-primary-600" />
                <span>{editingId ? 'Edit Author Profile' : 'New Author / Reviewer'}</span>
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
              {/* Photo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Profile Photo URL
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={formData.profilePhoto || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      type="url"
                      value={formData.profilePhoto || ''}
                      onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setIsMediaOpen(true)}
                      className="text-[11px] text-primary-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <ImageIcon size={12} />
                      <span>Choose from Media Library</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Prahlad Gadhvi"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              {/* Author Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role / Author Type *
                </label>
                <select
                  value={formData.authorType || 'Doctor'}
                  onChange={(e) => setFormData({ ...formData, authorType: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium bg-white"
                >
                  <option value="Doctor">Doctor / Physician</option>
                  <option value="Medical Reviewer">Medical Reviewer</option>
                  <option value="Editorial Team">Editorial Team</option>
                </select>
              </div>

              {/* Qualification & Designation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={formData.qualification || ''}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g. MD, FACP"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.designation || ''}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Medical Director"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Short Clinical Biography
                </label>
                <textarea
                  rows={3}
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Clinical experience, medical school, board certifications..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl leading-relaxed"
                />
              </div>

              {/* Profile URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Profile URL / Slug
                </label>
                <input
                  type="text"
                  value={formData.profileUrl || ''}
                  onChange={(e) => setFormData({ ...formData, profileUrl: e.target.value })}
                  placeholder="e.g. /providers/dr-prahlad-gadhvi"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono text-slate-600"
                />
              </div>

              {/* Social Links */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                  Social & Citation Links
                </span>
                <input
                  type="url"
                  value={formData.socialLinks?.website || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, website: e.target.value }
                  })}
                  placeholder="Website / Profile URL"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                />
                <input
                  type="url"
                  value={formData.socialLinks?.linkedin || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                  })}
                  placeholder="LinkedIn URL"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingId ? 'Save Author Changes' : 'Create Author Profile'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Authors List Column */}
        <div className={`space-y-4 ${isAdding || editingId ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAuthors.map((author) => {
              const articleCount = blogs.filter(b => b.authorId === author.id || b.author === author.name).length;
              const reviewCount = blogs.filter(b => b.reviewedByDoctor === author.name || b.medicallyReviewedBy === author.name).length;

              return (
                <div
                  key={author.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-primary-300 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={author.profilePhoto}
                      alt={author.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                          author.authorType === 'Doctor' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          author.authorType === 'Medical Reviewer' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {author.authorType}
                        </span>
                        {author.qualification && (
                          <span className="text-[11px] font-semibold text-slate-500 font-mono">
                            {author.qualification}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {author.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {author.designation}
                      </p>
                    </div>
                  </div>

                  {author.bio && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      {author.bio}
                    </p>
                  )}

                  {/* Stats & Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <BookOpen size={13} className="text-slate-400" />
                        <strong>{articleCount}</strong> {articleCount === 1 ? 'article' : 'articles'}
                      </span>
                      {reviewCount > 0 && (
                        <span className="flex items-center gap-1 text-emerald-700 font-medium">
                          <UserCheck size={13} />
                          <strong>{reviewCount}</strong> reviewed
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(author)}
                        className="p-2 hover:bg-slate-100 text-slate-600 hover:text-primary-600 rounded-xl transition-colors cursor-pointer"
                        title="Edit author"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(author)}
                        className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                        title="Delete author"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAuthors.length === 0 && (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400 space-y-2">
              <UserCheck size={32} className="mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No authors found</p>
              <p className="text-xs text-slate-400">Try adjusting your search or add a new clinical contributor.</p>
            </div>
          )}
        </div>

      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelectImage={(url) => {
          setFormData(prev => ({ ...prev, profilePhoto: url }));
          setIsMediaOpen(false);
        }}
      />
    </div>
  );
}
