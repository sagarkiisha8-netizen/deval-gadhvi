import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Mail, MapPin, Phone, CheckCircle2, Calendar, MessageSquare, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getDb } from '../lib/firebase';
import { trackEvent } from '../services/analyticsService';
import AppointmentBookingForm from './AppointmentBookingForm';

export default function Contact() {
  const [activeTab, setActiveTab] = useState<'appointment' | 'inquiry'>('appointment');

  // Inquiry Form State
  const [inquiryData, setInquiryData] = useState({
    fullName: '',
    age: '',
    email: '',
    phone: '',
    service: 'General Inquiry',
    message: ''
  });
  const [honeypot, setHoneypot] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryRefId, setInquiryRefId] = useState('');

  const handleInquiryChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInquiryData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.trim() !== '') return;
    setIsSubmittingInquiry(true);

    try {
      const db = getDb();
      const currentYear = new Date().getFullYear();
      const randomSeq = Math.floor(100000 + Math.random() * 900000);
      const leadId = `LEAD-${currentYear}-${randomSeq}`;

      await setDoc(doc(db, 'leads', leadId), {
        id: leadId,
        name: inquiryData.fullName.trim(),
        age: inquiryData.age.trim() || undefined,
        email: inquiryData.email.trim(),
        phone: inquiryData.phone.trim(),
        service: inquiryData.service,
        message: inquiryData.message.trim(),
        source: 'Homepage Inquiry Form',
        sourcePage: '/',
        status: 'new',
        internalNotes: `Received via homepage general contact form.${inquiryData.age.trim() ? ` Patient Age: ${inquiryData.age.trim()}.` : ''}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await trackEvent({
        eventName: 'lead_submitted',
        category: 'conversion',
        label: 'Homepage lead form submitted',
        metadata: { service: inquiryData.service }
      });

      setInquiryRefId(leadId);
      setInquirySuccess(true);
      setInquiryData({ fullName: '', age: '', email: '', phone: '', service: 'General Inquiry', message: '' });
    } catch (error) {
      console.error('Error submitting lead:', error);
      const leadId = `LEAD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      setInquiryRefId(leadId);
      setInquirySuccess(true);
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Top Indicator */}
        <div className="flex justify-center items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
          <span className="text-slate-800 text-sm font-medium">Contact & Appointments</span>
        </div>

        {/* Main Heading */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.15]"
          >
            Your connection to better <br className="hidden sm:inline" />
            care starts here
          </motion.h2>
        </div>

        {/* Action Button Below Heading */}
        <div className="flex justify-center mb-10">
          <Link
            to="/services"
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-7 py-2.5 rounded-full shadow-sm hover:shadow transition-all"
          >
            What we do
          </Link>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('appointment')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'appointment'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar size={14} />
              <span>Book Appointment</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('inquiry')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'inquiry'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare size={14} />
              <span>General Inquiry</span>
            </button>
          </div>
        </div>

        {activeTab === 'appointment' ? (
          <div className="max-w-4xl mx-auto">
            <AppointmentBookingForm />
          </div>
        ) : (
          /* Split Card for General Inquiries */
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="max-w-5xl mx-auto bg-white rounded-3xl sm:rounded-[32px] border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="grid md:grid-cols-12 min-h-[480px]">
              {/* Left Side: Contact Form */}
              <div className="md:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
                {inquirySuccess ? (
                  <div className="py-12 text-center my-auto">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Received!</h3>
                    <p className="text-slate-600 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                      Thank you for reaching out. Our Newark clinical team will get back to you shortly.
                    </p>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 inline-block mb-6">
                      <span className="text-xs text-slate-500 block mb-1">Inquiry Reference ID</span>
                      <span className="font-mono text-lg font-bold text-slate-900">{inquiryRefId}</span>
                    </div>
                    <div>
                      <button
                        onClick={() => setInquirySuccess(false)}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline"
                      >
                        Send another message
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-6">
                    <input
                      type="text"
                      name="site_security_check"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    {/* Row 1: Full Name, Patient Age & Email Address */}
                    <div className="grid sm:grid-cols-12 gap-6">
                      <div className="sm:col-span-5">
                        <label className="block text-sm font-semibold text-slate-800 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={inquiryData.fullName}
                          onChange={handleInquiryChange}
                          placeholder="John Carter"
                          className="w-full border-b border-slate-300 focus:border-blue-600 py-2.5 text-slate-800 placeholder-slate-400 text-sm focus:outline-none bg-transparent transition-colors"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-sm font-semibold text-slate-800 mb-2">
                          Patient Age
                        </label>
                        <input
                          type="number"
                          name="age"
                          min="0"
                          max="120"
                          value={inquiryData.age}
                          onChange={handleInquiryChange}
                          placeholder="e.g. 35"
                          className="w-full border-b border-slate-300 focus:border-blue-600 py-2.5 text-slate-800 placeholder-slate-400 text-sm focus:outline-none bg-transparent transition-colors"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-sm font-semibold text-slate-800 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={inquiryData.email}
                          onChange={handleInquiryChange}
                          placeholder="yourname@gmail.com"
                          className="w-full border-b border-slate-300 focus:border-blue-600 py-2.5 text-slate-800 placeholder-slate-400 text-sm focus:outline-none bg-transparent transition-colors"
                        />
                      </div>
                    </div>

                    {/* Row 2: Phone Number & Service */}
                    <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={inquiryData.phone}
                          onChange={handleInquiryChange}
                          placeholder="(973) 412-9404"
                          className="w-full border-b border-slate-300 focus:border-blue-600 py-2.5 text-slate-800 placeholder-slate-400 text-sm focus:outline-none bg-transparent transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">
                          Service Topic
                        </label>
                        <select
                          name="service"
                          value={inquiryData.service}
                          onChange={handleInquiryChange}
                          className="w-full border-b border-slate-300 focus:border-blue-600 py-2.5 text-slate-800 text-sm focus:outline-none bg-transparent transition-colors"
                        >
                          <option value="General Inquiry">General Inquiry</option>
                          <option value="Primary Care">Primary Care</option>
                          <option value="Cardiology">Cardiology Diagnostics</option>
                          <option value="Insurance / Billing">Insurance & Billing</option>
                          <option value="Medical Records">Medical Records</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 3: Message */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">
                        Message *
                      </label>
                      <textarea
                        rows={3}
                        name="message"
                        required
                        value={inquiryData.message}
                        onChange={handleInquiryChange}
                        placeholder="How can our clinical team assist you?"
                        className="w-full border-b border-slate-300 focus:border-blue-600 py-2.5 text-slate-800 placeholder-slate-400 text-sm focus:outline-none bg-transparent transition-colors resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmittingInquiry}
                        className="bg-[#8cbcfc] hover:bg-blue-600 text-white font-semibold text-sm px-10 py-3 rounded-full transition-all duration-200 shadow-xs hover:shadow cursor-pointer disabled:opacity-60"
                      >
                        {isSubmittingInquiry ? 'Sending Inquiry...' : 'Submit Message'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Right Side: Blue Solid Info Panel */}
              <div className="md:col-span-5 bg-blue-600 text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between rounded-b-3xl md:rounded-b-none md:rounded-r-3xl">
                <div>
                  <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
                    Reach out directly
                  </h3>
                  <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                    We're here to answer your questions and support your healthcare journey.
                  </p>

                  {/* Divider Line */}
                  <div className="border-t border-white/25 my-8 w-full" />

                  {/* Direct Contact Items */}
                  <div className="space-y-6">
                    {/* Phone */}
                    <div className="flex items-center gap-4">
                      <Phone size={20} className="shrink-0 text-white" />
                      <a
                        href="tel:+19734129404"
                        className="text-white font-medium text-sm sm:text-base hover:underline transition-all"
                      >
                        (973) 412-9404
                      </a>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-4">
                      <Mail size={20} className="shrink-0 text-white" />
                      <a
                        href="mailto:medicalnewark@gmail.com"
                        className="text-white font-medium text-sm sm:text-base hover:underline transition-all"
                      >
                        medicalnewark@gmail.com
                      </a>
                    </div>

                    {/* Location Address */}
                    <div className="flex items-start gap-4">
                      <MapPin size={20} className="shrink-0 text-white mt-0.5" />
                      <span className="text-white font-medium text-sm sm:text-base leading-snug">
                        337 Bloomfield Avenue, Newark, NJ 07107
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Subtle Assurance */}
                <div className="pt-8 text-xs text-white/75">
                  Newark Medical Associates • Comprehensive Care
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
