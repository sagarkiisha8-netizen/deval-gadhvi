import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCmsData } from '../context/CmsContext';

// Neutral placeholder — shown only if a provider has no imageUrl at all.
// This is NOT a stock doctor image — just a grey silhouette.
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" fill="%23E8E4DC"><rect width="400" height="500"/><circle cx="200" cy="170" r="80" fill="%23C8C0B0"/><ellipse cx="200" cy="420" rx="140" ry="100" fill="%23C8C0B0"/></svg>';

export default function Providers() {
  // ── Single source of truth: Firestore providers collection via CmsContext ──
  const { providers } = useCmsData();

  // Only render active providers, sorted by displayOrder (already sorted in CmsContext)
  const activeProviders = providers.filter(p => p.isActive !== false);

  // Show first 3 on homepage
  const displayList = activeProviders.slice(0, 3);

  return (
    <section id="providers" className="bg-[#FCFBF8] py-16 sm:py-24 lg:py-32 border-b border-[#D9D0C5] overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Editorial Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 pb-6 border-b border-[#D9D0C5]"
        >
          <div>
            <p className="text-[11.5px] sm:text-[12px] uppercase font-bold tracking-[0.24em] text-[#B39A68] mb-2 sm:mb-3">
              Our Medical Team
            </p>
            <h2 className="font-serif text-[32px] sm:text-[46px] lg:text-[56px] xl:text-[60px] text-[#0B1F2A] leading-[1.08] sm:leading-[1.05] tracking-[-0.02em]">
              Meet the people behind your care.
            </h2>
          </div>

          <Link
            to="/providers"
            className="inline-flex items-center gap-2 text-[13.5px] sm:text-[14.5px] font-bold uppercase tracking-wider text-[#0B1F2A] hover:text-[#315B52] transition-colors group min-h-[44px]"
          >
            <span>View All Doctors &amp; Staff</span>
            <ArrowRight size={16} className="text-[#B39A68] group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Provider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-14">
          {displayList.map((provider, idx) => {
            // ── Canonical image: ONLY provider.imageUrl from Firestore ──
            const imageUrl = provider.imageUrl || PLACEHOLDER_IMAGE;

            // ── Canonical slug for profile link ──
            const slug = provider.slug || provider.id;

            // ── Credentials display ──
            const credentials = provider.credentials || '';
            const designation = provider.designation || provider.title || 'Physician';
            const specialty = provider.specialty || '';
            const shortBio = provider.shortBio || (provider.bio ? provider.bio.slice(0, 140) : '');

            return (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
                className="flex flex-col group"
              >
                {/* 4:5 Large Portrait Photography */}
                <div className="relative aspect-[4/5] overflow-hidden mb-5 sm:mb-6 bg-[#F4EFE6] rounded-xs">
                  <img
                    src={imageUrl}
                    alt={provider.name}
                    className="w-full h-full object-cover object-top group-hover:scale-104 transition-transform duration-700 filter grayscale-[12%] group-hover:grayscale-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // If R2 image fails to load, fall back to placeholder
                      (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                    }}
                  />
                </div>

                {/* Provider Name */}
                <h3 className="font-serif text-[24px] sm:text-[28px] lg:text-[30px] text-[#0B1F2A] leading-snug mb-1.5 group-hover:text-[#315B52] transition-colors">
                  {provider.name}
                </h3>

                {/* Credentials & Designation */}
                <p className="font-sans text-[12px] sm:text-[13px] font-bold uppercase tracking-widest text-[#B39A68] mb-2">
                  {credentials}{credentials && designation ? ' • ' : ''}{designation}
                </p>

                {/* Specialty */}
                <p className="font-sans text-[14px] sm:text-[15px] text-[#5A6264] leading-relaxed mb-4 line-clamp-2">
                  {specialty}
                </p>

                {/* View Profile Link */}
                <div>
                  <Link
                    to={`/providers/${slug}`}
                    className="inline-flex items-center gap-2 text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-[#0B1F2A] hover:text-[#315B52] transition-colors group/link min-h-[44px]"
                  >
                    <span className="border-b border-[#0B1F2A] group-hover/link:border-[#315B52]">View Physician Profile</span>
                    <ArrowRight size={15} className="text-[#B39A68] group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
