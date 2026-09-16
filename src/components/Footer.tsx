import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Clock, Mail } from 'lucide-react';
import { NEWARK_PRACTICE_INFO } from '../data/localSeoData';
import BrandLogo from './BrandLogo';

export default function Footer() {
  const clinicalLinks = [
    { name: 'Primary Care & Routine Visits', href: '/services/primary-care' },
    { name: 'Preventive Medicine & Screenings', href: '/services/preventive-care' },
    { name: 'Chronic Disease Oversight', href: '/services/chronic-disease-management' },
    { name: 'In-Office Diagnostics & EKGs', href: '/diagnostics' },
    { name: 'Annual Wellness Physicals', href: '/services/annual-physicals' },
    { name: 'Pre-Operative Clearances', href: '/services/pre-op-clearance' },
    { name: 'Conditions We Treat', href: '/conditions' }
  ];

  const practiceLinks = [
    { name: 'About Our Practice Heritage', href: '/about' },
    { name: 'Our Physicians & Clinical Team', href: '/providers' },
    { name: 'Patient Resources & Forms', href: '/patient-resources' },
    { name: 'Accepted Insurances & Self-Pay', href: '/insurance-pricing' },
    { name: 'The Health Journal (Blog)', href: '/blog' },
    { name: 'Schedule an Appointment', href: '/appointments' },
    { name: 'Contact & Location Directions', href: '/contact' }
  ];

  return (
    <footer className="bg-[#0B1F2A] text-[#FCFBF8] pt-20 sm:pt-24 pb-14 border-t border-[#0B1F2A]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Top Section: Large Logo & Editorial Purpose */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-14 border-b border-[#B39A68]/30">
          <div className="max-w-xl">
            <Link to="/" className="inline-block mb-5">
              <BrandLogo layout="horizontal" colorScheme="white" size="lg" />
            </Link>
            <p className="font-sans text-[16px] text-[#D9D0C5] leading-[1.7]">
              Providing unhurried, evidence-based primary care, preventive screenings, and on-site clinical diagnostics to families and professionals throughout Newark and Essex County.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              to="/appointments"
              className="inline-flex items-center justify-center px-7 py-4 bg-[#B39A68] hover:bg-[#c4ab79] text-[#0B1F2A] text-[14px] font-bold uppercase tracking-wider transition-colors"
            >
              Book an Appointment
            </Link>
            <a
              href={`tel:${NEWARK_PRACTICE_INFO.rawPhone}`}
              className="inline-flex items-center justify-center px-7 py-4 border border-[#D9D0C5]/40 hover:border-[#FCFBF8] text-[#FCFBF8] text-[14px] font-semibold uppercase tracking-wider transition-colors"
            >
              Call (973) 412-9404
            </a>
          </div>
        </div>

        {/* 4 Large Editorial Columns with Generous Spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-14 py-16 sm:py-20 border-b border-[#B39A68]/20">
          
          {/* Col 1: Practice Location (4 cols) */}
          <div className="lg:col-span-4">
            <h4 className="font-serif text-[22px] text-[#FCFBF8] mb-5 tracking-wide">
              The Newark Clinic
            </h4>
            <div className="space-y-4 text-[15px] text-[#D9D0C5] leading-relaxed">
              <p className="flex items-start gap-3">
                <MapPin size={18} className="text-[#B39A68] shrink-0 mt-1" />
                <span>
                  337 Bloomfield Avenue<br />
                  Newark, New Jersey 07107<br />
                  <span className="text-xs text-[#B39A68]">North Ward • Free On-Site Patient Parking</span>
                </span>
              </p>
              <p className="flex items-center gap-3">
                <Phone size={18} className="text-[#B39A68] shrink-0" />
                <a href={`tel:${NEWARK_PRACTICE_INFO.rawPhone}`} className="hover:text-white font-medium">
                  {NEWARK_PRACTICE_INFO.phone}
                </a>
              </p>
              <p className="flex items-center gap-3">
                <Mail size={18} className="text-[#B39A68] shrink-0" />
                <span>care@newarkmed.com</span>
              </p>
            </div>
          </div>

          {/* Col 2: Clinical Offerings (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="font-serif text-[22px] text-[#FCFBF8] mb-5 tracking-wide">
              Clinical Services
            </h4>
            <ul className="space-y-3 text-[14.5px]">
              {clinicalLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-[#D9D0C5] hover:text-[#B39A68] transition-colors block py-0.5"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Practice & Patients (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="font-serif text-[22px] text-[#FCFBF8] mb-5 tracking-wide">
              Practice & Access
            </h4>
            <ul className="space-y-3 text-[14.5px]">
              {practiceLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-[#D9D0C5] hover:text-[#B39A68] transition-colors block py-0.5"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Clinical Hours (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-serif text-[22px] text-[#FCFBF8] mb-5 tracking-wide">
              Office Hours
            </h4>
            <div className="space-y-3 text-[14px] text-[#D9D0C5]">
              <div>
                <p className="font-semibold text-white">Monday – Friday</p>
                <p>8:30 AM – 5:00 PM</p>
              </div>
              <div>
                <p className="font-semibold text-white">Saturday</p>
                <p>9:00 AM – 1:00 PM</p>
                <p className="text-xs text-[#B39A68] mt-0.5">By Appointment</p>
              </div>
              <div>
                <p className="font-semibold text-white">Sunday</p>
                <p className="text-[#9EAAA7]">Closed</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Accreditation */}
        <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#9EAAA7]">
          <p>
            © {new Date().getFullYear()} Newark Medical Associates LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span>HIPAA Compliant Practice</span>
            <span>•</span>
            <Link to="/patient-resources" className="hover:text-white transition-colors">
              Privacy Notice
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-white transition-colors">
              Accessibility
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
