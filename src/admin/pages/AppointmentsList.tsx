import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, ChevronDown, Download, 
  Calendar, Plus, Clock, User, Phone, CheckCircle2, 
  XCircle, AlertCircle, X, Loader2, RefreshCw, Trash2, 
  Eye, Mail, UserCheck 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  collection, onSnapshot, query, orderBy, 
  doc, setDoc, updateDoc, deleteDoc, serverTimestamp 
} from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { Appointment, Provider, ServiceItem } from '../../types';
import { useCmsData } from '../../context/CmsContext';
import { sendAppointmentNotification } from '../../services/notificationService';
import { getAvailableTimeSlots, TimeSlot } from '../../services/availabilityService';

export default function AppointmentsList() {
  const { providers, services } = useCmsData();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'date_asc' | 'date_desc'>('newest');

  // Quick Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newPatientType, setNewPatientType] = useState<'New Patient' | 'Existing Patient'>('New Patient');
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');
  const [newProviderId, setNewProviderId] = useState('');
  const [newServiceId, setNewServiceId] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('09:00 AM');
  const [newNotes, setNewNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  const activeProviders = providers.filter(p => p.isActive !== false);
  const activeServices = services.filter(s => s.isActive !== false);

  // Sync real appointments from Firestore
  useEffect(() => {
    setLoading(true);
    try {
      const db = getDb();
      const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: Appointment[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        setAppointments(list);
        setLoading(false);
      }, (err) => {
        console.warn('Firestore appointments listener error:', err);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch {
      setLoading(false);
    }
  }, []);

  // Set default provider / service in add modal
  useEffect(() => {
    if (activeProviders.length > 0 && !newProviderId) {
      setNewProviderId(activeProviders[0].id);
    }
    if (activeServices.length > 0 && !newServiceId) {
      setNewServiceId(activeServices[0].id);
    }
  }, [activeProviders, activeServices, newProviderId, newServiceId]);

  // Load available slots for selected provider and date in modal
  useEffect(() => {
    const loadSlots = async () => {
      if (!newDate) return;
      const prov = activeProviders.find(p => p.id === newProviderId) || null;
      try {
        const slots = await getAvailableTimeSlots(prov, newDate);
        setAvailableSlots(slots);
        const firstAvail = slots.find(s => s.available);
        if (firstAvail && !slots.some(s => s.time === newTime && s.available)) {
          setNewTime(firstAvail.time);
        }
      } catch (err) {
        console.warn('Slot load error:', err);
      }
    };
    loadSlots();
  }, [newProviderId, newDate, activeProviders]);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim() || !newPatientPhone.trim()) return;

    setIsSaving(true);
    try {
      const db = getDb();
      const currentYear = new Date().getFullYear();
      const randomSeq = Math.floor(100000 + Math.random() * 900000);
      const id = `NMA-${currentYear}-${randomSeq}`;

      const prov = activeProviders.find(p => p.id === newProviderId);
      const serv = activeServices.find(s => s.id === newServiceId);

      const payload: Appointment = {
        id,
        patientName: newPatientName.trim(),
        patientEmail: newPatientEmail.trim(),
        patientPhone: newPatientPhone.trim(),
        phone: newPatientPhone.trim(),
        email: newPatientEmail.trim(),
        patientType: newPatientType,
        providerId: newProviderId,
        providerName: prov ? prov.name : 'Dr. Deval Gadhvi',
        serviceId: newServiceId,
        serviceName: serv ? serv.name : 'Primary Care',
        preferredDate: newDate,
        preferredTime: newTime,
        status: 'confirmed', // Admin booked directly is confirmed
        bookingSource: 'Admin Staff Portal',
        notes: newNotes.trim(),
        internalNotes: `Scheduled manually by clinic staff for ${newPatientType}.`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'appointments', id), payload);
      await sendAppointmentNotification('appointment_confirmed', payload);

      setIsAddModalOpen(false);
      // Reset form
      setNewPatientName('');
      setNewPatientEmail('');
      setNewPatientPhone('');
      setNewNotes('');
    } catch (err) {
      console.error('Error creating appointment:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (appointment: Appointment, newStatus: Appointment['status']) => {
    try {
      const db = getDb();
      await updateDoc(doc(db, 'appointments', appointment.id), { 
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      const updated = { ...appointment, status: newStatus };
      if (newStatus === 'confirmed') {
        await sendAppointmentNotification('appointment_confirmed', updated);
      } else if (newStatus === 'cancelled') {
        await sendAppointmentNotification('appointment_cancelled', updated);
      }
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this appointment record?')) return;
    try {
      const db = getDb();
      await deleteDoc(doc(db, 'appointments', id));
    } catch (err) {
      console.error('Error deleting appointment:', err);
    }
  };

  // CSV Export
  const exportToCSV = () => {
    if (filteredAppointments.length === 0) {
      alert('No appointments to export.');
      return;
    }

    const headers = [
      'Appointment ID',
      'Patient Name',
      'Patient Type',
      'Phone',
      'Email',
      'Provider',
      'Service',
      'Date',
      'Time Slot',
      'Status',
      'Booking Source',
      'Reason / Notes'
    ];

    const rows = filteredAppointments.map(apt => [
      `"${apt.id || ''}"`,
      `"${(apt.patientName || '').replace(/"/g, '""')}"`,
      `"${apt.patientType || 'New Patient'}"`,
      `"${apt.patientPhone || apt.phone || ''}"`,
      `"${apt.patientEmail || apt.email || ''}"`,
      `"${(apt.providerName || '').replace(/"/g, '""')}"`,
      `"${(apt.serviceName || '').replace(/"/g, '""')}"`,
      `"${apt.preferredDate || ''}"`,
      `"${apt.preferredTime || ''}"`,
      `"${apt.status || 'new'}"`,
      `"${apt.bookingSource || 'Web Portal'}"`,
      `"${(apt.notes || apt.reasonForVisit || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NMA_Appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort Logic
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = 
      (apt.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.patientPhone || apt.phone || '').includes(searchTerm) ||
      (apt.patientEmail || apt.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.providerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.serviceName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || apt.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesProvider = providerFilter === 'all' || apt.providerId === providerFilter || apt.providerName === providerFilter;
    
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = apt.preferredDate === todayStr;
    } else if (dateFilter === 'upcoming') {
      matchesDate = (apt.preferredDate || '') >= todayStr;
    }

    return matchesSearch && matchesStatus && matchesProvider && matchesDate;
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    }
    if (sortBy === 'oldest') {
      return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
    }
    if (sortBy === 'date_asc') {
      return (a.preferredDate || '').localeCompare(b.preferredDate || '');
    }
    if (sortBy === 'date_desc') {
      return (b.preferredDate || '').localeCompare(a.preferredDate || '');
    }
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Appointments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time Firestore schedule, intake requests, and clinical workflow management.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <Link 
            to="/admin/calendar" 
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Calendar size={14} />
            <span>Calendar View</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text" 
              placeholder="Search patient name, phone, doctor, ID..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Provider Filter */}
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="all">All Providers</option>
              {activeProviders.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>

            {/* Date Quick Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="all">All Dates</option>
              <option value="today">Today's Schedule</option>
              <option value="upcoming">Upcoming Schedule</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="newest">Recently Received</option>
              <option value="oldest">Oldest First</option>
              <option value="date_asc">Appointment Date (Asc)</option>
              <option value="date_desc">Appointment Date (Desc)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          {[
            { id: 'all', label: `All (${appointments.length})` },
            { id: 'new', label: `New Intake (${appointments.filter(a => a.status === 'new' || a.status === 'New').length})` },
            { id: 'confirmed', label: `Confirmed (${appointments.filter(a => a.status === 'confirmed' || a.status === 'Confirmed').length})` },
            { id: 'completed', label: `Completed (${appointments.filter(a => a.status === 'completed' || a.status === 'Completed').length})` },
            { id: 'cancelled', label: `Cancelled (${appointments.filter(a => a.status === 'cancelled' || a.status === 'Cancelled').length})` }
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

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="px-5 py-3.5">ID / Patient</th>
                <th className="px-5 py-3.5">Provider & Service</th>
                <th className="px-5 py-3.5">Date & Time</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Quick Actions</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary-600 mb-2" />
                    <span>Syncing appointments from database...</span>
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No appointments match your filters.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <User size={13} className="text-primary-600 shrink-0" />
                        <span>{apt.patientName}</span>
                        {apt.patientType && (
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                            {apt.patientType}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{apt.id}</div>
                      {(apt.patientPhone || apt.phone) && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone size={10} />
                          <span>{apt.patientPhone || apt.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{apt.providerName || 'Primary Physician'}</div>
                      <div className="text-[11px] text-slate-500">{apt.serviceName || 'Consultation'}</div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-900">{apt.preferredDate}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock size={11} />
                        <span>{apt.preferredTime}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        apt.status === 'new' || apt.status === 'New' ? 'bg-amber-100 text-amber-800' :
                        apt.status === 'confirmed' || apt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                        apt.status === 'completed' || apt.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        apt.status === 'cancelled' || apt.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {(apt.status === 'new' || apt.status === 'New') && '● New Intake'}
                        {(apt.status === 'confirmed' || apt.status === 'Confirmed') && '✓ Confirmed'}
                        {(apt.status === 'completed' || apt.status === 'Completed') && 'Completed'}
                        {(apt.status === 'cancelled' || apt.status === 'Cancelled') && 'Cancelled'}
                        {(apt.status === 'rescheduled' || apt.status === 'Rescheduled') && 'Rescheduled'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {apt.status !== 'confirmed' && apt.status !== 'Confirmed' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(apt, 'confirmed')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-[11px] transition-colors"
                            title="Confirm appointment and notify patient"
                          >
                            Confirm
                          </button>
                        )}
                        {apt.status !== 'completed' && apt.status !== 'Completed' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(apt, 'completed')}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-[11px] transition-colors"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteAppointment(apt.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete appointment"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <Link 
                        to={`/admin/appointments/${apt.id}`} 
                        className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 font-semibold"
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Appointment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Direct Patient Booking</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-6 space-y-4 text-left">
              {/* Patient Type */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setNewPatientType('New Patient')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    newPatientType === 'New Patient' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  New Patient
                </button>
                <button
                  type="button"
                  onClick={() => setNewPatientType('Existing Patient')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    newPatientType === 'Existing Patient' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Existing Patient
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Johnathan Miller"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(973) 000-0000"
                    value={newPatientPhone}
                    onChange={(e) => setNewPatientPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={newPatientEmail}
                    onChange={(e) => setNewPatientEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Assigned Provider
                  </label>
                  <select
                    value={newProviderId}
                    onChange={(e) => setNewProviderId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white"
                  >
                    {activeProviders.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Clinical Service
                  </label>
                  <select
                    value={newServiceId}
                    onChange={(e) => setNewServiceId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white"
                  >
                    {activeServices.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Time Slot
                  </label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white"
                  >
                    {availableSlots.length > 0 ? (
                      availableSlots.map(s => (
                        <option key={s.time} value={s.time} disabled={!s.available}>
                          {s.time} {!s.available ? '(Booked)' : ''}
                        </option>
                      ))
                    ) : (
                      <option value="09:00 AM">09:00 AM</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Clinical Intake Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Reason for visit, symptoms, prior history..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>Confirm & Save Appointment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
