import React from 'react';
import { motion } from 'motion/react';
import { Users, FileHeart, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StatsTrustStrip() {
  const trustItems = [
    {
      id: 'experienced-team',
      icon: Users,
      title: 'Experienced Care Team',
      subtitle: 'Board-Certified Leadership',
      description: 'Dedicated internal medicine physicians providing clinical excellence with an unhurried, patient-centered focus.',
      isHighlighted: true
    },
    {
      id: 'personalized-plans',
      icon: FileHeart,
      title: 'Personalized Care Plans',
      subtitle: 'Tailored to Your Life',
      description: 'Custom prevention roadmaps, individualized medication management, and ongoing adult health support.'
    },
    {
      id: 'preventative-approach',
      icon: ShieldCheck,
      title: 'Preventative Approach',
      subtitle: 'Early Detection Focus',
      description: 'Comprehensive annual physicals, cardiovascular screenings, and in-office lab testing before complications arise.'
    },
    {
      id: 'convenient-clinic',
      icon: MapPin,
      title: 'Convenient Newark Clinic',
      subtitle: '337 Bloomfield Ave',
      description: 'Centrally located with on-site diagnostic testing, free patient parking, and multilingual care.'
    }
  ];

  return (
    <section 
      id="quality-standards"
      className="relative py-20 sm:py-24 lg:py-[104px] border-y border-[#DDE7E5] overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #F7FAF9 0%, #EEF7F5 100%)'
      }}
    >
      {/* Soft, low-opacity radial ambient gradients for subtle depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(circle at 18% 30%, rgba(13, 148, 136, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 85% 75%, rgba(16, 42, 67, 0.04) 0%, transparent 45%)
          `
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 2-Column Editorial Master Layout: Left (Intro ~38-40%) + Right (2x2 Cards ~60-62%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-14 items-center">
          
          {/* LEFT COLUMN: Eyebrow, Main Heading, Supporting Value Prop, CTA */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            
            {/* Subtle Editorial Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-3.5 sm:mb-4">
              <span className="w-2 h-2 rounded-full bg-[#0D9488]" />
              <span className="text-[12px] sm:text-[12.5px] font-semibold text-[#0D9488] tracking-wider uppercase">
                Quality Standards
              </span>
            </div>

            {/* Prominent High-Contrast Heading with Architectural Accent Bar */}
            <div className="relative mb-5">
              <div 
                className="hidden sm:block absolute -left-5 top-1.5 bottom-1.5 w-1 rounded-full bg-gradient-to-b from-[#0D9488] via-[#0D9488]/60 to-transparent" 
                aria-hidden="true"
              />
              <h2 className="font-heading font-bold text-[#102A43] tracking-[-0.02em] text-[32px] sm:text-[40px] md:text-[44px] lg:text-[48px] leading-[1.1] max-w-lg">
                A Higher Standard of Primary Care in Newark
              </h2>
            </div>

            {/* Supporting Trust Paragraph */}
            <p className="text-[16px] sm:text-[16.5px] text-[#64748B] leading-[1.7] mb-7 max-w-[440px] font-normal">
              From prevention-focused visits to personalized care plans, our team is committed to providing compassionate, coordinated primary care designed around long-term health.
            </p>

            {/* Refined Practice Standards Link & Trust Indicator */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-[14.5px] sm:text-[15px] font-semibold text-[#0D9488] hover:text-[#0F766E] transition-all group w-fit"
              >
                <span>Learn about our practice standards</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Subtle Clinical Pillar Badges */}
            <div className="mt-8 pt-6 border-t border-[#102A43]/[0.08] flex items-center gap-4 text-xs text-[#64748B]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
                <span>Board-Certified</span>
              </div>
              <span className="text-[#CBD5E1]">•</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
                <span>On-Site Labs</span>
              </div>
              <span className="text-[#CBD5E1]">•</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
                <span>Unhurried Visits</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: 4 Premium Feature Cards in a 2x2 Grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {trustItems.map((item, idx) => {
                const Icon = item.icon;
                const isHighlight = item.isHighlighted;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.35, delay: idx * 0.07 }}
                    className={`rounded-[22px] p-6 sm:p-7 border transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#0D9488]/35 hover:shadow-[0_18px_45px_rgba(16,42,67,0.08)] flex flex-col justify-between group relative overflow-hidden ${
                      isHighlight
                        ? 'bg-gradient-to-br from-white via-white to-[#F0F9F7] border-[#0D9488]/25 shadow-[0_14px_35px_rgba(16,42,67,0.06)]'
                        : 'bg-white/95 backdrop-blur-sm border-[#102A43]/[0.08] shadow-[0_12px_30px_rgba(16,42,67,0.04)]'
                    }`}
                  >
                    {/* Subtle Corner Accent for Highlighted Card */}
                    {isHighlight && (
                      <div 
                        className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#0D9488]/10 to-transparent rounded-bl-full pointer-events-none"
                        aria-hidden="true"
                      />
                    )}

                    <div>
                      {/* Top: Premium Icon Container + Category Eyebrow */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] bg-[#DDF5F2] text-[#0D9488] flex items-center justify-center group-hover:bg-[#CCECE7] group-hover:scale-105 transition-all duration-200 shrink-0 shadow-xs">
                          <Icon size={22} strokeWidth={2} />
                        </div>

                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488]/80 text-right">
                          {item.subtitle}
                        </span>
                      </div>

                      {/* Main Title */}
                      <h3 className="text-[18px] sm:text-[19px] font-bold text-[#102A43] tracking-tight mb-2 group-hover:text-[#0D9488] transition-colors leading-snug">
                        {item.title}
                      </h3>

                      {/* Body Description */}
                      <p className="text-[14px] text-[#64748B] leading-[1.65] font-normal">
                        {item.description}
                      </p>
                    </div>

                    {/* Subtle bottom grounding line */}
                    <div className="mt-5 pt-3.5 border-t border-[#102A43]/[0.05] flex items-center justify-between text-[12px] font-medium text-[#0D9488]/90">
                      <span>Clinical Standard</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]/60 group-hover:bg-[#0D9488] transition-colors" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
