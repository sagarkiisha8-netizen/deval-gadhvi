import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export interface DiagnosticItem {
  id: string;
  title: string;
  shortDesc: string;
  icon?: React.ElementType;
  badge?: string;
  turnaround?: string;
}

export const diagnosticServicesList: DiagnosticItem[] = [
  {
    id: "annual-work-physicals",
    title: "Annual & Work Physicals",
    shortDesc: "Comprehensive adult preventive examinations, commercial DOT medical exams, and pre-employment clearances.",
    turnaround: "Same-Day Reports"
  },
  {
    id: "ekg-testing",
    title: "12-Lead EKG & Rhythm Testing",
    shortDesc: "Immediate electrocardiograms to evaluate chest pain, arrhythmias, conduction abnormalities, and pre-operative cardiac readiness.",
    turnaround: "Immediate Results"
  },
  {
    id: "blood-testing",
    title: "Certified Phlebotomy Lab Draws",
    shortDesc: "In-office venous blood collection for comprehensive metabolic panels, complete blood counts, lipids, HbA1c, and thyroid tests.",
    turnaround: "Rapid Processing"
  },
  {
    id: "echocardiograms-ultrasound",
    title: "Echocardiograms & Vascular Sonograms",
    shortDesc: "Non-invasive cardiovascular ultrasound assessments evaluating cardiac wall motion, valve function, and peripheral circulation.",
    turnaround: "Board-Certified Reading"
  },
  {
    id: "allergy-testing",
    title: "Environmental & Food Allergy Testing",
    shortDesc: "Diagnostic panels to detect airborne, environmental, and dietary sensitivities with clear clinical management plans.",
    turnaround: "Targeted Analysis"
  },
  {
    id: "confidential-std-screening",
    title: "Confidential STD & Health Screenings",
    shortDesc: "Discreet, compassionate testing and counseling conducted with complete privacy and same-day medication guidance.",
    turnaround: "100% Confidential"
  }
];

export default function Diagnostics() {
  return (
    <section id="diagnostics" className="bg-[#FCFBF8] py-16 sm:py-24 lg:py-32 border-b border-[#D9D0C5] overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Editorial Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 mb-12 sm:mb-16 pb-6 sm:pb-8 border-b border-[#D9D0C5]"
        >
          <div className="max-w-2xl">
            <p className="text-[11.5px] sm:text-[12.5px] uppercase font-bold tracking-[0.24em] text-[#B39A68] mb-2 sm:mb-3">
              On-Site Clinical Laboratory
            </p>
            <h2 className="font-serif text-[32px] sm:text-[46px] lg:text-[58px] xl:text-[62px] text-[#0B1F2A] leading-[1.08] sm:leading-[1.04] tracking-[-0.02em]">
              In-Office Diagnostics,<br />
              <span className="italic font-normal">Without Hospital Delays.</span>
            </h2>
          </div>

          <div className="lg:max-w-md">
            <p className="font-sans text-[15px] sm:text-[16.5px] text-[#5A6264] leading-[1.65] sm:leading-[1.7] mb-4">
              We eliminate the frustration of traveling to disconnected third-party testing centers. Crucial diagnostic testing is performed right here under direct physician supervision.
            </p>
            <Link
              to="/diagnostics"
              className="inline-flex items-center gap-2 text-[13.5px] sm:text-[14.5px] font-bold uppercase tracking-wider text-[#0B1F2A] hover:text-[#315B52] transition-colors group min-h-[44px]"
            >
              <span className="border-b border-[#0B1F2A] group-hover:border-[#315B52]">Explore All Diagnostic Modalities</span>
              <ArrowRight size={16} className="text-[#B39A68] group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Editorial 2-Column List with Divider Lines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-14 gap-y-8 sm:gap-y-12 divide-y md:divide-y-0">
          {diagnosticServicesList.map((item, idx) => (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.08 * idx }}
              className="pt-6 sm:pt-8 md:pt-0 pb-6 border-b border-[#D9D0C5] flex flex-col justify-between group hover:bg-[#F4EFE6]/30 px-2 -mx-2 rounded-sm transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-serif text-[18px] sm:text-[20px] text-[#B39A68]">
                    0{idx + 1}
                  </span>
                  <span className="text-[11px] sm:text-[11.5px] uppercase tracking-widest font-semibold text-[#315B52] px-2.5 py-1 bg-[#F4EFE6] border border-[#D9D0C5]/40">
                    {item.turnaround}
                  </span>
                </div>

                <h3 className="font-serif text-[22px] sm:text-[26px] lg:text-[28px] text-[#0B1F2A] leading-snug mb-2.5 sm:mb-3 group-hover:text-[#315B52] transition-colors">
                  {item.title}
                </h3>

                <p className="font-sans text-[14.5px] sm:text-[15.5px] text-[#5A6264] leading-[1.65]">
                  {item.shortDesc}
                </p>
              </div>

              <div className="mt-5">
                <Link
                  to="/diagnostics"
                  className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-[#0B1F2A] hover:text-[#315B52] transition-colors min-h-[44px]"
                >
                  <span>Diagnostic Details</span>
                  <ArrowRight size={14} className="text-[#B39A68] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
