import React, { useState } from 'react';
import { 
  Settings, Save, Loader2, CheckCircle2, 
  Image as ImageIcon, Globe, Shield, Activity, 
  Share2, BarChart2, Mail, Phone, MapPin, 
  Clock, ExternalLink, Sliders, Layout, Link2,
  Upload, RotateCcw, AlertCircle, Eye
} from 'lucide-react';
import { useCmsData } from '../../context/CmsContext';
import { SiteSettings } from '../../types';
import MediaPickerModal from '../components/MediaPickerModal';
import { Link } from 'react-router-dom';

type SettingsTab = 'general' | 'header_footer' | 'seo' | 'advanced';

export default function WebsiteSettings() {
  const { 
    siteSettings, 
    updateSiteSettings,
    headerContent,
    updateHeaderContent,
    footerContent,
    updateFooterContent
  } = useCmsData();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [formData, setFormData] = useState<SiteSettings>(siteSettings);
  const [headerData, setHeaderData] = useState(headerContent);
  const [footerData, setFooterData] = useState(footerContent);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Logo management states
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [logoUploadSuccess, setLogoUploadSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    setFormData(siteSettings);
  }, [siteSettings]);

  React.useEffect(() => {
    setHeaderData(headerContent);
  }, [headerContent]);

  React.useEffect(() => {
    setFooterData(footerContent);
  }, [footerContent]);

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
        console.warn('R2 endpoint fallback in WebsiteSettings:', err);
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
      setHeaderData(prev => ({ ...prev, logoUrl: finalUrl }));
      setLogoUploadSuccess('Logo uploaded successfully! Click "Save Settings" to publish across the website.');
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
    setHeaderData(prev => ({ ...prev, logoUrl: defaultLogo }));
    setLogoUploadSuccess('Reset to official default logo. Click "Save Settings" to apply.');
    setTimeout(() => setLogoUploadSuccess(null), 4000);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateSiteSettings(formData);
      if (formData.logoUrl && headerData && updateHeaderContent) {
        await updateHeaderContent({ ...headerData, logoUrl: formData.logoUrl });
      }
      if (activeTab === 'header_footer') {
        if (headerData && updateHeaderContent) await updateHeaderContent(headerData);
        if (footerData && updateFooterContent) await updateFooterContent(footerData);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold mb-1.5">
            <Sliders size={13} />
            <span>Clinic Settings</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Practice & Website Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage practice identity, contact channels, header navigation, SEO, and regulatory credentials.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Practice settings updated successfully in Firestore!</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Activity size={15} />
          <span>GENERAL</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('header_footer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'header_footer'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layout size={15} />
          <span>HEADER & FOOTER</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'seo'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Share2 size={15} />
          <span>SEO</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('advanced')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'advanced'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Shield size={15} />
          <span>ADVANCED PRACTICE INFO</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: GENERAL */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Practice Identity */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Activity size={18} className="text-primary-600" />
                <span>Practice Identity</span>
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Practice Name
                  </label>
                  <input
                    type="text"
                    value={formData.practiceName}
                    onChange={(e) => setFormData({ ...formData, practiceName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Brand Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Website Logo & Branding */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon size={18} className="text-primary-600" />
                  <span>Website Logo & Navbar Branding</span>
                </h2>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md self-start sm:self-auto">
                  Single source of truth for Desktop & Mobile
                </span>
              </div>

              {logoUploadSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>{logoUploadSuccess}</span>
                </div>
              )}

              {logoUploadError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={15} className="text-rose-600 shrink-0" />
                  <span>{logoUploadError}</span>
                </div>
              )}

              {/* Logo Preview in Navbar Context */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Current Navbar Logo Preview
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {/* Preview on actual Warm Ivory navbar background */}
                  <div className="p-4 rounded-xl bg-[#F4EFE6] border border-[#D9D0C5] flex flex-col items-center justify-center min-h-[90px]">
                    <span className="text-[10px] font-bold text-[#0B1F2A]/60 uppercase tracking-wider mb-2">
                      Warm Ivory Navbar Background (#F4EFE6)
                    </span>
                    <img
                      src={formData.logoUrl || '/newark-medical-associates-logo.png'}
                      alt="Navbar Logo Preview"
                      className="w-auto h-auto object-contain max-h-[50px] max-w-[240px]"
                    />
                  </div>

                  {/* Preview on clean white background */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center min-h-[90px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      White Background
                    </span>
                    <img
                      src={formData.logoUrl || '/newark-medical-associates-logo.png'}
                      alt="Clean Background Logo Preview"
                      className="w-auto h-auto object-contain max-h-[50px] max-w-[240px]"
                    />
                  </div>
                </div>
              </div>

              {/* Logo Source & Upload Controls */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Logo Image URL / Path
                  </label>
                  <input
                    type="text"
                    value={formData.logoUrl || '/newark-medical-associates-logo.png'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, logoUrl: val });
                      setHeaderData({ ...headerData, logoUrl: val });
                    }}
                    placeholder="/newark-medical-associates-logo.png"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Displays on both desktop and mobile headers. Preserves full aspect ratio.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {/* Upload button via R2 */}
                  <label className="inline-flex items-center gap-2 bg-[#0B1F2A] hover:bg-[#153444] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer">
                    {logoUploading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    <span>{logoUploading ? 'Uploading to R2...' : 'Upload New Logo'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleLogoUpload}
                      disabled={logoUploading}
                      className="hidden"
                    />
                  </label>

                  {/* Reset to Default */}
                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Reset to Default Logo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Phone size={18} className="text-primary-600" />
                <span>Phone & Email Channels</span>
              </h2>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Main Telephone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Clinic Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@newarkmed.com"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Emergency Urgent Line
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Clinic Fax Number
                </label>
                <input
                  type="text"
                  value={formData.fax || ''}
                  onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                  placeholder="(973) 555-0199"
                  className="w-full max-w-sm px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Physical Location */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <MapPin size={18} className="text-primary-600" />
                <span>Physical Address & Location</span>
              </h2>

              <div className="grid sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    City / State
                  </label>
                  <input
                    type="text"
                    value={`${formData.city}, ${formData.state}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(',');
                      setFormData({
                        ...formData,
                        city: parts[0]?.trim() || '',
                        state: parts[1]?.trim() || 'NJ'
                      });
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Google Maps Directions Link
                </label>
                <input
                  type="text"
                  value={formData.googleMapsLink || ''}
                  onChange={(e) => setFormData({ ...formData, googleMapsLink: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono text-xs"
                />
              </div>
            </div>

            {/* Clinic Operating Hours */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Clock size={18} className="text-primary-600" />
                <span>Office Hours</span>
              </h2>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Monday – Friday
                  </label>
                  <input
                    type="text"
                    value={formData.hours?.monFri || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      hours: { ...formData.hours, monFri: e.target.value }
                    })}
                    placeholder="8:00 AM - 6:00 PM"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Saturday
                  </label>
                  <input
                    type="text"
                    value={formData.hours?.sat || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      hours: { ...formData.hours, sat: e.target.value }
                    })}
                    placeholder="9:00 AM - 1:00 PM"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Sunday
                  </label>
                  <input
                    type="text"
                    value={formData.hours?.sun || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      hours: { ...formData.hours, sun: e.target.value }
                    })}
                    placeholder="Closed / Urgent On-Call"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HEADER & FOOTER */}
        {activeTab === 'header_footer' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layout size={18} className="text-primary-600" />
                  <span>Header Configuration</span>
                </h2>
                <Link
                  to="/admin/layout/header"
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <span>Open Full Header CMS</span>
                  <ExternalLink size={13} />
                </Link>
              </div>

              {headerData?.announcement && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showAnnouncement"
                      checked={headerData.announcement.enabled}
                      onChange={(e) => setHeaderData({
                        ...headerData,
                        announcement: { ...headerData.announcement, enabled: e.target.checked }
                      })}
                      className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
                    />
                    <label htmlFor="showAnnouncement" className="text-xs font-bold text-slate-800">
                      Show Announcement / Urgent Notification Bar
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Announcement Bar Text
                    </label>
                    <input
                      type="text"
                      value={headerData.announcement.text || ''}
                      onChange={(e) => setHeaderData({
                        ...headerData,
                        announcement: { ...headerData.announcement, text: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Configuration */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Globe size={18} className="text-primary-600" />
                  <span>Footer Content & Social Media</span>
                </h2>
                <Link
                  to="/admin/layout/footer"
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <span>Open Full Footer CMS</span>
                  <ExternalLink size={13} />
                </Link>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Footer Description
                </label>
                <textarea
                  rows={2}
                  value={footerData?.aboutText || ''}
                  onChange={(e) => setFooterData({
                    ...footerData,
                    aboutText: e.target.value
                  })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Copyright Notice
                </label>
                <input
                  type="text"
                  value={footerData?.copyrightText || ''}
                  onChange={(e) => setFooterData({
                    ...footerData,
                    copyrightText: e.target.value
                  })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="pt-2">
                <h3 className="text-xs font-bold text-slate-900 mb-3">Social Media Profiles</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Facebook URL</label>
                    <input
                      type="text"
                      value={formData.social?.facebook || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        social: { ...formData.social, facebook: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Instagram URL</label>
                    <input
                      type="text"
                      value={formData.social?.instagram || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        social: { ...formData.social, instagram: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">LinkedIn URL</label>
                    <input
                      type="text"
                      value={formData.social?.linkedin || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        social: { ...formData.social, linkedin: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Twitter / X URL</label>
                    <input
                      type="text"
                      value={formData.social?.twitter || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        social: { ...formData.social, twitter: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Share2 size={18} className="text-primary-600" />
                <span>Search Engine Optimization (SEO) & Social Graph</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Default Browser Title Tag
                </label>
                <input
                  type="text"
                  value={formData.seo.defaultTitle}
                  onChange={(e) => setFormData({
                    ...formData,
                    seo: { ...formData.seo, defaultTitle: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Default Meta Description (Google Search Snippet)
                </label>
                <textarea
                  rows={2}
                  value={formData.seo.defaultDescription}
                  onChange={(e) => setFormData({
                    ...formData,
                    seo: { ...formData.seo, defaultDescription: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Meta Keywords (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.seo.keywords}
                  onChange={(e) => setFormData({
                    ...formData,
                    seo: { ...formData.seo, keywords: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              {/* Social Share OG Image */}
              <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="w-24 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                  <img
                    src={formData.seo.ogImage}
                    alt="Social share preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 mb-0.5">Social Share Card (OG Image)</h4>
                  <p className="text-xs text-slate-500 mb-2.5">Preview card for iMessage, WhatsApp, Twitter, and Facebook</p>
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-xs cursor-pointer"
                  >
                    <ImageIcon size={14} />
                    <span>Select Share Image</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ADVANCED PRACTICE INFO */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            {/* Regulatory Credentials */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Shield size={18} className="text-primary-600" />
                <span>Regulatory Credentials & License</span>
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    National Provider Identifier (NPI)
                  </label>
                  <input
                    type="text"
                    value={formData.npiNumber || ''}
                    onChange={(e) => setFormData({ ...formData, npiNumber: e.target.value })}
                    placeholder="10-digit NPI Number"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    State Medical License / Facility ID
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber || ''}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    placeholder="e.g. NJ-MED-20941"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Production Canonical Domain
                </label>
                <input
                  type="text"
                  value={formData.siteUrl || formData.seo?.canonicalDomain || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    siteUrl: e.target.value,
                    seo: { ...formData.seo, canonicalDomain: e.target.value } 
                  })}
                  placeholder="https://newarkmed.com"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono"
                />
              </div>
            </div>

            {/* Analytics & Webmaster */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <BarChart2 size={18} className="text-primary-600" />
                <span>Webmaster Tracking & Analytics Integration</span>
              </h2>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Google Analytics 4 ID
                  </label>
                  <input
                    type="text"
                    placeholder="G-XXXXXXXXXX"
                    value={formData.seo.googleAnalyticsId || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      seo: { ...formData.seo, googleAnalyticsId: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Google Tag Manager ID
                  </label>
                  <input
                    type="text"
                    placeholder="GTM-XXXXXXX"
                    value={formData.seo.googleTagManagerId || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      seo: { ...formData.seo, googleTagManagerId: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Search Console Key
                  </label>
                  <input
                    type="text"
                    placeholder="Verification Key..."
                    value={formData.seo.searchConsoleVerification || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      seo: { ...formData.seo, searchConsoleVerification: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save Settings Changes</span>
          </button>
        </div>
      </form>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        title="Select Social Share Image"
        onSelectImage={(ogImage) => {
          setFormData(prev => ({
            ...prev,
            seo: { ...prev.seo, ogImage }
          }));
        }}
      />
    </div>
  );
}
