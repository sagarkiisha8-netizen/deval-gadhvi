import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import AppointmentBookingForm from './AppointmentBookingForm';

export default function Contact() {
  return (
    <section id="contact" className="py-20 md:py-28 bg-[#FCFBF8] relative overflow-hidden border-t border-[#D9D0C5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Top Indicator */}
        <div className="flex justify-center items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#B39A68] inline-block" />
          <span className="text-[#0B1F2A] text-sm font-medium uppercase tracking-widest">Contact & Appointments</span>
        </div>

        {/* Main Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#0B1F2A] tracking-tight leading-[1.15]"
          >
            Choose Your Physician & <br className="hidden sm:inline" />
            <span className="italic font-normal">Call to Book</span>
          </motion.h2>
          <p className="text-[#5A6264] text-base sm:text-lg mt-4 max-w-xl mx-auto">
            Select your healthcare provider below to call directly and schedule your consultation.
          </p>
        </div>

        {/* Direct Provider Calling Directory */}
        <div className="max-w-5xl mx-auto">
          <AppointmentBookingForm />
        </div>

      </div>
    </section>
  );
}
