import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { getDb } from '../lib/firebase';
import SeoHead from '../components/SeoHead';
import { useCmsData } from '../context/CmsContext';

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

const DEFAULT_DOCTOR_DATA: Record<string, DoctorDetailData> = {
  'dr-prahlad-gadhvi': {
    name: 'Dr. Prahlad Gadhavi',
    role: 'Primary Care Physician',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
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
  'dr-prahlad-gadhavi': {
    name: 'Dr. Prahlad Gadhavi',
    role: 'Primary Care Physician',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
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
  'dr-deval-gadhvi': {
    name: 'Dr. Deval Gadhvi',
    role: 'Medical Director - Primary Care Physician',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800',
    experience: '18 years',
    qualifications: 'MBBS, MD',
    location: '337, Bloomfield Avenue, Newark, NJ-07107',
    phone: '(973) 412-9404',
    email: 'medicalnewark@gmail.com',
    about: 'Dr. Deval Gadhvi is a board-certified Internal Medicine Specialist and Medical Director at Newark Medical Associates. She has dedicated her career to preventative healthcare, chronic metabolic management, and comprehensive women’s health.',
    experienceDetail: 'With over 18 years of clinical leadership and clinical excellence, Dr. Deval Gadhvi is widely respected for her empathetic patient listening, personalized treatment strategies, and proactive wellness programs.',
    specialities: [
      'Comprehensive adult primary care',
      'Women’s wellness & annual examinations',
      'Metabolic syndrome & weight management',
      'Hypertension & diabetes therapeutic care',
      'In-office laboratory & screening coordination',
      'Long-term preventative wellness'
    ]
  },
  'dr-sankalp-pathak': {
    name: 'Dr. Sankalp Pathak',
    role: 'Cardiology Consultant',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=800',
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
  const { providers, getMediaUrl, getSiteMedia } = useCmsData();

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

  const isPrahlad = normalizedSlug === 'dr-prahlad-gadhavi' || normalizedSlug === 'dr-prahlad-gadhvi';

  // Live state for doctor profile & photo to ensure uploaded images render immediately
  const [liveDoctorProfile, setLiveDoctorProfile] = useState<any>(() => {
    try {
      const cached = localStorage.getItem('newark_doctor_profile');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });

  const [liveDoctorPhoto, setLiveDoctorPhoto] = useState<string | null>(() => {
    try {
      return localStorage.getItem('newark_doctor_photo');
    } catch (e) {
      return null;
    }
  });

  // Listen to storage events & Firestore live doc for instant photo sync
  useEffect(() => {
    const handleStorage = () => {
      try {
        const cached = localStorage.getItem('newark_doctor_profile');
        if (cached) setLiveDoctorProfile(JSON.parse(cached));
      } catch (e) {}
    };

    window.addEventListener('storage', handleStorage);

    let unsub: (() => void) | undefined;
    if (isPrahlad) {
      try {
        const db = getDb();
        unsub = onSnapshot(doc(db, 'doctor_profile', 'main'), (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setLiveDoctorProfile(data);
            if (data?.photoUrl) {
              setLiveDoctorPhoto(data.photoUrl);
            }
          }
        }, (err) => console.warn('Live doctor profile snap:', err));
      } catch (e) {}
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (unsub) unsub();
    };
  }, [isPrahlad]);

  // Find dynamic provider from CMS or fallback with flexible ID matching
  const dynamicProvider = useMemo(() => {
    return providers.find(p => 
      p.slug === slug || 
      p.id === slug || 
      p.slug === normalizedSlug || 
      p.id === normalizedSlug ||
      (isPrahlad && (
        p.id === 'dr-prahlad-gadhvi' || 
        p.id === 'dr-prahlad-gadhavi' || 
        p.slug === 'dr-prahlad-gadhvi' || 
        p.slug === 'dr-prahlad-gadhavi' || 
        p.name?.toLowerCase().includes('prahlad')
      ))
    ) || null;
  }, [providers, slug, normalizedSlug, isPrahlad]);

  const defaultDoctor = DEFAULT_DOCTOR_DATA[normalizedSlug] || DEFAULT_DOCTOR_DATA['dr-prahlad-gadhavi'];

  // Final doctor data merged with CMS and live photo
  const doctor: DoctorDetailData = useMemo(() => {
    const cmsSiteMediaUrl = getMediaUrl('providers', 'doctors', normalizedSlug) ||
      getMediaUrl('providers', 'doctors', (slug || '').replace('dr-', '')) ||
      getMediaUrl('providers', 'doctors', slug || '') ||
      getMediaUrl('providers', normalizedSlug, 'portrait') ||
      getMediaUrl('providers', slug || '', 'portrait') ||
      getMediaUrl('providers', (slug || '').replace('dr-', ''), 'portrait');

    const effectivePhoto = 
      cmsSiteMediaUrl ||
      dynamicProvider?.photoUrl || 
      dynamicProvider?.imageUrl || 
      dynamicProvider?.image ||
      (isPrahlad ? (liveDoctorPhoto || liveDoctorProfile?.photoUrl) : undefined) ||
      defaultDoctor.image;

    if (dynamicProvider) {
      return {
        name: (isPrahlad && liveDoctorProfile?.name) || dynamicProvider.name || defaultDoctor.name,
        role: (isPrahlad && liveDoctorProfile?.designation) || dynamicProvider.title || dynamicProvider.role || defaultDoctor.role,
        image: effectivePhoto,
        experience: dynamicProvider.experienceYears ? `${dynamicProvider.experienceYears} years` : defaultDoctor.experience,
        qualifications: (isPrahlad && liveDoctorProfile?.qualification) || dynamicProvider.credentials || defaultDoctor.qualifications,
        location: (isPrahlad && liveDoctorProfile?.clinicAddress) || defaultDoctor.location,
        phone: (isPrahlad && liveDoctorProfile?.phone) || dynamicProvider.phone || defaultDoctor.phone,
        email: (isPrahlad && liveDoctorProfile?.email) || dynamicProvider.email || defaultDoctor.email,
        about: (isPrahlad && liveDoctorProfile?.biography) || dynamicProvider.fullBio || dynamicProvider.bio || defaultDoctor.about,
        experienceDetail: defaultDoctor.experienceDetail,
        specialities: dynamicProvider.specialties && dynamicProvider.specialties.length > 0 
          ? dynamicProvider.specialties 
          : ((isPrahlad && liveDoctorProfile?.expertise) || defaultDoctor.specialities)
      };
    }

    return {
      ...defaultDoctor,
      name: (isPrahlad && liveDoctorProfile?.name) || defaultDoctor.name,
      role: (isPrahlad && liveDoctorProfile?.designation) || defaultDoctor.role,
      image: effectivePhoto,
      qualifications: (isPrahlad && liveDoctorProfile?.qualification) || defaultDoctor.qualifications,
      about: (isPrahlad && liveDoctorProfile?.biography) || defaultDoctor.about,
      location: (isPrahlad && liveDoctorProfile?.clinicAddress) || defaultDoctor.location,
      phone: (isPrahlad && liveDoctorProfile?.phone) || defaultDoctor.phone,
      email: (isPrahlad && liveDoctorProfile?.email) || defaultDoctor.email,
      specialities: (isPrahlad && liveDoctorProfile?.expertise) || defaultDoctor.specialities
    };
  }, [dynamicProvider, defaultDoctor, isPrahlad, liveDoctorPhoto, liveDoctorProfile]);

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
