import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NEWARK_PRACTICE_INFO } from '../data/localSeoData';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What health insurances are accepted at Newark Medical Associates?',
      answer: 'We accept Medicare, Horizon Blue Cross Blue Shield, Aetna, Cigna, UnitedHealthcare, Oxford, AmeriHealth, Clover Health, Braven Health, and major commercial plans. For patients without coverage, we offer transparent and predictable self-pay rates.',
    },
    {
      question: 'Are same-day walk-in appointments available?',
      answer: 'Yes. We accommodate same-day urgent visits and acute medical consultations at our 337 Bloomfield Ave clinic. While walk-ins are welcomed, calling in advance or booking online helps minimize wait times.',
    },
    {
      question: 'How quickly are in-office diagnostic and lab results available?',
      answer: 'Immediate diagnostic tests like 12-lead EKGs, urinalysis, and rapid screening swabs provide real-time results during your appointment. Routine blood chemistry panels and lipid profiles processed through our phlebotomy service typically return within 24 to 48 hours.',
    },
    {
      question: 'What should I bring to my initial consultation as a new patient?',
      answer: 'Please bring a valid photo ID, your insurance card, a list of current medications and supplements, and any recent medical records or laboratory results from previous providers.',
    },
    {
      question: 'Do you provide pre-operative medical clearance for surgeries?',
      answer: 'Yes. Our internists provide fast, thorough pre-operative surgical clearances including mandatory EKGs, biomarker panels, and comprehensive cardiopulmonary assessments coordinated directly with your surgeon.',
    },
    {
      question: 'Where is the clinic located, and is parking available?',
      answer: 'We are located at 337 Bloomfield Avenue, Newark, NJ 07107 in the North Ward. Dedicated patient parking is provided on-site, and our facility is fully accessible via public transit.',
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-[#FCFBF8] py-16 sm:py-24 lg:py-32 border-b border-[#D9D0C5] overflow-hidden" id="faq">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 lg:mb-20"
        >
          <p className="text-[11.5px] sm:text-[12px] uppercase font-bold tracking-[0.24em] text-[#B39A68] mb-2 sm:mb-3">
            Common Inquiries
          </p>
          <h2 className="font-serif text-[32px] sm:text-[46px] lg:text-[54px] text-[#0B1F2A] leading-[1.08] tracking-[-0.02em] mb-3 sm:mb-4">
            Frequently Asked Questions
          </h2>
          <p className="font-sans text-[15px] sm:text-[16.5px] text-[#5A6264] leading-relaxed">
            Clear answers regarding insurance coverage, scheduling, diagnostic turnaround, and establishing care with our physicians.
          </p>
        </motion.div>

        {/* Editorial Accordion List (Divider lines only, NO cards) */}
        <div className="divide-y divide-[#D9D0C5] border-t border-b border-[#D9D0C5]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="py-5 sm:py-7 lg:py-8"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left flex items-start justify-between gap-4 sm:gap-6 group focus:outline-none min-h-[44px] cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-[19px] sm:text-[23px] lg:text-[26px] text-[#0B1F2A] leading-snug group-hover:text-[#315B52] transition-colors pt-0.5">
                    {faq.question}
                  </span>
                  <span className="w-8 h-8 sm:w-9 sm:h-9 border border-[#D9D0C5] flex items-center justify-center text-[#0B1F2A] shrink-0 mt-0.5 group-hover:border-[#0B1F2A] transition-colors">
                    {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 sm:pt-4 pr-4 sm:pr-12">
                        <p className="font-sans text-[14.5px] sm:text-[16px] text-[#5A6264] leading-[1.7]">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Contact Note */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 sm:mt-12 text-center text-[14px] sm:text-[15px] text-[#5A6264]"
        >
          Have a question not addressed here? Call our Newark team directly at{' '}
          <a href={`tel:${NEWARK_PRACTICE_INFO.rawPhone}`} className="text-[#0B1F2A] font-semibold underline hover:text-[#315B52] transition-colors">
            {NEWARK_PRACTICE_INFO.phone}
          </a>.
        </motion.div>

      </div>
    </section>
  );
}
