import React, { useState } from 'react';
import { 
  Building2, Save, Loader2, Image as ImageIcon, 
  CheckCircle2, Plus, Trash2, ExternalLink 
} from 'lucide-react';
import { useCmsData } from '../../../context/CmsContext';
import { AboutPageContent } from '../../../types';
import MediaPickerModal from '../../components/MediaPickerModal';

export default function AboutPageCms() {
  const { aboutContent, updateAboutPageContent } = useCmsData();
  const [formData, setFormData] = useState<AboutPageContent>(aboutContent);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  React.useEffect(() => {
    setFormData(aboutContent);
  }, [aboutContent]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateAboutPageContent(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving about content:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddValue = () => {
    const current = formData.values || [];
    setFormData({
      ...formData,
      values: [...current, { title: 'New Core Value', desc: 'Description of clinic value...' }]
    });
  };

  const handleRemoveValue = (index: number) => {
    const current = formData.values || [];
    setFormData({
      ...formData,
      values: current.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">About Page CMS</h1>
          <p className="text-sm text-slate-500 mt-1">
            Edit practice history, mission, vision statements, core values, and clinic facility imagery.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/about"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <ExternalLink size={14} />
            <span>View Live Page</span>
          </a>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Save About Page</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>About page content updated successfully in Firestore!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Header & Introduction
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Section Pill Tag
              </label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Experience Badge (e.g. 35+ Years)
              </label>
              <input
                type="text"
                value={formData.experienceYearsBadge}
                onChange={(e) => setFormData({ ...formData, experienceYearsBadge: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Main Headline Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Introduction Subtitle
            </label>
            <textarea
              rows={2}
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Story, Mission & Vision */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Practice Story, Mission & Vision
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Story Heading
            </label>
            <input
              type="text"
              value={formData.storyTitle}
              onChange={(e) => setFormData({ ...formData, storyTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Story Paragraph 1
              </label>
              <textarea
                rows={4}
                value={formData.storyParagraph1}
                onChange={(e) => setFormData({ ...formData, storyParagraph1: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Story Paragraph 2
              </label>
              <textarea
                rows={4}
                value={formData.storyParagraph2}
                onChange={(e) => setFormData({ ...formData, storyParagraph2: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mission Statement
              </label>
              <textarea
                rows={3}
                value={formData.missionText}
                onChange={(e) => setFormData({ ...formData, missionText: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Vision Statement
              </label>
              <textarea
                rows={3}
                value={formData.visionText}
                onChange={(e) => setFormData({ ...formData, visionText: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Facility Image & Values */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Facility Imagery & Core Values
          </h2>

          <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-24 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
              <img
                src={formData.facilityImageUrl}
                alt="Facility preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900 mb-0.5">Clinic Facility Photo</h4>
              <p className="text-xs text-slate-500 mb-2.5">Showcase modern exam rooms, diagnostic suites, or front reception</p>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-xs"
              >
                <ImageIcon size={14} />
                <span>Select Facility Image</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-900">
                Core Clinical Values
              </label>
              <button
                type="button"
                onClick={handleAddValue}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                <Plus size={14} />
                <span>Add Value</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {formData.values?.map((val, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveValue(idx)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                  <input
                    type="text"
                    value={val.title}
                    onChange={(e) => {
                      const updated = [...formData.values];
                      updated[idx].title = e.target.value;
                      setFormData({ ...formData, values: updated });
                    }}
                    placeholder="Value Title"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  />
                  <textarea
                    rows={2}
                    value={val.desc}
                    onChange={(e) => {
                      const updated = [...formData.values];
                      updated[idx].desc = e.target.value;
                      setFormData({ ...formData, values: updated });
                    }}
                    placeholder="Value description..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              ))}
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
            <span>Save About Page Changes</span>
          </button>
        </div>
      </form>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        title="Select Clinic Facility Image"
        onSelectImage={(facilityImageUrl) => {
          setFormData(prev => ({ ...prev, facilityImageUrl }));
        }}
      />
    </div>
  );
}
