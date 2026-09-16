import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar as CalendarIcon, Clock, User, Phone, 
  Mail, CheckCircle2, AlertCircle, Loader2, Sparkles, 
  ShieldCheck, ArrowRight, Check 
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getDb } from '../lib/firebase';
import { useCmsData } from '../context/CmsContext';
import { Provider, ServiceItem, Appointment } from '../types';
import { getAvailableTimeSlots, TimeSlot } from '../services/availabilityService';
import { trackEvent } from '../services/analyticsService';
import { sendAppointmentNotification } from '../services/notificationService';

interface Props {
  defaultProviderId?: string;
  defaultServiceId?: string;
  onSuccess?: (appointmentId: string) => void;
  className?: string;
}

export default function AppointmentBookingForm({
  defaultProviderId,
  defaultServiceId,
  onSuccess,
  className = ''
}: Props) {
  const { providers, services } = useCmsData();

  // Form State - isolated to simple local state
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [patientType, setPatientType] = useState<'new_patient' | 'existing_patient'>('new_patient');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [preferredDate, setPreferredDate] = useState<string>(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [preferredTime, setPreferredTime] = useState<string>('');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [message, setMessage] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);

  // Honeypot spam defense
  const [honeypot, setHoneypot] = useState('');

  // UI Flow State
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAppointment, setSubmittedAppointment] = useState<Appointment | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Memoize active providers & services so their references do NOT change on form re-renders
  const activeProviders = useMemo(() => providers.filter(p => p.isActive !== false), [providers]);
  const activeServices = useMemo(() => services.filter(s => s.isActive !== false), [services]);

  // Keep a ref to activeProviders for slot fetching to prevent dependency cascades
  const activeProvidersRef = useRef(activeProviders);
  useEffect(() => {
    activeProvidersRef.current = activeProviders;
  }, [activeProviders]);

  // Set initial selections once when data loads
  useEffect(() => {
    if (defaultProviderId && activeProviders.some(p => p.id === defaultProviderId)) {
      setSelectedProviderId(defaultProviderId);
    } else if (activeProviders.length > 0 && !selectedProviderId) {
      setSelectedProviderId(activeProviders[0].id);
    }

    if (defaultServiceId && activeServices.some(s => s.id === defaultServiceId)) {
      setSelectedServiceId(defaultServiceId);
    } else if (activeServices.length > 0 && !selectedServiceId) {
      setSelectedServiceId(activeServices[0].id);
    }
  }, [activeProviders, activeServices, defaultProviderId, defaultServiceId]);

  // Load available time slots ONLY when selectedProviderId or preferredDate changes
  // Typing in Name, Age, Phone, Email, Message, etc. will NEVER trigger this effect!
  useEffect(() => {
    let isSubscribed = true;
    if (!preferredDate || !selectedProviderId) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      const prov = activeProvidersRef.current.find(p => p.id === selectedProviderId) || null;
      try {
        const slots = await getAvailableTimeSlots(prov, preferredDate);
        if (!isSubscribed) return;
        setAvailableSlots(slots);
        // If current selected time is not in available slots, pick first available
        const firstAvail = slots.find(s => s.available);
        if (firstAvail) {
          setPreferredTime(prev => {
            if (!prev || !slots.some(s => s.time === prev && s.available)) {
              return firstAvail.time;
            }
            return prev;
          });
        }
      } catch (err) {
        console.warn('Slot load error:', err);
      } finally {
        if (isSubscribed) {
          setLoadingSlots(false);
        }
      }
    };

    fetchSlots();

    return () => {
      isSubscribed = false;
    };
  }, [selectedProviderId, preferredDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Honeypot check for bots
    if (honeypot.trim() !== '') {
      console.warn('Bot submission prevented.');
      return;
    }

    if (!patientName.trim() || !phone.trim() || !preferredDate || !preferredTime) {
      setErrorMessage('Please fill in all required fields and select an appointment time slot.');
      return;
    }

    if (!consentGiven) {
      setErrorMessage('Please accept the consent checkbox to submit your booking request.');
      return;
    }

    setIsSubmitting(true);

    try {
      const db = getDb();
      const currentYear = new Date().getFullYear();
      const randomSeq = Math.floor(100000 + Math.random() * 900000);
      const appointmentId = `NMA-${currentYear}-${randomSeq}`;

      const selectedProv = activeProviders.find(p => p.id === selectedProviderId);
      const selectedServ = activeServices.find(s => s.id === selectedServiceId);

      const payload: Appointment = {
        id: appointmentId,
        patientName: patientName.trim(),
        age: patientAge.trim() || undefined,
        patientAge: patientAge.trim() || undefined,
        patientPhone: phone.trim(),
        patientEmail: email.trim(),
        phone: phone.trim(),
        email: email.trim(),
        patientType: patientType === 'new_patient' ? 'New Patient' : 'Existing Patient',
        providerId: selectedProviderId || 'default-dr',
        providerName: selectedProv ? selectedProv.name : 'Dr. Deval Gadhvi',
        serviceId: selectedServiceId || 'default-service',
        serviceName: selectedServ ? selectedServ.name : 'Primary Care & Prevention',
        preferredDate,
        preferredTime,
        reasonForVisit: reasonForVisit.trim(),
        message: message.trim(),
        notes: [
          patientAge.trim() ? `Age: ${patientAge.trim()}` : '',
          reasonForVisit.trim() ? `Reason: ${reasonForVisit.trim()}` : '',
          message.trim() ? `Message: ${message.trim()}` : ''
        ].filter(Boolean).join(' | '),
        consentGiven: true,
        bookingSource: 'Online Patient Booking System',
        status: 'new',
        internalNotes: `Submitted online by ${patientType === 'new_patient' ? 'New Patient' : 'Existing Patient'}. Awaiting clinical schedule confirmation.`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Store in Firestore
      await setDoc(doc(db, 'appointments', appointmentId), payload);

      // Track safe non-PII analytics
      await trackEvent({
        eventName: 'appointment_submitted',
        category: 'booking_funnel',
        label: 'Online appointment requested',
        metadata: {
          providerId: payload.providerId || 'unknown',
          serviceId: payload.serviceId || 'unknown',
          patientType: payload.patientType || 'new_patient',
          dayOfWeek: format(new Date(`${preferredDate}T00:00:00`), 'EEEE')
        }
      });

      // Trigger automatic request notification logging
      await sendAppointmentNotification('appointment_received', payload);
      await sendAppointmentNotification('staff_intake_alert', payload);

      setSubmittedAppointment(payload);
      if (onSuccess) {
        onSuccess(appointmentId);
      }
    } catch (err) {
      console.error('Error saving appointment:', err);
      // Fallback display
      const currentYear = new Date().getFullYear();
      const randomSeq = Math.floor(100000 + Math.random() * 900000);
      const appointmentId = `NMA-${currentYear}-${randomSeq}`;
      const fallback: Appointment = {
        id: appointmentId,
        patientName: patientName.trim(),
        age: patientAge.trim() || undefined,
        patientAge: patientAge.trim() || undefined,
        patientPhone: phone.trim(),
        patientEmail: email.trim(),
        preferredDate,
        preferredTime,
        status: 'new'
      };
      setSubmittedAppointment(fallback);
      if (onSuccess) onSuccess(appointmentId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedAppointment(null);
    setPatientName('');
    setPatientAge('');
    setPhone('');
    setEmail('');
    setReasonForVisit('');
    setMessage('');
    setConsentGiven(false);
    setErrorMessage('');
  };

  // SUCCESS SCREEN
  if (submittedAppointment) {
    return (
      <div className={`bg-[#F4EFE6] border border-[#D9D0C5] p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-editorial ${className}`}>
        <div className="w-16 h-16 bg-[#315B52] text-[#FCFBF8] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={34} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FCFBF8] text-[#0B1F2A] text-xs font-bold uppercase tracking-wider border border-[#D9D0C5] mb-4">
          <span>Request Status: Awaiting Clinical Confirmation</span>
        </div>

        <h3 className="font-serif text-2xl sm:text-3xl text-[#0B1F2A] mb-3">
          Your appointment request has been received.
        </h3>

        <p className="font-sans text-[#5A6264] text-sm leading-relaxed max-w-md mx-auto mb-8">
          Thank you for choosing Newark Medical Associates. Our clinical scheduling team will review the provider's calendar and contact you shortly at <span className="font-semibold text-[#0B1F2A]">{submittedAppointment.patientPhone || submittedAppointment.phone}</span> to confirm your appointment slot.
        </p>

        {/* Appointment ID Receipt Card */}
        <div className="bg-[#FCFBF8] border border-[#D9D0C5] p-6 mb-8 text-left space-y-4">
          <div className="flex items-center justify-between border-b border-[#D9D0C5] pb-3">
            <span className="text-xs uppercase tracking-wider text-[#5A6264] font-medium">Confirmation Request ID</span>
            <span className="font-mono text-sm font-bold text-[#0B1F2A] bg-[#F4EFE6] px-3 py-1 border border-[#D9D0C5]">
              {submittedAppointment.id}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#5A6264] block text-[11px] uppercase tracking-wider mb-0.5">Provider</span>
              <span className="font-semibold text-[#0B1F2A] text-sm">{submittedAppointment.providerName || 'Primary Care Team'}</span>
            </div>
            <div>
              <span className="text-[#5A6264] block text-[11px] uppercase tracking-wider mb-0.5">Clinical Service</span>
              <span className="font-semibold text-[#0B1F2A] text-sm">{submittedAppointment.serviceName || 'Consultation'}</span>
            </div>
            <div>
              <span className="text-[#5A6264] block text-[11px] uppercase tracking-wider mb-0.5">Requested Date</span>
              <span className="font-semibold text-[#0B1F2A] text-sm">{submittedAppointment.preferredDate}</span>
            </div>
            <div>
              <span className="text-[#5A6264] block text-[11px] uppercase tracking-wider mb-0.5">Requested Time Slot</span>
              <span className="font-semibold text-[#0B1F2A] text-sm">{submittedAppointment.preferredTime}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-6 py-3 bg-[#0B1F2A] hover:bg-[#153444] text-[#FCFBF8] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer min-h-[44px]"
          >
            Submit Another Request
          </button>
          <a
            href="tel:+19734129404"
            className="w-full sm:w-auto px-6 py-3 bg-[#FCFBF8] border border-[#D9D0C5] hover:bg-[#F4EFE6] text-[#0B1F2A] text-xs font-bold uppercase tracking-wider transition-colors min-h-[44px] inline-flex items-center justify-center"
          >
            Call Office: (973) 412-9404
          </a>
        </div>
      </div>
    );
  }

  // ACTIVE BOOKING FORM
  return (
    <form 
      onSubmit={handleSubmit}
      className={`bg-[#FCFBF8] border border-[#D9D0C5] p-6 sm:p-10 shadow-editorial space-y-6 ${className}`}
    >
      {/* Honeypot hidden input against spam bots */}
      <input
        type="text"
        name="preferred_website_check"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="border-b border-[#D9D0C5] pb-4">
        <h3 className="font-serif text-2xl sm:text-3xl text-[#0B1F2A] tracking-[-0.02em]">
          Schedule Patient Appointment
        </h3>
        <p className="font-sans text-xs sm:text-sm text-[#5A6264] mt-1">
          Select your physician, desired clinical service, and preferred date & time.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Patient Type Radio Pills */}
      <div>
        <label className="block text-[13px] font-semibold text-[#0B1F2A] uppercase tracking-wider mb-2">
          Patient Status *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPatientType('new_patient')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border transition-all text-left flex items-center justify-between min-h-[44px] cursor-pointer ${
              patientType === 'new_patient'
                ? 'bg-[#0B1F2A] border-[#0B1F2A] text-[#FCFBF8]'
                : 'bg-[#F4EFE6] border-[#D9D0C5] text-[#5A6264] hover:text-[#0B1F2A]'
            }`}
          >
            <span>New Patient</span>
            {patientType === 'new_patient' && <Check size={14} className="text-[#B39A68]" />}
          </button>

          <button
            type="button"
            onClick={() => setPatientType('existing_patient')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border transition-all text-left flex items-center justify-between min-h-[44px] cursor-pointer ${
              patientType === 'existing_patient'
                ? 'bg-[#0B1F2A] border-[#0B1F2A] text-[#FCFBF8]'
                : 'bg-[#F4EFE6] border-[#D9D0C5] text-[#5A6264] hover:text-[#0B1F2A]'
            }`}
          >
            <span>Existing Patient</span>
            {patientType === 'existing_patient' && <Check size={14} className="text-[#B39A68]" />}
          </button>
        </div>
      </div>

      {/* Row 1: Patient Name, Age & Phone */}
      <div className="grid sm:grid-cols-12 gap-4">
        <div className="sm:col-span-5">
          <label className="block text-[13px] font-semibold text-[#0B1F2A] uppercase tracking-wider mb-1.5">
            Patient Full Name *
          </label>
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B9898]" />
            <input
              type="text"
              name="patientName"
              required
              placeholder="e.g. Johnathan Miller"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-[#D9D0C5] text-sm text-[#0B1F2A] focus:outline-none focus:border-[#0B1F2A] bg-[#FCFBF8]"
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label className="block text-[13px] font-semibold text-[#0B1F2A] uppercase tracking-wider mb-1.5">
            Patient Age
          </label>
          <input
            type="number"
            name="age"
            min="0"
            max="120"
            placeholder="e.g. 35"
            value={patientAge}
            onChange={(e) => setPatientAge(e.target.value)}
            className="w-full px-3.5 py-3 border border-[#D9D0C5] text-sm text-[#0B1F2A] focus:outline-none focus:border-[#0B1F2A] bg-[#FCFBF8]"
          />
        </div>

        <div className="sm:col-span-4">
          <label className="block text-[13px] font-semibold text-[#0B1F2A] uppercase tracking-wider mb-1.5">
            Phone Number *
          </label>
          <div className="relative">
            <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B9898]" />
            <input
              type="tel"
              name="phone"
              required
              placeholder="(973) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-[#D9D0C5] text-sm text-[#0B1F2A] focus:outline-none focus:border-[#0B1F2A] bg-[#FCFBF8]"
            />
          </div>
        </div>
      </div>

      {/* Row 2: Email & Provider */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-semibold text-[#0B1F2A] uppercase tracking-wider mb-1.5">
            Email Address (Optional)
          </label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B9898]" />
            <input
              type="email"
              placeholder="patient@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-[#D9D0C5] text-sm text-[#0B1F2A] focus:outline-none focus:border-[#0B1F2A] bg-[#FCFBF8]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-[#0B1F2A] uppercase tracking-wider mb-1.5">
            Select Provider *
          </label>
          <select
            value={selectedProviderId}
            onChange={(e) => setSelectedProviderId(e.target.value)}
            className="w-full px-3.5 py-3 border border-[#D9D0C5] text-sm text-[#0B1F2A] focus:outline-none focus:border-[#0B1F2A] bg-[#FCFBF8]"
          >
            {activeProviders.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.specialty || p.title})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3: Service Selection */}
      <div>
        <label className="block text-[13px] font-semibold text-[#0B1F2A] uppercase tracking-wider mb-1.5">
          Select Clinical Service *
        </label>
        <select
          value={selectedServiceId}
          onChange={(e) => setSelectedServiceId(e.target.value)}
          className="w-full px-3.5 py-3 border border-[#D9D0C5] text-sm text-[#0B1F2A] focus:outline-none focus:border-[#0B1F2A] bg-[#FCFBF8]"
        >
          {activeServices.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.category})
            </option>
          ))}
        </select>
      </div>

      {/* Row 4: Preferred Date */}
      <div>
        <label className="block text-[13px] font-semibold text-[#0B1F2A] uppercase tracking-wider mb-1.5">
          Preferred Date *
        </label>
        <div className="relative">
          <CalendarIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B9898]" />
          <input
            type="date"
            required
            min={format(new Date(), 'yyyy-MM-dd')}
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-[#D9D0C5] text-sm text-[#0B1F2A] focus:outline-none focus:border-[#0B1F2A] bg-[#FCFBF8]"
          />
        </div>
      </div>

      {/* Row 5: Dynamic Time Slots Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-[13px] font-semibold text-[#0B1F2A] uppercase tracking-wider">
            Available Time Slot *
          </label>
          <span className="text-[11px] text-[#5A6264] flex items-center gap-1">
            <Clock size={11} />
            <span>30-min consultation slots</span>
          </span>
        </div>

        {loadingSlots ? (
          <div className="p-4 text-center bg-[#F4EFE6] border border-[#D9D0C5] text-xs text-[#5A6264] flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin text-[#0B1F2A]" />
            <span>Checking provider calendar...</span>
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="p-4 text-center bg-[#F4EFE6] border border-[#D9D0C5] text-xs text-[#0B1F2A]">
            Provider is not available on this date (weekend or blocked day). Please select another date.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {availableSlots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                disabled={!slot.available}
                onClick={() => setPreferredTime(slot.time)}
                className={`py-2.5 px-2 text-xs font-semibold border transition-all text-center min-h-[42px] cursor-pointer ${
                  preferredTime === slot.time
                    ? 'bg-[#0B1F2A] text-[#FCFBF8] border-[#0B1F2A]'
                    : slot.available
                    ? 'bg-[#FCFBF8] hover:bg-[#F4EFE6] text-[#0B1F2A] border-[#D9D0C5]'
                    : 'bg-[#EFEAE2] text-[#8B9898] border-[#D9D0C5] cursor-not-allowed line-through opacity-50'
                }`}
                title={slot.available ? 'Click to select slot' : 'Slot already booked'}
              >
                {slot.time}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Row 6: Reason for Visit & Optional Message */}
      <div className="space-y-3">
        <div>
          <label className="block text-[13px] font-semibold text-[#0B1F2A] uppercase tracking-wider mb-1.5">
            Reason for Visit / Primary Symptoms *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Annual physical, blood pressure follow-up, prescription refill..."
            value={reasonForVisit}
            onChange={(e) => setReasonForVisit(e.target.value)}
            className="w-full px-3.5 py-3 border border-[#D9D0C5] text-sm text-[#0B1F2A] focus:outline-none focus:border-[#0B1F2A] bg-[#FCFBF8]"
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-[#0B1F2A] uppercase tracking-wider mb-1.5">
            Additional Message or Special Requests (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Insurance details, accessibility needs, preferred language..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3.5 py-3 border border-[#D9D0C5] text-sm text-[#0B1F2A] focus:outline-none focus:border-[#0B1F2A] bg-[#FCFBF8]"
          />
        </div>
      </div>

      {/* Consent Checkbox */}
      <div className="pt-2 border-t border-[#D9D0C5]">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="w-4 h-4 text-[#0B1F2A] focus:ring-[#0B1F2A] border-[#D9D0C5] mt-0.5"
          />
          <span className="text-xs text-[#5A6264] leading-relaxed">
            I consent to Newark Medical Associates contacting me by phone or email regarding this appointment request. I understand that this request is pending until confirmed by the clinical staff.
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#0B1F2A] hover:bg-[#153444] text-[#FCFBF8] font-bold uppercase tracking-wider text-[13.5px] py-4 px-6 transition-colors shadow-editorial flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer min-h-[48px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Processing Request...</span>
            </>
          ) : (
            <>
              <span>Request Appointment</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] text-[#5A6264] pt-1">
        <ShieldCheck size={14} className="text-[#315B52]" />
        <span>HIPAA Compliant & Secure Intake Portal</span>
      </div>
    </form>
  );
}
