import React, { useState } from 'react';
import { 
  Workflow, Save, Loader2, CheckCircle2, 
  Plus, Trash2, ExternalLink 
} from 'lucide-react';
import { useCmsData } from '../../../context/CmsContext';
import { ProcessPageContent } from '../../../types';

export default function ProcessPageCms() {
  const { processContent, updateProcessPageContent } = useCmsData();
  const [formData, setFormData] = useState<ProcessPageContent>(processContent);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newChecklistText, setNewChecklistText] = useState('');

  React.useEffect(() => {
    setFormData(processContent);
  }, [processContent]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateProcessPageContent(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving process content:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddStep = () => {
    const current = formData.steps || [];
    setFormData({
      ...formData,
      steps: [
        ...current,
        {
          stepNumber: `0${current.length + 1}`,
          title: 'New Step Title',
          description: 'Step overview description...',
          detail: 'Additional helpful advice for the patient...'
        }
      ]
    });
  };

  const handleRemoveStep = (index: number) => {
    const current = formData.steps || [];
    setFormData({
      ...formData,
      steps: current.filter((_, i) => i !== index)
    });
  };

  const handleAddChecklist = () => {
    if (!newChecklistText.trim()) return;
    const current = formData.checklistItems || [];
    setFormData({
      ...formData,
      checklistItems: [...current, newChecklistText.trim()]
    });
    setNewChecklistText('');
  };

  const handleRemoveChecklist = (index: number) => {
    const current = formData.checklistItems || [];
    setFormData({
      ...formData,
      checklistItems: current.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Process & Journey CMS</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure step-by-step patient journey, appointment preparation, and arrival checklists.
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
            <span>Save Process Page</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Process journey updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Section Header
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
                Heading Title
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
        </div>

        {/* Steps Manager */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Care Steps (Sequential Workflow)
            </h2>
            <button
              type="button"
              onClick={handleAddStep}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              <Plus size={14} />
              <span>Add Step</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.steps?.map((step, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => handleRemoveStep(idx)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-600"
                >
                  <Trash2 size={15} />
                </button>
                <div className="grid sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Step Number
                    </label>
                    <input
                      type="text"
                      value={step.stepNumber}
                      onChange={(e) => {
                        const updated = [...formData.steps];
                        updated[idx].stepNumber = e.target.value;
                        setFormData({ ...formData, steps: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Step Title
                    </label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => {
                        const updated = [...formData.steps];
                        updated[idx].title = e.target.value;
                        setFormData({ ...formData, steps: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={step.description}
                      onChange={(e) => {
                        const updated = [...formData.steps];
                        updated[idx].description = e.target.value;
                        setFormData({ ...formData, steps: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Detail / Benefit Subtext
                    </label>
                    <textarea
                      rows={2}
                      value={step.detail}
                      onChange={(e) => {
                        const updated = [...formData.steps];
                        updated[idx].detail = e.target.value;
                        setFormData({ ...formData, steps: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What to Bring Checklist */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            "What to Bring" Patient Checklist
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Valid Government Photo ID"
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
            />
            <button
              type="button"
              onClick={handleAddChecklist}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
            >
              Add Item
            </button>
          </div>

          <div className="space-y-2">
            {formData.checklistItems?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-800">{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveChecklist(idx)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={14} />
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
            <span>Save Process Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
