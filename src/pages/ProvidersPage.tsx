import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { useCmsData } from '../context/CmsContext';
import { DEFAULT_PROVIDERS } from '../data/defaultCmsData';
import { getProviderImage, getProviderImageSrc, normalizeProviderKey } from '../utils/providerImages';

export default function ProvidersPage() {
  const { providers: cmsProviders, siteMedia } = useCmsData();

  // Build provider list: DEFAULT_PROVIDERS as base, merged with CMS data strictly by id/slug
  const providers = useMemo(() => {
    return DEFAULT_PROVIDERS.map((def) => {
      const defKey = normalizeProviderKey(def.id || def.slug);
      const cmsDoc = cmsProviders.find((p) => normalizeProviderKey(p.id || p.slug) === defKey);
      
      const resolvedImage = getProviderImage(cmsDoc || def);
      const item = {
        ...def,
        name: cmsDoc?.name || def.name,
        title: cmsDoc?.title || def.title,
        image: resolvedImage,
        imageUrl: resolvedImage,
        bio: cmsDoc?.fullBio || cmsDoc?.bio || def.bio,
        fullBio: cmsDoc?.fullBio || def.fullBio,
        specialties: (cmsDoc as any)?.specialties?.length ? (cmsDoc as any).specialties : def.specialties,
        languages: cmsDoc?.languages?.length ? cmsDoc.languages : def.languages,
        updatedAt: (cmsDoc as any)?.updatedAt || (def as any)?.updatedAt,
      };

      if (process.env.NODE_ENV !== 'production') {
        console.log({
          provider: item.name,
          id: item.id,
          slug: item.slug,
          image: item.image
        });
      }

      return item;
    });
  }, [cmsProviders, siteMedia]);

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

      {/* 1. Header Hero: Warm Ivory Editorial Hero */}
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

      {/* 2. Editorial Provider Gallery (Large 4:5 Portrait Photography, NO white cards or borders) */}
      <section className="py-24 sm:py-28 lg:py-32 border-b border-[#D9D0C5]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
          
          <div className="space-y-20 lg:space-y-24">
            {providers.map((docItem, index) => {
              const isEven = index % 2 === 0;
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
                        src={getProviderImageSrc(docItem)}
                        alt={docItem.name}
                        className="w-full h-full group-hover:scale-103 transition-transform duration-700"
                        style={{ objectFit: 'cover', objectPosition: 'center top' }}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-4 left-4 right-4 bg-[#0B1F2A]/90 p-3 text-center text-xs text-[#D9D0C5] uppercase tracking-widest font-semibold">
                        {docItem.experienceYears ? `${docItem.experienceYears}+ Years Experience` : (docItem as any).experience || ''}
                      </div>
                    </div>
                  </div>

                  {/* Biography & Details Column */}
                  <div className={`lg:col-span-7 ${isEven ? 'lg:order-2' : 'lg:order-1'} flex flex-col justify-between`}>
                    <div>
                      <p className="text-[12.5px] uppercase font-bold tracking-[0.2em] text-[#B39A68] mb-2">
                        {docItem.title || (docItem as any).role}
                      </p>

                      <h2 className="font-serif text-[38px] sm:text-[46px] text-[#0B1F2A] leading-tight mb-4">
                        {docItem.name}
                      </h2>

                      <p className="font-sans text-[17px] text-[#5A6264] leading-[1.75] mb-8">
                        {docItem.fullBio || docItem.bio}
                      </p>

                      {/* Clinical Specialties */}
                      <div className="mb-8">
                        <h4 className="font-serif text-[20px] text-[#0B1F2A] mb-3">
                          Clinical Specialties & Focus
                        </h4>
                        <div className="flex flex-wrap gap-2.5">
                          {docItem.specialties.map((spec, i) => (
                            <span
                              key={i}
                              className="px-3.5 py-1.5 bg-[#F4EFE6] text-[#0B1F2A] text-[13.5px] font-medium border border-[#D9D0C5]"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Languages Spoken */}
                      <div className="pt-4 border-t border-[#D9D0C5]/70 flex items-center gap-2 text-[14.5px] text-[#5A6264] mb-8">
                        <span className="font-semibold text-[#0B1F2A]">Languages:</span>
                        <span>{docItem.languages.join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <Link
                        to="/appointments"
                        className="inline-flex items-center justify-center px-7 py-3.5 bg-[#0B1F2A] hover:bg-[#153444] text-[#FCFBF8] text-[14px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                      >
                        Schedule with {docItem.name.split(' ')[1] || 'Doctor'}
                      </Link>

                      <Link
                        to={`/providers/${docItem.slug}`}
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

    </div>
  );
}
