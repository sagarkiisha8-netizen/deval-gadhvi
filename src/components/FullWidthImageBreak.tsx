import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCmsData } from '../context/CmsContext';

export default function FullWidthImageBreak() {
  const { homeContent, getMediaUrl, getSiteMedia } = useCmsData();
  const mediaItem = getSiteMedia('homepage', 'fullwidth', 'interior');
  const bannerImage = getMediaUrl('homepage', 'fullwidth', 'interior') || 
    (homeContent as any)?.fullWidthImage || 
    (homeContent as any)?.hero?.fullWidthImageUrl || 
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=85&w=2400";

  return (
    <section className="relative w-full min-h-[420px] sm:h-[480px] lg:h-[540px] overflow-hidden bg-[#0B1F2A] flex items-center justify-center py-16 sm:py-20">
      {/* Full Width Cinematic Photography with scale effect on scroll */}
      <motion.img
        initial={{ scale: 1.08 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        src={bannerImage}
        alt={mediaItem?.altText || "Newark Medical Associates clinical facility and serene care setting"}
        className="absolute inset-0 w-full h-full"
        style={{
          objectFit: (mediaItem?.objectFit as any) || 'cover',
          objectPosition: mediaItem?.position || 'center'
        }}
        loading="lazy"
        referrerPolicy="no-referrer"
      />

      {/* Subtle Dark Overlay */}
      <div 
        className="absolute inset-0 bg-[#0B1F2A]/70 mix-blend-multiply"
        aria-hidden="true"
      />
      <div 
        className="absolute inset-0 bg-gradient-to-t from-[#0B1F2A]/90 via-transparent to-[#0B1F2A]/80"
        aria-hidden="true"
      />

      {/* Dramatic Overlay Text */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-[11.5px] sm:text-[12.5px] uppercase font-bold tracking-[0.3em] text-[#B39A68] block mb-3 sm:mb-4"
        >
          Continuity Across Generations
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-[32px] sm:text-[50px] lg:text-[66px] text-[#FCFBF8] leading-[1.08] sm:leading-[1.05] tracking-[-0.02em] mb-4 sm:mb-6"
        >
          Care for every stage of life.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-sans text-[15px] sm:text-[18px] text-[#D9D0C5] max-w-xl mx-auto leading-[1.65] sm:leading-[1.7] mb-6 sm:mb-8 font-light"
        >
          From young adulthood through senior wellness, our clinicians provide the steady medical partnership your family deserves.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link
            to="/appointments"
            className="inline-flex items-center justify-center min-h-[48px] px-7 sm:px-8 py-3.5 sm:py-4 bg-[#FCFBF8] hover:bg-[#F4EFE6] text-[#0B1F2A] text-[13.5px] sm:text-[14px] font-bold uppercase tracking-wider transition-colors shadow-editorial active:scale-[0.99]"
          >
            Schedule a Consultation
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
