import React from 'react';
import { ArrowRight, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { NEWARK_PRACTICE_INFO } from '../data/localSeoData';
import { useCmsData } from '../context/CmsContext';

// Neutral placeholder
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" fill="%23E8E4DC"><rect width="400" height="500"/><circle cx="200" cy="170" r="80" fill="%23C8C0B0"/><ellipse cx="200" cy="420" rx="140" ry="100" fill="%23C8C0B0"/></svg>';

export default function ProvidersPage() {
  const { providers } = useCmsData();
  const activeProviders = providers.filter(p => p.isActive !== false);

  return (
    <div className="bg-[#FCFBF8] text-[#252A2B] overflow-hidden">
      <SeoHead
        title="Our Physicians & Providers | Newark Medical Associates | Newark NJ"
        description="Meet board-certified primary care physicians Dr. Prahlad Gadhvi, Dr. Deval Gadhvi, and clinical team at Newark Medical Associates in Newark, NJ. Accepting new patients."
        keywords={[
          'Dr. Prahlad Gadhvi',
          'Dr. Deval Gadhvi',
          'primary care doctor Newark NJ',
          'internal medicine physician Newark',
          'doctors accepting new patients Newark'
        ]}
        canonicalUrl="https://newarkmed.com/providers"
      />

      {/* 1. Header Hero */}
      <section className="bg-[#F4EFE6] py-20 sm:py-24 lg:py-28 border-b border-[#D9D0C5]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="max-w-4xl">
            <p className="text-[12px] uppercase font-bold tracking-[0.24em] text-[#B39A68] mb-4">
              Our Medical Team
            </p>
            <h1 className="font-serif text-[44px] sm:text-[58px] lg:text-[68px] text-[#0B1F2A] leading-[1.04] tracking-[-0.02em] mb-6">
              Meet the People<br />
              <span className="italic font-normal">Behind Your Care.</span>
            </h1>
            <p className="font-sans text-[18px] sm:text-[20px] text-[#5A6264] leading-[1.7] max-w-2xl">
              Board-certified internists who bring rigorous clinical training, decades of community dedication, and genuine empathy to every patient consultation.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Provider Gallery */}
      <section className="py-24 sm:py-28 lg:py-32 border-b border-[#D9D0C5]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="space-y-20 lg:space-y-24">
            {activeProviders.map((docItem, index) => {
              const isEven = index % 2 === 0;
              const slug = docItem.slug || docItem.id;
              const imageUrl = docItem.imageUrl || PLACEHOLDER_IMAGE;
              const role = docItem.designation || docItem.title || 'Physician';
              const experience = docItem.experienceYears ? `${docItem.experienceYears}+ Years` : '';
              
              // Normalize specialties to array if it is a string from old data
              let specialties: string[] = [];
              if (Array.isArray(docItem.specialties)) {
                specialties = docItem.specialties;
              } else if (typeof docItem.specialty === 'string' && docItem.specialty.trim() !== '') {
                specialties = [docItem.specialty];
              }
              
              const languages = docItem.languages || ['English'];
              const bio = docItem.fullBio || docItem.bio || '';

              return (
                <div
                  key={docItem.id}
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start pb-20 border-b border-[#D9D0C5] last:border-b-0 ${
                    isEven ? '' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Portrait Column: 4:5 Ratio */}
                  <div className={`lg:col-span-5 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#F4EFE6] border border-[#D9D0C5] shadow-editorial group">
                      <img
                        src={imageUrl}
                        alt={docItem.name}
                        className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-700 filter grayscale-[12%] group-hover:grayscale-0"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                        }}
                      />
                      {experience && (
                        <div className="absolute bottom-4 left-4 right-4 bg-[#0B1F2A]/90 p-3 text-center text-xs text-[#D9D0C5] uppercase tracking-widest font-semibold">
                          {experience} in Practice
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Biography & Details Column */}
                  <div className={`lg:col-span-7 ${isEven ? 'lg:order-2' : 'lg:order-1'} flex flex-col justify-between`}>
                    <div>
                      <p className="text-[12.5px] uppercase font-bold tracking-[0.2em] text-[#B39A68] mb-2">
                        {role}
                      </p>

                      <h2 className="font-serif text-[38px] sm:text-[46px] text-[#0B1F2A] leading-tight mb-4">
                        {docItem.name}
                      </h2>

                      <p className="font-sans text-[17px] text-[#5A6264] leading-[1.75] mb-8 whitespace-pre-wrap">
                        {bio}
                      </p>

                      {/* Clinical Specialties */}
                      {specialties.length > 0 && (
                        <div className="mb-8">
                          <h4 className="font-serif text-[20px] text-[#0B1F2A] mb-3">
                            Clinical Specialties &amp; Focus
                          </h4>
                          <div className="flex flex-wrap gap-2.5">
                            {specialties.map((spec, i) => (
                              <span
                                key={i}
                                className="px-3.5 py-1.5 bg-[#F4EFE6] text-[#0B1F2A] text-[13.5px] font-medium border border-[#D9D0C5]"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Languages Spoken */}
                      <div className="pt-4 border-t border-[#D9D0C5]/70 flex items-center gap-2 text-[14.5px] text-[#5A6264] mb-8">
                        <span className="font-semibold text-[#0B1F2A]">Languages:</span>
                        <span>{languages.join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <Link
                        to="/appointments"
                        className="inline-flex items-center justify-center px-7 py-3.5 bg-[#0B1F2A] hover:bg-[#153444] text-[#FCFBF8] text-[14px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                      >
                        Schedule with {(docItem.name || '').split(' ')[1] || 'Doctor'}
                      </Link>

                      <Link
                        to={`/providers/${slug}`}
                        className="inline-flex items-center gap-2 text-[14px] font-bold uppercase tracking-wider text-[#0B1F2A] hover:text-[#315B52] transition-colors group/link px-4 py-3"
                      >
                        <span className="border-b border-[#0B1F2A] group-hover/link:border-[#315B52]">Full Curriculum Vitae</span>
                        <ArrowRight size={15} className="text-[#B39A68] group-hover/link:translate-x-1.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Bottom CTA Banner */}
      <section className="bg-[#315B52] text-[#FCFBF8] py-20 sm:py-24">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h3 className="font-serif text-[38px] sm:text-[48px] lg:text-[56px] leading-[1.08] mb-6">
            Accepting New Adult Patients in Newark.
          </h3>
          <p className="font-sans text-[17px] sm:text-[19px] text-[#D9D0C5] max-w-xl mx-auto leading-[1.7] mb-10">
            Most appointments are accommodated within 48 to 72 hours. Same-day urgent consultations are also welcomed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/appointments"
              className="px-8 py-4 bg-[#FCFBF8] hover:bg-[#F4EFE6] text-[#0B1F2A] font-bold uppercase tracking-wider text-[14px] transition-colors"
            >
              Book Your Appointment
            </Link>
            <a
              href={`tel:${NEWARK_PRACTICE_INFO.rawPhone}`}
              className="px-7 py-4 border border-[#FCFBF8]/40 hover:border-[#FCFBF8] text-[#FCFBF8] font-semibold uppercase tracking-wider text-[14px] transition-colors"
            >
              Call (973) 412-9404
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
