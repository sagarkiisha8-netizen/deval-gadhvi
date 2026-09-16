import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Process() {
  const steps = [
    {
      num: "01",
      title: "Schedule",
      desc: "Reserve your consultation online or with a brief phone call. Same-week and same-day urgent appointments are accommodated."
    },
    {
      num: "02",
      title: "Visit",
      desc: "Arrive at our 337 Bloomfield Ave clinic. Meet your physician in a calm, respectful setting with zero rushed conversations."
    },
    {
      num: "03",
      title: "Personalized Plan",
      desc: "Complete any needed in-office labs or diagnostics. Receive a bespoke treatment strategy crafted around your specific biometrics."
    },
    {
      num: "04",
      title: "Ongoing Care",
      desc: "Maintain regular wellness check-ins, medication oversight, and preventative screenings with your trusted primary physician."
    }
  ];

  return (
    <section className="bg-[#FCFBF8] py-16 sm:py-24 lg:py-32 border-b border-[#D9D0C5] overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 lg:mb-20"
        >
          <p className="text-[11.5px] sm:text-[12px] uppercase font-bold tracking-[0.24em] text-[#B39A68] mb-2 sm:mb-3">
            The Patient Journey
          </p>
          <h2 className="font-serif text-[32px] sm:text-[46px] lg:text-[56px] xl:text-[60px] text-[#0B1F2A] leading-[1.08] sm:leading-[1.05] tracking-[-0.02em] mb-4 sm:mb-5">
            Your Care, Made Simple.
          </h2>
          <p className="font-sans text-[15.5px] sm:text-[18px] text-[#5A6264] leading-[1.65] sm:leading-[1.7]">
            From your very first inquiry to ongoing health preservation, we make the clinical experience seamless and transparent.
          </p>
        </motion.div>

        {/* Horizontal Timeline (Connecting Lines, NO Boxes) */}
        <div className="relative">
          {/* Subtle Horizontal Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[28px] left-[5%] right-[5%] h-[1px] bg-[#D9D0C5]" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-8">
            {steps.map((step, idx) => (
              <motion.div 
                key={step.num} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative flex flex-col pt-2 lg:pt-0 group"
              >
                
                {/* Step Marker Node */}
                <div className="flex items-center gap-4 mb-4 sm:mb-6">
                  <span className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 bg-[#F4EFE6] border border-[#D9D0C5] flex items-center justify-center font-serif text-[20px] sm:text-[24px] text-[#0B1F2A] group-hover:bg-[#0B1F2A] group-hover:text-[#FCFBF8] group-hover:scale-105 transition-all duration-300">
                    {step.num}
                  </span>
                  <div className="lg:hidden flex-1 h-[1px] bg-[#D9D0C5]" />
                </div>

                {/* Content */}
                <h3 className="font-serif text-[22px] sm:text-[24px] lg:text-[26px] text-[#0B1F2A] mb-2 sm:mb-3 leading-snug group-hover:text-[#315B52] transition-colors">
                  {step.title}
                </h3>
                <p className="font-sans text-[14px] sm:text-[15px] text-[#5A6264] leading-[1.65] sm:leading-[1.7]">
                  {step.desc}
                </p>

              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Booking Action */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-[#D9D0C5]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6"
        >
          <p className="font-serif text-[18px] sm:text-[20px] text-[#0B1F2A] italic">
            Ready to establish your medical home in Newark?
          </p>
          <Link
            to="/appointments"
            className="inline-flex items-center gap-2.5 text-[13.5px] sm:text-[14.5px] font-bold uppercase tracking-wider text-[#0B1F2A] hover:text-[#315B52] transition-colors group min-h-[44px]"
          >
            <span>Begin Your Journey Today</span>
            <ArrowRight size={16} className="text-[#B39A68] group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
