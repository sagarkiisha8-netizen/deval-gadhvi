import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Phone, Clock, Mail, Navigation, Car, Bus, 
  CheckCircle2, Calendar, ShieldCheck, HeartPulse, 
  Stethoscope, Users, HelpCircle, ChevronDown, ChevronUp,
  ArrowRight, ExternalLink, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { NEWARK_PRACTICE_INFO, LOCAL_SERVICES_DATA } from '../data/localSeoData';
import { useCmsData } from '../context/CmsContext';
import AppointmentBookingForm from '../components/AppointmentBookingForm';

export default function NewarkLocationPage() {
  const { providers, getMediaUrl } = useCmsData();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const localFaqs = [
    {
      question: 'Where is Newark Medical Associates located in Newark?',
      answer: 'Our clinic is located at 337 Bloomfield Avenue, Newark, NJ 07107, in the North Ward near the historic Forest Hill district and Branch Brook Park.'
    },
    {
      question: 'Is parking available for patients at your Newark clinic?',
      answer: 'Yes! We offer dedicated on-site patient parking right outside our entrance, as well as ample metered and street parking along Bloomfield Avenue.'
    },
    {
      question: 'How do I reach the clinic via public transportation?',
      answer: 'NJ Transit Bus lines #11, #28, and #29 stop right along Bloomfield Avenue within a few steps of our front door. We are also easily accessible via the Newark Light Rail (Branch Brook Park / Park Ave stations) and Newark Broad Street Station.'
    },
    {
      question: 'Do your physicians speak Spanish or other languages?',
      answer: 'Yes! Our physicians and clinical care coordinators are fluent in English, Spanish (Español), Hindi, and Gujarati, ensuring clear communication and comfortable care for all patients.'
    },
    {
      question: 'Can I get my blood work and diagnostic testing done at this Newark location?',
      answer: 'Yes. We have a full in-office diagnostic testing suite offering phlebotomy lab blood draws, 12-lead EKGs, echocardiograms, and vascular ultrasound sonograms on-site.'
    },
    {
      question: 'Do you accept walk-ins or same-day appointments in Newark?',
      answer: 'Yes, we accommodate same-day sick visits and walk-in patients for acute health needs. For routine physicals and comprehensive checkups, scheduling in advance is recommended.'
    }
  ];

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Locations', url: '/locations' },
    { name: 'Newark, NJ', url: '/locations/newark-nj' }
  ];

  // Specific MedicalClinic LocalBusiness Schema
  const clinicLocalSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    '@id': 'https://newarkmed.com/locations/newark-nj#location',
    name: NEWARK_PRACTICE_INFO.name,
    legalName: NEWARK_PRACTICE_INFO.legalName,
    url: 'https://newarkmed.com/locations/newark-nj',
    telephone: NEWARK_PRACTICE_INFO.rawPhone,
    email: NEWARK_PRACTICE_INFO.email,
    image: getMediaUrl('contact', 'facility', 'exterior-photo') || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=1200',
    address: {
      '@type': 'PostalAddress',
      streetAddress: NEWARK_PRACTICE_INFO.address.streetAddress,
      addressLocality: NEWARK_PRACTICE_INFO.address.addressLocality,
      addressRegion: NEWARK_PRACTICE_INFO.address.addressRegion,
      postalCode: NEWARK_PRACTICE_INFO.address.postalCode,
      addressCountry: 'US'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: NEWARK_PRACTICE_INFO.geo.latitude,
      longitude: NEWARK_PRACTICE_INFO.geo.longitude
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:30',
        closes: '18:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '14:00'
      }
    ],
    areaServed: NEWARK_PRACTICE_INFO.neighborhoodsServed.map(n => ({
      '@type': 'AdministrativeArea',
      name: `${n}, NJ`
    })),
    hasMap: NEWARK_PRACTICE_INFO.googleMapsDirectionsUrl,
    isAcceptingNewPatients: true,
    priceRange: '$$'
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* SEO Head & Schema */}
      <SeoHead
        title="Primary Care Doctor & Medical Clinic Newark NJ | Newark Medical Associates"
        description="Visit Newark Medical Associates at 337 Bloomfield Ave, Newark, NJ 07107. Board-certified primary care physicians, on-site diagnostics, EKG, lab blood draws, and walk-ins welcome."
        keywords={[
          'medical clinic Newark NJ',
          'doctor in Newark NJ',
          'primary care doctor Newark NJ',
          'physician Newark NJ 07107',
          '337 Bloomfield Ave Newark',
          'Bloomfield Avenue doctor Newark',
          'North Ward Newark medical clinic'
        ]}
        canonicalUrl="https://newarkmed.com/locations/newark-nj"
        breadcrumbs={breadcrumbs}
        faqs={localFaqs}
        schema={clinicLocalSchema}
      />

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200 pt-28 pb-4">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/contact" className="hover:text-primary-600 transition-colors">Locations</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Newark, NJ (Bloomfield Ave)</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-12 md:py-18">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold uppercase tracking-wider mb-5">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>Serving Newark & Essex County for 15+ Years</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15] mb-6">
                Compassionate Medical Care & Primary Care in Newark, NJ
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
                Welcome to Newark Medical Associates, your community healthcare home at <strong>337 Bloomfield Avenue</strong>. We offer board-certified primary care physicians, on-site diagnostics, and a welcoming bilingual environment for patients across Newark and surrounding Essex County neighborhoods.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-7 py-3.5 rounded-full text-base font-semibold hover:bg-primary-700 shadow-md shadow-primary-600/20 transition-all hover:scale-105"
                >
                  <Calendar size={18} />
                  <span>Book Newark Appointment</span>
                </button>

                <a
                  href={`tel:${NEWARK_PRACTICE_INFO.rawPhone}`}
                  className="inline-flex items-center justify-center gap-2 bg-white text-slate-800 border border-slate-300 px-7 py-3.5 rounded-full text-base font-semibold hover:bg-slate-50 transition-all shadow-xs"
                >
                  <Phone size={18} className="text-primary-600" />
                  <span>Call (973) 412-9404</span>
                </a>
              </div>

              {/* Quick Trust Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary-500 shrink-0" />
                  <span className="font-medium">On-Site Parking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary-500 shrink-0" />
                  <span className="font-medium">Walk-Ins Welcome</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary-500 shrink-0" />
                  <span className="font-medium">In-Office Lab & EKG</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary-500 shrink-0" />
                  <span className="font-medium">Bilingual Staff</span>
                </div>
              </div>
            </div>

            {/* Right: Quick NAP Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900 text-white rounded-3xl p-7 md:p-8 shadow-xl border border-slate-800">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
                  <span>Clinic Contact & Hours</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                    Open Mon – Sat
                  </span>
                </h3>

                <div className="space-y-4 text-sm text-slate-300 mb-8">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-primary-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Address</p>
                      <p className="text-xs text-slate-300">{NEWARK_PRACTICE_INFO.formattedAddress}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Essex County • North Ward</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-primary-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Telephone</p>
                      <a href="tel:+19734129404" className="text-xs text-primary-400 hover:underline font-medium">(973) 412-9404</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-primary-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Email</p>
                      <a href="mailto:medicalnewark@gmail.com" className="text-xs text-slate-300 hover:underline">medicalnewark@gmail.com</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-primary-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Office Hours</p>
                      <p className="text-xs text-slate-300">Monday – Friday: 8:30 AM – 6:00 PM</p>
                      <p className="text-xs text-slate-300">Saturday: 9:00 AM – 2:00 PM</p>
                      <p className="text-xs text-slate-400">Sunday: Closed (On-Call Emergencies)</p>
                    </div>
                  </div>
                </div>

                <a
                  href={NEWARK_PRACTICE_INFO.googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all text-xs"
                >
                  <Navigation size={14} />
                  <span>Open in Google Maps</span>
                  <ExternalLink size={12} className="opacity-70" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Map & Directions Section */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-6 md:px-12">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/80 shadow-xs mb-14">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
              Location & Interactive Map
            </h2>
            <p className="text-sm text-slate-600">
              Conveniently positioned on the major Bloomfield Avenue corridor in Newark, easily reachable by car, bus, and light rail.
            </p>
          </div>

          {/* Embedded Google Map */}
          <div className="w-full h-88 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-inner mb-10">
            <iframe
              src={NEWARK_PRACTICE_INFO.googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Newark Medical Associates Google Map"
            />
          </div>

          {/* Transportation & Directions Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Driving & Parking */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-3 mb-4 text-primary-700 font-bold">
                <Car size={20} />
                <h3 className="text-base text-slate-900">Driving & Parking Information</h3>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0 mt-2" />
                  <span><strong>From Route 21 / McCarter Highway:</strong> Take the exit toward Bloomfield Ave / Mount Pleasant Ave, continue west on Bloomfield Ave for 1.2 miles.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0 mt-2" />
                  <span><strong>From Garden State Parkway:</strong> Take Exit 148 toward Bloomfield, follow Bloomfield Ave south toward Newark.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0 mt-2" />
                  <span><strong>Dedicated Patient Parking:</strong> On-site parking spaces are available directly adjacent to the clinic, plus meter-free street parking.</span>
                </li>
              </ul>
            </div>

            {/* Public Transportation */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-3 mb-4 text-teal-700 font-bold">
                <Bus size={20} />
                <h3 className="text-base text-slate-900">Public Transit & Bus Connections</h3>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-2" />
                  <span><strong>NJ Transit Bus Lines #11, #28, #29:</strong> All run along Bloomfield Avenue with convenient bus stops within steps of our building.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-2" />
                  <span><strong>Newark Light Rail:</strong> Connect via Branch Brook Park or Park Avenue station with a short bus transfer or quick walk.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-2" />
                  <span><strong>Newark Broad Street Station:</strong> 5-minute rideshare or bus ride connecting to NJ Transit commuter rail trains to NYC and Morris/Essex lines.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Newark Neighborhoods Served */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/80 shadow-xs mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
            Serving Patients Across Newark & Essex County
          </h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            We are proud to be the trusted primary care provider for residents throughout all five wards of Newark and adjacent Essex County municipalities:
          </p>

          <div className="flex flex-wrap gap-2.5">
            {NEWARK_PRACTICE_INFO.neighborhoodsServed.map((nh, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold"
              >
                {nh}
              </span>
            ))}
          </div>
        </div>

        {/* Board-Certified Physicians at This Location */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/80 shadow-xs mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Our Newark Medical Team
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Experienced, board-certified physicians dedicated to your ongoing health.
              </p>
            </div>
            <Link
              to="/providers"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700"
            >
              <span>View All Provider Bios</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <img
                      src={getMediaUrl('providers', doc.id, 'portrait') || getMediaUrl('providers', doc.slug, 'portrait') || doc.photoUrl || doc.imageUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'}
                      alt={doc.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-white shadow-xs"
                    />
                    <div>
                      <Link to={`/providers/${doc.slug}`} className="font-bold text-slate-900 hover:text-primary-600 text-sm transition-colors block">
                        {doc.name}{doc.credentials ? `, ${doc.credentials}` : ''}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">{doc.title || 'Internal Medicine'}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {doc.bio}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-semibold">Accepting Patients</span>
                  <Link
                    to={`/providers/${doc.slug}`}
                    className="font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <span>View Profile</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services Available at This Location */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/80 shadow-xs mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Services Available at 337 Bloomfield Ave
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Explore our full suite of on-site medical care and diagnostics.
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700"
            >
              <span>View All Services</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(LOCAL_SERVICES_DATA).map((svc) => (
              <Link
                key={svc.id}
                to={`/${svc.slug}`}
                className="group p-4 rounded-2xl bg-slate-50 hover:bg-primary-50 border border-slate-200/70 hover:border-primary-200 transition-all flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-white text-primary-600 flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                    {svc.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {svc.shortSummary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Location FAQ */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/80 shadow-xs mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight flex items-center gap-3">
            <HelpCircle className="text-primary-600" size={24} />
            <span>Newark Location Frequently Asked Questions</span>
          </h2>

          <div className="space-y-4">
            {localFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex justify-between items-center gap-4 bg-white hover:bg-slate-50 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="font-bold text-slate-900 text-base">{faq.question}</span>
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-5 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-xl text-center relative overflow-hidden">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Experience Better Healthcare in Newark?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            Our board-certified physicians are currently accepting new patients at 337 Bloomfield Ave. Book online today or give us a call.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-400 text-white font-bold py-3.5 px-8 rounded-full shadow-lg transition-all text-sm"
            >
              <Calendar size={18} />
              <span>Book Appointment Online</span>
            </button>
            <a
              href="tel:+19734129404"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 px-8 rounded-full border border-white/20 transition-all text-sm"
            >
              <Phone size={18} />
              <span>Call (973) 412-9404</span>
            </a>
          </div>
        </div>

      </section>

      {/* Appointment Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center font-bold"
              aria-label="Close booking modal"
            >
              ✕
            </button>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-900">Schedule Newark Appointment</h3>
              <p className="text-xs text-slate-500">337 Bloomfield Avenue, Newark, NJ 07107</p>
            </div>
            <AppointmentBookingForm
              onSuccess={() => setIsBookingModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
