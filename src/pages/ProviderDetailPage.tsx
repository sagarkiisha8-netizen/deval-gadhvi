import React, { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import { useCmsData } from '../context/CmsContext';
import { DEFAULT_PROVIDERS } from '../data/defaultCmsData';
import { getProviderImage, getProviderImageSrc, normalizeProviderKey } from '../utils/providerImages';

// ─── Single canonical master data for all three providers ────────────────────
// This is the ONLY source of truth for provider detail pages.
// All data is keyed strictly by slug (same slug used on the cards and routes).
interface ProviderDetailRecord {
  id: string;
  slug: string;
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
  updatedAt?: any; // cache-busting token from Firestore
}

const PROVIDER_DETAIL_DATA: Record<string, ProviderDetailRecord> = {
  'prahlad-gadhavi': {
    id: 'dr-prahlad-gadhvi',
    slug: 'dr-prahlad-gadhvi',
    name: 'Dr. Prahlad Gadhavi',
    role: 'Primary Care Physician',
    image: 'https://framerusercontent.com/images/aU1QUlSKO9mpYg2rCyxW7d2q0.png?width=898&height=1194',
    experience: '20 years',
    qualifications: 'MBBS, MD',
    location: '337, Bloomfield Avenue, Newark, NJ-07107',
    phone: '(973) 412-9404',
    email: 'medicalnewark@gmail.com',
    about: "Dr. Prahlad Gadhavi is a board-certified Internal Medicine Specialist at Newark Medical Associates. He earned his bachelor's degree in Medicine and Surgery at B.J. Medical College in Ahmedabad, graduating with honors in 2003. He completed his residency in Internal Medicine at Mount Sinai and Beth Israel Medical Centers in New York City.",
    experienceDetail: 'With more than 20 years of diverse experience in Internal Medicine, Dr. Gadhavi has built a strong reputation for providing compassionate and comprehensive care. His patients trust him for his thorough approach and commitment to helping them understand their treatment options.',
    specialities: [
      'Annual & preventative physical exams',
      'Acute/same-day urgent care visits',
      'Chronic disease management (hypertension, diabetes, etc.)',
      'Blood testing & lab work',
      'EKG & basic cardiac risk screening',
      'Pre-operative exams',
      'Specialist referral coordination'
    ]
  },
  'deval-gadhvi': {
    id: 'dr-deval-gadhvi',
    slug: 'dr-deval-gadhvi',
    name: 'Dr. Deval Gadhvi',
    role: 'Medical Director - Primary Care Physician',
    image: '/newark_internal_medicine_4.webp',
    experience: '18 years',
    qualifications: 'MBBS, MD',
    location: '337, Bloomfield Avenue, Newark, NJ-07107',
    phone: '(973) 412-9404',
    email: 'medicalnewark@gmail.com',
    about: "Dr. Deval Gadhvi is a board-certified Internal Medicine Specialist and Medical Director at Newark Medical Associates. She has dedicated her career to preventative healthcare, chronic metabolic management, and comprehensive women's health.",
    experienceDetail: 'With over 18 years of clinical leadership and clinical excellence, Dr. Deval Gadhvi is widely respected for her empathetic patient listening, personalized treatment strategies, and proactive wellness programs.',
    specialities: [
      'Comprehensive adult primary care',
      "Women's wellness & annual examinations",
      'Metabolic syndrome & weight management',
      'Hypertension & diabetes therapeutic care',
      'In-office laboratory & screening coordination',
      'Long-term preventative wellness'
    ]
  },
  'sankalp-pathak': {
    id: 'dr-sankalp-pathak',
    slug: 'dr-sankalp-pathak',
    name: 'Dr. Sankalp Pathak',
    role: 'Cardiology Consultant',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800',
    experience: '15 years',
    qualifications: 'MD, FACC',
    location: '337, Bloomfield Avenue, Newark, NJ-07107',
    phone: '(973) 412-9404',
    email: 'medicalnewark@gmail.com',
    about: 'Dr. Sankalp Pathak is a board-certified Cardiologist and clinical consultant at Newark Medical Associates, focusing on non-invasive cardiovascular imaging and proactive cardiac disease prevention.',
    experienceDetail: 'With 15 years of specialized cardiology practice, Dr. Pathak brings advanced diagnostic evaluation, stress testing, and echocardiography to our outpatient Newark clinic.',
    specialities: [
      'Comprehensive cardiac risk assessments',
      '12-lead EKG interpretation & monitoring',
      'Echocardiogram (ECHO) ultrasound diagnostics',
      'Hypertension & dyslipidemia management',
      'Pre-operative cardiac clearances'
    ]
  }
};

export default function ProviderDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { providers: cmsProviders, siteMedia } = useCmsData();

  // 1. Resolve canonical key strictly by slug/id (prahlad-gadhavi, deval-gadhvi, sankalp-pathak)
  const canonicalKey = normalizeProviderKey(slug || '');

  // 2. Get base data from our single source of truth
  const baseData = PROVIDER_DETAIL_DATA[canonicalKey];

  // 3. Merge with CMS provider data (if available) using normalized key match ONLY
  const doctor = useMemo((): ProviderDetailRecord | null => {
    if (!baseData) return null;

    // Find CMS provider strictly by canonical key — never by index
    const cmsProvider = cmsProviders.find(
      (p) => normalizeProviderKey(p.id || p.slug) === canonicalKey
    );

    const mediaId = `providers-${canonicalKey === 'prahlad-gadhavi' ? 'dr-prahlad' : canonicalKey === 'deval-gadhvi' ? 'dr-deval' : 'dr-sankalp'}`;
    const centralizedImage = siteMedia?.[mediaId]?.url;
    const resolvedImage = centralizedImage || getProviderImage(cmsProvider || baseData);

    const item = {
      ...baseData,
      name: cmsProvider?.name || baseData.name,
      role: cmsProvider?.title || (cmsProvider as any)?.role || baseData.role,
      image: resolvedImage,
      updatedAt: (cmsProvider as any)?.updatedAt || (baseData as any)?.updatedAt,
      experience: cmsProvider?.experienceYears
        ? `${cmsProvider.experienceYears} years`
        : baseData.experience,
      qualifications: cmsProvider?.credentials || baseData.qualifications,
      about: cmsProvider?.fullBio || cmsProvider?.bio || baseData.about,
      phone: cmsProvider?.phone || baseData.phone,
      email: cmsProvider?.email || baseData.email,
      specialities:
        (cmsProvider as any)?.specialties &&
        (cmsProvider as any).specialties.length > 0
          ? (cmsProvider as any).specialties
          : baseData.specialities,
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
  }, [baseData, cmsProviders, siteMedia, canonicalKey]);


  // 4. If no matching provider found, redirect to list page
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
      <section className="pt-28 pb-6 sm:pt-32 sm:pb-8">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Left Column: Doctor Photo – always uses doctor.image, no other source */}
            <div className="md:col-span-5 flex justify-start">
              <div className="w-full max-w-[360px] sm:max-w-[380px] aspect-[4/4.3] rounded-[26px] sm:rounded-[28px] overflow-hidden bg-slate-100 shadow-xs border border-slate-200/80">
                <img
                  src={getProviderImageSrc(doctor)}
                  alt={`${doctor.name} - ${doctor.role}`}
                  className="w-full h-full"
                  style={{ objectFit: 'cover', objectPosition: 'center top' }}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // On load error, fall back to the canonical default for this slug only
                    const fallback = PROVIDER_DETAIL_DATA[canonicalKey]?.image;
                    if (fallback && e.currentTarget.src !== fallback) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                />
              </div>
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
                <div className="grid grid-cols-12 gap-4 items-baseline">
                  <span className="col-span-4 sm:col-span-3 text-slate-900 font-normal">
                    Experience
                  </span>
                  <span className="col-span-8 sm:col-span-9 text-slate-600 font-normal">
                    {doctor.experience}
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-4 items-baseline">
                  <span className="col-span-4 sm:col-span-3 text-slate-900 font-normal">
                    Qualifications
                  </span>
                  <span className="col-span-8 sm:col-span-9 text-slate-600 font-normal">
                    {doctor.qualifications}
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-4 items-baseline">
                  <span className="col-span-4 sm:col-span-3 text-slate-900 font-normal">
                    Location
                  </span>
                  <span className="col-span-8 sm:col-span-9 text-slate-600 font-normal">
                    {doctor.location}
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-4 items-baseline">
                  <span className="col-span-4 sm:col-span-3 text-slate-900 font-normal">
                    Phone No.
                  </span>
                  <span className="col-span-8 sm:col-span-9 text-slate-600 font-normal">
                    <a 
                      href={`tel:${doctor.phone.replace(/[^0-9]/g, '')}`} 
                      className="hover:text-blue-600 transition-colors"
                    >
                      {doctor.phone}
                    </a>
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-4 items-baseline">
                  <span className="col-span-4 sm:col-span-3 text-slate-900 font-normal">
                    Email Id
                  </span>
                  <span className="col-span-8 sm:col-span-9 text-slate-600 font-normal">
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

      {/* Bottom Blue Contact Banner */}
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
