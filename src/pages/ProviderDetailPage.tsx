import React, { useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import { useCmsData } from '../context/CmsContext';
import { DEFAULT_PROVIDERS } from '../data/defaultCmsData';
import { getProviderImage, getProviderImageSrc, normalizeProviderKey } from '../utils/providerImages';

interface DoctorDetailData {
  name: string;
  role: string;
  image: string;
  experience: string;
  qualifications: string;
  location: string;
  phone: string;
  email: string;
  about: string;
  experienceDetail: string;
  specialities: string[];
}

/**
 * Build DoctorDetailData from the canonical DEFAULT_PROVIDERS array.
 * This is the SINGLE SOURCE OF TRUTH for provider data.
 * Both the homepage (Providers.tsx) and this detail page read from the
 * same DEFAULT_PROVIDERS record, so the image — and every other field —
 * are always consistent across the site.
 */
function getDefaultDoctorData(normalizedSlug: string): DoctorDetailData | null {
  // Try to find by normalized key
  const canonicalKey = normalizeProviderKey(normalizedSlug);
  const found = DEFAULT_PROVIDERS.find((p) => {
    return (
      normalizeProviderKey(p.id) === canonicalKey ||
      normalizeProviderKey(p.slug) === canonicalKey ||
      normalizeProviderKey(p.name) === canonicalKey
    );
  }) || DEFAULT_PROVIDERS.find((p) => {
    // Fallback: fuzzy match the slug itself
    const pKey = normalizeProviderKey(p.id || p.slug || p.name);
    return normalizedSlug.includes(pKey) || pKey.includes(canonicalKey);
  });

  if (!found) return null;

  // Canonical image from the provider record (already correct in DEFAULT_PROVIDERS)
  const image = getProviderImage(found);

  return {
    name: found.name,
    role: found.title || found.specialty || 'Physician',
    image,
    experience: found.experienceYears ? `${found.experienceYears} years` : '',
    qualifications: found.credentials || 'MD',
    location: '337, Bloomfield Avenue, Newark, NJ-07107',
    phone: found.phone || '(973) 412-9404',
    email: found.email || 'medicalnewark@gmail.com',
    about: found.bio || found.fullBio || '',
    experienceDetail: found.fullBio || found.bio || '',
    specialities: (found.specialties && found.specialties.length > 0)
      ? found.specialties
      : (found.specialty ? [found.specialty] : ['Internal Medicine'])
  };
}

/** Fallback for completely unknown slugs */
const FALLBACK_DOCTOR_DATA: DoctorDetailData = {
  name: 'Our Physician',
  role: 'Primary Care Physician',
  image: 'https://pub-463524c5dd1e422ca67b4960ad60e690.r2.dev/providers/dr-prahlad-gadhavi/1791280065505-dr-prahlad-gadhavi.png',
  experience: '',
  qualifications: 'MD',
  location: '337, Bloomfield Avenue, Newark, NJ-07107',
  phone: '(973) 412-9404',
  email: 'medicalnewark@gmail.com',
  about: '',
  experienceDetail: '',
  specialities: ['Internal Medicine', 'Primary Care']
};

export default function ProviderDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { providers, getSiteMedia } = useCmsData();

  // Normalize slug
  const normalizedSlug = useMemo(() => {
    if (!slug) return '';
    const clean = slug.toLowerCase().trim();
    if (clean === 'prahlad-gadhvi' || clean === 'dr-prahlad-gadhvi' || clean === 'dr-prahlad-gadhavi' || clean === 'prahlad-gadhavi') {
      return 'dr-prahlad-gadhavi';
    }
    if (clean === 'deval-gadhvi' || clean === 'dr-deval-gadhvi') {
      return 'dr-deval-gadhvi';
    }
    if (clean === 'sankalp-pathak' || clean === 'dr-sankalp-pathak') {
      return 'dr-sankalp-pathak';
    }
    return clean;
  }, [slug]);

  // Find dynamic provider from CMS — match by id, slug, or name (no isPrahlad special-casing).
  // The providers Firestore collection is the SINGLE SOURCE OF TRUTH for all provider images.
  const dynamicProvider = useMemo(() => {
    const canonicalKey = normalizeProviderKey(normalizedSlug);
    return providers.find(p => {
      if (p.slug === slug || p.id === slug) return true;
      if (p.slug === normalizedSlug || p.id === normalizedSlug) return true;
      const pKey = normalizeProviderKey(p.id || p.slug || p.name || '');
      return pKey === canonicalKey;
    }) || null;
  }, [providers, slug, normalizedSlug]);

  // Derive default doctor data from DEFAULT_PROVIDERS (canonical fallback)
  const defaultDoctor = useMemo(
    () => getDefaultDoctorData(normalizedSlug) || FALLBACK_DOCTOR_DATA,
    [normalizedSlug]
  );

  // Final doctor data — image always comes from the providers collection (via dynamicProvider)
  // or from DEFAULT_PROVIDERS. Never from localStorage or a deprecated doctor_profile collection.
  const doctor: DoctorDetailData = useMemo(() => {
    // getProviderImageSrc applies cache-busting via updatedAt timestamp
    const effectivePhoto = dynamicProvider
      ? getProviderImageSrc(dynamicProvider)
      : getProviderImage(defaultDoctor);

    if (dynamicProvider) {
      return {
        name: dynamicProvider.name || defaultDoctor.name,
        role: dynamicProvider.title || (dynamicProvider as any).role || defaultDoctor.role,
        image: effectivePhoto,
        experience: dynamicProvider.experienceYears ? `${dynamicProvider.experienceYears} years` : defaultDoctor.experience,
        qualifications: dynamicProvider.credentials || defaultDoctor.qualifications,
        location: defaultDoctor.location,
        phone: dynamicProvider.phone || defaultDoctor.phone,
        email: dynamicProvider.email || defaultDoctor.email,
        about: dynamicProvider.fullBio || dynamicProvider.bio || defaultDoctor.about,
        experienceDetail: dynamicProvider.fullBio || dynamicProvider.bio || defaultDoctor.experienceDetail,
        specialities: dynamicProvider.specialties && dynamicProvider.specialties.length > 0
          ? dynamicProvider.specialties
          : defaultDoctor.specialities
      };
    }

    return { ...defaultDoctor, image: effectivePhoto };
  }, [dynamicProvider, defaultDoctor]);

  if (!doctor) {
    return <Navigate to="/providers" replace />;
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Providers', url: '/providers' },
    { name: doctor.name, url: `/providers/${slug}` }
  ];

  return (
    <div className="bg-white min-h-screen text-slate-800">
      <SeoHead
        title={`${doctor.name} - ${doctor.role} | Newark Medical Associates`}
        description={`${doctor.name}, ${doctor.role} at Newark Medical Associates. ${doctor.experience} experience. Location: ${doctor.location}. Phone: ${doctor.phone}.`}
        keywords={[
          doctor.name,
          `${doctor.name} Newark NJ`,
          'doctor Newark NJ',
          'primary care doctor Newark'
        ]}
        canonicalUrl={`https://newarkmed.com/providers/${slug}`}
        breadcrumbs={breadcrumbs}
      />

      {/* Top Main Profile Section */}
      <section className="pt-8 pb-6 sm:pt-12 sm:pb-8">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Left Column: Doctor Photo */}
            <div className="md:col-span-5 flex justify-start">
              {(() => {
                const mediaItem = getSiteMedia('providers', 'doctors', normalizedSlug) ||
                  getSiteMedia('providers', 'doctors', (slug || '').replace('dr-', '')) ||
                  getSiteMedia('providers', 'doctors', slug || '') ||
                  getSiteMedia('providers', normalizedSlug, 'portrait') ||
                  getSiteMedia('providers', slug || '', 'portrait') ||
                  getSiteMedia('providers', (slug || '').replace('dr-', ''), 'portrait');
                return (
                  <div className="w-full max-w-[360px] sm:max-w-[380px] aspect-[4/4.3] rounded-[26px] sm:rounded-[28px] overflow-hidden bg-slate-100 shadow-xs border border-slate-200/80">
                    <img
                      src={doctor.image}
                      alt={`${doctor.name} - ${doctor.role}`}
                      className="w-full h-full"
                      style={{
                        objectFit: (mediaItem?.objectFit as any) || 'cover',
                        objectPosition: mediaItem?.position || 'top'
                      }}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.src !== defaultDoctor.image) {
                          img.src = defaultDoctor.image;
                        }
                      }}
                    />
                  </div>
                );
              })()}
            </div>

            {/* Right Column: Name, Title & Key-Value Details */}
            <div className="md:col-span-7">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-slate-900 tracking-tight leading-tight">
                {doctor.name}
              </h1>

              <p className="text-slate-500 text-base sm:text-lg font-normal mt-1.5 mb-6">
                {doctor.role}
              </p>

              {/* Top Divider */}
              <div className="border-t border-slate-200/90 my-6" />

              {/* Two-Column Details Grid */}
              <div className="space-y-4 text-sm sm:text-[15px]">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 items-baseline">
                  <span className="sm:col-span-3 text-slate-900 font-normal">
                    Experience
                  </span>
                  <span className="sm:col-span-9 text-slate-600 font-normal">
                    {doctor.experience}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 items-baseline">
                  <span className="sm:col-span-3 text-slate-900 font-normal">
                    Qualifications
                  </span>
                  <span className="sm:col-span-9 text-slate-600 font-normal">
                    {doctor.qualifications}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 items-baseline">
                  <span className="sm:col-span-3 text-slate-900 font-normal">
                    Location
                  </span>
                  <span className="sm:col-span-9 text-slate-600 font-normal">
                    {doctor.location}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 items-baseline">
                  <span className="sm:col-span-3 text-slate-900 font-normal">
                    Phone No.
                  </span>
                  <span className="sm:col-span-9 text-slate-600 font-normal">
                    <a 
                      href={`tel:${doctor.phone.replace(/[^0-9]/g, '')}`} 
                      className="hover:text-blue-600 transition-colors"
                    >
                      {doctor.phone}
                    </a>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 items-baseline">
                  <span className="sm:col-span-3 text-slate-900 font-normal">
                    Email Id
                  </span>
                  <span className="sm:col-span-9 text-slate-600 font-normal">
                    <a 
                      href={`mailto:${doctor.email}`} 
                      className="hover:text-blue-600 transition-colors"
                    >
                      {doctor.email}
                    </a>
                  </span>
                </div>
              </div>

              {/* Bottom Divider */}
              <div className="border-t border-slate-200/90 my-6" />
            </div>

          </div>
        </div>
      </section>

      {/* Narrative Bio & Clinical Sections */}
      <section className="py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 space-y-10 sm:space-y-12">
          
          {/* About Section */}
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-[26px] font-semibold text-slate-900 tracking-tight">
              About:
            </h2>
            <p className="text-slate-600 leading-relaxed text-base sm:text-[17px] font-normal max-w-4xl">
              {doctor.about}
            </p>
          </div>

          {/* Experience Section */}
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-[26px] font-semibold text-slate-900 tracking-tight">
              Experience:
            </h2>
            <p className="text-slate-600 leading-relaxed text-base sm:text-[17px] font-normal max-w-4xl">
              {doctor.experienceDetail}
            </p>
          </div>

          {/* Specialities Section */}
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-[26px] font-semibold text-slate-900 tracking-tight">
              Specialities
            </h2>
            <div className="text-slate-600 leading-relaxed text-base sm:text-[17px] font-normal space-y-2 max-w-4xl">
              {doctor.specialities.map((item, idx) => (
                <p key={idx}>
                  {idx === 0 ? item : `- ${item}`}
                </p>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Bottom Blue Contact Banner matching screenshot */}
      <section className="bg-[#2563eb] text-white py-14 sm:py-16 px-6 sm:px-8 lg:px-12 mt-16 sm:mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-md">
            <div className="flex items-center gap-2 text-white/90 text-sm font-medium mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-white inline-block"></span>
              <span>Contact</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-[40px] font-bold text-white tracking-tight leading-[1.2]">
              Contact us for more information & get started
            </h2>
          </div>

          <div className="space-y-4 text-white text-base sm:text-[17px]">
            <a 
              href={`mailto:${doctor.email}`} 
              className="flex items-center gap-3.5 hover:text-white/90 transition-colors"
            >
              <Mail size={22} className="shrink-0 text-white" />
              <span>{doctor.email}</span>
            </a>
            <div className="flex items-center gap-3.5">
              <MapPin size={22} className="shrink-0 text-white" />
              <span>{doctor.location}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
