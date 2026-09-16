import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCmsData } from '../context/CmsContext';

export default function PatientFirstSection() {
  const { getMediaUrl, getSiteMedia } = useCmsData();
  const mediaItem = getSiteMedia('home', 'patient-first', 'listening-photo') || getSiteMedia('home', 'about', 'image');
  const imageUrl = getMediaUrl('home', 'patient-first', 'listening-photo') || 
    getMediaUrl('home', 'about', 'image') || 
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200";

  return (
    <section className="py-20 lg:py-28 bg-[#F4EFE6] border-y border-[#D9D0C5] relative overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Visual Healthcare Photo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 relative"
          >
            <div className="border border-[#D9D0C5] overflow-hidden aspect-[4/3] sm:aspect-[5/4] max-h-[480px] w-full bg-[#EAE3D6] relative shadow-editorial">
              <img
                src={imageUrl}
                alt={mediaItem?.altText || "Doctor listening attentively to patient at Newark Medical Associates"}
                className="w-full h-full"
                style={{
                  objectFit: (mediaItem?.objectFit as any) || 'cover',
                  objectPosition: mediaItem?.position || 'center'
                }}
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          {/* Right Column: Headline, Body, Pillars & CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-6"
          >
            <p className="text-[11.5px] uppercase font-bold tracking-[0.24em] text-[#B39A68] mb-4">
              Whole-Person Approach
            </p>

            <h2 className="font-serif text-[34px] sm:text-[44px] lg:text-[52px] text-[#0B1F2A] leading-[1.08] tracking-[-0.02em] mb-6">
              Care That Looks Beyond Symptoms.
            </h2>

            <p className="font-sans text-[16px] sm:text-[18px] text-[#5A6264] leading-[1.7] mb-8">
              Our physicians focus on understanding the individual patient as a whole — identifying underlying risk factors early, managing ongoing conditions with rigor, and supporting sustained vitality across every decade of life.
            </p>

            <div className="space-y-4 mb-10 border-t border-[#D9D0C5] pt-6">
              <div className="flex items-start gap-4">
                <span className="font-serif text-[20px] text-[#B39A68] leading-none mt-0.5">I.</span>
                <span className="text-[15px] sm:text-[16px] text-[#252A2B] font-medium leading-relaxed">
                  Detailed health evaluations & unhurried annual physicals
                </span>
              </div>
              <div className="flex items-start gap-4">
                <span className="font-serif text-[20px] text-[#B39A68] leading-none mt-0.5">II.</span>
                <span className="text-[15px] sm:text-[16px] text-[#252A2B] font-medium leading-relaxed">
                  Proactive lifestyle, metabolic, and cardiovascular prevention
                </span>
              </div>
              <div className="flex items-start gap-4">
                <span className="font-serif text-[20px] text-[#B39A68] leading-none mt-0.5">III.</span>
                <span className="text-[15px] sm:text-[16px] text-[#252A2B] font-medium leading-relaxed">
                  Coordinated diagnostic testing & continuous disease management
                </span>
              </div>
            </div>

            <div>
              <Link
                to="/appointments"
                className="inline-flex items-center justify-center gap-3 bg-[#0B1F2A] hover:bg-[#153444] text-[#FCFBF8] font-bold uppercase tracking-wider text-[13.5px] px-8 py-4 shadow-editorial transition-colors min-h-[48px]"
              >
                <span>Schedule Consultation</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
