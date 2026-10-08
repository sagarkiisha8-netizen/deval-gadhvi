import React, { useState } from 'react';
import { 
  Menu, Save, Loader2, CheckCircle2, 
  Plus, Trash2, ExternalLink, Globe,
  Upload, RotateCcw, Image as ImageIcon, AlertCircle 
} from 'lucide-react';
import { useCmsData } from '../../../context/CmsContext';
import { HeaderContent } from '../../../types';

export default function HeaderCms() {
  const { headerContent, updateHeaderContent, siteSettings, updateSiteSettings } = useCmsData();
  const [formData, setFormData] = useState<HeaderContent>(headerContent);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Logo upload states
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [logoUploadSuccess, setLogoUploadSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    setFormData(headerContent);
  }, [headerContent]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      setLogoUploadError('Please select a PNG, JPG, or WebP logo file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLogoUploadError('Logo file size exceeds 5MB limit.');
      return;
    }

    setLogoUploading(true);
    setLogoUploadError(null);
    setLogoUploadSuccess(null);

    try {
      let finalUrl = '';
      try {
        const uploadData = new FormData();
        uploadData.append('file', file);
        const res = await fetch('/.netlify/functions/upload-provider-image?providerId=branding', {
          method: 'POST',
          body: uploadData
        });
        if (res.ok) {
          const json = await res.json();
          if (json.imageUrl) {
            finalUrl = json.imageUrl;
          }
        }
      } catch (err) {
        console.warn('R2 endpoint fallback in HeaderCms:', err);
      }

      if (!finalUrl) {
        finalUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      setFormData(prev => ({ ...prev, logoUrl: finalUrl }));
      setLogoUploadSuccess('Logo uploaded! Click "Save Header Navigation" to apply.');
      setTimeout(() => setLogoUploadSuccess(null), 4000);
    } catch (err: any) {
      setLogoUploadError(err.message || 'Failed to upload logo.');
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  };

  const handleResetLogo = () => {
    const defaultLogo = '/newark-medical-associates-logo.png';
    setFormData(prev => ({ ...prev, logoUrl: defaultLogo }));
    setLogoUploadSuccess('Reset to default official logo. Click "Save Header Navigation" to apply.');
    setTimeout(() => setLogoUploadSuccess(null), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateHeaderContent(formData);
      if (formData.logoUrl && updateSiteSettings) {
        await updateSiteSettings({ logoUrl: formData.logoUrl });
      }
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

          {/* Logo Image Preview & Upload to R2 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-200 pb-2.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-primary-600" />
                <span>Website Navbar Logo File</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Single source of truth for desktop & mobile
              </span>
            </div>

            {logoUploadSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>{logoUploadSuccess}</span>
              </div>
            )}

            {logoUploadError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={14} className="text-rose-600 shrink-0" />
                <span>{logoUploadError}</span>
              </div>
            )}

            {/* Preview on actual Warm Ivory navbar background */}
            <div className="p-3 rounded-lg bg-[#F4EFE6] border border-[#D9D0C5] flex flex-col items-center justify-center min-h-[80px]">
              <span className="text-[10px] font-bold text-[#0B1F2A]/60 uppercase tracking-wider mb-2">
                Navbar Preview (#F4EFE6)
              </span>
              <img
                src={formData.logoUrl || '/newark-medical-associates-logo.png'}
                alt="Header Logo Preview"
                className="w-auto h-auto object-contain max-h-[48px] max-w-[240px]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Logo URL / Path
              </label>
              <input
                type="text"
                value={formData.logoUrl || '/newark-medical-associates-logo.png'}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <label className="inline-flex items-center gap-2 bg-[#0B1F2A] hover:bg-[#153444] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer">
                {logoUploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                <span>{logoUploading ? 'Uploading to R2...' : 'Upload Logo to R2'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoUpload}
                  disabled={logoUploading}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleResetLogo}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Reset to Default</span>
              </button>
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
