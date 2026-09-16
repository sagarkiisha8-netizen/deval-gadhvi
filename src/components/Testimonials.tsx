import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCmsData } from '../context/CmsContext';

const EDITORIAL_TESTIMONIALS = [
  {
    quote: "“I finally felt like my doctor had the time to listen.”",
    detail: "Been a patient for years; love the office staff as well as Dr. Gadhvi. There is never a long wait to see the doctor. He takes the time to explain every lab result and truly treats you as a human being.",
    name: "Jessica C.",
    location: "Newark, NJ",
    role: "Patient of 6 Years"
  },
  {
    quote: "“Dr. Gadhvi is deeply attentive and believes in holistic prevention.”",
    detail: "Rather than simply writing a prescription and sending me out the door, he worked with me on my diet, blood pressure monitoring, and lifestyle. The clinical team here is warm, polite, and exceptionally efficient.",
    name: "Charmaine R.",
    location: "North Ward, Newark",
    role: "Verified Patient"
  },
  {
    quote: "“The highest standard of primary care I’ve experienced in New Jersey.”",
    detail: "Dr. Gadhvi is very responsive, highly knowledgeable, and very caring to my medical needs. Having on-site phlebotomy blood draws and EKGs done under one roof saves so much stress and time.",
    name: "Donato G.",
    location: "Essex County, NJ",
    role: "Patient of 4 Years"
  },
  {
    quote: "“He explains test results in plain language without rushing.”",
    detail: "Dr. Gadhvi is extremely friendly, patient, and always willing to help. He takes the time to review every single metric and ensures all questions are answered before you leave.",
    name: "Archana P.",
    location: "New Jersey",
    role: "Verified Patient"
  }
];

export default function Testimonials() {
  const { testimonials: dynamicTestimonials } = useCmsData();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const testimonials = (dynamicTestimonials && dynamicTestimonials.length > 0)
    ? dynamicTestimonials.map((t) => {
        const rawQuote = (t as any).quote || (t as any).text || (t as any).detail || '';
        const name = (t as any).patientName || (t as any).name || 'Verified Patient';
        const location = t.location || 'Newark, NJ';
        const role = (t as any).role || 'Verified Patient';
        const shortQuote = rawQuote
          ? (rawQuote.length > 95 ? `“${rawQuote.slice(0, 90).trim()}...”` : `“${rawQuote}”`)
          : '“I finally felt like my doctor had the time to listen.”';

        return {
          quote: shortQuote,
          detail: rawQuote || shortQuote,
          name,
          location,
          role
        };
      })
    : EDITORIAL_TESTIMONIALS;

  const validTestimonials = testimonials.length > 0 ? testimonials : EDITORIAL_TESTIMONIALS;
  const safeIndex = ((index % validTestimonials.length) + validTestimonials.length) % validTestimonials.length;
  const current = validTestimonials[safeIndex];

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prev) => (prev === 0 ? validTestimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % validTestimonials.length);
  };

  return (
    <section className="bg-[#315B52] text-[#FCFBF8] py-16 sm:py-24 lg:py-32 overflow-hidden border-b border-[#24443D]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Editorial Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-10 sm:mb-16 pb-5 sm:pb-6 border-b border-[#FCFBF8]/20"
        >
          <p className="text-[11.5px] sm:text-[12px] uppercase font-bold tracking-[0.24em] text-[#B39A68]">
            Patient Perspectives
          </p>
          <div className="flex items-center gap-1.5 text-[#B39A68]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={15} fill="#B39A68" />
            ))}
            <span className="text-xs text-[#FCFBF8] font-sans ml-2 font-medium">4.9 / 5.0 Rating • Verified Essex County Patients</span>
          </div>
        </motion.div>

        {/* Large Editorial Serif Quote with smooth animated transition */}
        <div className="min-h-[280px] sm:min-h-[300px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={safeIndex}
              initial={{ opacity: 0, x: direction * 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -25 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <h2 className="font-serif text-[28px] sm:text-[40px] md:text-[48px] lg:text-[56px] leading-[1.15] sm:leading-[1.12] text-[#FCFBF8] tracking-[-0.015em] mb-4 sm:mb-6 max-w-4xl">
                {current.quote}
              </h2>
              <p className="font-sans text-[15.5px] sm:text-[18px] text-[#D9D0C5] leading-[1.65] sm:leading-[1.75] max-w-3xl mb-8 sm:mb-10">
                {current.detail}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Attribution & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-6 sm:pt-8 border-t border-[#FCFBF8]/20">
            <div>
              <p className="font-serif text-[20px] sm:text-[24px] text-[#FCFBF8]">
                {current.name}
              </p>
              <p className="font-sans text-[12px] sm:text-[13px] uppercase tracking-widest text-[#B39A68] mt-1">
                {current.role} • {current.location}
              </p>
            </div>

            {/* Switcher Arrows & Counter */}
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="font-serif text-[16px] sm:text-[18px] text-[#D9D0C5] tracking-widest mr-2">
                0{safeIndex + 1} / 0{validTestimonials.length}
              </span>
              <button
                onClick={handlePrev}
                className="w-12 h-12 border border-[#FCFBF8]/30 hover:border-[#B39A68] hover:bg-[#FCFBF8]/10 active:scale-95 text-[#FCFBF8] flex items-center justify-center transition-all cursor-pointer"
                aria-label="Previous quote"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                onClick={handleNext}
                className="w-12 h-12 border border-[#FCFBF8]/30 hover:border-[#B39A68] hover:bg-[#FCFBF8]/10 active:scale-95 text-[#FCFBF8] flex items-center justify-center transition-all cursor-pointer"
                aria-label="Next quote"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
