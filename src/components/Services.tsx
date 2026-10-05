import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useCmsData } from '../context/CmsContext';

export interface DisplayService {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  keyFeatures?: string[];
}

export default function Services() {
  const { getMediaUrl, getSiteMedia } = useCmsData();

  const primaryCareMedia = getSiteMedia('services', 'primary-care', 'card-image');
  const primaryCareImg = getMediaUrl('services', 'primary-care', 'card-image', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200');

  const diagnosticsMedia = getSiteMedia('services', 'diagnostics', 'card-image');
  const diagnosticsImg = getMediaUrl('services', 'diagnostics', 'card-image', 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800');
  return (
    <section id="services" className="bg-[#FCFBF8] py-16 sm:py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 pb-6 sm:pb-8 border-b border-[#D9D0C5]"
        >
          <div>
            <p className="text-[11.5px] sm:text-[12.5px] uppercase font-bold tracking-[0.24em] text-[#B39A68] mb-2 sm:mb-3">
              Clinical Offerings
            </p>
            <h2 className="font-serif text-[34px] sm:text-[48px] lg:text-[58px] xl:text-[62px] text-[#0B1F2A] leading-[1.08] sm:leading-[1.05] tracking-[-0.02em]">
              Comprehensive Care,<br />
              <span className="italic font-normal">Thoughtfully Delivered.</span>
            </h2>
          </div>

          <Link
            to="/services"
            className="inline-flex items-center gap-2.5 text-[14px] sm:text-[15px] font-semibold text-[#0B1F2A] hover:text-[#315B52] transition-colors group pb-1 min-h-[44px]"
          >
            <span className="border-b border-[#0B1F2A] group-hover:border-[#315B52]">Explore All Practice Services</span>
            <ArrowRight size={16} className="text-[#B39A68] group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* ASYMMETRIC EDITORIAL GRID (Mixed sizes, colors, imagery) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* 1. LEFT LARGE FEATURE: Primary Care (Spans 7 cols on LG) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.65 }}
            className="lg:col-span-7 bg-[#F4EFE6] border border-[#D9D0C5] flex flex-col justify-between overflow-hidden group shadow-editorial hover:shadow-editorial-lg transition-shadow duration-300"
          >
            <div className="relative h-[240px] sm:h-[320px] lg:h-[360px] overflow-hidden">
              <img
                src={primaryCareImg}
                alt={primaryCareMedia?.altText || 'Primary Care physician discussing medical history with patient'}
                className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700"
                style={{
                  objectFit: (primaryCareMedia?.objectFit as any) || 'cover',
                  objectPosition: primaryCareMedia?.position || 'center'
                }}
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 sm:top-6 left-4 sm:left-6 px-3 sm:px-3.5 py-1 sm:py-1.5 bg-[#0B1F2A] text-[#FCFBF8] text-[11px] sm:text-[11.5px] font-bold uppercase tracking-widest">
                Primary Specialty
              </div>
            </div>

            <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-between flex-grow">
              <div>
                <span className="text-[#B39A68] text-[12px] sm:text-[13px] font-semibold uppercase tracking-wider block mb-2">
                  01 • Foundational Health
                </span>
                <h3 className="font-serif text-[26px] sm:text-[34px] lg:text-[40px] text-[#0B1F2A] leading-tight mb-3 sm:mb-4">
                  Primary Care & Adult Medicine
                </h3>
                <p className="font-sans text-[15px] sm:text-[16.5px] text-[#5A6264] leading-[1.65] sm:leading-[1.7] max-w-xl mb-6">
                  From annual wellness physicals and pre-operative clearances to urgent same-day medical evaluations, our physicians coordinate every aspect of your healthcare journey under one roof.
                </p>
              </div>

              <Link
                to="/services/primary-care"
                className="inline-flex items-center gap-3 text-[13.5px] sm:text-[14.5px] font-bold uppercase tracking-wider text-[#0B1F2A] hover:text-[#315B52] transition-colors group/link mt-2 sm:mt-4 min-h-[44px]"
              >
                <span>Learn More About Primary Care</span>
                <ArrowRight size={16} className="text-[#B39A68] group-hover/link:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* RIGHT SIDE: 2 Stacked Cards (Spans 5 cols on LG) */}
          <div className="lg:col-span-5 flex flex-col gap-6 sm:gap-8">
            
            {/* 2. RIGHT TOP: Preventive Medicine (Forest Green Accent) */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="bg-[#315B52] text-[#FCFBF8] p-6 sm:p-10 border border-[#24443D] flex flex-col justify-between flex-1 group shadow-editorial hover:shadow-editorial-lg transition-shadow duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#B39A68] text-[11.5px] sm:text-[12px] font-bold uppercase tracking-widest">
                    02 • Early Detection
                  </span>
                  <span className="text-[#FCFBF8]/60 text-xs font-serif italic">Routine Screenings</span>
                </div>
                <h3 className="font-serif text-[24px] sm:text-[30px] lg:text-[34px] text-[#FCFBF8] leading-tight mb-3">
                  Preventive Medicine & Screenings
                </h3>
                <p className="font-sans text-[14.5px] sm:text-[15.5px] text-[#D9D0C5] leading-[1.65] mb-6">
                  Comprehensive cardiovascular risk panels, diabetes screenings, cancer prevention guidelines, and tailored nutrition counseling.
                </p>
              </div>

              <Link
                to="/services/preventive-care"
                className="inline-flex items-center gap-2 text-[13px] sm:text-[13.5px] font-bold uppercase tracking-wider text-[#FCFBF8] hover:text-[#B39A68] transition-colors min-h-[44px]"
              >
                <span>Preventive Care Services</span>
                <ArrowRight size={15} className="text-[#B39A68] group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* 3. RIGHT BOTTOM: Chronic Care (Midnight Navy Block) */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.65, delay: 0.15 }}
              className="bg-[#0B1F2A] text-[#FCFBF8] p-6 sm:p-10 border border-[#0B1F2A] flex flex-col justify-between flex-1 group shadow-editorial hover:shadow-editorial-lg transition-shadow duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#B39A68] text-[11.5px] sm:text-[12px] font-bold uppercase tracking-widest">
                    03 • Continuous Oversight
                  </span>
                  <span className="text-[#D9D0C5]/60 text-xs font-serif italic">Ongoing Management</span>
                </div>
                <h3 className="font-serif text-[24px] sm:text-[30px] lg:text-[34px] text-[#FCFBF8] leading-tight mb-3">
                  Chronic Disease Care
                </h3>
                <p className="font-sans text-[14.5px] sm:text-[15.5px] text-[#D9D0C5] leading-[1.65] mb-6">
                  Structured clinical management for hypertension, diabetes, cholesterol, arthritis, and thyroid conditions with regular biomarker monitoring.
                </p>
              </div>

              <Link
                to="/services/chronic-disease-management"
                className="inline-flex items-center gap-2 text-[13px] sm:text-[13.5px] font-bold uppercase tracking-wider text-[#FCFBF8] hover:text-[#B39A68] transition-colors min-h-[44px]"
              >
                <span>Chronic Care Pathways</span>
                <ArrowRight size={15} className="text-[#B39A68] group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

          </div>

          {/* 4. BOTTOM LEFT: Women’s Health / Specialized Medicine (Spans 5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="lg:col-span-5 bg-[#F4EFE6] border border-[#D9D0C5] p-6 sm:p-10 flex flex-col justify-between group shadow-editorial hover:shadow-editorial-lg transition-shadow duration-300"
          >
            <div>
              <span className="text-[#B39A68] text-[11.5px] sm:text-[12px] font-bold uppercase tracking-widest block mb-2">
                04 • Specialized Primary Care
              </span>
              <h3 className="font-serif text-[24px] sm:text-[30px] lg:text-[34px] text-[#0B1F2A] leading-tight mb-3">
                Women’s & Adult Wellness
              </h3>
              <p className="font-sans text-[14.5px] sm:text-[15.5px] text-[#5A6264] leading-[1.65] mb-6">
                Well-woman annual examinations, hormone evaluations, bone density referrals, cervical screenings, and sensitive preventative guidance throughout life transitions.
              </p>
            </div>

            <Link
              to="/services/preventive-care"
              className="inline-flex items-center gap-2 text-[13px] sm:text-[13.5px] font-bold uppercase tracking-wider text-[#0B1F2A] hover:text-[#315B52] transition-colors min-h-[44px]"
            >
              <span>Explore Wellness Offerings</span>
              <ArrowRight size={15} className="text-[#B39A68] group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* 5. BOTTOM RIGHT LARGE: Diagnostics (Spans 7 cols with Image) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="lg:col-span-7 bg-[#0B1F2A] text-[#FCFBF8] border border-[#0B1F2A] flex flex-col sm:flex-row overflow-hidden group shadow-editorial hover:shadow-editorial-lg transition-shadow duration-300"
          >
            <div className="sm:w-1/2 relative min-h-[200px] sm:min-h-[240px]">
              <img
                src={diagnosticsImg}
                alt={diagnosticsMedia?.altText || 'Onsite cardiopulmonary diagnostic equipment'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                style={{
                  objectFit: (diagnosticsMedia?.objectFit as any) || 'cover',
                  objectPosition: diagnosticsMedia?.position || 'center'
                }}
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="sm:w-1/2 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <span className="text-[#B39A68] text-[11.5px] sm:text-[12px] font-bold uppercase tracking-widest block mb-2">
                  05 • In-House Testing
                </span>
                <h3 className="font-serif text-[24px] sm:text-[28px] lg:text-[32px] text-[#FCFBF8] leading-tight mb-3">
                  Certified On-Site Diagnostics
                </h3>
                <p className="font-sans text-[14px] sm:text-[14.5px] text-[#D9D0C5] leading-[1.65] mb-6">
                  Immediate 12-lead EKGs, echocardiograms, blood draws, and pre-op evaluations without sending you to third-party testing centers.
                </p>
              </div>

              <Link
                to="/diagnostics"
                className="inline-flex items-center gap-2 text-[13px] sm:text-[13.5px] font-bold uppercase tracking-wider text-[#FCFBF8] hover:text-[#B39A68] transition-colors min-h-[44px]"
              >
                <span>View All In-Office Tests</span>
                <ArrowRight size={15} className="text-[#B39A68] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
