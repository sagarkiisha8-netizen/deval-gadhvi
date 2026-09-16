import React, { useState } from 'react';
import { 
  Settings, Save, Loader2, CheckCircle2, 
  Image as ImageIcon, Globe, Shield, Activity, 
  Share2, BarChart2 
} from 'lucide-react';
import { useCmsData } from '../../context/CmsContext';
import { SiteSettings } from '../../types';
import MediaPickerModal from '../components/MediaPickerModal';

export default function WebsiteSettings() {
  const { siteSettings, updateSiteSettings } = useCmsData();
  const [formData, setFormData] = useState<SiteSettings>(siteSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  React.useEffect(() => {
    setFormData(siteSettings);
  }, [siteSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateSiteSettings(formData);
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Practice & Website Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Global clinic information, NPI identifiers, office hours, SEO configuration, and analytics tags.
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
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Global practice settings updated in Firestore!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Practice Identity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Activity size={18} className="text-primary-600" />
            <span>Practice Identity & Credentials</span>
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
        </div>

        {/* Contact Numbers & Location */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Globe size={18} className="text-primary-600" />
            <span>Clinic Telephony & Physical Location</span>
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
                Emergency Urgent Line
              </label>
              <input
                type="text"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Fax Number
              </label>
              <input
                type="text"
                value={formData.fax || ''}
                onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>

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
        </div>

        {/* Global SEO Meta Configuration */}
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
              <p className="text-xs text-slate-500 mb-2.5">Appears when links are shared on iMessage, WhatsApp, Twitter, and Facebook</p>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-xs"
              >
                <ImageIcon size={14} />
                <span>Select Share Image</span>
              </button>
            </div>
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
                Google Analytics 4 Measurement ID
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
                Search Console Verification
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

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save All Settings</span>
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
