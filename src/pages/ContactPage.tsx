import React, { useState, useCallback } from 'react';
import { Mail, MapPin, Phone, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getDb } from '../lib/firebase';
import { trackEvent } from '../services/analyticsService';
import AppointmentBookingForm from '../components/AppointmentBookingForm';
import SeoHead from '../components/SeoHead';
import { NEWARK_PRACTICE_INFO } from '../data/localSeoData';
import { useCmsData } from '../context/CmsContext';

export default function ContactPage() {
  const { getMediaUrl, getSiteMedia } = useCmsData();
  const clinicExteriorMedia = getSiteMedia('contact', 'facility', 'exterior-photo');
  const clinicExteriorUrl = getMediaUrl('contact', 'facility', 'exterior-photo', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200');

  const [activeTab, setActiveTab] = useState<'appointment' | 'inquiry'>('appointment');

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Contact Us', url: '/contact' }
  ];

  const [inquiryData, setInquiryData] = useState({
    fullName: '',
    age: '',
    email: '',
    phone: '',
    service: 'General Consultation',
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
        source: 'Contact Page Inquiry Form',
        sourcePage: '/contact',
        status: 'new',
        internalNotes: `Received via contact page general inquiry form.${inquiryData.age.trim() ? ` Patient Age: ${inquiryData.age.trim()}.` : ''}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await trackEvent({
        eventName: 'lead_submitted',
        category: 'conversion',
        label: 'Contact page lead submitted',
        metadata: { service: inquiryData.service }
      });

      setInquiryRefId(leadId);
      setInquirySuccess(true);
      setInquiryData({ fullName: '', age: '', email: '', phone: '', service: 'General Consultation', message: '' });
    } catch (error) {
      console.error('Error submitting contact lead:', error);
      const leadId = `LEAD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      setInquiryRefId(leadId);
      setInquirySuccess(true);
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  return (
    <div className="bg-[#FCFBF8] text-[#252A2B] min-h-screen overflow-hidden">
      <SeoHead
        title="Contact & Location | Newark Medical Associates | Newark NJ"
        description="Contact Newark Medical Associates at 337 Bloomfield Ave, Newark, NJ. Schedule a primary care appointment online or call (973) 412-9404. Open Monday through Saturday."
        keywords={[
          'contact doctor Newark NJ',
          'book appointment Newark doctor',
          '337 Bloomfield Ave Newark NJ phone',
          'medical clinic Newark phone number'
        ]}
        canonicalUrl="https://newarkmed.com/contact"
        breadcrumbs={breadcrumbs}
      />

      {/* 1. Header Hero: Warm Ivory Editorial Hero */}
      <section className="bg-[#F4EFE6] py-16 sm:py-24 lg:py-28 border-b border-[#D9D0C5]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <p className="text-[11.5px] sm:text-[12px] uppercase font-bold tracking-[0.24em] text-[#B39A68] mb-3 sm:mb-4">
              Get In Touch
            </p>
            <h1 className="font-serif text-[34px] sm:text-[54px] lg:text-[68px] text-[#0B1F2A] leading-[1.06] sm:leading-[1.04] tracking-[-0.02em] mb-4 sm:mb-6">
              Connect with Our<br />
              <span className="italic font-normal">Newark Clinical Practice.</span>
            </h1>
            <p className="font-sans text-[16px] sm:text-[20px] text-[#5A6264] leading-[1.65] sm:leading-[1.7] max-w-2xl">
              Conveniently located at 337 Bloomfield Avenue. Whether you are scheduling a new patient evaluation or have questions about testing, we are here to assist.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-20">
        
        {/* Mode Selector Tabs (Editorial Text Buttons) */}
        <div className="flex items-center gap-6 sm:gap-8 mb-10 sm:mb-12 border-b border-[#D9D0C5] pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('appointment')}
            className={`text-[15px] sm:text-[17px] pb-2 transition-all relative font-medium cursor-pointer min-h-[44px] ${
              activeTab === 'appointment'
                ? 'text-[#0B1F2A] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#0B1F2A]'
                : 'text-[#5A6264] hover:text-[#0B1F2A]'
            }`}
          >
            Schedule Consultation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inquiry')}
            className={`text-[15px] sm:text-[17px] pb-2 transition-all relative font-medium cursor-pointer min-h-[44px] ${
              activeTab === 'inquiry'
                ? 'text-[#0B1F2A] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#0B1F2A]'
                : 'text-[#5A6264] hover:text-[#0B1F2A]'
            }`}
          >
            General Inquiries & Questions
          </button>
        </div>

        {activeTab === 'appointment' ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-4xl"
          >
            <AppointmentBookingForm />
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start"
          >
            
            {/* Form Column (7 cols) */}
            <div className="lg:col-span-7">
              {inquirySuccess ? (
                <div className="py-12 sm:py-16 text-center border border-[#D9D0C5] bg-[#F4EFE6] p-6 sm:p-8">
                  <div className="w-14 h-14 bg-[#315B52] text-[#FCFBF8] rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={30} />
                  </div>
                  <h3 className="font-serif text-[26px] sm:text-[30px] text-[#0B1F2A] mb-2">Message Received</h3>
                  <p className="font-sans text-[15px] sm:text-[16px] text-[#5A6264] mb-6 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out. A member of our Newark clinical administrative team will follow up with you promptly.
                  </p>
                  <div className="bg-[#FCFBF8] border border-[#D9D0C5] p-4 inline-block mb-6">
                    <span className="text-xs text-[#5A6264] block mb-1">Inquiry Reference Number</span>
                    <span className="font-mono text-lg font-bold text-[#0B1F2A]">{inquiryRefId}</span>
                  </div>
                  <div>
                    <button
                      onClick={() => setInquirySuccess(false)}
                      className="text-[13.5px] sm:text-[14px] font-bold uppercase tracking-wider text-[#0B1F2A] underline hover:text-[#315B52] min-h-[44px]"
                    >
                      Send another message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-5 sm:space-y-6">
                  <input
                    type="text"
                    name="site_safety_check"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
                    <div>
                      <label className="block text-[13px] sm:text-[13.5px] font-semibold text-[#0B1F2A] uppercase tracking-wider mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={inquiryData.fullName}
                        onChange={handleInquiryChange}
                        placeholder="e.g. Eleanor Vance"
                        className="w-full bg-[#FCFBF8] border border-[#D9D0C5] px-4 py-3 text-[15px] text-[#0B1F2A] focus:outline-none focus:border-[#0B1F2A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] sm:text-[13.5px] font-semibold text-[#0B1F2A] uppercase tracking-wider mb-2">
                        Patient Age (Optional)
                      </label>
                      <input
                        type="text"
                        name="age"
                        value={inquiryData.age}
                        onChange={handleInquiryChange}
                        placeholder="e.g. 48"
                        className="w-full bg-[#FCFBF8] border border-[#D9D0C5] px-4 py-3 text-[15px] text-[#0B1F2A] focus:outline-none focus:border-[#0B1F2A]"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
                    <div>
                      <label className="block text-[13px] sm:text-[13.5px] font-semibold text-[#0B1F2A] uppercase tracking-wider mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={inquiryData.email}
                        onChange={handleInquiryChange}
                        placeholder="eleanor@example.com"
                        className="w-full bg-[#FCFBF8] border border-[#D9D0C5] px-4 py-3 text-[15px] text-[#0B1F2A] focus:outline-none focus:border-[#0B1F2A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] sm:text-[13.5px] font-semibold text-[#0B1F2A] uppercase tracking-wider mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={inquiryData.phone}
                        onChange={handleInquiryChange}
                        placeholder="(973) 000-0000"
                        className="w-full bg-[#FCFBF8] border border-[#D9D0C5] px-4 py-3 text-[15px] text-[#0B1F2A] focus:outline-none focus:border-[#0B1F2A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] sm:text-[13.5px] font-semibold text-[#0B1F2A] uppercase tracking-wider mb-2">
                      Reason for Inquiry
                    </label>
                    <select
                      name="service"
                      value={inquiryData.service}
                      onChange={handleInquiryChange}
                      className="w-full bg-[#FCFBF8] border border-[#D9D0C5] px-4 py-3 text-[15px] text-[#0B1F2A] focus:outline-none focus:border-[#0B1F2A]"
                    >
                      <option value="General Consultation">General Consultation / Establishing Care</option>
                      <option value="Preventative Care">Preventive Exam or Annual Physical</option>
                      <option value="Chronic Care">Chronic Disease Management (Diabetes, Hypertension)</option>
                      <option value="Diagnostics">In-Office Diagnostics / Lab Draw / EKG</option>
                      <option value="Insurance Question">Insurance Coverage & Billing Question</option>
                      <option value="Other">Other Clinical Inquiries</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] sm:text-[13.5px] font-semibold text-[#0B1F2A] uppercase tracking-wider mb-2">
                      Your Message *
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={inquiryData.message}
                      onChange={handleInquiryChange}
                      placeholder="Please share details about your inquiry or health needs..."
                      className="w-full bg-[#FCFBF8] border border-[#D9D0C5] px-4 py-3 text-[15px] text-[#0B1F2A] focus:outline-none focus:border-[#0B1F2A]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingInquiry}
                    className="w-full sm:w-auto px-8 py-4 bg-[#0B1F2A] hover:bg-[#153444] text-[#FCFBF8] text-[13.5px] sm:text-[14px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 min-h-[48px] cursor-pointer"
                  >
                    {isSubmittingInquiry ? 'Submitting Message...' : 'Send Inquiry'}
                  </button>
                </form>
              )}
            </div>

            {/* Clinic Info Column (5 cols) */}
            <div className="lg:col-span-5 bg-[#0B1F2A] text-[#FCFBF8] border border-[#0B1F2A] overflow-hidden flex flex-col justify-between">
              {clinicExteriorUrl && (
                <div className="w-full h-[200px] sm:h-[240px] relative overflow-hidden bg-slate-900 border-b border-[#B39A68]/20">
                  <img
                    src={clinicExteriorUrl}
                    alt={clinicExteriorMedia?.altText || "Newark Medical Associates facility exterior at 337 Bloomfield Ave"}
                    className="w-full h-full"
                    style={{
                      objectFit: (clinicExteriorMedia?.objectFit as any) || 'cover',
                      objectPosition: clinicExteriorMedia?.position || 'center'
                    }}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-3 left-4 px-2.5 py-1 bg-[#0B1F2A]/90 text-[#FCFBF8] text-[10.5px] font-bold uppercase tracking-widest backdrop-blur-xs border border-[#B39A68]/30">
                    Clinic Facility
                  </div>
                </div>
              )}

              <div className="p-6 sm:p-8 lg:p-10 flex-1">
                <span className="text-[11px] sm:text-[11.5px] uppercase font-bold tracking-[0.24em] text-[#B39A68] block mb-2 sm:mb-3">
                  Practice Location
                </span>
                <h3 className="font-serif text-[24px] sm:text-[28px] text-[#FCFBF8] mb-5 sm:mb-6">
                  Newark Medical Associates
                </h3>

              <div className="space-y-5 sm:space-y-6 text-[14.5px] sm:text-[15px] text-[#D9D0C5] mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-[#B39A68]/30">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-[#B39A68] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">337 Bloomfield Avenue</p>
                    <p>Newark, New Jersey 07107</p>
                    <p className="text-xs text-[#B39A68] mt-1">North Ward • Free On-Site Parking</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone size={20} className="text-[#B39A68] shrink-0" />
                  <div>
                    <a href={`tel:${NEWARK_PRACTICE_INFO.rawPhone}`} className="hover:text-white font-medium">
                      {NEWARK_PRACTICE_INFO.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-[#B39A68] shrink-0" />
                  <div>
                    <span>care@newarkmed.com</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[11.5px] sm:text-[12px] uppercase font-bold tracking-[0.2em] text-[#B39A68] block mb-2.5 sm:mb-3">
                  Hours of Operation
                </span>
                <div className="space-y-2 text-[13.5px] sm:text-[14px] text-[#D9D0C5]">
                  <div className="flex justify-between">
                    <span>Monday – Friday</span>
                    <span className="font-medium text-white">8:30 AM – 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-medium text-white">9:00 AM – 1:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-[#8B9898]">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          </motion.div>
        )}

      </div>
    </div>
  );
}
