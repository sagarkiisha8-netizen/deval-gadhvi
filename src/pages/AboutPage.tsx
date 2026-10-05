import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import SeoHead from '../components/SeoHead';
import { NEWARK_PRACTICE_INFO } from '../data/localSeoData';
import { useCmsData } from '../context/CmsContext';

export default function AboutPage() {
  const { aboutContent, getMediaUrl, getSiteMedia } = useCmsData();
  const facilityMedia = getSiteMedia('about', 'facility', 'main') || getSiteMedia('about', 'facility', 'main-image');
  const facilityImage = getMediaUrl('about', 'facility', 'main') || 
    getMediaUrl('about', 'facility', 'main-image') ||
    (aboutContent as any)?.facilityImageUrl || 
    (aboutContent as any)?.heroImage ||
    (aboutContent as any)?.mission?.imageUrl || 
    (aboutContent as any)?.imageUrl || 
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=85&w=2200";

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'About Us', url: '/about' }
  ];

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Newark Medical Associates',
    description: 'Learn about Newark Medical Associates, our board-certified internal medicine physicians, clinical heritage, and community mission serving Newark, NJ.',
    mainEntity: {
      '@type': 'MedicalClinic',
      name: NEWARK_PRACTICE_INFO.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: NEWARK_PRACTICE_INFO.address.streetAddress,
        addressLocality: NEWARK_PRACTICE_INFO.address.addressLocality,
        addressRegion: NEWARK_PRACTICE_INFO.address.addressRegion,
        postalCode: NEWARK_PRACTICE_INFO.address.postalCode,
        addressCountry: 'US'
      }
    }
  };

  const values = [
    {
      num: "01",
      title: "Patient-Centered Listening",
      desc: "We prioritize intentional dialogue over hurried checkboxes. We believe the foundation of every sound diagnosis begins with truly hearing the patient's story."
    },
    {
      num: "02",
      title: "Proactive Prevention",
      desc: "Rather than waiting for illness to dictate life, we focus on early biometric risk stratification, cardiovascular screenings, and sustainable health habits."
    },
    {
      num: "03",
      title: "Clinical Excellence",
      desc: "Our board-certified internists bring decades of rigorous hospital and private practice experience, ensuring our patients receive evidence-based oversight."
    },
    {
      num: "04",
      title: "Community Dedication",
      desc: "Proudly serving Newark, Essex County, and northern New Jersey families with accessible, respectful, and culturally attentive primary care."
    }
  ];

  const milestones = [
    { year: "2009", title: "Practice Established in Newark", desc: "Founded with the clear vision of delivering unhurried, independent primary care to the Newark community." },
    { year: "2015", title: "On-Site Diagnostic Lab Suite", desc: "Introduced certified phlebotomy, 12-lead EKGs, and digital echocardiogram capabilities to prevent hospital delays." },
    { year: "2020", title: "Comprehensive Adult Specialties", desc: "Expanded preventative health programs, pre-op clearances, metabolic therapies, and senior wellness management." },
    { year: "Today", title: "Over 15,000 Lives Supported", desc: "Recognized as a premier independent primary care clinic trusted across generations of Essex County patients." }
  ];

  return (
    <div className="bg-[#FCFBF8] text-[#252A2B] overflow-hidden">
      <SeoHead
        title="About Our Practice | Newark Medical Associates | Newark, NJ"
        description="Learn about Newark Medical Associates in Newark, NJ. Founded over 15 years ago to deliver patient-centered internal medicine, preventive care, and on-site diagnostics."
        keywords={[
          'about Newark Medical Associates',
          'medical clinic Newark NJ',
          'internal medicine practice Newark',
          'Dr. Prahlad Gadhvi',
          'Dr. Deval Gadhvi'
        ]}
        canonicalUrl="https://newarkmed.com/about"
        breadcrumbs={breadcrumbs}
        schema={aboutSchema}
      />

      {/* 1. Header Banner: Warm Ivory Editorial Hero */}
      <section className="bg-[#F4EFE6] py-16 sm:py-24 lg:py-28 border-b border-[#D9D0C5]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <p className="text-[11.5px] sm:text-[12px] uppercase font-bold tracking-[0.24em] text-[#B39A68] mb-3 sm:mb-4">
              Our Heritage & Philosophy
            </p>
            <h1 className="font-serif text-[34px] sm:text-[54px] lg:text-[68px] text-[#0B1F2A] leading-[1.06] sm:leading-[1.04] tracking-[-0.02em] mb-4 sm:mb-6">
              Medicine Grounded in<br />
              <span className="italic font-normal">Compassion and Continuity.</span>
            </h1>
            <p className="font-sans text-[16px] sm:text-[20px] text-[#5A6264] leading-[1.65] sm:leading-[1.7] max-w-2xl">
              For over 15 years, Newark Medical Associates has provided thoughtful, relationship-based adult healthcare at 337 Bloomfield Avenue.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. Large Landscape Editorial Image */}
      <div className="w-full h-[320px] sm:h-[480px] lg:h-[620px] overflow-hidden border-b border-[#D9D0C5] bg-[#0B1F2A]">
        <img
          src={facilityImage}
          alt={facilityMedia?.altText || "Newark Medical Associates clinical facility"}
          className="w-full h-full"
          style={{
            objectFit: (facilityMedia?.objectFit as any) || 'cover',
            objectPosition: facilityMedia?.position || 'center 35%'
          }}
          referrerPolicy="no-referrer"
        />
      </div>

      {/* 3. The Practice Narrative */}
      <section className="py-16 sm:py-24 lg:py-32 border-b border-[#D9D0C5]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5"
            >
              <span className="text-[11.5px] sm:text-[12px] uppercase font-bold tracking-[0.24em] text-[#B39A68] block mb-2 sm:mb-3">
                Why We Practice
              </span>
              <h2 className="font-serif text-[30px] sm:text-[42px] lg:text-[50px] text-[#0B1F2A] leading-[1.08] tracking-[-0.02em]">
                Restoring the Human Element to Primary Healthcare.
              </h2>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-7 space-y-5 sm:space-y-6 font-sans text-[15.5px] sm:text-[17px] text-[#5A6264] leading-[1.7]"
            >
              <p>
                In a healthcare landscape increasingly dominated by brief corporate appointments and rushed electronic entries, Newark Medical Associates was deliberately structured to be different.
              </p>
              <p>
                Our founders, Dr. Prahlad Gadhvi and Dr. Deval Gadhvi, established this practice with a deep commitment to the North Ward community. We believe that an accurate clinical diagnosis cannot be formulated in ten minutes. It requires an unhurried discussion, a thorough physical examination, and continuous doctor-patient collaboration.
              </p>
              <p>
                By integrating certified on-site diagnostic testing—including rapid phlebotomy, 12-lead EKGs, and echocardiograms—we empower our patients with immediate insights and coordinated care under a single roof.
              </p>
              
              <div className="pt-4 sm:pt-6">
                <Link
                  to="/providers"
                  className="inline-flex items-center gap-2.5 text-[13.5px] sm:text-[14.5px] font-bold uppercase tracking-wider text-[#0B1F2A] hover:text-[#315B52] transition-colors group min-h-[44px]"
                >
                  <span className="border-b border-[#0B1F2A] group-hover:border-[#315B52]">Meet Our Board-Certified Physicians</span>
                  <ArrowRight size={16} className="text-[#B39A68] group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Core Values (Editorial Typography, NO cards) */}
      <section className="bg-[#F4EFE6] py-16 sm:py-24 lg:py-32 border-b border-[#D9D0C5]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mb-12 sm:mb-16 pb-6 border-b border-[#D9D0C5]"
          >
            <p className="text-[11.5px] sm:text-[12px] uppercase font-bold tracking-[0.24em] text-[#B39A68] mb-2 sm:mb-3">
              Guiding Standards
            </p>
            <h2 className="font-serif text-[32px] sm:text-[46px] lg:text-[54px] text-[#0B1F2A] leading-[1.08] tracking-[-0.02em]">
              The Four Pillars of Our Clinical Care.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 sm:gap-x-14 gap-y-10 sm:gap-y-12 divide-y md:divide-y-0">
            {values.map((v, idx) => (
              <motion.div 
                key={v.num} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="pt-6 sm:pt-8 md:pt-0 pb-6 border-b border-[#D9D0C5]"
              >
                <span className="font-serif text-[28px] sm:text-[32px] text-[#B39A68] block mb-2">
                  {v.num}
                </span>
                <h3 className="font-serif text-[22px] sm:text-[26px] lg:text-[28px] text-[#0B1F2A] mb-2 sm:mb-3 leading-snug">
                  {v.title}
                </h3>
                <p className="font-sans text-[14.5px] sm:text-[16px] text-[#5A6264] leading-[1.65] sm:leading-[1.7]">
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. Practice Milestones */}
      <section className="py-16 sm:py-24 lg:py-32 border-b border-[#D9D0C5]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mb-12 sm:mb-16 pb-6 border-b border-[#D9D0C5]"
          >
            <p className="text-[11.5px] sm:text-[12px] uppercase font-bold tracking-[0.24em] text-[#B39A68] mb-2 sm:mb-3">
              Historical Milestones
            </p>
            <h2 className="font-serif text-[32px] sm:text-[46px] lg:text-[54px] text-[#0B1F2A] leading-[1.08] tracking-[-0.02em]">
              Our Journey in Newark.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            {milestones.map((m, idx) => (
              <motion.div 
                key={m.year} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col"
              >
                <span className="font-serif text-[32px] sm:text-[38px] text-[#0B1F2A] font-light mb-2">
                  {m.year}
                </span>
                <div className="w-10 h-[2px] bg-[#B39A68] mb-3 sm:mb-4" />
                <h4 className="font-serif text-[20px] sm:text-[22px] text-[#0B1F2A] mb-2 leading-snug">
                  {m.title}
                </h4>
                <p className="font-sans text-[14px] sm:text-[15px] text-[#5A6264] leading-[1.65]">
                  {m.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Call to Action */}
      <section className="bg-[#0B1F2A] text-[#FCFBF8] py-16 sm:py-24">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="font-serif text-[30px] sm:text-[46px] lg:text-[56px] leading-[1.08] mb-4 sm:mb-6">
              Experience primary care as it was meant to be.
            </h3>
            <p className="font-sans text-[15.5px] sm:text-[18px] text-[#D9D0C5] max-w-2xl mx-auto leading-[1.65] sm:leading-[1.7] mb-8 sm:mb-10">
              Schedule an appointment at our 337 Bloomfield Ave clinic and meet physicians who take the time to know you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
              <Link
                to="/appointments"
                className="w-full sm:w-auto px-8 py-4 bg-[#B39A68] hover:bg-[#c4ab79] text-[#0B1F2A] font-bold uppercase tracking-wider text-[13.5px] sm:text-[14px] transition-colors min-h-[48px] flex items-center justify-center"
              >
                Book an Appointment
              </Link>
              <a
                href={`tel:${NEWARK_PRACTICE_INFO.rawPhone}`}
                className="w-full sm:w-auto px-7 py-4 border border-[#FCFBF8]/40 hover:border-[#FCFBF8] text-[#FCFBF8] font-semibold uppercase tracking-wider text-[13.5px] sm:text-[14px] transition-colors min-h-[48px] flex items-center justify-center"
              >
                Call (973) 412-9404
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
