import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCmsData } from '../context/CmsContext';
import { DEFAULT_PROVIDERS } from '../data/defaultCmsData';
import { getProviderImageSrc, normalizeProviderKey } from '../utils/providerImages';

export interface ProviderItem {
  id: string;
  slug: string;
  name: string;
  credentials: string;
  designation: string;
  specialty: string;
  shortBio: string;
  image: string;
  languages: string[];
}

export default function Providers() {
  const { providers: dynamicProviders, getSiteMedia } = useCmsData();

  // Deduplicate and resolve canonical provider cards for homepage display
  const displayList = useMemo(() => {
    const rawList = (dynamicProviders && dynamicProviders.length > 0) ? dynamicProviders : DEFAULT_PROVIDERS;

    // Deduplicate by normalized key (e.g. prahlad-gadhavi vs prahlad-gadhvi)
    const canonicalMap = new Map<string, any>();
    rawList.forEach((p) => {
      // Exclude hidden or inactive doctors
      if (p.showOnHomepage === false || p.isActive === false) return;

      const key = normalizeProviderKey(p.id || p.slug || p.name);
      if (!canonicalMap.has(key)) {
        canonicalMap.set(key, p);
      } else {
        // Prefer record with valid image or newer update
        const existing = canonicalMap.get(key);
        const existingTime = new Date(existing.updatedAt || 0).getTime();
        const currTime = new Date(p.updatedAt || 0).getTime();
        if (currTime > existingTime || (!existing.imageUrl && p.imageUrl)) {
          canonicalMap.set(key, { ...existing, ...p });
        }
      }
    });

    const dedupedList = Array.from(canonicalMap.values());
    // Sort by displayOrder
    dedupedList.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

    return dedupedList.map((dp) => {
      const canonicalKey = normalizeProviderKey(dp.id || dp.slug || dp.name);
      const mediaItem = getSiteMedia('providers', 'doctors', dp.id) ||
        getSiteMedia('providers', 'doctors', `dr-${canonicalKey}`) ||
        getSiteMedia('providers', dp.id, 'portrait');

      // Resolve strictly using centralized provider images with homepage override priority
      const image = getProviderImageSrc(dp, { forHomepage: true });

      return {
        id: dp.id,
        slug: dp.slug || dp.id,
        name: dp.name,
        credentials: dp.credentials || 'MD',
        designation: dp.designation || dp.title || 'Physician',
        specialty: dp.specialty || 'Internal Medicine',
        shortBio: dp.shortBio || dp.bio?.slice(0, 140) || '',
        image,
        altText: dp.altText || mediaItem?.altText || dp.name,
        mediaItem,
        languages: dp.languages || ['English', 'Spanish']
      };
    });
  }, [dynamicProviders, getSiteMedia]);

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
            <span>View All Doctors & Staff</span>
            <ArrowRight size={16} className="text-[#B39A68] group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Horizontal Editorial Portraits (NO White Box, NO Card Border) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-14">
          {displayList.slice(0, 3).map((docItem, idx) => (
            <motion.div 
              key={docItem.id} 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: idx * 0.12 }}
              className="flex flex-col group"
            >
              
              {/* 4:5 Large Portrait Photography */}
              <div className="relative aspect-[4/5] overflow-hidden mb-5 sm:mb-6 bg-[#F4EFE6] rounded-xs">
                <img
                  src={docItem.image}
                  alt={docItem.altText}
                  className="w-full h-full group-hover:scale-104 transition-transform duration-700 filter grayscale-[12%] group-hover:grayscale-0"
                  style={{
                    objectFit: (docItem.mediaItem?.objectFit as any) || 'cover',
                    objectPosition: docItem.mediaItem?.position || 'center 20%'
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Provider Name Below */}
              <h3 className="font-serif text-[24px] sm:text-[28px] lg:text-[30px] text-[#0B1F2A] leading-snug mb-1.5 group-hover:text-[#315B52] transition-colors">
                {docItem.name}
              </h3>

              {/* Credentials & Specialty */}
              <p className="font-sans text-[12px] sm:text-[13px] font-bold uppercase tracking-widest text-[#B39A68] mb-2">
                {docItem.credentials} • {docItem.designation}
              </p>

              <p className="font-sans text-[14px] sm:text-[15px] text-[#5A6264] leading-relaxed mb-4 line-clamp-2">
                {docItem.specialty}
              </p>

              {/* View Profile Link */}
              <div>
                <Link
                  to={`/providers/${docItem.slug}`}
                  className="inline-flex items-center gap-2 text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-[#0B1F2A] hover:text-[#315B52] transition-colors group/link min-h-[44px]"
                >
                  <span className="border-b border-[#0B1F2A] group-hover/link:border-[#315B52]">View Physician Profile</span>
                  <ArrowRight size={15} className="text-[#B39A68] group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
