import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, Plus, Search, Edit2, Trash2, CheckCircle2, 
  X, Save, ArrowUpDown, Tag, AlertCircle 
} from 'lucide-react';
import { 
  collection, onSnapshot, doc, setDoc, deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { useAdminAuth } from '../context/AdminAuthContext';
import { logAdminActivity } from '../utils/auditLogger';
import { FaqItem } from '../../types';

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Are you currently accepting new patients at Newark Medical Associates?',
    answer: 'Yes, we are actively accepting new adult and adolescent patients for comprehensive primary care, routine annual exams, diagnostic evaluations, and ongoing chronic condition management.',
    category: 'Appointments & Practice',
    displayOrder: 1
  },
  {
    id: 'faq-2',
    question: 'What health insurance plans do you accept?',
    answer: 'We accept most major commercial and government health insurance plans including Medicare, Medicaid, Horizon Blue Cross Blue Shield, Aetna, Cigna, UnitedHealthcare, Oxford, and Amerigroup. Transparent self-pay fee schedules are also available.',
    category: 'Billing & Insurance',
    displayOrder: 2
  },
  {
    id: 'faq-3',
    question: 'Do you offer same-day or walk-in appointments for urgent illness?',
    answer: 'Yes! We reserve dedicated daily appointment slots for non-emergency acute concerns including fever, persistent cough, minor injuries, sinus infections, and urinary tract infections.',
    category: 'Clinical Services',
    displayOrder: 3
  },
  {
    id: 'faq-4',
    question: 'Are blood work and diagnostic testing performed in your office?',
    answer: 'Yes. Our Newark clinic features an on-site certified laboratory for rapid blood draws, metabolic panels, lipid testing, diabetic HbA1c, rapid strep/flu/COVID, and resting 12-lead EKGs.',
    category: 'Diagnostics & Testing',
    displayOrder: 4
  },
  {
    id: 'faq-5',
    question: 'What languages does Dr. Gadhvi and the clinic staff speak?',
    answer: 'Our healthcare providers and clinical support team are fluent in English, Spanish, Gujarati, and Hindi, ensuring clear, comfortable communication for all patients.',
    category: 'Appointments & Practice',
    displayOrder: 5
  }
];

export default function FaqManager() {
  const { user } = useAdminAuth();
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const categories = ['All', 'Appointments & Practice', 'Billing & Insurance', 'Clinical Services', 'Diagnostics & Testing', 'Preventive Care'];

  useEffect(() => {
    try {
      const db = getDb();
      const unsub = onSnapshot(collection(db, 'faqs'), (snap) => {
        if (!snap.empty) {
          const list: FaqItem[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() as any }));
          list.sort((a, b) => a.displayOrder - b.displayOrder);
          setFaqs(list);
        }
      }, () => {});
      return () => unsub();
    } catch {
      // offline fallback
    }
  }, []);

  const handleCreateNew = () => {
    setEditingFaq({
      id: `faq-${Date.now()}`,
      question: '',
      answer: '',
      category: 'Appointments & Practice',
      displayOrder: faqs.length + 1
    });
    setIsCreating(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq || !editingFaq.question.trim()) return;

    setSaving(true);
    try {
      const db = getDb();
      const toSave = {
        ...editingFaq,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'faqs', editingFaq.id), toSave, { merge: true });

      await logAdminActivity(
        user?.email || 'admin@newarkmed.com',
        user?.displayName || 'Admin',
        isCreating ? `Created FAQ: ${editingFaq.question.substring(0, 30)}...` : `Updated FAQ: ${editingFaq.question.substring(0, 30)}...`,
        'general'
      );

      setToastMessage(isCreating ? 'FAQ created successfully!' : 'FAQ updated successfully!');
      setTimeout(() => setToastMessage(null), 3000);
      setEditingFaq(null);
      setIsCreating(false);
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const db = getDb();
      await deleteDoc(doc(db, 'faqs', id));
      setFaqs(faqs.filter(f => f.id !== id));
      await logAdminActivity(
        user?.email || 'admin@newarkmed.com',
        user?.displayName || 'Admin',
        `Deleted FAQ: ${id}`,
        'general'
      );
      setToastMessage('FAQ deleted.');
      setTimeout(() => setToastMessage(null), 3000);
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const filtered = faqs.filter(f => {
    const matchesSearch = f.question.toLowerCase().includes(search.toLowerCase()) || 
                          f.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

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
            <HelpCircle size={13} />
            <span>Patient Knowledge Base</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">FAQ Management</h1>
          <p className="text-xs text-slate-500">
            Create, categorize, reorder, and manage frequently asked questions displayed across the website.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all"
        >
          <Plus size={16} />
          <span>Add New FAQ</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions or answers..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No FAQs found matching your query.
          </div>
        ) : (
          filtered.map((item, idx) => (
            <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">#{item.displayOrder || idx + 1}</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 text-primary-700 border border-primary-100">
                    <Tag size={10} />
                    <span>{item.category || 'General'}</span>
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{item.question}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.answer}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => { setEditingFaq(item); setIsCreating(false); }}
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
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete FAQ?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this question from the patient FAQ section?
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
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Modal */}
      {editingFaq && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {isCreating ? 'Create Frequently Asked Question' : 'Edit Question'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingFaq(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={editingFaq.question}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Do you accept Medicare?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Answer</label>
                <textarea
                  rows={4}
                  required
                  value={editingFaq.answer}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="Clear and informative answer for patients..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingFaq.category}
                    onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 bg-white"
                  >
                    <option value="Appointments & Practice">Appointments & Practice</option>
                    <option value="Billing & Insurance">Billing & Insurance</option>
                    <option value="Clinical Services">Clinical Services</option>
                    <option value="Diagnostics & Testing">Diagnostics & Testing</option>
                    <option value="Preventive Care">Preventive Care</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingFaq.displayOrder}
                    onChange={(e) => setEditingFaq({ ...editingFaq, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
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
                  <span>{saving ? 'Saving...' : 'Save FAQ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
