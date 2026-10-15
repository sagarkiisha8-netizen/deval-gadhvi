import React from 'react';
import { Phone, Mail, ShieldCheck } from 'lucide-react';
import { DEFAULT_PROVIDERS } from '../data/defaultCmsData';
import { useCmsData } from '../context/CmsContext';
import { getProviderImageSrc, normalizeProviderKey } from '../utils/providerImages';

export default function AppointmentBookingForm() {
  const { providers } = useCmsData();
  const list = (providers && providers.length > 0) ? providers : DEFAULT_PROVIDERS;

  return (
    <div className="bg-white border border-[#D9D0C5] p-6 sm:p-10 shadow-editorial space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-[#315B52] bg-[#F4EFE6] px-3 py-1 inline-block">
          Direct Physician Scheduling
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#0B1F2A]">
          Choose Your Physician & Call to Book
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          We have discontinued online appointment booking forms to better protect your patient privacy. Please select your physician below and call directly to schedule your consultation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {list.map((doc) => {
          const isSankalp = doc.id.includes('sankalp') || doc.name.toLowerCase().includes('sankalp');
          const phone = isSankalp ? '(973) 370-5259' : (doc.phone || '(973) 412-9404');
          const email = isSankalp ? 'mycardiovascularclinic@mycardiovascularclinic.com' : (doc.email || 'medicalnewark@gmail.com');
          const phoneHref = `tel:${phone.replace(/[^0-9]/g, '')}`;
          const emailHref = `mailto:${email}`;
          const img = getProviderImageSrc(doc);
          const isDisha = doc.id === 'dr-disha-patel' || normalizeProviderKey(doc.id) === 'dr-disha-patel' || !img;

          return (
            <div key={doc.id} className="bg-[#FCFBF8] border border-[#D9D0C5]/80 p-6 flex flex-col justify-between rounded-sm shadow-xs hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="aspect-[4/4.5] overflow-hidden bg-[#F4EFE6] border border-[#D9D0C5] rounded-xs">
                  {isDisha ? (
                    <div className="w-full h-full p-6 flex flex-col justify-between bg-[#F4EFE6]">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 bg-[#0B1F2A] text-[#F4EFE6] text-[10px] font-semibold uppercase tracking-widest mb-2">
                          Clinical Specialist
                        </span>
                        <h4 className="font-serif text-lg text-[#0B1F2A] mb-1">{doc.name}</h4>
                        <p className="text-xs text-[#B39A68] font-bold uppercase tracking-wider">{doc.credentials || 'PT, DPT, GCS'}</p>
                      </div>
                      <p className="text-xs text-[#5A6264] italic">
                        "Evidence-based physical therapy & functional recovery without portrait display."
                      </p>
                    </div>
                  ) : (
                    <img
                      src={img}
                      alt={doc.name}
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl text-[#0B1F2A] mb-1">
                    {doc.name}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#B39A68] mb-2">
                    {doc.credentials || 'MD'} • {doc.title || doc.specialty || 'Physician'}
                  </p>
                  <p className="text-slate-600 text-xs sm:text-sm line-clamp-2">
                    {doc.bio || doc.specialty}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[#D9D0C5]/60 space-y-4">
                <div className="space-y-2 text-xs sm:text-sm">
                  <a
                    href={phoneHref}
                    className="flex items-center gap-2 text-[#0B1F2A] hover:text-[#315B52] font-semibold transition-colors"
                  >
                    <Phone size={16} className="text-[#315B52] shrink-0" />
                    <span>{phone}</span>
                  </a>
                  <a
                    href={emailHref}
                    className="flex items-center gap-2 text-slate-600 hover:text-[#0B1F2A] transition-colors break-all"
                  >
                    <Mail size={16} className="text-[#B39A68] shrink-0" />
                    <span>{email}</span>
                  </a>
                </div>

                <a
                  href={phoneHref}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#0B1F2A] hover:bg-[#153444] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors shadow-xs"
                >
                  <Phone size={15} className="text-[#B39A68]" />
                  <span>Call to Book</span>
                </a>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <a
                    href={`/providers/${doc.slug || doc.id}`}
                    className="text-[#315B52] hover:underline font-semibold"
                  >
                    View Full Profile →
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#F4EFE6] border border-[#D9D0C5] p-4 text-center text-xs text-[#5A6264] flex items-center justify-center gap-2">
        <ShieldCheck size={16} className="text-[#315B52] shrink-0" />
        <span>Please do not send sensitive medical information by email. For urgent medical needs, call 911.</span>
      </div>
    </div>
  );
}
