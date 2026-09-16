import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import AppointmentBookingForm from '../components/AppointmentBookingForm';
import { useCmsData } from '../context/CmsContext';
import SeoHead from '../components/SeoHead';
import { NEWARK_PRACTICE_INFO } from '../data/localSeoData';

export default function AppointmentsPage() {
  const { trackPageView } = useCmsData();

  useEffect(() => {
    trackPageView('/appointments');
    window.scrollTo(0, 0);
  }, []);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Appointments', url: '/appointments' }
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#252A2B] overflow-hidden">
      <SeoHead
        title="Schedule an Appointment | Newark Medical Associates | Newark NJ"
        description="Book your internal medicine consultation or diagnostic appointment with Newark Medical Associates at 337 Bloomfield Ave, Newark, NJ. Same-week openings available."
        keywords={[
          'schedule doctor appointment Newark',
          'book internal medicine Newark NJ',
          'primary care appointment Newark',
          'Newark Medical Associates appointments'
        ]}
        canonicalUrl="https://newarkmed.com/appointments"
        breadcrumbs={breadcrumbs}
      />

      {/* Hero Header: Warm Ivory Editorial Hero */}
      <section className="bg-[#F4EFE6] py-16 sm:py-24 lg:py-28 border-b border-[#D9D0C5]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className="text-[11.5px] sm:text-[12px] uppercase font-bold tracking-[0.24em] text-[#B39A68] mb-3 sm:mb-4">
              Direct Clinical Scheduling
            </p>
            <h1 className="font-serif text-[34px] sm:text-[54px] lg:text-[68px] text-[#0B1F2A] leading-[1.06] sm:leading-[1.04] tracking-[-0.02em] mb-4 sm:mb-6">
              Schedule Your<br />
              <span className="italic font-normal">Physician Consultation.</span>
            </h1>
            <p className="font-sans text-[16px] sm:text-[19px] text-[#5A6264] leading-[1.65] sm:leading-[1.7]">
              Select your preferred clinician, appointment reason, and requested time slot below. Our scheduling coordinator will contact you promptly to confirm your consultation.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-[13px] text-[#5A6264]">
              <span>Need immediate assistance?</span>
              <a href={`tel:${NEWARK_PRACTICE_INFO.rawPhone}`} className="text-[#0B1F2A] font-bold underline hover:text-[#315B52]">
                Call our office at (973) 412-9404
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Form Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <AppointmentBookingForm />
        </motion.div>
      </div>
    </div>
  );
}
