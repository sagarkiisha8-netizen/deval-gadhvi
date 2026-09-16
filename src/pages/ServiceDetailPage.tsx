import React, { useMemo, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, ArrowRight, Phone, Calendar, MapPin, 
  Clock, ShieldCheck, ChevronDown, ChevronUp, Stethoscope, 
  Activity, HeartPulse, Award, User, HelpCircle, FileText,
  AlertCircle, Sparkles, Navigation, Share2, Check
} from 'lucide-react';
import SeoHead from '../components/SeoHead';
import { LOCAL_SERVICES_DATA, NEWARK_PRACTICE_INFO } from '../data/localSeoData';
import { useCmsData } from '../context/CmsContext';
import AppointmentBookingForm from '../components/AppointmentBookingForm';

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { providers, services: dynamicServices, getMediaUrl, getSiteMedia } = useCmsData();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Normalize slug to match keys
  const serviceData = useMemo(() => {
    if (!slug) return null;
    const cleanSlug = slug.toLowerCase().replace(/^\/+/g, '');
    
    // Direct key match
    if (LOCAL_SERVICES_DATA[cleanSlug]) {
      return LOCAL_SERVICES_DATA[cleanSlug];
    }
    
    // Search by slug or alternateSlugs
    const found = Object.values(LOCAL_SERVICES_DATA).find(
      s => s.slug === cleanSlug || (s.alternateSlugs && s.alternateSlugs.includes(cleanSlug))
    );
    if (found) return found;

    // Alias map for common variants
    const aliasMap: Record<string, string> = {
      'primary-urgent-care': 'primary-care',
      'urgent-care': 'primary-care',
      'wellness-prevention': 'preventive-care',
      'preventive-medicine': 'preventive-care',
      'disease-management': 'chronic-disease-management',
      'chronic-care': 'chronic-disease-management',
      'weight-management': 'medical-weight-loss',
      'weight-loss': 'medical-weight-loss',
      'cardiology': 'in-office-diagnostics',
      'cardiology-screening': 'in-office-diagnostics',
      'phlebotomy': 'onsite-laboratory',
      'blood-testing': 'onsite-laboratory',
      'laboratory': 'onsite-laboratory',
      'ultrasound': 'in-office-diagnostics',
      'ekg': 'in-office-diagnostics',
      'echo': 'in-office-diagnostics',
      'annual-exam': 'annual-physical',
      'physicals': 'annual-physical'
    };

    if (aliasMap[cleanSlug] && LOCAL_SERVICES_DATA[aliasMap[cleanSlug]]) {
      return LOCAL_SERVICES_DATA[aliasMap[cleanSlug]];
    }

    // Check dynamic services from CMS
    if (dynamicServices && dynamicServices.length > 0) {
      const dynamicMatch = dynamicServices.find(
        s => s.slug.toLowerCase().replace(/^\/+/g, '') === cleanSlug || s.id === cleanSlug
      );
      if (dynamicMatch) {
        return {
          id: dynamicMatch.id,
          slug: dynamicMatch.slug.replace(/^\/+/g, ''),
          alternateSlugs: [cleanSlug],
          name: dynamicMatch.name,
          h1: `${dynamicMatch.name} in Newark, NJ`,
          category: (dynamicMatch.category as any) || 'Primary Care',
          metaTitle: `${dynamicMatch.name} Newark NJ | Newark Medical Associates`,
          metaDescription: dynamicMatch.shortDescription || `Specialized ${dynamicMatch.name} in Newark, NJ with board-certified physicians at Newark Medical Associates.`,
          keywords: [dynamicMatch.name, `${dynamicMatch.name} Newark NJ`, 'medical clinic Newark NJ'],
          shortSummary: dynamicMatch.shortDescription || dynamicMatch.description || 'Compassionate, evidence-based care delivered by experienced physicians.',
          heroBadge: 'Board-Certified Care • Newark, NJ',
          heroHeadline: `${dynamicMatch.name} in Newark, NJ`,
          heroSubtitle: dynamicMatch.shortDescription || 'Dedicated, comprehensive clinical evaluation and tailored medical management.',
          overview: [
            dynamicMatch.description || 'At Newark Medical Associates, our medical team provides evidence-based, compassionate care designed to address your immediate needs and long-term health goals.',
            'We combine prompt evaluations with on-site diagnostic testing, eliminating redundant trips to outside imaging or laboratory centers.',
            'Our bilingual staff and board-certified physicians ensure each patient receives dedicated, unhurried attention.'
          ],
          symptomsOrReasons: {
            title: `Key Highlights & When to Schedule`,
            items: dynamicMatch.keyFeatures || [
              'Comprehensive diagnostic evaluation and review of medical history',
              'Personalized treatment plans tailored to your lifestyle and health goals',
              'On-site laboratory and diagnostic imaging coordination',
              'Prompt prescription management and follow-up support'
            ]
          },
          whatToExpect: {
            title: 'What to Expect During Your Visit',
            steps: [
              { step: '01', title: 'Consultation & Clinical Intake', description: 'Our clinical team checks your vitals and reviews your personal health history.' },
              { step: '02', title: 'Physician Examination', description: 'A thorough consultation with your board-certified provider.' },
              { step: '03', title: 'On-Site Diagnostic Testing', description: 'Any recommended blood panels, swabs, or ultrasound testing performed in-clinic.' },
              { step: '04', title: 'Treatment & Care Plan', description: 'Personalized treatment protocol, electronic prescriptions, and next steps.' }
            ]
          },
          whyChooseUs: [
            'Board-certified internal medicine and primary care specialists with decades of clinical experience',
            'On-site laboratory and diagnostic suites on Bloomfield Ave in Newark, NJ',
            'Bilingual clinical team fluent in English, Spanish, Hindi, and Gujarati',
            'Accepting major commercial insurances, Medicare, and offering affordable self-pay options'
          ],
          faqs: [
            {
              question: `How do I prepare for a ${dynamicMatch.name} visit?`,
              answer: dynamicMatch.preparationTips || 'Please bring a photo ID, insurance card, and an updated list of all medications/supplements you currently take.'
            },
            {
              question: 'Are same-day appointments available for this service?',
              answer: 'Yes! We offer same-week and same-day appointment slots whenever clinical capacity permits.'
            }
          ],
          relatedServices: ['primary-care', 'in-office-diagnostics', 'preventive-care'],
          leadDoctorSlug: 'dr-prahlad-gadhvi',
          schemaType: 'MedicalProcedure',
          medicalSpecialty: 'PrimaryCare'
        };
      }
    }

    // Rich fallback for specific medical specializations
    if (cleanSlug === 'sexual-health') {
      return {
        id: 'sexual-health',
        slug: 'services/sexual-health',
        name: 'Sexual Health & Confidential Testing in Newark, NJ',
        h1: 'Sexual Health & Confidential Testing in Newark, NJ',
        category: 'Specialized Services',
        metaTitle: 'Confidential Sexual Health & STD Testing Newark NJ | Newark Medical Associates',
        metaDescription: 'Discreet, compassionate sexual health consultations, STD/STI screenings, PrEP counseling, and preventative care in Newark, NJ.',
        keywords: ['STD testing Newark NJ', 'sexual health clinic Newark', 'confidential STI screening Newark', 'PrEP doctor Newark NJ'],
        shortSummary: 'Discreet, confidential consultations, comprehensive STI/STD screenings, and preventative sexual wellness in a nonjudgmental clinical environment.',
        heroBadge: 'Discreet & Confidential • Newark, NJ',
        heroHeadline: 'Confidential, Respectful Sexual Health Services',
        heroSubtitle: 'Comprehensive STI screenings, rapid testing, contraception guidance, and preventative therapy in an unhurried, welcoming clinic.',
        overview: [
          'Sexual health is an essential part of your overall well-being. At Newark Medical Associates, we provide confidential, dignified, and supportive medical consultations for individuals of all backgrounds.',
          'Our board-certified physicians offer discreet screening for common sexually transmitted infections, rapid swabs, blood testing, and preventative guidance without judgment or delays.',
          'Whether you are experiencing new symptoms, seeking routine peace of mind, or interested in preventative treatments like PrEP, our Newark team is here to support you.'
        ],
        symptomsOrReasons: {
          title: 'When to Schedule a Sexual Health Consultation',
          items: [
            'Routine annual or semi-annual confidential STI/STD screening',
            'Unusual discharge, burning sensation during urination, or pelvic discomfort',
            'Sores, bumps, rashes, or skin irritation in the genital area',
            'Partner diagnosed with a sexually transmitted infection',
            'PrEP (Pre-Exposure Prophylaxis) evaluation and prescription management',
            'Contraception consultations and reproductive health questions'
          ]
        },
        whatToExpect: {
          title: 'What to Expect During Your Confidential Visit',
          steps: [
            { step: '01', title: 'Private & Discreet Intake', description: 'A confidential review of your symptoms and testing preferences with zero judgment.' },
            { step: '02', title: 'Targeted Clinical Exam', description: 'A gentle, respectful physical evaluation tailored to your specific concerns.' },
            { step: '03', title: 'On-Site Diagnostic Testing', description: 'Confidential blood draws and rapid swabs completed on-site with expedited laboratory reporting.' },
            { step: '04', title: 'Prompt Results & Treatment', description: 'Direct physician consultation for test results and immediate prescription treatments if indicated.' }
          ]
        },
        whyChooseUs: [
          'Strict patient confidentiality and respectful, compassionate medical providers',
          'On-site laboratory blood draws and rapid diagnostic swabs',
          'Same-day visits available for acute discomfort or recent exposure',
          'Convenient Newark location with major insurance and affordable self-pay options'
        ],
        faqs: [
          { question: 'Is my sexual health visit and testing kept confidential?', answer: 'Yes, your privacy is protected under strict HIPAA regulations. All discussions, exams, and laboratory records are completely confidential.' },
          { question: 'How quickly will I get my STI test results?', answer: 'Most routine swab and blood panels return within 24 to 48 hours, and our clinical team contacts you directly with clear explanations.' }
        ],
        relatedServices: ['primary-care', 'onsite-laboratory', 'preventive-care'],
        leadDoctorSlug: 'dr-deval-gadhvi',
        schemaType: 'MedicalProcedure',
        medicalSpecialty: 'InternalMedicine'
      };
    }

    if (cleanSlug === 'travel-medicine') {
      return {
        id: 'travel-medicine',
        slug: 'services/travel-medicine',
        name: 'Travel Medicine & Travel Vaccines in Newark, NJ',
        h1: 'Travel Medicine & Vaccines in Newark, NJ',
        category: 'Specialized Services',
        metaTitle: 'Travel Vaccines & Medicine Clinic Newark NJ | Newark Medical Associates',
        metaDescription: 'Pre-travel consultations, destination vaccines, malaria prophylaxis, and travel safety advice in Newark, NJ.',
        keywords: ['travel clinic Newark NJ', 'travel vaccines Newark', 'yellow fever Newark NJ', 'malaria pills Newark NJ', 'travel immunizations Newark'],
        shortSummary: 'Destination-specific immunizations, travel advisories, and preventive medications to protect your health during international travel.',
        heroBadge: 'International Travel Clinic • Newark, NJ',
        heroHeadline: 'Prepare Safely for International Travel',
        heroSubtitle: 'Personalized immunization schedules, malaria prophylaxis, traveler’s diarrhea management, and global health advisories tailored to your itinerary.',
        overview: [
          'Traveling abroad requires proactive health planning. At Newark Medical Associates, our physicians provide destination-specific medical consultations based on the latest CDC and WHO travel health guidelines.',
          'We evaluate your itinerary, planned activities, and personal health history to determine required and recommended vaccines, prescription prophylaxis, and self-care strategies.',
          'We recommend scheduling your travel consultation 4 to 6 weeks before departure to allow vaccines to build maximum immunity.'
        ],
        symptomsOrReasons: {
          title: 'Services Provided During Travel Consultations',
          items: [
            'Destination-specific vaccine assessments (Hepatitis A & B, Typhoid, Tetanus/diphtheria, Meningitis)',
            'Malaria risk assessment and prescription prophylaxis (Malarone, Doxycycline)',
            'Traveler’s diarrhea prevention and emergency self-treatment kits',
            'High-altitude sickness prevention and motion sickness therapy',
            'Travel health guidance for patients with diabetes, heart disease, or chronic conditions',
            'Proof of immunization documentation for visas and international entry requirements'
          ]
        },
        whatToExpect: {
          title: 'Your Travel Medicine Consultation Process',
          steps: [
            { step: '01', title: 'Itinerary Review', description: 'We assess countries, regions, travel dates, and environmental exposure risks.' },
            { step: '02', title: 'Immunization Plan', description: 'Review of past immunization records and administration of necessary travel vaccines.' },
            { step: '03', title: 'Prescription Coordination', description: 'E-prescriptions for malaria prevention, traveler’s diarrhea, and altitude illness sent to your pharmacy.' },
            { step: '04', title: 'Travel Health Documentation', description: 'Official vaccination certificates and documentation provided for border and visa clearance.' }
          ]
        },
        whyChooseUs: [
          'Experienced internists up to date with CDC global health advisories',
          'Convenient Newark clinic near Newark Liberty International Airport (EWR)',
          'Complete travel prescriptions and wellness kits coordinated in one appointment'
        ],
        faqs: [
          { question: 'When should I schedule my travel clinic appointment before a trip?', answer: 'Ideally 4 to 6 weeks prior to departure, as some vaccines require multiple doses or take 2 weeks to become fully effective.' },
          { question: 'What should I bring to my travel medicine appointment?', answer: 'Please bring your detailed travel itinerary, list of countries and cities, and any previous immunization records you possess.' }
        ],
        relatedServices: ['primary-care', 'preventive-care', 'annual-physical'],
        leadDoctorSlug: 'dr-prahlad-gadhvi',
        schemaType: 'MedicalProcedure',
        medicalSpecialty: 'PreventiveMedicine'
      };
    }

    if (cleanSlug === 'physical-therapy') {
      return {
        id: 'physical-therapy',
        slug: 'services/physical-therapy',
        name: 'Physical Therapy & Musculoskeletal Rehabilitation in Newark, NJ',
        h1: 'Physical Therapy & Rehabilitation in Newark, NJ',
        category: 'Specialized Services',
        metaTitle: 'Physical Therapy & Rehabilitation Newark NJ | Newark Medical Associates',
        metaDescription: 'Targeted physical therapy, musculoskeletal rehabilitation, joint pain relief, and mobility restoration in Newark, NJ.',
        keywords: ['physical therapy Newark NJ', 'rehabilitation Newark', 'joint pain relief Newark', 'back pain physical therapy Newark NJ'],
        shortSummary: 'Evidence-based musculoskeletal evaluation, joint pain relief, mobility restoration, and functional rehabilitation in Newark, NJ.',
        heroBadge: 'Mobility & Pain Relief • Newark, NJ',
        heroHeadline: 'Restore Mobility and Relieve Chronic Pain',
        heroSubtitle: 'Comprehensive musculoskeletal assessments, non-surgical pain management, and personalized rehabilitation programs.',
        overview: [
          'Chronic back pain, neck stiffness, and joint discomfort can severely disrupt your daily life. At Newark Medical Associates, our clinical team evaluates musculoskeletal injuries and functional limitations.',
          'We emphasize non-invasive, conservative therapies that restore strength, range of motion, and physical independence without heavy reliance on opioid medications.',
          'Our providers work collaboratively with you to identify ergonomic causes, posture imbalances, and structural weaknesses, guiding you back to pain-free movement.'
        ],
        symptomsOrReasons: {
          title: 'Conditions Evaluated & Managed',
          items: [
            'Lower back pain, sciatica, and lumbar disc discomfort',
            'Neck pain, cervical stiffness, and postural strain from desk work',
            'Osteoarthritis and degenerative joint disease in knees, hips, and shoulders',
            'Post-surgical orthopedic rehabilitation and mobility recovery',
            'Workplace ergonomics, repetitive strain, and sports sprains',
            'Balance training and fall prevention for older adults'
          ]
        },
        whatToExpect: {
          title: 'The Rehabilitation Process',
          steps: [
            { step: '01', title: 'Functional Assessment', description: 'Evaluation of joint range of motion, muscle strength, gait, and pain triggers.' },
            { step: '02', title: 'Diagnostic Imaging (If Needed)', description: 'In-clinic ultrasound or imaging referral to evaluate soft tissue and joint structures.' },
            { step: '03', title: 'Custom Care Protocol', description: 'Individualized rehabilitation regimen combining therapeutic exercises and ergonomic guidance.' },
            { step: '04', title: 'Progress Milestones', description: 'Regular check-ins to measure mobility gains and adjust your recovery program.' }
          ]
        },
        whyChooseUs: [
          'Holistic physician oversight integrating musculoskeletal and general health',
          'Conservative, non-surgical focus on long-term functional recovery',
          'Convenient Bloomfield Avenue location with accessible parking in Newark'
        ],
        faqs: [
          { question: 'Do I need a doctor’s referral for physical therapy in NJ?', answer: 'In New Jersey, Direct Access allows patients to initiate physical therapy evaluations directly without a prior referral.' },
          { question: 'How long does a rehabilitation program usually take?', answer: 'Programs vary based on the underlying condition, typically ranging from 4 to 12 weeks of structured therapeutic progression.' }
        ],
        relatedServices: ['primary-care', 'in-office-diagnostics', 'chronic-disease-management'],
        leadDoctorSlug: 'dr-sankalp-pathak',
        schemaType: 'MedicalProcedure',
        medicalSpecialty: 'PhysicalMedicine'
      };
    }

    return null;
  }, [slug, dynamicServices]);

  // If no matching service found, redirect to main services index
  if (!serviceData) {
    return <Navigate to="/services" replace />;
  }

  // Find lead doctor
  const leadDoctor = useMemo(() => {
    if (!serviceData.leadDoctorSlug) return providers[0] || null;
    return providers.find(p => p.slug === serviceData.leadDoctorSlug) || providers[0] || null;
  }, [providers, serviceData]);

  // Related services
  const relatedServicesList = useMemo(() => {
    return serviceData.relatedServices
      .map(k => LOCAL_SERVICES_DATA[k])
      .filter(Boolean);
  }, [serviceData]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: serviceData.name, url: `/${serviceData.slug}` }
  ];

  // Specific MedicalProcedure Schema
  const procedureSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: serviceData.name,
    description: serviceData.metaDescription,
    procedureType: 'NonSurgicalProcedure',
    relevantSpecialty: {
      '@type': 'MedicalSpecialty',
      name: serviceData.medicalSpecialty
    },
    location: {
      '@type': 'MedicalClinic',
      name: NEWARK_PRACTICE_INFO.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: NEWARK_PRACTICE_INFO.address.streetAddress,
        addressLocality: NEWARK_PRACTICE_INFO.address.addressLocality,
        addressRegion: NEWARK_PRACTICE_INFO.address.addressRegion,
        postalCode: NEWARK_PRACTICE_INFO.address.postalCode,
        addressCountry: 'US'
      },
      telephone: NEWARK_PRACTICE_INFO.rawPhone
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* SEO Head & Schema Injections */}
      <SeoHead
        title={serviceData.metaTitle}
        description={serviceData.metaDescription}
        keywords={serviceData.keywords}
        canonicalUrl={`https://newarkmed.com/${serviceData.slug}`}
        breadcrumbs={breadcrumbs}
        faqs={serviceData.faqs}
        schema={procedureSchema}
      />

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200 pt-28 pb-4">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <nav className="flex items-center gap-2" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/services" className="hover:text-primary-600 transition-colors">Services</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-none">{serviceData.name}</span>
          </nav>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-xs"
          >
            {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Share2 size={13} />}
            <span>{copiedLink ? 'Link Copied' : 'Share Service'}</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 pt-10 pb-16 lg:pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold uppercase tracking-wider mb-5">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>{serviceData.heroBadge}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15] mb-6">
                {serviceData.h1}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
                {serviceData.heroSubtitle}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-7 py-3.5 rounded-full text-base font-semibold hover:bg-primary-700 shadow-md shadow-primary-600/20 transition-all hover:scale-105"
                >
                  <Calendar size={18} />
                  <span>Book Appointment in Newark</span>
                </button>

                <a
                  href={`tel:${NEWARK_PRACTICE_INFO.rawPhone}`}
                  className="inline-flex items-center justify-center gap-2 bg-white text-slate-800 border border-slate-300 px-7 py-3.5 rounded-full text-base font-semibold hover:bg-slate-50 hover:text-primary-600 transition-all shadow-xs"
                >
                  <Phone size={18} className="text-primary-600" />
                  <span>Call {NEWARK_PRACTICE_INFO.phone}</span>
                </a>
              </div>

              {/* Quick Trust Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary-500 shrink-0" />
                  <span className="font-medium">Same-Week Visits</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary-500 shrink-0" />
                  <span className="font-medium">All Major Insurances</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary-500 shrink-0" />
                  <span className="font-medium">Bilingual Care Team</span>
                </div>
              </div>
            </div>

            {/* Right Card: Quick Clinic Snapshot */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900 text-white rounded-3xl p-7 md:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-800">
                  <div>
                    <span className="text-primary-400 text-xs font-bold uppercase tracking-wider block mb-1">Newark Clinic Location</span>
                    <h3 className="text-xl font-bold text-white">{NEWARK_PRACTICE_INFO.name}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
                    <MapPin size={20} />
                  </div>
                </div>

                <div className="space-y-4 text-sm text-slate-300 mb-8">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-primary-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">{NEWARK_PRACTICE_INFO.formattedAddress}</p>
                      <p className="text-xs text-slate-400 mt-0.5">North Ward • Free Patient Parking Available</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-primary-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Hours of Operation</p>
                      <p className="text-xs text-slate-400">Mon – Fri: 8:30 AM – 6:00 PM</p>
                      <p className="text-xs text-slate-400">Saturday: 9:00 AM – 2:00 PM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldCheck size={18} className="text-primary-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">On-Site Capabilities</p>
                      <p className="text-xs text-slate-400">EKG, Ultrasound, Echo, and Full Lab Phlebotomy</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={NEWARK_PRACTICE_INFO.googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-3 px-4 rounded-xl border border-slate-700 transition-colors"
                  >
                    <Navigation size={14} className="text-primary-400" />
                    <span>Get Driving & Transit Directions</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout: Two-Column Structure */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Main Article & Clinical Details Column */}
          <div className="lg:col-span-8 space-y-14">
            
            {/* Dynamic Featured Service Image Banner */}
            {(() => {
              const serviceKey = serviceData.slug.replace(/^services\//, '');
              const sMedia = getSiteMedia('services', serviceKey, 'hero-image') || 
                getSiteMedia('services', serviceKey, 'card-image') || 
                getSiteMedia('services', serviceData.id, 'hero-image') ||
                getSiteMedia('services', serviceData.id, 'card-image');
              const sUrl = getMediaUrl('services', serviceKey, 'hero-image') || 
                getMediaUrl('services', serviceKey, 'card-image') || 
                getMediaUrl('services', serviceData.id, 'hero-image') ||
                getMediaUrl('services', serviceData.id, 'card-image') ||
                (serviceData as any)?.imageUrl;
              if (!sUrl) return null;
              return (
                <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-900">
                  <img
                    src={sUrl}
                    alt={sMedia?.altText || serviceData.name}
                    className="w-full h-full"
                    style={{
                      objectFit: (sMedia?.objectFit as any) || 'cover',
                      objectPosition: sMedia?.position || 'center'
                    }}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-bold uppercase tracking-widest rounded-full border border-white/20">
                    {serviceData.category}
                  </div>
                </div>
              );
            })()}

            {/* 1. Clinical Overview */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200/80 shadow-xs">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 tracking-tight">
                About {serviceData.name}
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed text-base">
                {serviceData.overview.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>

            {/* 2. When to Visit / Symptoms */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Activity size={20} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {serviceData.symptomsOrReasons.title}
                </h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {serviceData.symptomsOrReasons.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 size={18} className="text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-slate-700 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. What to Expect During Your Visit */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200/80 shadow-xs">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight">
                {serviceData.whatToExpect.title}
              </h2>

              <div className="space-y-6">
                {serviceData.whatToExpect.steps.map((st, idx) => (
                  <div key={idx} className="flex gap-5 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 font-bold flex items-center justify-center shrink-0 text-sm border border-primary-100 shadow-2xs">
                      {st.step}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{st.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{st.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. On-Site Diagnostics Banner (If applicable) */}
            {serviceData.onSiteDiagnosticsIncluded && (
              <div className="bg-gradient-to-br from-primary-900 to-slate-900 text-white rounded-3xl p-8 md:p-10 shadow-lg relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4 text-primary-300 text-xs font-bold uppercase tracking-wider">
                  <HeartPulse size={16} />
                  <span>On-Site Technology at 337 Bloomfield Ave</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  No Outside Referrals for Routine Testing
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Unlike traditional clinics that send you to third-party imaging and blood centers, Newark Medical Associates provides testing in-house for faster clinical answers:
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {serviceData.onSiteDiagnosticsIncluded.map((diag, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-xl text-xs font-medium text-slate-100">
                      <Check size={14} className="text-primary-400 shrink-0" />
                      <span>{diag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Why Choose Newark Medical Associates */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200/80 shadow-xs">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">
                Why Newark Residents Choose Our Practice
              </h2>
              <div className="space-y-4">
                {serviceData.whyChooseUs.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={14} />
                    </div>
                    <span className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Frequently Asked Questions & FAQPage Schema */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <HelpCircle size={20} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="space-y-4">
                {serviceData.faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => toggleFaq(idx)}
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

          </div>

          {/* Sidebar Column: Provider Highlight, Insurances, Booking Card */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Booking & Call Card */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-md sticky top-32">
              <span className="text-xs font-bold text-primary-600 uppercase tracking-wider block mb-2">
                Newark Appointment Desk
              </span>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Schedule Your Consultation
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Book online in 60 seconds or speak directly with our front desk coordinators on Bloomfield Ave.
              </p>

              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 px-4 rounded-2xl shadow-md transition-all mb-3 text-sm"
              >
                <Calendar size={16} />
                <span>Book Appointment Online</span>
              </button>

              <a
                href={`tel:${NEWARK_PRACTICE_INFO.rawPhone}`}
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3.5 px-4 rounded-2xl transition-colors text-sm"
              >
                <Phone size={16} className="text-primary-600" />
                <span>Call {NEWARK_PRACTICE_INFO.phone}</span>
              </a>

              {/* Lead Doctor Feature */}
              {leadDoctor && (() => {
                const docSlug = leadDoctor.slug || leadDoctor.id;
                const docPhoto = getMediaUrl('providers', docSlug, 'portrait') ||
                  getMediaUrl('providers', docSlug.replace('dr-', ''), 'portrait') ||
                  leadDoctor.photoUrl ||
                  leadDoctor.imageUrl ||
                  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200';
                return (
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                      Lead Physician
                    </span>
                    <div className="flex items-center gap-3">
                      <img
                        src={docPhoto}
                        alt={leadDoctor.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <Link to={`/providers/${leadDoctor.slug}`} className="font-bold text-slate-900 hover:text-primary-600 text-sm transition-colors block">
                          {leadDoctor.name}, {leadDoctor.credentials || 'MD'}
                        </Link>
                        <p className="text-xs text-slate-500 leading-tight mt-0.5">{leadDoctor.title || 'Internal Medicine Specialist'}</p>
                        <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Accepting Patients
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Insurances Accepted Widget */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                  Insurances Accepted
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {NEWARK_PRACTICE_INFO.insurances.slice(0, 6).map((ins, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-primary-500 shrink-0" />
                      <span>{ins}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/insurance-pricing"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 mt-3"
                >
                  <span>View All Insurance Details</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              {/* Related Services Links */}
              {relatedServicesList.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                    Related Healthcare Services
                  </span>
                  <div className="space-y-2">
                    {relatedServicesList.map((rel) => (
                      <Link
                        key={rel.id}
                        to={`/${rel.slug}`}
                        className="block p-2.5 rounded-xl bg-slate-50 hover:bg-primary-50 border border-slate-100 hover:border-primary-200 transition-all text-xs font-semibold text-slate-700 hover:text-primary-700"
                      >
                        {rel.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* Appointment Booking Modal */}
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
              <h3 className="text-xl font-bold text-slate-900">Book Your Appointment</h3>
              <p className="text-xs text-slate-500">Service: {serviceData.name}</p>
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
