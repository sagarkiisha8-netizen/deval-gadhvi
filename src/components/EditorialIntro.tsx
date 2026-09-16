import React from 'react';
import { motion } from 'motion/react';

export default function EditorialIntro() {
  const pillars = [
    { num: "01", title: "Preventive Care", desc: "Early detection and risk reduction before health concerns develop." },
    { num: "02", title: "Personalized Treatment", desc: "Individualized care plans tailored to your medical history and lifestyle." },
    { num: "03", title: "Experienced Providers", desc: "Board-certified internal medicine physicians with decades of Newark service." },
    { num: "04", title: "Long-Term Wellness", desc: "Continuity of care that supports your health through every stage of life." }
  ];

  return (
    <section className="bg-[#F4EFE6] py-16 sm:py-24 lg:py-28 border-b border-[#D9D0C5]/70 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
        
        {/* Subtle Brand Tag */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-[11.5px] sm:text-[12.5px] uppercase font-bold tracking-[0.24em] text-[#B39A68] mb-4 sm:mb-6"
        >
          Our Clinical Philosophy
        </motion.p>

        {/* Large Editorial Statement */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-[30px] sm:text-[44px] md:text-[54px] lg:text-[62px] text-[#0B1F2A] leading-[1.1] sm:leading-[1.08] tracking-[-0.02em] max-w-4xl mx-auto mb-5 sm:mb-6"
        >
          “Healthcare should feel personal,<br className="hidden sm:inline" /> thoughtful and unhurried.”
        </motion.h2>

        {/* Short Paragraph Below */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-sans text-[15.5px] sm:text-[18px] text-[#5A6264] max-w-2xl mx-auto leading-[1.65] sm:leading-[1.7] mb-10 sm:mb-14"
        >
          At Newark Medical Associates, appointments are never rushed. We prioritize comprehensive listening, thorough diagnostic investigation, and respectful partnership with every patient.
        </motion.p>

        {/* Thin Horizontal Line with Animated Width */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
          className="w-full max-w-4xl mx-auto h-[1px] bg-[#D9D0C5] mb-10 sm:mb-14 origin-center"
        />

        {/* 4 Items With Typography Only - NO Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 sm:gap-8 lg:gap-10 max-w-5xl mx-auto text-left">
          {pillars.map((item, idx) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.15 + idx * 0.1 }}
              className="flex flex-col group p-2 -m-2 rounded-sm transition-colors hover:bg-[#FCFBF8]/40"
            >
              <span className="font-serif text-[26px] sm:text-[32px] text-[#B39A68] leading-none mb-2.5 sm:mb-3 group-hover:scale-105 transition-transform origin-left inline-block">
                {item.num}
              </span>
              <h3 className="font-serif text-[19px] sm:text-[22px] text-[#0B1F2A] mb-2 leading-snug group-hover:text-[#315B52] transition-colors">
                {item.title}
              </h3>
              <p className="font-sans text-[14px] sm:text-[14.5px] text-[#5A6264] leading-[1.6]">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
