import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, ArrowRight, Phone, Calendar, MapPin, 
  Clock, ShieldCheck, ChevronDown, ChevronUp, Stethoscope, 
  Activity, HeartPulse, AlertTriangle, HelpCircle, Share2, Check 
} from 'lucide-react';
import SeoHead from '../components/SeoHead';
import { DEFAULT_CONDITIONS, ConditionItem } from '../data/conditionsData';
import { NEWARK_PRACTICE_INFO } from '../data/localSeoData';
import { getDb } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useCmsData } from '../context/CmsContext';
import AppointmentBookingForm from '../components/AppointmentBookingForm';

export default function ConditionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { providers, getMediaUrl, getSiteMedia } = useCmsData();
  const [conditions, setConditions] = useState<ConditionItem[]>(DEFAULT_CONDITIONS);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    try {
      const db = getDb();
      const unsub = onSnapshot(collection(db, 'conditions'), (snap) => {
        if (!snap.empty) {
          const list: ConditionItem[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() as any }));
          setConditions(list);
        }
      }, (err) => console.warn('Conditions listener offline:', err));
      return () => unsub();
    } catch {
      // offline fallback
    }
  }, []);

  const condition = useMemo(() => {
    if (!slug) return null;
    const cleanSlug = slug.toLowerCase().replace(/^\/+/g, '');
    return conditions.find(c => 
      c.slug.toLowerCase().replace(/^\/+/g, '') === cleanSlug || 
      c.id.toLowerCase() === cleanSlug
    ) || DEFAULT_CONDITIONS.find(c => 
      c.slug.toLowerCase().replace(/^\/+/g, '') === cleanSlug || 
      c.id.toLowerCase() === cleanSlug
    ) || null;
  }, [slug, conditions]);

  if (!condition) {
    return <Navigate to="/conditions" replace />;
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Conditions', url: '/conditions' },
    { name: condition.name, url: `/conditions/${condition.slug}` }
  ];

  const medicalConditionSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    name: condition.name,
    description: condition.overview,
    signOrSymptom: condition.symptoms.map(s => ({ '@type': 'MedicalSignOrSymptom', name: s })),
    possibleTreatment: condition.treatmentOptions.map(t => ({ '@type': 'MedicalTherapy', name: t })),
    secondaryPrevention: condition.prevention.map(p => ({ '@type': 'LifestyleModification', name: p }))
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <SeoHead
        title={condition.seoTitle || `${condition.name} Treatment Newark NJ | Newark Medical Associates`}
        description={condition.metaDescription || condition.overview.slice(0, 155)}
        canonicalUrl={`https://newarkmed.com/conditions/${condition.slug}`}
        breadcrumbs={breadcrumbs}
        faqs={condition.faqs}
        schema={medicalConditionSchema}
      />

      {/* Breadcrumbs Bar */}
      <div className="bg-white border-b border-slate-200 pt-24 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <nav className="flex items-center gap-2" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/conditions" className="hover:text-primary-600 transition-colors">Conditions</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-none">{condition.name}</span>
          </nav>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-xs"
          >
            {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Share2 size={13} />}
            <span>{copiedLink ? 'Link Copied' : 'Share Article'}</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 pt-8 pb-14 lg:pb-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold mb-4 border border-primary-100">
                <ShieldCheck size={14} className="text-primary-600" />
                <span>Evidence-Based Internal Medicine • Newark, NJ</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                {condition.name}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
                {condition.overview}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-md shadow-primary-600/20 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <Calendar size={16} />
                  <span>{condition.ctaText || 'Schedule an Evaluation'}</span>
                </button>

                <a
                  href={`tel:${NEWARK_PRACTICE_INFO.rawPhone}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  <Phone size={16} className="text-emerald-600" />
                  <span>Call {NEWARK_PRACTICE_INFO.phone}</span>
                </a>
              </div>
            </div>

            {/* Right Photo */}
            <div className="lg:col-span-5">
              {(() => {
                const condMedia = getSiteMedia('conditions', condition.slug, 'featured-image') || 
                  getSiteMedia('conditions', condition.id, 'featured-image');
                const condImg = getMediaUrl('conditions', condition.slug, 'featured-image') || 
                  getMediaUrl('conditions', condition.id, 'featured-image') || 
                  condition.featuredImage || 
                  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800';
                return (
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-slate-100 relative">
                    <img
                      src={condImg}
                      alt={condMedia?.altText || condition.name}
                      className="w-full h-full"
                      style={{
                        objectFit: (condMedia?.objectFit as any) || 'cover',
                        objectPosition: condMedia?.position || 'center'
                      }}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs p-3 rounded-2xl border border-white/60 text-xs">
                      <span className="font-bold text-slate-900 block">Board-Certified Evaluation</span>
                      <span className="text-slate-500">Newark Medical Associates • 337 Bloomfield Ave</span>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      </section>

      {/* Main Clinical Details */}
      <section className="py-14 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Left Main Article Column */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Symptoms Card */}
            <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Symptoms & Clinical Warning Signs</h2>
                  <p className="text-xs text-slate-500">Common indicators that require physician evaluation</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                {condition.symptoms.map((symptom, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-medium text-slate-700">{symptom}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Causes & Risk Factors */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-primary-600" />
                  <span>Causes & Pathophysiology</span>
                </h3>
                <ul className="space-y-2.5">
                  {condition.causes.map((cause, i) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-600 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <HeartPulse size={18} className="text-indigo-600" />
                  <span>Key Risk Factors</span>
                </h3>
                <ul className="space-y-2.5">
                  {condition.riskFactors.map((rf, i) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-600 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                      <span>{rf}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Diagnosis & Testing Card */}
            <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <Stethoscope size={20} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Diagnosis & In-Clinic Testing</h2>
                  <p className="text-xs text-slate-500">Performed on-site at our Newark clinical facility</p>
                </div>
              </div>

              <div className="space-y-3">
                {condition.diagnosis.map((diag, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-primary-50/40 border border-primary-100/60">
                    <span className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-slate-800">{diag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Treatment & Management */}
            <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/80 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Evidence-Based Treatment Plans</h2>
              <p className="text-xs text-slate-500 mb-6">Tailored medical protocols for your long-term health</p>

              <div className="grid sm:grid-cols-2 gap-4">
                {condition.treatmentOptions.map((treat, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-700 font-medium">{treat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs Accordion */}
            {condition.faqs && condition.faqs.length > 0 && (
              <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <HelpCircle size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
                    <p className="text-xs text-slate-500">Expert medical insights from our clinical team</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {condition.faqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:bg-slate-50 transition-colors"
                        >
                          <span>{faq.question}</span>
                          {isOpen ? <ChevronUp size={18} className="text-slate-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50 pt-3"
                            >
                              {faq.answer}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Right Sticky Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Direct Booking Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-primary-200 shadow-lg sticky top-28">
              <span className="text-[11px] font-bold text-primary-600 uppercase tracking-wider block mb-2">
                Newark Clinical Appointment
              </span>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Book a Consultation for {condition.name}
              </h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Meet with our board-certified physicians for an unhurried, thorough examination and complete on-site diagnostic review.
              </p>

              <div className="space-y-3 mb-6 text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>Same-week and same-day availability</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>On-site lab draws, EKG & ultrasound</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>Most commercial insurances & Medicare accepted</span>
                </div>
              </div>

              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-full text-sm font-semibold shadow-md shadow-primary-600/25 transition-all mb-3 cursor-pointer"
              >
                Book Appointment Online
              </button>

              <a
                href={`tel:${NEWARK_PRACTICE_INFO.rawPhone}`}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-full text-sm font-semibold transition-colors"
              >
                <Phone size={15} />
                <span>Call {NEWARK_PRACTICE_INFO.phone}</span>
              </a>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-400">
                  Located at {NEWARK_PRACTICE_INFO.address.streetAddress}, Newark, NJ
                </p>
              </div>
            </div>

            {/* Related Services */}
            {condition.relatedServices && condition.relatedServices.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                  Related Clinical Services
                </h4>
                <div className="space-y-2">
                  {condition.relatedServices.map((srv, idx) => (
                    <Link
                      key={idx}
                      to="/services"
                      className="block p-3 rounded-xl bg-slate-50 hover:bg-primary-50 text-xs font-semibold text-slate-700 hover:text-primary-700 border border-slate-100 transition-colors"
                    >
                      {srv}
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full my-8 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">
                Book Consultation for {condition.name}
              </h3>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>
            <AppointmentBookingForm />
          </div>
        </div>
      )}
    </div>
  );
}
