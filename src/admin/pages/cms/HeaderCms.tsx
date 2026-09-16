import React, { useState } from 'react';
import { 
  Menu, Save, Loader2, CheckCircle2, 
  Plus, Trash2, ExternalLink, Globe 
} from 'lucide-react';
import { useCmsData } from '../../../context/CmsContext';
import { HeaderContent } from '../../../types';

export default function HeaderCms() {
  const { headerContent, updateHeaderContent } = useCmsData();
  const [formData, setFormData] = useState<HeaderContent>(headerContent);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    setFormData(headerContent);
  }, [headerContent]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateHeaderContent(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving header content:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLink = () => {
    const current = formData.navLinks || [];
    setFormData({
      ...formData,
      navLinks: [...current, { name: 'New Link', href: '/', isActive: true }]
    });
  };

  const handleRemoveLink = (index: number) => {
    const current = formData.navLinks || [];
    setFormData({
      ...formData,
      navLinks: current.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Header & Navigation CMS</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure top announcement bar, logo typography, CTA buttons, and main navigation links.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Save Header Navigation</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Header configuration saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Top Info Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Top Utility & Announcement Bar
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Announcement Message
              </label>
              <input
                type="text"
                value={formData.topBarAnnouncement}
                onChange={(e) => setFormData({ ...formData, topBarAnnouncement: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.topBarPhone}
                onChange={(e) => setFormData({ ...formData, topBarPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Location Snippet
              </label>
              <input
                type="text"
                value={formData.topBarAddress}
                onChange={(e) => setFormData({ ...formData, topBarAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Brand & CTA */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Brand Logo & Primary Header CTA
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Logo Primary Text
              </label>
              <input
                type="text"
                value={formData.logoText}
                onChange={(e) => setFormData({ ...formData, logoText: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Logo Sub-text
              </label>
              <input
                type="text"
                value={formData.logoSubtext}
                onChange={(e) => setFormData({ ...formData, logoSubtext: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                CTA Button Label
              </label>
              <input
                type="text"
                value={formData.ctaButtonText}
                onChange={(e) => setFormData({ ...formData, ctaButtonText: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                CTA Button Link Destination
              </label>
              <input
                type="text"
                value={formData.ctaButtonLink}
                onChange={(e) => setFormData({ ...formData, ctaButtonLink: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Nav Links Manager */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Main Navigation Links
            </h2>
            <button
              type="button"
              onClick={handleAddLink}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              <Plus size={14} />
              <span>Add Link</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.navLinks?.map((link, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex-1 grid sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={link.name}
                    onChange={(e) => {
                      const updated = [...formData.navLinks];
                      updated[idx].name = e.target.value;
                      setFormData({ ...formData, navLinks: updated });
                    }}
                    placeholder="Link Name"
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => {
                      const updated = [...formData.navLinks];
                      updated[idx].href = e.target.value;
                      setFormData({ ...formData, navLinks: updated });
                    }}
                    placeholder="Destination (e.g. /services)"
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={link.isActive ?? true}
                    onChange={(e) => {
                      const updated = [...formData.navLinks];
                      updated[idx].isActive = e.target.checked;
                      setFormData({ ...formData, navLinks: updated });
                    }}
                    className="w-3.5 h-3.5 text-primary-600 rounded"
                  />
                  <span>Active</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveLink(idx)}
                  className="text-slate-400 hover:text-red-600 p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save Navigation Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
