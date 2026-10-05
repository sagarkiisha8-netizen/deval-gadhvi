import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import SeoHead from '../components/SeoHead';
import { NEWARK_PRACTICE_INFO } from '../data/localSeoData';
import { useCmsData } from '../context/CmsContext';

interface DetailedService {
  id: string;
  slug: string;
  title: string;
  category: 'All' | 'Primary Care' | 'Preventive Medicine' | 'Chronic Care' | 'In-Office Diagnostics';
  summary: string;
  details: string;
  highlights: string[];
  image: string;
}

export default function ServicesPage() {
  const { getMediaUrl, getSiteMedia, services } = useCmsData();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Primary Care',
    'Preventive Medicine',
    'Chronic Care',
    'In-Office Diagnostics'
  ];

  const serviceList: DetailedService[] = [
    {
      id: "primary-urgent-care",
      slug: "primary-care",
      title: "Primary Care & Acute Visits",
      category: "Primary Care",
      summary: "Comprehensive adult medical evaluations, same-day sick care, and continuous primary healthcare for Newark residents.",
      details: "Our primary physicians address acute illnesses, routine physicals, minor injuries, and medication renewals with unhurried clinical diligence and compassionate bedside manner.",
      highlights: [
        "Same-day sick appointments & walk-in availability",
        "Respiratory viral infections, strep & flu treatments",
        "Comprehensive health evaluations & medication renewals",
        "Direct specialist referrals throughout Essex County"
      ],
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1000"
    },
    {
      id: "preventive-wellness",
      slug: "preventive-care",
      title: "Preventive Medicine & Screenings",
      category: "Preventive Medicine",
      summary: "Proactive biometric screenings, lipid evaluations, cancer risk checks, and tailored lifestyle coaching.",
      details: "Comprehensive annual physical examinations, biometric laboratory panels, age-appropriate cancer screenings, and metabolic roadmaps tailored to your medical history.",
      highlights: [
        "Annual comprehensive wellness physicals",
        "Cardiovascular risk calculations & biometric labs",
        "Immunizations, booster shots & seasonal vaccinations",
        "Personalized nutritional and lifestyle counseling"
      ],
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1000"
    },
    {
      id: "chronic-disease-management",
      slug: "chronic-disease-management",
      title: "Chronic Disease Management",
      category: "Chronic Care",
      summary: "Structured longitudinal oversight for diabetes, hypertension, high cholesterol, asthma, and thyroid health.",
      details: "Expert management and continuous monitoring of chronic conditions to prevent vascular, renal, or cardiopulmonary complications through regular biomarker monitoring.",
      highlights: [
        "Type 1 & Type 2 Diabetes treatment and HbA1c tracking",
        "Hypertension (High Blood Pressure) protocols",
        "Lipid & cholesterol balance therapies",
        "Routine medication optimization & quarterly check-ins"
      ],
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1000"
    },
    {
      id: "in-office-diagnostics",
      slug: "in-office-diagnostics",
      title: "In-Office Diagnostics & EKGs",
      category: "In-Office Diagnostics",
      summary: "Immediate 12-lead EKGs, certified phlebotomy lab draws, and non-invasive ultrasound sonograms conducted on-site.",
      details: "State-of-the-art diagnostic testing suites within our 337 Bloomfield Ave clinic, providing rapid test turnarounds and avoiding delayed hospital referrals.",
      highlights: [
        "Immediate 12-lead electrocardiograms (EKG)",
        "Certified in-office phlebotomy blood draw station",
        "Echocardiograms & vascular ultrasound sonograms",
        "Pre-operative surgical cardiac clearances"
      ],
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1000"
    },
    {
      id: "annual-physicals",
      slug: "annual-physicals",
      title: "Annual Physicals & Work Clearances",
      category: "Primary Care",
      summary: "Comprehensive routine physical examinations, DOT medical exams, and employment verifications.",
      details: "Detailed head-to-toe physical assessments tailored to employer guidelines, athletic participation, and personal wellness baselines.",
      highlights: [
        "Complete adult wellness physicals",
        "Commercial driver DOT physical exams",
        "Pre-employment & school medical clearances",
        "Certified documentation provided promptly"
      ],
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1000"
    },
    {
      id: "cardiovascular-health",
      slug: "ekg-cardiac",
      title: "Cardiovascular Health & Clearances",
      category: "Chronic Care",
      summary: "Specialized heart health assessments, hypertension control, and cardiac clearance for scheduled procedures.",
      details: "Cardiovascular risk factor identification, blood pressure regulation, arrhythmia screenings, and collaborative coordination with leading NJ cardiologists.",
      highlights: [
        "Cardiopulmonary risk evaluations",
        "In-office cardiac rhythm and pulse tracking",
        "Coordination with hospital cardiac departments",
        "Pre-surgical cardiac risk stratification"
      ],
      image: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&q=80&w=1000"
    }
  ];

  const filteredServices = selectedCategory === 'All'
    ? serviceList
    : serviceList.filter(s => s.category === selectedCategory);

  return (
    <div className="bg-[#FCFBF8] text-[#252A2B] overflow-hidden">
      <SeoHead
        title="Clinical Services | Primary Care & Diagnostics Newark NJ | Newark Medical Associates"
        description="Explore comprehensive medical services at Newark Medical Associates in Newark, NJ. Internal medicine, preventive physicals, chronic disease management, and on-site diagnostics."
        keywords={[
          'medical services Newark NJ',
          'primary care Newark',
          'preventive medicine Newark',
          'EKG testing Newark',
          'chronic disease management Newark NJ'
        ]}
        canonicalUrl="https://newarkmed.com/services"
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
              Practice Capabilities
            </p>
            <h1 className="font-serif text-[34px] sm:text-[54px] lg:text-[68px] text-[#0B1F2A] leading-[1.06] sm:leading-[1.04] tracking-[-0.02em] mb-4 sm:mb-6">
              Clinical Services Designed<br />
              <span className="italic font-normal">Around Your Long-Term Health.</span>
            </h1>
            <p className="font-sans text-[16px] sm:text-[20px] text-[#5A6264] leading-[1.65] sm:leading-[1.7] max-w-2xl">
              From foundational primary care to immediate on-site diagnostic testing, every service at Newark Medical Associates is delivered with time, precision, and genuine empathy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. Editorial Category Filter Bar (Refined Underlines, NO SaaS pills) */}
      <section className="border-b border-[#D9D0C5] bg-[#FCFBF8]/95 backdrop-blur-xs sticky top-[68px] sm:top-[112px] md:top-[128px] z-20">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-6 sm:gap-8 py-3.5 sm:py-4 whitespace-nowrap min-w-max">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[14px] sm:text-[15px] pb-1 transition-all relative font-medium min-h-[38px] cursor-pointer ${
                    isSelected
                      ? 'text-[#0B1F2A] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#0B1F2A]'
                      : 'text-[#5A6264] hover:text-[#0B1F2A]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Editorial Services Grid (Asymmetric & Stately, NO repetitive SaaS cards) */}
      <section className="py-16 sm:py-24 lg:py-28 border-b border-[#D9D0C5]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
          
          <div className="space-y-12 sm:space-y-16 lg:space-y-20">
            <AnimatePresence mode="wait">
              {filteredServices.map((service, index) => {
                const isEven = index % 2 === 0;
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className={`grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-center pb-12 sm:pb-16 border-b border-[#D9D0C5] last:border-b-0 ${
                      isEven ? '' : 'lg:flex-row-reverse'
                    }`}
                  >
                    {/* Image Column (5 cols) */}
                    <div className={`lg:col-span-5 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                      {(() => {
                        const cmsService = services?.find(s => s.slug === service.slug || s.id === service.id);
                        const dynamicMedia = getSiteMedia('services', service.slug, 'card-image') || 
                          getSiteMedia('services', service.slug, 'hero-image') || 
                          getSiteMedia('services', service.id, 'card-image');
                        const dynamicUrl = getMediaUrl('services', service.slug, 'card-image') || 
                          getMediaUrl('services', service.slug, 'hero-image') || 
                          getMediaUrl('services', service.id, 'card-image') || 
                          cmsService?.imageUrl || 
                          service.image;
                        return (
                          <div className="relative aspect-[4/3] overflow-hidden border border-[#D9D0C5] shadow-editorial bg-[#F4EFE6] group">
                            <img
                              src={dynamicUrl}
                              alt={dynamicMedia?.altText || service.title}
                              className="w-full h-full group-hover:scale-103 transition-transform duration-700"
                              style={{
                                objectFit: (dynamicMedia?.objectFit as any) || 'cover',
                                objectPosition: dynamicMedia?.position || 'center'
                              }}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-3.5 sm:top-4 left-3.5 sm:left-4 px-3 py-1 bg-[#0B1F2A] text-[#FCFBF8] text-[10.5px] sm:text-[11px] font-bold uppercase tracking-widest">
                              {service.category}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Text Column (7 cols) */}
                    <div className={`lg:col-span-7 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                      <span className="font-serif text-[24px] sm:text-[28px] text-[#B39A68] block mb-1.5 sm:mb-2">
                        0{index + 1}
                      </span>

                      <h2 className="font-serif text-[26px] sm:text-[34px] lg:text-[40px] text-[#0B1F2A] leading-tight mb-3 sm:mb-4">
                        {service.title}
                      </h2>

                      <p className="font-sans text-[15px] sm:text-[17px] text-[#5A6264] leading-[1.65] sm:leading-[1.7] mb-5 sm:mb-6">
                        {service.details}
                      </p>

                      {/* Highlights */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-6 sm:mb-8">
                        {service.highlights.map((h, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-[13.5px] sm:text-[14.5px] text-[#252A2B]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#315B52] shrink-0 mt-2" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-5 sm:gap-6 pt-1">
                        <Link
                          to={`/services/${service.slug}`}
                          className="inline-flex items-center gap-2 text-[13.5px] sm:text-[14px] font-bold uppercase tracking-wider text-[#0B1F2A] hover:text-[#315B52] transition-colors group min-h-[44px]"
                        >
                          <span className="border-b border-[#0B1F2A] group-hover:border-[#315B52]">Explore Service Details</span>
                          <ArrowRight size={15} className="text-[#B39A68] group-hover:translate-x-1.5 transition-transform" />
                        </Link>

                        <Link
                          to="/appointments"
                          className="text-[13px] sm:text-[13.5px] font-bold uppercase tracking-wider text-[#315B52] hover:text-[#0B1F2A] transition-colors min-h-[44px] inline-flex items-center"
                        >
                          Book Visit →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* 4. Practice Booking Banner */}
      <section className="bg-[#0B1F2A] text-[#FCFBF8] py-16 sm:py-24">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="font-serif text-[30px] sm:text-[44px] lg:text-[54px] leading-[1.08] mb-4 sm:mb-6">
              Need an appointment this week?
            </h3>
            <p className="font-sans text-[15.5px] sm:text-[18px] text-[#D9D0C5] max-w-xl mx-auto leading-[1.65] sm:leading-[1.7] mb-8 sm:mb-10">
              Our clinic offers convenient same-week and same-day availability for adult primary care, diagnostics, and urgent visits.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
              <Link
                to="/appointments"
                className="w-full sm:w-auto px-8 py-4 bg-[#B39A68] hover:bg-[#c4ab79] text-[#0B1F2A] font-bold uppercase tracking-wider text-[13.5px] sm:text-[14px] transition-colors min-h-[48px] flex items-center justify-center"
              >
                Book an Appointment
              </Link>
              <a
                href={`tel:${NEWARK_PRACTICE_INFO.rawPhone}`}
                className="w-full sm:w-auto px-7 py-4 border border-[#FCFBF8]/40 hover:border-[#FCFBF8] text-[#FCFBF8] font-semibold uppercase tracking-wider text-[13.5px] sm:text-[14px] transition-colors min-h-[48px] flex items-center justify-center"
              >
                Call (973) 412-9404
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
