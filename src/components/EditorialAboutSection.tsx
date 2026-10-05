import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useCmsData } from '../context/CmsContext';

export default function EditorialAboutSection() {
  const { homeContent, getMediaUrl, getSiteMedia } = useCmsData();
  const mediaItem = getSiteMedia('home', 'about', 'preview-image') || getSiteMedia('home', 'aboutPreview', 'image');
  const aboutImage = getMediaUrl('home', 'about', 'preview-image') || 
    getMediaUrl('home', 'aboutPreview', 'image') || 
    homeContent?.aboutPreview?.imageUrl || 
    homeContent?.aboutPreview?.image || 
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=85&w=2000";
  const aboutTitle = homeContent?.aboutPreview?.headline || "Better care starts with better listening.";
  const aboutBody = homeContent?.aboutPreview?.body || "Founded on the belief that medicine is fundamentally about human relationships, our practice has served Newark and the greater Essex County community with unhurried clinical attention for over two decades.";

  return (
    <section className="bg-[#0B1F2A] text-[#FCFBF8] py-16 sm:py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Top: Two-column Heading & Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start mb-12 sm:mb-16 lg:mb-20">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6"
          >
            <p className="text-[11.5px] sm:text-[12px] uppercase font-bold tracking-[0.24em] text-[#B39A68] mb-3 sm:mb-4">
              About Newark Medical Associates
            </p>
            <h2 className="font-serif text-[32px] sm:text-[46px] lg:text-[56px] xl:text-[62px] text-[#FCFBF8] leading-[1.08] sm:leading-[1.04] tracking-[-0.02em]">
              {aboutTitle.includes('starts') ? (
                <>
                  {aboutTitle.split('starts')[0]}starts<br />
                  <span className="italic font-normal text-[#D9D0C5]">{aboutTitle.split('starts')[1]}</span>
                </>
              ) : (
                aboutTitle
              )}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-6 flex flex-col justify-between pt-0 lg:pt-6"
          >
            <p className="font-sans text-[15.5px] sm:text-[18px] text-[#D9D0C5] leading-[1.65] sm:leading-[1.7] mb-4 sm:mb-6">
              {aboutBody}
            </p>
            <p className="font-sans text-[14px] sm:text-[15.5px] text-[#9EAAA7] leading-[1.65] sm:leading-[1.7] mb-6">
              Our board-certified internists don’t just prescribe; we take the time to understand your lifestyle, family medical history, and personal wellness aspirations. You are never treated as a number or a symptom code.
            </p>
            <div>
              <Link
                to="/about"
                className="inline-flex items-center gap-2.5 text-[13.5px] sm:text-[14.5px] font-bold uppercase tracking-wider text-[#B39A68] hover:text-[#FCFBF8] transition-colors group min-h-[44px]"
              >
                <span>Discover Our Practice Heritage</span>
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </motion.div>

        </div>

        {/* Middle: Large Landscape Image of Doctor Interacting with Patient */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.8 }}
          className="w-full h-[280px] sm:h-[420px] lg:h-[540px] overflow-hidden mb-12 sm:mb-16 lg:mb-20 border border-[#252A2B] group"
        >
          <img
            src={aboutImage}
            alt={mediaItem?.altText || "Physician at Newark Medical Associates in compassionate consultation with patient"}
            className="w-full h-full group-hover:scale-103 transition-transform duration-700"
            style={{
              objectFit: (mediaItem?.objectFit as any) || 'cover',
              objectPosition: mediaItem?.position || 'center 35%'
            }}
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Bottom: 3 Editorial Columns with Divider Lines Only */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#252A2B] border-t border-b border-[#252A2B] py-6 sm:py-10">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="py-6 md:py-2 md:px-8 first:pl-0"
          >
            <span className="text-[#B39A68] text-[11.5px] sm:text-[12px] font-bold uppercase tracking-widest block mb-2">
              Core Principle 01
            </span>
            <h3 className="font-serif text-[24px] sm:text-[28px] text-[#FCFBF8] mb-2.5">
              Prevention
            </h3>
            <p className="font-sans text-[14px] sm:text-[15px] text-[#D9D0C5] leading-[1.65]">
              Prioritizing early risk detection, biometric screenings, and lifestyle modifications before acute symptoms arise.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="py-6 md:py-2 md:px-8"
          >
            <span className="text-[#B39A68] text-[11.5px] sm:text-[12px] font-bold uppercase tracking-widest block mb-2">
              Core Principle 02
            </span>
            <h3 className="font-serif text-[24px] sm:text-[28px] text-[#FCFBF8] mb-2.5">
              Relationships
            </h3>
            <p className="font-sans text-[14px] sm:text-[15px] text-[#D9D0C5] leading-[1.65]">
              Direct access to board-certified physicians who know your medical history personally and listen without interruption.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="py-6 md:py-2 md:px-8 last:pr-0"
          >
            <span className="text-[#B39A68] text-[11.5px] sm:text-[12px] font-bold uppercase tracking-widest block mb-2">
              Core Principle 03
            </span>
            <h3 className="font-serif text-[24px] sm:text-[28px] text-[#FCFBF8] mb-2.5">
              Continuity
            </h3>
            <p className="font-sans text-[14px] sm:text-[15px] text-[#D9D0C5] leading-[1.65]">
              Seamless management across routine wellness, diagnostic workups, chronic conditions, and specialist coordination.
            </p>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
