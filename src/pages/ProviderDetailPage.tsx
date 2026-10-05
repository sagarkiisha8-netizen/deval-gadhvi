import React, { useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Mail, MapPin, ArrowLeft } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import { useCmsData } from '../context/CmsContext';

// Neutral placeholder
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" fill="%23E8E4DC"><rect width="400" height="500"/><circle cx="200" cy="170" r="80" fill="%23C8C0B0"/><ellipse cx="200" cy="420" rx="140" ry="100" fill="%23C8C0B0"/></svg>';

export default function ProviderDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { providers, loading } = useCmsData();

  // Find provider exactly matching the slug (or fallback id matching)
  const provider = useMemo(() => {
    if (!slug) return null;
    const cleanSlug = slug.toLowerCase().trim();
    return providers.find(p => {
      // Direct matches
      if (p.slug === cleanSlug || p.id === cleanSlug) return true;
      // Handle the Prahlad legacy slug collisions
      if (cleanSlug.includes('prahlad') && (p.id.includes('prahlad') || p.slug?.includes('prahlad'))) return true;
      return false;
    }) || null;
  }, [providers, slug]);

  if (loading) {
    return <div className="min-h-screen bg-[#FCFBF8] flex items-center justify-center">Loading provider details...</div>;
  }

  if (!provider) {
    return <Navigate to="/providers" replace />;
  }

  const imageUrl = provider.imageUrl || PLACEHOLDER_IMAGE;
  const role = provider.designation || provider.title || 'Physician';
  const experience = provider.experienceYears ? `${provider.experienceYears}+ years` : '';
  const qualifications = provider.credentials || '';
  const bio = provider.fullBio || provider.bio || '';
  const location = '337 Bloomfield Avenue, Newark, NJ 07107'; // Canonical location
  const phone = provider.phone || '(973) 412-9404';
  const email = provider.email || 'medicalnewark@gmail.com';

  let specialties: string[] = [];
  if (Array.isArray(provider.specialties)) {
    specialties = provider.specialties;
  } else if (typeof provider.specialty === 'string' && provider.specialty.trim() !== '') {
    specialties = [provider.specialty];
  }

  return (
    <div className="bg-[#FCFBF8] text-[#252A2B] min-h-screen pb-20">
      <SeoHead
        title={`${provider.name} | ${role} in Newark NJ`}
        description={bio.slice(0, 150) + '...'}
        canonicalUrl={`https://newarkmed.com/providers/${provider.slug || provider.id}`}
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20">
        
        {/* Back Link */}
        <div className="mb-8 lg:mb-12">
          <Link
            to="/providers"
            className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-[#5A6264] hover:text-[#315B52] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to All Providers
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left Column: Photo & Contact Box */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] bg-[#F4EFE6] border border-[#D9D0C5] mb-8 shadow-editorial overflow-hidden">
              <img
                src={imageUrl}
                alt={provider.name}
                className="w-full h-full object-cover object-top filter grayscale-[12%]"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                }}
              />
            </div>

            <div className="bg-white p-8 border border-[#D9D0C5] shadow-sm">
              <h3 className="font-serif text-[24px] text-[#0B1F2A] mb-6">Contact &amp; Scheduling</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="text-[#B39A68] mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-[14px] font-bold text-[#0B1F2A] mb-1">Primary Location</p>
                    <p className="text-[15px] text-[#5A6264] leading-relaxed">
                      {location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="text-[#B39A68] mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-[14px] font-bold text-[#0B1F2A] mb-1">Direct Contact</p>
                    <p className="text-[15px] text-[#5A6264]">{phone}</p>
                    <p className="text-[15px] text-[#5A6264]">{email}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-[#D9D0C5]">
                <Link
                  to="/appointments"
                  className="flex items-center justify-center w-full py-4 bg-[#0B1F2A] hover:bg-[#153444] text-white text-[13px] font-bold uppercase tracking-wider transition-colors"
                >
                  Book Appointment
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Bio & Details */}
          <div className="lg:col-span-7 pt-4 lg:pt-0">
            <p className="text-[13px] uppercase font-bold tracking-[0.2em] text-[#B39A68] mb-3">
              {role}
            </p>
            <h1 className="font-serif text-[42px] sm:text-[52px] text-[#0B1F2A] leading-[1.05] mb-6">
              {provider.name}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-[14px] font-semibold text-[#5A6264] mb-10 pb-10 border-b border-[#D9D0C5]">
              {qualifications && <span>{qualifications}</span>}
              {qualifications && experience && <span className="text-[#D9D0C5]">|</span>}
              {experience && <span>{experience} Experience</span>}
            </div>

            <div className="prose prose-lg prose-p:text-[#5A6264] prose-p:leading-[1.8] prose-p:text-[17px] max-w-none mb-12 whitespace-pre-wrap">
              {bio}
            </div>

            {specialties.length > 0 && (
              <div className="bg-[#F4EFE6] p-8 lg:p-10 border border-[#D9D0C5]">
                <h3 className="font-serif text-[28px] text-[#0B1F2A] mb-6">
                  Clinical Specialties
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {specialties.map((spec, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-2 w-1.5 h-1.5 bg-[#B39A68] rounded-full flex-shrink-0" />
                      <span className="text-[16px] text-[#5A6264] leading-snug">{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
