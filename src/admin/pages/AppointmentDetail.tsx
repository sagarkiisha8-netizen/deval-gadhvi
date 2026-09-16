import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Phone, Mail, Clock, Calendar, 
  User, Activity, CheckCircle2, XCircle, Trash2, 
  Save, Loader2, MessageSquare, AlertCircle, 
  Send, RefreshCw, FileText, UserCheck, ShieldCheck 
} from 'lucide-react';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { Appointment } from '../../types';
import { useCmsData } from '../../context/CmsContext';
import { sendAppointmentNotification } from '../../services/notificationService';
import { getAvailableTimeSlots, TimeSlot } from '../../services/availabilityService';

export default function AppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { providers, services } = useCmsData();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Editable Fields
  const [status, setStatus] = useState<Appointment['status']>('new');
  const [providerId, setProviderId] = useState('');
  const [providerName, setProviderName] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  const activeProviders = providers.filter(p => p.isActive !== false);
  const activeServices = services.filter(s => s.isActive !== false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const fetchAppt = async () => {
      try {
        const db = getDb();
        const docRef = doc(db, 'appointments', id);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as Appointment;
          setAppointment(data);
          setStatus(data.status || 'new');
          setProviderId(data.providerId || '');
          setProviderName(data.providerName || '');
          setServiceId(data.serviceId || '');
          setServiceName(data.serviceName || '');
          setPreferredDate(data.preferredDate || '');
          setPreferredTime(data.preferredTime || '');
          setInternalNotes(data.internalNotes || '');
        } else {
          setAppointment(null);
        }
      } catch (err) {
        console.warn('Error fetching appointment record:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppt();
  }, [id]);

  // Update dynamic time slots when date or provider changes
  useEffect(() => {
    const loadSlots = async () => {
      if (!preferredDate) return;
      const prov = activeProviders.find(p => p.id === providerId || p.name === providerName) || null;
      try {
        const slots = await getAvailableTimeSlots(prov, preferredDate);
        setAvailableSlots(slots);
      } catch (err) {
        console.warn('Error fetching available slots for date:', err);
      }
    };
    loadSlots();
  }, [preferredDate, providerId, providerName, activeProviders]);

  const handleSaveAll = async () => {
    if (!id || !appointment) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const db = getDb();
      const previousStatus = appointment.status;

      const updatedPayload: Partial<Appointment> = {
        status,
        providerId,
        providerName,
        serviceId,
        serviceName,
        preferredDate,
        preferredTime,
        internalNotes,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'appointments', id), updatedPayload);
      
      const fullUpdated: Appointment = {
        ...appointment,
        ...updatedPayload
      } as Appointment;

      setAppointment(fullUpdated);
      setSaveSuccess(true);

      // Trigger automatic patient confirmation email / SMS log if status transitioned
      if (status !== previousStatus) {
        if (status === 'confirmed') {
          await sendAppointmentNotification('appointment_confirmed', fullUpdated);
          setNotificationStatus('Confirmation notification sent to patient!');
        } else if (status === 'cancelled') {
          await sendAppointmentNotification('appointment_cancelled', fullUpdated);
          setNotificationStatus('Cancellation notice sent to patient.');
        } else if (status === 'rescheduled') {
          await sendAppointmentNotification('appointment_rescheduled', fullUpdated);
          setNotificationStatus('Reschedule notice sent to patient.');
        }
      }

      setTimeout(() => {
        setSaveSuccess(false);
        setNotificationStatus(null);
      }, 4000);
    } catch (err) {
      console.error('Error saving appointment updates:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickConfirm = async () => {
    setStatus('confirmed');
    if (!id || !appointment) return;
    try {
      const db = getDb();
      await updateDoc(doc(db, 'appointments', id), {
        status: 'confirmed',
        updatedAt: serverTimestamp()
      });
      const updated = { ...appointment, status: 'confirmed' as const };
      setAppointment(updated);
      await sendAppointmentNotification('appointment_confirmed', updated);
      setNotificationStatus('Appointment confirmed! Notification logged.');
      setTimeout(() => setNotificationStatus(null), 4000);
    } catch (err) {
      console.error('Quick confirm error:', err);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      const db = getDb();
      await deleteDoc(doc(db, 'appointments', id));
      navigate('/admin/appointments');
    } catch (err) {
      console.error('Delete error:', err);
      navigate('/admin/appointments');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-2" />
        <p className="text-xs">Loading appointment record from Firestore...</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16 space-y-4">
        <AlertCircle size={40} className="mx-auto text-slate-400" />
        <h2 className="text-lg font-bold text-slate-900">Appointment Record Not Found</h2>
        <p className="text-xs text-slate-500">The appointment ID was not found in the database.</p>
        <Link to="/admin/appointments" className="inline-block text-primary-600 font-semibold text-xs mt-2">
          ← Return to Appointments List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          to="/admin/appointments" 
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs"
        >
          <ArrowLeft size={14} className="mr-1.5" />
          <span>Back to All Appointments</span>
        </Link>

        <div className="flex items-center gap-2">
          {status !== 'confirmed' && (
            <button
              type="button"
              onClick={handleQuickConfirm}
              className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 size={14} />
              <span>Confirm Appointment</span>
            </button>
          )}

          {deleteConfirm ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold"
              >
                Confirm Delete
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setDeleteConfirm(true)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Delete Appointment"
            >
              <Trash2 size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold hover:bg-primary-700 flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save Updates</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Appointment record updated in Firestore. {notificationStatus || ''}</span>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white shadow-sm rounded-3xl border border-slate-200 overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-lg font-bold text-slate-900">Appointment Record {appointment.id}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                status === 'new' ? 'bg-amber-100 text-amber-800' :
                status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                status === 'completed' ? 'bg-blue-100 text-blue-800' :
                status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                'bg-slate-100 text-slate-800'
              }`}>
                {status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Source: {appointment.bookingSource || 'Patient Web Portal'} • Patient Type: {appointment.patientType || 'New Patient'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-600">Workflow Status:</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-primary-500"
            >
              <option value="new">● New Intake Request</option>
              <option value="confirmed">✓ Confirmed</option>
              <option value="rescheduled">↻ Rescheduled</option>
              <option value="completed">✓ Completed</option>
              <option value="cancelled">✕ Cancelled</option>
            </select>
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Patient Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Patient Identification
            </h3>
            
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                  {appointment.patientName?.charAt(0) || 'P'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{appointment.patientName}</h4>
                  <span className="text-[11px] font-semibold text-primary-600">
                    {appointment.patientType || 'New Patient'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" />
                    <span>Phone</span>
                  </span>
                  <a 
                    href={`tel:${appointment.patientPhone || appointment.phone}`} 
                    className="font-semibold text-primary-600 hover:underline"
                  >
                    {appointment.patientPhone || appointment.phone || 'None provided'}
                  </a>
                </div>

                {(appointment.patientEmail || appointment.email) && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Mail size={13} className="text-slate-400" />
                      <span>Email</span>
                    </span>
                    <a 
                      href={`mailto:${appointment.patientEmail || appointment.email}`} 
                      className="font-semibold text-primary-600 hover:underline"
                    >
                      {appointment.patientEmail || appointment.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Clinical Booking Details & Schedule Editor */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Clinical Session & Scheduling
            </h3>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Assigned Healthcare Provider
                </label>
                <select
                  value={providerId || providerName}
                  onChange={(e) => {
                    const prov = activeProviders.find(p => p.id === e.target.value || p.name === e.target.value);
                    if (prov) {
                      setProviderId(prov.id);
                      setProviderName(prov.name);
                    } else {
                      setProviderName(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                >
                  {activeProviders.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                  ))}
                  {!activeProviders.some(p => p.name === providerName) && providerName && (
                    <option value={providerName}>{providerName}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Clinical Service
                </label>
                <select
                  value={serviceId || serviceName}
                  onChange={(e) => {
                    const s = activeServices.find(srv => srv.id === e.target.value || srv.name === e.target.value);
                    if (s) {
                      setServiceId(s.id);
                      setServiceName(s.name);
                    } else {
                      setServiceName(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                >
                  {activeServices.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                  {!activeServices.some(s => s.name === serviceName) && serviceName && (
                    <option value={serviceName}>{serviceName}</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Time Slot
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                  >
                    {availableSlots.length > 0 ? (
                      availableSlots.map(s => (
                        <option key={s.time} value={s.time}>
                          {s.time} {!s.available && s.time !== preferredTime ? '(Conflict)' : ''}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value={preferredTime}>{preferredTime || '09:00 AM'}</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="01:30 PM">01:30 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="04:30 PM">04:30 PM</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Request Notes */}
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Patient Chief Complaint / Intake Note
            </h3>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              {appointment.reasonForVisit || appointment.notes || appointment.message ? (
                <div className="space-y-1">
                  {appointment.reasonForVisit && (
                    <p><strong className="text-slate-900">Reason:</strong> {appointment.reasonForVisit}</p>
                  )}
                  {(appointment.notes || appointment.message) && (
                    <p><strong className="text-slate-900">Notes / Details:</strong> {appointment.notes || appointment.message}</p>
                  )}
                </div>
              ) : (
                'No extra comments submitted by patient.'
              )}
            </div>
          </div>

          {/* Staff Internal Notes */}
          <div className="md:col-span-2 space-y-2 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MessageSquare size={14} className="text-primary-600" />
                <span>Internal Staff & Clinical Notes</span>
              </h3>
              <span className="text-[11px] text-slate-400">Internal only • Not visible to patient</span>
            </div>

            <textarea 
              rows={4}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Record insurance pre-authorization, patient check-in notes, lab requisitions, clinical instructions..."
              className="w-full border border-slate-300 rounded-2xl p-3.5 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
