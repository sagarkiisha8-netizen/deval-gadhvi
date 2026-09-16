import React from 'react';
import { Phone, Calendar, Navigation, MessageCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCmsData } from '../context/CmsContext';
import { NEWARK_PRACTICE_INFO } from '../data/localSeoData';

export default function MobileFloatingBar() {
  const { siteSettings } = useCmsData();
  const location = useLocation();

  // Hide bar on admin routes to prevent overlapping controls
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const phone = siteSettings?.phone || NEWARK_PRACTICE_INFO.phone;
  const rawPhone = phone.replace(/[^0-9]/g, '');
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(NEWARK_PRACTICE_INFO.formattedAddress)}`;
  const whatsappUrl = `https://wa.me/19734129404?text=${encodeURIComponent("Hello Newark Medical Associates, I'd like to ask about an appointment.")}`;

  return (
    <aside aria-label="Quick contact and appointment actions" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1F2A]/95 backdrop-blur-md border-t border-[#B39A68]/30 px-3 py-2 shadow-2xl pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1.5 text-center">
        
        {/* Call Now */}
        <a
          href={`tel:${rawPhone}`}
          className="flex flex-col items-center justify-center gap-1 py-1 px-1 text-[#FCFBF8]/80 hover:text-[#FCFBF8] active:bg-white/5 transition-colors"
          aria-label="Call clinic directly"
        >
          <div className="w-8 h-8 border border-[#B39A68]/40 text-[#B39A68] flex items-center justify-center">
            <Phone size={15} />
          </div>
          <span className="text-[10.5px] uppercase tracking-wider font-semibold">Call</span>
        </a>

        {/* Directions */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 py-1 px-1 text-[#FCFBF8]/80 hover:text-[#FCFBF8] active:bg-white/5 transition-colors"
          aria-label="Directions to Newark clinic"
        >
          <div className="w-8 h-8 border border-[#B39A68]/40 text-[#B39A68] flex items-center justify-center">
            <Navigation size={15} />
          </div>
          <span className="text-[10.5px] uppercase tracking-wider font-semibold">Directions</span>
        </a>

        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 py-1 px-1 text-[#FCFBF8]/80 hover:text-[#FCFBF8] active:bg-white/5 transition-colors"
          aria-label="Chat on WhatsApp"
        >
          <div className="w-8 h-8 border border-[#B39A68]/40 text-[#B39A68] flex items-center justify-center">
            <MessageCircle size={15} />
          </div>
          <span className="text-[10.5px] uppercase tracking-wider font-semibold">WhatsApp</span>
        </a>

        {/* Book Appointment CTA */}
        <Link
          to="/appointments"
          className="flex flex-col items-center justify-center gap-1 py-1 px-1 text-[#B39A68] hover:text-white active:bg-white/5 transition-colors"
          aria-label="Book an appointment"
        >
          <div className="w-8 h-8 bg-[#315B52] border border-[#315B52] text-[#FCFBF8] flex items-center justify-center shadow-xs">
            <Calendar size={15} />
          </div>
          <span className="text-[10.5px] uppercase tracking-wider font-bold text-[#FCFBF8]">Book</span>
        </Link>

      </div>
    </aside>
  );
}
