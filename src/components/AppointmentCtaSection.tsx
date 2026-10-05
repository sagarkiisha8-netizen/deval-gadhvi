import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { NEWARK_PRACTICE_INFO } from '../data/localSeoData';
import { useCmsData } from '../context/CmsContext';

export default function AppointmentCtaSection() {
  const { getMediaUrl, getSiteMedia } = useCmsData();
  const mediaItem = getSiteMedia('home', 'cta', 'featured-image') || getSiteMedia('home', 'cta', 'image');
  const ctaImage = getMediaUrl('home', 'cta', 'featured-image') || 
    getMediaUrl('home', 'cta', 'image') || 
    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=85&w=1200";

  return (
    <section className="bg-[#F4EFE6] py-16 sm:py-24 lg:py-32 border-b border-[#D9D0C5] overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Huge Serif Headline & Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <p className="text-[11.5px] sm:text-[12.5px] uppercase font-bold tracking-[0.24em] text-[#315B52] mb-3 sm:mb-4">
              Begin Your Care
            </p>

            <h2 className="font-serif text-[34px] sm:text-[52px] md:text-[62px] lg:text-[70px] xl:text-[76px] text-[#0B1F2A] leading-[1.05] sm:leading-[1.02] tracking-[-0.025em] mb-4 sm:mb-6">
              Your Health Deserves<br />
              <span className="italic font-normal">Thoughtful Care.</span>
            </h2>

            <p className="font-sans text-[15.5px] sm:text-[18px] lg:text-[20px] text-[#5A6264] leading-[1.65] sm:leading-[1.7] max-w-xl mb-8 sm:mb-10">
              Schedule your consultation with our board-certified internal medicine physicians today. We provide same-week openings, attentive listening, and comprehensive on-site diagnostics.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
              <Link
                to="/appointments"
                className="inline-flex items-center justify-center gap-3 px-8 sm:px-9 py-4 bg-[#0B1F2A] hover:bg-[#153444] text-[#FCFBF8] text-[14px] sm:text-[15px] font-semibold uppercase tracking-wider transition-all duration-200 shadow-editorial min-h-[48px] active:scale-[0.99]"
              >
                <span>Book Appointment</span>
                <ArrowRight size={16} className="text-[#B39A68]" />
              </Link>

              <a
                href={`tel:${NEWARK_PRACTICE_INFO.rawPhone}`}
                className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-4 border border-[#0B1F2A] hover:bg-[#0B1F2A]/5 text-[#0B1F2A] text-[14px] sm:text-[15px] font-semibold uppercase tracking-wider transition-colors min-h-[48px]"
              >
                <Phone size={16} className="text-[#315B52]" />
                <span>Call (973) 412-9404</span>
              </a>
            </div>

            <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-[#D9D0C5] flex flex-wrap items-center gap-4 sm:gap-6 text-[12.5px] sm:text-[13px] text-[#5A6264]">
              <span className="inline-flex items-center gap-1.5"><span className="text-[#315B52] font-bold">✓</span> Medicare & Major Commercial Insurances</span>
              <span className="inline-flex items-center gap-1.5"><span className="text-[#315B52] font-bold">✓</span> Free On-Site Patient Parking</span>
              <span className="inline-flex items-center gap-1.5"><span className="text-[#315B52] font-bold">✓</span> 337 Bloomfield Ave, Newark NJ</span>
            </div>
          </motion.div>

          {/* Right Column: Large Image Integrated into Composition */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="relative aspect-[4/5] overflow-hidden border border-[#D9D0C5] shadow-editorial-lg group">
              <img
                src={ctaImage}
                alt={mediaItem?.altText || "Newark Medical Associates physician in clinical office"}
                className="w-full h-full group-hover:scale-103 transition-transform duration-700"
                style={{
                  objectFit: (mediaItem?.objectFit as any) || 'cover',
                  objectPosition: mediaItem?.position || 'center'
                }}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F2A]/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-5 sm:bottom-6 left-5 sm:left-6 right-5 sm:right-6 text-white">
                <span className="text-[10.5px] sm:text-[11px] uppercase tracking-widest font-bold text-[#B39A68] block mb-1">
                  Private Medical Practice
                </span>
                <p className="font-serif text-[18px] sm:text-[20px] leading-snug">
                  Welcoming new adult primary care patients in Newark, New Jersey.
                </p>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
