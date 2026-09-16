import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function WhyChooseUs() {
  const points = [
    {
      num: "01",
      title: "Personalized Appointments",
      desc: "We dedicate real time to each visit. Consultations are structured around comprehensive dialogue, clinical thoroughness, and addressing all of your personal concerns."
    },
    {
      num: "02",
      title: "Preventive Focus",
      desc: "Proactive biometric diagnostics, cardiovascular evaluations, and personalized lifestyle counseling that protect your vitality before disease takes root."
    },
    {
      num: "03",
      title: "Continuity of Care",
      desc: "Consistent physician oversight from the same dedicated clinical team. You see doctors who intimately understand your medical background."
    },
    {
      num: "04",
      title: "Convenient Newark Access",
      desc: "Centrally positioned on Bloomfield Avenue with dedicated patient parking, on-site certified phlebotomy labs, EKGs, and same-week appointment availability."
    }
  ];

  return (
    <section id="why-choose-us" className="bg-[#F4EFE6] py-16 sm:py-24 lg:py-32 border-b border-[#D9D0C5] overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: Large Editorial Headline & Practice Mission */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 lg:sticky lg:top-28"
          >
            <p className="text-[11.5px] sm:text-[12px] uppercase font-bold tracking-[0.24em] text-[#B39A68] mb-3 sm:mb-4">
              The Newark Standard
            </p>

            <h2 className="font-serif text-[32px] sm:text-[46px] lg:text-[56px] xl:text-[60px] text-[#0B1F2A] leading-[1.08] sm:leading-[1.04] tracking-[-0.02em] mb-4 sm:mb-6">
              Primary care<br />
              <span className="italic font-normal">built around people.</span>
            </h2>

            <p className="font-sans text-[15.5px] sm:text-[17.5px] text-[#5A6264] leading-[1.65] sm:leading-[1.7] mb-6 sm:mb-8">
              We reject high-volume assembly line medicine. Newark Medical Associates was founded on the fundamental principle that exceptional diagnosis requires genuine clinical presence and mutual trust.
            </p>

            <div className="pt-5 sm:pt-6 border-t border-[#D9D0C5] flex flex-col gap-3 sm:gap-4">
              <div className="flex items-center gap-3 text-[13.5px] sm:text-[14.5px] font-semibold text-[#0B1F2A]">
                <span className="w-2 h-2 rounded-full bg-[#315B52] shrink-0" />
                <span>337 Bloomfield Ave, Newark, NJ 07107</span>
              </div>
              <div className="flex items-center gap-3 text-[13.5px] sm:text-[14.5px] font-semibold text-[#0B1F2A]">
                <span className="w-2 h-2 rounded-full bg-[#B39A68] shrink-0" />
                <span>Serving North Ward, Essex County & Northern NJ</span>
              </div>
            </div>

            <div className="mt-6 sm:mt-8">
              <Link
                to="/appointments"
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-[#0B1F2A] hover:bg-[#153444] text-[#FCFBF8] text-[13.5px] sm:text-[14px] font-bold uppercase tracking-wider transition-all min-h-[48px] active:scale-[0.99]"
              >
                Schedule With Us
              </Link>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: 4 Large Stacked Rows with Separators (NO Boxes) */}
          <div className="lg:col-span-7 flex flex-col divide-y divide-[#D9D0C5] border-t border-b border-[#D9D0C5]">
            {points.map((pt, idx) => (
              <motion.div 
                key={pt.num} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="py-8 sm:py-10 lg:py-12 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 group hover:bg-[#FCFBF8]/40 px-2 -mx-2 rounded-xs transition-colors"
              >
                <span className="font-serif text-[32px] sm:text-[40px] text-[#B39A68] leading-none shrink-0 sm:w-16 group-hover:scale-105 transition-transform origin-left">
                  {pt.num}
                </span>

                <div className="flex-1">
                  <h3 className="font-serif text-[22px] sm:text-[26px] lg:text-[28px] text-[#0B1F2A] mb-2 sm:mb-3 leading-snug group-hover:text-[#315B52] transition-colors">
                    {pt.title}
                  </h3>
                  <p className="font-sans text-[14.5px] sm:text-[15.5px] text-[#5A6264] leading-[1.65] sm:leading-[1.7]">
                    {pt.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
