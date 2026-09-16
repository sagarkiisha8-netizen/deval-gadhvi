import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, Plus, Search, Edit2, Trash2, CheckCircle2, 
  X, Save, Eye, EyeOff, Sparkles, AlertCircle, ArrowUpDown,
  FileText, ExternalLink, HelpCircle
} from 'lucide-react';
import { 
  collection, onSnapshot, doc, setDoc, deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { useAdminAuth } from '../context/AdminAuthContext';
import { logAdminActivity } from '../utils/auditLogger';
import { ConditionItem } from '../../types';

const DEFAULT_CONDITIONS: ConditionItem[] = [
  {
    id: 'hypertension',
    name: 'Hypertension (High Blood Pressure)',
    slug: 'hypertension-treatment-newark-nj',
    featuredImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
    overview: 'Comprehensive diagnosis and personalized medical regimens to keep blood pressure within healthy parameters, protecting against stroke and heart disease.',
    symptoms: ['Morning headaches', 'Shortness of breath', 'Nosebleeds', 'Dizziness', 'Chest tightness'],
    causes: ['High sodium diet', 'Genetics / family history', 'Lack of physical activity', 'Chronic stress'],
    riskFactors: ['Age over 50', 'Obesity', 'Smoking', 'Chronic kidney disease'],
    diagnosis: ['Automated in-clinic BP mapping', '24-hour ambulatory monitoring', 'Comprehensive metabolic panel', 'EKG testing'],
    treatmentOptions: ['ACE inhibitors / ARBs', 'Diuretics & Calcium channel blockers', 'DASH dietary coaching', 'Weight management'],
    prevention: ['Low-sodium diet (<1500mg/day)', 'Daily 30-minute cardio', 'Limiting alcohol and caffeine', 'Routine annual checkups'],
    faqs: [
      { question: 'What is a normal blood pressure reading?', answer: 'A normal reading is generally below 120/80 mmHg for healthy adults.' },
      { question: 'Do I need medication if I have no symptoms?', answer: 'Yes, hypertension is often called the silent killer because arterial damage occurs without outward symptoms.' }
    ],
    relatedServices: ['Comprehensive Primary Care', 'Onsite EKG Diagnostics'],
    ctaText: 'Schedule a Blood Pressure Evaluation',
    ctaLink: '/appointments',
    seoTitle: 'Hypertension & High Blood Pressure Care Newark NJ | Newark Medical',
    metaDescription: 'Board-certified physicians providing personalized hypertension management, EKG diagnostics, and medication titration in Newark, NJ.',
    displayOrder: 1,
    isActive: true
  },
  {
    id: 'type-2-diabetes',
    name: 'Type 2 Diabetes & Metabolic Syndrome',
    slug: 'diabetes-management-newark-nj',
    featuredImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800',
    overview: 'Continuous glucose monitoring, HbA1c optimization, personalized nutrition regimens, and modern insulin-sensitizing therapies.',
    symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue', 'Blurred vision', 'Slow healing cuts'],
    causes: ['Insulin resistance', 'Sedentary lifestyle', 'Genetic predisposition', 'Excess visceral fat'],
    riskFactors: ['Prediabetes history', 'BMI > 25', 'History of gestational diabetes', 'Age 45+'],
    diagnosis: ['In-office Rapid HbA1c testing', 'Fasting plasma glucose', 'Oral glucose tolerance test', 'Urinary microalbumin'],
    treatmentOptions: ['Metformin / GLP-1 receptor agonists', 'SGLT2 inhibitors', 'Continuous Glucose Monitoring (CGM)', 'Nutritional counseling'],
    prevention: ['Moderate glycemic diet', 'Strength and resistance training', 'Targeted weight reduction of 7-10%'],
    faqs: [
      { question: 'Can Type 2 Diabetes be put into remission?', answer: 'Yes, structured weight management and early intensive lifestyle intervention can achieve glycemic remission.' }
    ],
    relatedServices: ['Onsite Diagnostic Laboratory', 'Medical Weight Loss'],
    ctaText: 'Book a Diabetes Consultation',
    ctaLink: '/appointments',
    seoTitle: 'Diabetes Treatment & HbA1c Testing Newark NJ | Newark Medical Associates',
    metaDescription: 'Expert diabetic care, on-site lab testing, and personalized blood sugar management in Newark, NJ.',
    displayOrder: 2,
    isActive: true
  },
  {
    id: 'high-cholesterol',
    name: 'Hyperlipidemia & High Cholesterol',
    slug: 'high-cholesterol-treatment-newark-nj',
    featuredImage: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800',
    overview: 'Advanced lipid profiling, APOB assessments, and cardiovascular risk reduction strategies tailored to each patient.',
    symptoms: ['Usually asymptomatic until arterial blockages develop'],
    causes: ['Saturated fat excess', 'Familial hypercholesterolemia', 'Metabolic dysfunction'],
    riskFactors: ['Smoking', 'Hypertension', 'Sedentary routine', 'Family history of early heart attack'],
    diagnosis: ['Fast lipid panel (Total, LDL, HDL, Triglycerides)', 'High-sensitivity CRP', 'Coronary calcium scoring referral'],
    treatmentOptions: ['Statin therapy', 'Ezetimibe & PCSK9 inhibitors', 'Cardioprotective Mediterranean diet'],
    prevention: ['Soluble fiber intake', 'Omega-3 fatty acids', 'Smoking cessation', 'Regular cardiovascular screening'],
    faqs: [
      { question: 'How often should cholesterol be checked?', answer: 'Healthy adults should be tested every 4-6 years, while patients with risk factors should test annually.' }
    ],
    relatedServices: ['Comprehensive Primary Care', 'Preventive Medicine'],
    ctaText: 'Request a Complete Lipid Panel',
    ctaLink: '/appointments',
    seoTitle: 'Cholesterol & Lipid Management Newark NJ | Newark Medical Associates',
    metaDescription: 'Comprehensive lipid panel testing, statin counseling, and preventive cardiology in Newark, NJ.',
    displayOrder: 3,
    isActive: true
  }
];

export default function ConditionsManager() {
  const { user } = useAdminAuth();
  const [conditions, setConditions] = useState<ConditionItem[]>(DEFAULT_CONDITIONS);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<ConditionItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Array edit helpers
  const [tempSymptom, setTempSymptom] = useState('');
  const [tempCause, setTempCause] = useState('');
  const [tempTreatment, setTempTreatment] = useState('');

  useEffect(() => {
    try {
      const db = getDb();
      const unsub = onSnapshot(collection(db, 'conditions'), (snap) => {
        if (!snap.empty) {
          const list: ConditionItem[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() as any }));
          list.sort((a, b) => a.displayOrder - b.displayOrder);
          setConditions(list);
        }
      }, (err) => console.warn('Conditions listener fallback:', err));
      return () => unsub();
    } catch {
      // offline fallback
    }
  }, []);

  const handleCreateNew = () => {
    const newId = `condition-${Date.now()}`;
    setEditingItem({
      id: newId,
      name: '',
      slug: `condition-${Date.now()}`,
      featuredImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
      overview: '',
      symptoms: [],
      causes: [],
      riskFactors: [],
      diagnosis: [],
      treatmentOptions: [],
      prevention: [],
      faqs: [],
      relatedServices: ['Comprehensive Primary Care'],
      ctaText: 'Book an Appointment',
      ctaLink: '/appointments',
      seoTitle: '',
      metaDescription: '',
      displayOrder: conditions.length + 1,
      isActive: true
    });
    setIsCreating(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name.trim()) return;

    setSaving(true);
    try {
      const db = getDb();
      const conditionToSave = {
        ...editingItem,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'conditions', editingItem.id), conditionToSave, { merge: true });

      await logAdminActivity(
        user?.email || 'admin@newarkmed.com',
        user?.displayName || 'Admin',
        isCreating ? `Created Medical Condition: ${editingItem.name}` : `Updated Medical Condition: ${editingItem.name}`,
        'general',
        `Condition slug: ${editingItem.slug}`
      );

      setToastMessage(isCreating ? 'Condition page created successfully!' : 'Condition updated successfully!');
      setTimeout(() => setToastMessage(null), 3000);
      setEditingItem(null);
      setIsCreating(false);
    } catch (err: any) {
      alert('Failed to save condition: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const db = getDb();
      await deleteDoc(doc(db, 'conditions', id));
      setConditions(conditions.filter(c => c.id !== id));
      await logAdminActivity(
        user?.email || 'admin@newarkmed.com',
        user?.displayName || 'Admin',
        `Deleted Condition: ${id}`,
        'general'
      );
      setToastMessage('Condition deleted.');
      setTimeout(() => setToastMessage(null), 3000);
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const filtered = conditions.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.overview.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {toastMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button type="button" onClick={() => setToastMessage(null)}><X size={14} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-bold mb-2">
            <HeartPulse size={13} />
            <span>Clinical Treatments & Medical Conditions</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Treatments & Conditions Manager</h1>
          <p className="text-xs text-slate-500">
            Publish educational condition pages with symptoms, causes, clinical diagnosis, and evidence-based treatments.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all"
        >
          <Plus size={16} />
          <span>Add New Condition</span>
        </button>
      </div>

      {/* Search & Counter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conditions by name or symptoms..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold">
          Showing {filtered.length} of {conditions.length} conditions
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100">
          {filtered.map((item) => (
            <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-4 min-w-0">
                <img
                  src={item.featuredImage}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{item.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.isActive ? 'Active / Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{item.overview}</p>
                  <p className="text-[11px] text-slate-400 font-mono truncate">Slug: /{item.slug}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => { setEditingItem(item); setIsCreating(false); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-primary-700 bg-slate-100 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Condition Page?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this clinical condition? This action is permanent.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full my-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isCreating ? 'Create Medical Condition Page' : 'Edit Condition Details'}
                </h3>
                <p className="text-xs text-slate-500">Provide medical overview, diagnosis, and treatment protocols.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Condition Name</label>
                  <input
                    type="text"
                    required
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                    placeholder="e.g. Hypertension (High Blood Pressure)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={editingItem.slug}
                    onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                    placeholder="e.g. hypertension-treatment-newark-nj"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Featured Image URL</label>
                  <input
                    type="text"
                    value={editingItem.featuredImage}
                    onChange={(e) => setEditingItem({ ...editingItem, featuredImage: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Medical Overview</label>
                  <textarea
                    rows={3}
                    value={editingItem.overview}
                    onChange={(e) => setEditingItem({ ...editingItem, overview: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                    placeholder="Summary of this condition, pathology, and implications..."
                  />
                </div>
              </div>

              {/* Symptoms */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <label className="block text-xs font-bold text-slate-700">Clinical Symptoms</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempSymptom}
                    onChange={(e) => setTempSymptom(e.target.value)}
                    placeholder="Add a symptom (e.g. Morning dizziness)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (tempSymptom.trim()) {
                          setEditingItem({ ...editingItem, symptoms: [...editingItem.symptoms, tempSymptom.trim()] });
                          setTempSymptom('');
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tempSymptom.trim()) {
                        setEditingItem({ ...editingItem, symptoms: [...editingItem.symptoms, tempSymptom.trim()] });
                        setTempSymptom('');
                      }
                    }}
                    className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {editingItem.symptoms.map((sym, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                      <span>{sym}</span>
                      <button
                        type="button"
                        onClick={() => setEditingItem({
                          ...editingItem,
                          symptoms: editingItem.symptoms.filter((_, i) => i !== idx)
                        })}
                        className="hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Treatment Options */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <label className="block text-xs font-bold text-slate-700">Treatment Protocols</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempTreatment}
                    onChange={(e) => setTempTreatment(e.target.value)}
                    placeholder="Add a treatment (e.g. ACE Inhibitors)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (tempTreatment.trim()) {
                          setEditingItem({ ...editingItem, treatmentOptions: [...editingItem.treatmentOptions, tempTreatment.trim()] });
                          setTempTreatment('');
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tempTreatment.trim()) {
                        setEditingItem({ ...editingItem, treatmentOptions: [...editingItem.treatmentOptions, tempTreatment.trim()] });
                        setTempTreatment('');
                      }
                    }}
                    className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {editingItem.treatmentOptions.map((treat, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs rounded-full border border-primary-100">
                      <span>{treat}</span>
                      <button
                        type="button"
                        onClick={() => setEditingItem({
                          ...editingItem,
                          treatmentOptions: editingItem.treatmentOptions.filter((_, i) => i !== idx)
                        })}
                        className="hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Status & Display Order */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingItem.displayOrder}
                    onChange={(e) => setEditingItem({ ...editingItem, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <input
                    type="checkbox"
                    id="isActiveCondition"
                    checked={editingItem.isActive}
                    onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
                  />
                  <label htmlFor="isActiveCondition" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Publish On Website
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{saving ? 'Saving...' : 'Save Condition'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
