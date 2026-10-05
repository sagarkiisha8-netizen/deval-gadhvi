import React from 'react';
import SeoHead from '../components/SeoHead';
import Hero from '../components/Hero';
import EditorialIntro from '../components/EditorialIntro';
import Services from '../components/Services';
import EditorialAboutSection from '../components/EditorialAboutSection';
import Providers from '../components/Providers';
import CarePhilosophy from '../components/CarePhilosophy';
import FullWidthImageBreak from '../components/FullWidthImageBreak';
import Process from '../components/Process';
import FAQ from '../components/FAQ';

export default function HomePage() {
  const homeFaqs = [
    {
      question: 'Where is Newark Medical Associates located?',
      answer: 'Our clinic is located at 337 Bloomfield Avenue, Newark, NJ 07107, in the North Ward near Branch Brook Park. Free on-site patient parking is available.'
    },
    {
      question: 'Are you accepting new patients in Newark, NJ?',
      answer: 'Yes. Our board-certified physicians, Dr. Prahlad Gadhvi and Dr. Deval Gadhvi, are actively accepting new adult primary care and internal medicine patients with same-week availability.'
    },
    {
      question: 'What health insurances are accepted?',
      answer: 'We accept Medicare, Horizon Blue Cross Blue Shield, Aetna, Cigna, UnitedHealthcare, Braven Health, Clover Health, Amerigroup / Wellpoint, and major commercial plans. Affordable self-pay rates are also available.'
    },
    {
      question: 'Do you offer same-day walk-in appointments?',
      answer: 'Yes, we accommodate same-day sick visits and urgent primary care needs at our 337 Bloomfield Ave clinic. Walk-ins are welcome.'
    },
    {
      question: 'What diagnostic testing is done on-site?',
      answer: 'We provide full in-office diagnostic capabilities including certified phlebotomy lab blood draws, 12-lead EKGs, echocardiograms, vascular ultrasound sonograms, and pre-operative cardiac clearances.'
    }
  ];

  return (
    <div className="overflow-hidden bg-[#FCFBF8] text-[#252A2B]">
      {/* Local SEO Meta & MedicalClinic Schema */}
      <SeoHead
        title="Primary Care & Internal Medicine Newark NJ | Newark Medical Associates"
        description="Looking for a primary care doctor in Newark, NJ? Newark Medical Associates at 337 Bloomfield Ave provides thoughtful internal medicine, preventive physicals, same-week visits, and certified on-site diagnostics. Call (973) 412-9404."
        keywords={[
          'primary care doctor Newark NJ',
          'internal medicine Newark',
          'doctor in Newark NJ',
          'primary care physician Newark NJ',
          'medical clinic Newark NJ',
          'physician near me Newark',
          'preventive care Newark NJ',
          '337 Bloomfield Ave Newark NJ',
          'Dr. Prahlad Gadhvi',
          'Dr. Deval Gadhvi'
        ]}
        canonicalUrl="https://newarkmed.com/"
        faqs={homeFaqs}
      />

      {/* 1. New Hero: Full-Width Cinematic Medical Photography + Overlapping Warm Ivory Box */}
      <Hero />

      {/* 2. Intro Section: “Healthcare should feel personal, thoughtful and unhurried.” */}
      <EditorialIntro />

      {/* 3. Services: Asymmetric Editorial Grid */}
      <Services />

      {/* 4. About Section: Full-Width Dark Navy (#0B1F2A), Landscape Photo, 3 Editorial Columns */}
      <EditorialAboutSection />

      {/* 5. Providers: Large 4:5 Portrait Photography, No White Box or Borders */}
      <Providers />

      {/* 6. Care Philosophy: Split Layout with Lifestyle Image & 3 Principles */}
      <CarePhilosophy />

      {/* 7. Full-Width Image Break: Cinematic 500px Image Break */}
      <FullWidthImageBreak />

      {/* 8. Patient Journey: Horizontal Timeline */}
      <Process />

      {/* 9. FAQ: Clean Editorial Accordion */}
      <FAQ />

    </div>
  );
}
