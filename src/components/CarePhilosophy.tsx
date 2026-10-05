import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useCmsData } from '../context/CmsContext';

export default function CarePhilosophy() {
  const { homeContent, getMediaUrl, getSiteMedia } = useCmsData();
  const mediaItem = getSiteMedia('home', 'philosophy', 'lifestyle-image') || getSiteMedia('home', 'philosophy', 'image');
  const philosophyImage = getMediaUrl('home', 'philosophy', 'lifestyle-image') || 
    getMediaUrl('home', 'philosophy', 'image') || 
    (homeContent as any)?.philosophyImage || 
    (homeContent as any)?.hero?.philosophyImageUrl || 
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=85&w=1400";

  const principles = [
    {
      num: "01",
      title: "Listen First",
      desc: "Every appointment begins with intentional dialogue. We respect your concerns, ask the right questions, and never reduce your care to a 5-minute checkout."
    },
    {
      num: "02",
      title: "Prevent Early",
      desc: "True longevity starts before chronic illness begins. We use advanced diagnostic testing and biometric screening to identify health vulnerabilities before they advance."
    },
    {
      num: "03",
      title: "Care Continuously",
      desc: "Health is a lifelong journey. We provide dedicated clinical follow-through, coordinated lab evaluations, and consistent access to your attending physician."
    }
  ];

  return (
    <section className="bg-[#F4EFE6] py-16 sm:py-24 lg:py-32 border-b border-[#D9D0C5] overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* LEFT: Large Lifestyle Image */}
          <motion.div 
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 relative aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/5] overflow-hidden border border-[#D9D0C5] shadow-editorial group"
          >
            <img
              src={philosophyImage}
              alt={mediaItem?.altText || "Physician actively consulting with a patient in an unhurried, comfortable clinical environment"}
              className="w-full h-full group-hover:scale-103 transition-transform duration-700"
              style={{
                objectFit: (mediaItem?.objectFit as any) || 'cover',
                objectPosition: mediaItem?.position || 'center'
              }}
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 p-4 sm:p-6 bg-[#0B1F2A]/90 text-[#FCFBF8] backdrop-blur-xs">
              <p className="font-serif text-[17px] sm:text-[20px] text-[#FCFBF8] leading-snug">
                “Our purpose is to restore dignity, time, and empathy to modern primary medicine.”
              </p>
              <p className="text-[11px] sm:text-[12px] uppercase tracking-widest text-[#B39A68] mt-2 font-sans font-semibold">
                — Newark Medical Associates Clinical Directors
              </p>
            </div>
          </motion.div>

          {/* RIGHT: Large Numbers, Large Serif Text, No Icons, No Cards */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5 }}
              className="text-[11.5px] sm:text-[12px] uppercase font-bold tracking-[0.24em] text-[#B39A68] mb-2 sm:mb-3"
            >
              Our Practice Principles
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-[32px] sm:text-[44px] lg:text-[54px] text-[#0B1F2A] leading-[1.08] tracking-[-0.02em] mb-8 sm:mb-12"
            >
              The Newark Medical Standard.
            </motion.h2>

            <div className="space-y-6 sm:space-y-8">
              {principles.map((item, idx) => (
                <motion.div 
                  key={item.num} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: 0.15 + idx * 0.1 }}
                  className="flex items-start gap-4 sm:gap-7 pb-6 sm:pb-8 border-b border-[#D9D0C5]/80 last:border-b-0 group"
                >
                  <span className="font-serif text-[34px] sm:text-[46px] text-[#B39A68] leading-none shrink-0 w-12 sm:w-14 group-hover:scale-105 transition-transform origin-left">
                    {item.num}
                  </span>
                  <div>
                    <h3 className="font-serif text-[22px] sm:text-[28px] text-[#0B1F2A] mb-1.5 sm:mb-2 leading-tight group-hover:text-[#315B52] transition-colors">
                      {item.title}
                    </h3>
                    <p className="font-sans text-[14.5px] sm:text-[16px] text-[#5A6264] leading-[1.65]">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mt-6 sm:mt-8 pt-2 sm:pt-4"
            >
              <Link
                to="/about"
                className="inline-flex items-center gap-2.5 text-[13.5px] sm:text-[14.5px] font-bold uppercase tracking-wider text-[#0B1F2A] hover:text-[#315B52] transition-colors group min-h-[44px]"
              >
                <span>Read More About Our Approach</span>
                <ArrowRight size={16} className="text-[#B39A68] group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
}
