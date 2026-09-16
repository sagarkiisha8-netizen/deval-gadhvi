import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function ResourcesEditorial() {
  const resourceLinks = [
    {
      title: "Insurance & Coverage Information",
      desc: "Accepted health plans including Medicare, Horizon BCBS, Aetna, Cigna, UnitedHealthcare, and self-pay options.",
      href: "/insurance-pricing"
    },
    {
      title: "Patient Forms & Intake Documents",
      desc: "Download and complete your new patient medical history, consent agreements, and privacy notices before arrival.",
      href: "/patient-resources"
    },
    {
      title: "Prescription Refills & Pharmacy Support",
      desc: "Coordinate medication renewals, chronic condition therapy maintenance, and direct pharmacy transmissions.",
      href: "/patient-resources#prescriptions"
    },
    {
      title: "Appointments & Consultation Scheduling",
      desc: "Reserve routine adult physicals, specialized diagnostic testing, pre-op clearances, or same-day sick visits.",
      href: "/appointments"
    }
  ];

  return (
    <section className="bg-[#FCFBF8] py-16 sm:py-24 lg:py-32 border-b border-[#D9D0C5] overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 pb-6 border-b border-[#D9D0C5]"
        >
          <div>
            <p className="text-[11.5px] sm:text-[12px] uppercase font-bold tracking-[0.24em] text-[#B39A68] mb-2 sm:mb-3">
              Patient Portal & Resources
            </p>
            <h2 className="font-serif text-[32px] sm:text-[46px] lg:text-[56px] xl:text-[58px] text-[#0B1F2A] leading-[1.08] sm:leading-[1.05] tracking-[-0.02em]">
              Helpful Resources for Your Visit.
            </h2>
          </div>
          <p className="font-sans text-[14.5px] sm:text-[16px] text-[#5A6264] max-w-md leading-relaxed">
            Streamlined administrative access so you can focus entirely on your health and well-being.
          </p>
        </motion.div>

        {/* Large Horizontal Link Rows (Almost Full Width, NO Boxes) */}
        <div className="divide-y divide-[#D9D0C5] border-t border-b border-[#D9D0C5]">
          {resourceLinks.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
            >
              <Link
                to={item.href}
                className="py-8 sm:py-10 lg:py-12 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 group hover:bg-[#F4EFE6]/60 px-3 sm:px-6 -mx-3 sm:-mx-6 transition-colors duration-200 min-h-[44px]"
              >
                <div className="md:w-3/5">
                  <h3 className="font-serif text-[24px] sm:text-[30px] lg:text-[34px] text-[#0B1F2A] leading-tight mb-2 group-hover:text-[#315B52] transition-colors">
                    {item.title}
                  </h3>
                  <p className="font-sans text-[14.5px] sm:text-[15.5px] text-[#5A6264] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3 text-[13.5px] sm:text-[14.5px] font-bold uppercase tracking-wider text-[#0B1F2A] group-hover:text-[#315B52] transition-colors shrink-0">
                  <span className="border-b border-[#0B1F2A] group-hover:border-[#315B52]">Access Resource</span>
                  <ArrowRight size={18} className="text-[#B39A68] group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
