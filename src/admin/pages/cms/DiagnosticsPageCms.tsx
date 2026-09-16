import React, { useState } from 'react';
import { 
  Activity, Save, Loader2, CheckCircle2, 
  Plus, Trash2, ExternalLink 
} from 'lucide-react';
import { useCmsData } from '../../../context/CmsContext';
import { DiagnosticsPageContent } from '../../../types';

export default function DiagnosticsPageCms() {
  const { diagnosticsContent, updateDiagnosticsPageContent } = useCmsData();
  const [formData, setFormData] = useState<DiagnosticsPageContent>(diagnosticsContent);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    setFormData(diagnosticsContent);
  }, [diagnosticsContent]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateDiagnosticsPageContent(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving diagnostics content:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddEquipment = () => {
    const current = formData.equipmentHighlights || [];
    setFormData({
      ...formData,
      equipmentHighlights: [
        ...current,
        { title: 'New Diagnostic Device', desc: 'Description of screening capability...', icon: 'Activity' }
      ]
    });
  };

  const handleRemoveEquipment = (index: number) => {
    const current = formData.equipmentHighlights || [];
    setFormData({
      ...formData,
      equipmentHighlights: current.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Diagnostics Page CMS</h1>
          <p className="text-sm text-slate-500 mt-1">
            Customize in-office testing features, EKG, Echocardiography, and ultrasound descriptions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/services"
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
            <span>Save Diagnostics Page</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Diagnostics content saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
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
                Page Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Subtitle
            </label>
            <textarea
              rows={2}
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Clinical Introduction
            </label>
            <textarea
              rows={3}
              value={formData.intro}
              onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Equipment & Tests Highlights */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              In-House Testing Modalities
            </h2>
            <button
              type="button"
              onClick={handleAddEquipment}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              <Plus size={14} />
              <span>Add Modality</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {formData.equipmentHighlights?.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 relative">
                <button
                  type="button"
                  onClick={() => handleRemoveEquipment(idx)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-600"
                >
                  <Trash2 size={15} />
                </button>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Modality Name
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...formData.equipmentHighlights];
                      updated[idx].title = e.target.value;
                      setFormData({ ...formData, equipmentHighlights: updated });
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Description & Diagnostic Uses
                  </label>
                  <textarea
                    rows={2}
                    value={item.desc}
                    onChange={(e) => {
                      const updated = [...formData.equipmentHighlights];
                      updated[idx].desc = e.target.value;
                      setFormData({ ...formData, equipmentHighlights: updated });
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
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
            <span>Save Diagnostics Page</span>
          </button>
        </div>
      </form>
    </div>
  );
}
