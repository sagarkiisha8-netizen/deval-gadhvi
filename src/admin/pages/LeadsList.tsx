import React, { useState, useEffect } from 'react';
import { 
  Inbox, Search, Filter, Mail, Phone, Calendar, 
  CheckCircle2, Trash2, Clock, User, MessageSquare, 
  ArrowRight, Loader2, X, Download, Plus, Save, 
  FileText, UserPlus 
} from 'lucide-react';
import { 
  collection, onSnapshot, query, orderBy, 
  doc, updateDoc, deleteDoc, setDoc, serverTimestamp 
} from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { LeadItem, Appointment } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useCmsData } from '../../context/CmsContext';

export default function LeadsList() {
  const navigate = useNavigate();
  const { providers, services } = useCmsData();
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  
  // Note editing in drawer
  const [internalNotes, setInternalNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    setLoading(true);
    try {
      const db = getDb();
      const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: LeadItem[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        setLeads(list);
        setLoading(false);
      }, (err) => {
        console.warn('Firestore leads listener error:', err);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch {
      setLoading(false);
    }
  }, []);

  const handleSelectLead = (lead: LeadItem) => {
    setSelectedLead(lead);
    setInternalNotes(lead.internalNotes || '');
  };

  const handleUpdateStatus = async (id: string, newStatus: LeadItem['status']) => {
    try {
      const db = getDb();
      await updateDoc(doc(db, 'leads', id), { 
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setIsSavingNotes(true);
    try {
      const db = getDb();
      await updateDoc(doc(db, 'leads', selectedLead.id), {
        internalNotes: internalNotes.trim(),
        updatedAt: serverTimestamp()
      });
      setSelectedLead(prev => prev ? { ...prev, internalNotes: internalNotes.trim() } : null);
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleConvertToAppointment = async (lead: LeadItem) => {
    try {
      const db = getDb();
      const currentYear = new Date().getFullYear();
      const randomSeq = Math.floor(100000 + Math.random() * 900000);
      const apptId = `NMA-${currentYear}-${randomSeq}`;

      const activeProvider = providers.find(p => p.isActive !== false);
      const activeService = services.find(s => s.name === lead.service) || services[0];

      const newAppt: Appointment = {
        id: apptId,
        patientName: lead.name,
        patientEmail: lead.email,
        patientPhone: lead.phone || '',
        phone: lead.phone || '',
        email: lead.email,
        patientType: 'New Patient',
        providerName: activeProvider ? activeProvider.name : 'Dr. Deval Gadhvi',
        serviceName: lead.service || (activeService ? activeService.name : 'Primary Care & Prevention'),
        preferredDate: new Date().toISOString().split('T')[0],
        preferredTime: '09:00 AM',
        status: 'new',
        bookingSource: `Converted from Lead (${lead.id})`,
        notes: lead.message,
        internalNotes: `Converted from website lead ${lead.id}. ${lead.internalNotes || ''}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'appointments', apptId), newAppt);
      await updateDoc(doc(db, 'leads', lead.id), { status: 'converted' });

      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'converted' } : l));
      navigate(`/admin/appointments/${apptId}`);
    } catch (err) {
      console.error('Error converting lead to appointment:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this inquiry record?')) return;
    try {
      const db = getDb();
      await deleteDoc(doc(db, 'leads', id));
      setLeads(prev => prev.filter(l => l.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
    } catch (err) {
      console.error('Delete lead error:', err);
    }
  };

  const exportLeadsCSV = () => {
    if (filtered.length === 0) {
      alert('No leads to export.');
      return;
    }

    const headers = ['Lead ID', 'Name', 'Email', 'Phone', 'Service / Topic', 'Status', 'Source', 'Message', 'Internal Notes'];
    const rows = filtered.map(l => [
      `"${l.id || ''}"`,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${l.email || ''}"`,
      `"${l.phone || ''}"`,
      `"${(l.service || '').replace(/"/g, '""')}"`,
      `"${l.status || 'new'}"`,
      `"${(l.source || 'Website').replace(/"/g, '""')}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`,
      `"${(l.internalNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NMA_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = leads.filter(l => {
    const matchesSearch = 
      (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.message || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.phone || '').includes(searchTerm) ||
      (l.id || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || l.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Leads & Inquiries</h1>
          <p className="text-sm text-slate-500 mt-1">
            General patient contact requests, appointment inquiries, and website message submissions.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={exportLeadsCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <div className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-xl">
            Total Inquiries: <span className="text-slate-900 font-bold">{leads.length}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input 
            type="text" 
            placeholder="Search patient leads by name, question, phone..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: `All (${leads.length})` },
            { id: 'new', label: `Unread (${leads.filter(l => l.status === 'new').length})` },
            { id: 'contacted', label: `Contacted (${leads.filter(l => l.status === 'contacted').length})` },
            { id: 'converted', label: `Converted (${leads.filter(l => l.status === 'converted').length})` }
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === pill.id 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Split: Leads List + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Leads Table/Cards */}
        <div className={selectedLead ? 'lg:col-span-7' : 'lg:col-span-12'}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {loading ? (
              <div className="py-20 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary-600 mb-2" />
                <span className="text-xs">Syncing patient leads from Firestore...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-xs">
                No patient inquiries match your search.
              </div>
            ) : (
              filtered.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => handleSelectLead(lead)}
                  className={`p-5 hover:bg-slate-50/80 cursor-pointer transition-colors ${
                    selectedLead?.id === lead.id ? 'bg-primary-50/40 border-l-4 border-primary-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{lead.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          lead.status === 'new' ? 'bg-amber-100 text-amber-800' :
                          lead.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {(lead.status || 'new').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Mail size={12} className="text-slate-400" />
                          <span>{lead.email}</span>
                        </span>
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={12} className="text-slate-400" />
                            <span>{lead.phone}</span>
                          </span>
                        )}
                        {lead.service && (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                            {lead.service}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                      {lead.id}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{lead.message}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Selected Lead Detail */}
        {selectedLead && (
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5 sticky top-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedLead.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">Lead ID: {selectedLead.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Switcher */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Lead Status:</span>
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleUpdateStatus(selectedLead.id, e.target.value as any)}
                  className="text-xs font-bold px-3 py-1 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="new">New (Unread)</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted to Patient</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Inquiry Message */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Message</h4>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedLead.message}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700">Internal Staff Notes</h4>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
                  >
                    <Save size={12} />
                    <span>{isSavingNotes ? 'Saving...' : 'Save Note'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Record call attempts, insurance verification notes..."
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Convert to Appointment Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleConvertToAppointment(selectedLead)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  <UserPlus size={15} />
                  <span>Convert to Confirmed Appointment</span>
                </button>
              </div>

              {/* Contact Actions */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <a
                  href={`mailto:${selectedLead.email}?subject=Response from Newark Medical Associates`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                >
                  <Mail size={14} />
                  <span>Email {selectedLead.name}</span>
                </a>

                {selectedLead.phone && (
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Phone size={14} />
                    <span>Call ({selectedLead.phone})</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(selectedLead.id)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-1.5 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors mt-2"
                >
                  <Trash2 size={13} />
                  <span>Delete Inquiry</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
