import React from 'react';
import { motion } from 'motion/react';
import AppointmentBookingForm from '../components/AppointmentBookingForm';
import SeoHead from '../components/SeoHead';
import { useCmsData } from '../context/CmsContext';

export default function ContactPage() {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Contact Us', url: '/contact' }
  ];

  return (
    <div className="bg-[#FCFBF8] text-[#252A2B] min-h-screen overflow-hidden">
      <SeoHead
        title="Contact & Location | Newark Medical Associates | Newark NJ"
        description="Contact Newark Medical Associates at 337 Bloomfield Ave, Newark, NJ. Call our physicians directly to schedule your consultation. Open Monday through Saturday."
        keywords={[
          'contact doctor Newark NJ',
          'call Newark doctor',
          '337 Bloomfield Ave Newark NJ phone',
          'medical clinic Newark phone number'
        ]}
        canonicalUrl="https://newarkmed.com/contact"
        breadcrumbs={breadcrumbs}
      />

      {/* 1. Header Hero: Warm Ivory Editorial Hero */}
      <section className="bg-[#F4EFE6] py-16 sm:py-24 lg:py-28 border-b border-[#D9D0C5]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <p className="text-[11.5px] sm:text-[12px] uppercase font-bold tracking-[0.24em] text-[#B39A68] mb-3 sm:mb-4">
              Get In Touch
            </p>
            <h1 className="font-serif text-[34px] sm:text-[54px] lg:text-[68px] text-[#0B1F2A] leading-[1.06] sm:leading-[1.04] tracking-[-0.02em] mb-4 sm:mb-6">
              Connect with Our<br />
              <span className="italic font-normal">Newark Clinical Practice.</span>
            </h1>
            <p className="font-sans text-[16px] sm:text-[20px] text-[#5A6264] leading-[1.65] sm:leading-[1.7] max-w-2xl">
              Conveniently located at 337 Bloomfield Avenue. Please call your physician directly to schedule your consultation or ask clinical questions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-20">
        
        {/* Section Heading */}
        <div className="max-w-3xl mb-12">
          <h2 className="font-serif text-[28px] sm:text-[38px] text-[#0B1F2A] mb-3">
            Choose Your Physician & Call to Book
          </h2>
          <p className="font-sans text-[16px] text-[#5A6264]">
            Select your healthcare provider below to call directly and schedule your consultation.
          </p>
        </div>

        <div className="max-w-5xl">
          <AppointmentBookingForm />
        </div>

      </div>
    </div>
  );
}
