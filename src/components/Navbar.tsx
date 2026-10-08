import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, Phone } from 'lucide-react';
import { NEWARK_PRACTICE_INFO } from '../data/localSeoData';
import BrandLogo from './BrandLogo';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Scroll detection for subtle header elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Providers', href: '/providers' },
    { name: 'Resources', href: '/patient-resources' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' }
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-50 w-full transition-shadow duration-300">
      {/* TOP UTILITY BAR: Midnight Navy */}
      <div className="bg-[#0B1F2A] text-[#D9D0C5] h-[30px] px-3 sm:px-6 lg:px-7 flex items-center justify-between text-[11px] sm:text-[12px] font-medium tracking-wide border-b border-[#0B1F2A]/60">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B39A68] animate-pulse shrink-0" aria-hidden="true" />
          <span className="truncate text-[10.5px] sm:text-[11.5px]">Newark, NJ</span>
          <span className="hidden sm:inline text-[#B39A68]/60 shrink-0">•</span>
          <span className="hidden sm:inline text-[#D9D0C5]/80 truncate">337 Bloomfield Ave</span>
        </div>
        <div className="shrink-0">
          <a
            href={`tel:${NEWARK_PRACTICE_INFO.rawPhone}`}
            className="hover:text-white transition-colors flex items-center gap-1 sm:gap-1.5 font-medium py-1 min-h-[30px]"
            aria-label={`Call ${NEWARK_PRACTICE_INFO.phone}`}
          >
            <Phone size={12} className="text-[#B39A68] shrink-0" />
            <span className="hidden xs:inline text-[10.5px] sm:text-[11.5px]">Call</span>
            <span className="text-white font-semibold text-[10.5px] sm:text-[11.5px]">{NEWARK_PRACTICE_INFO.phone}</span>
          </a>
        </div>
      </div>

      {/* MAIN HEADER: Warm Ivory (#F4EFE6), Responsive Height & Alignment */}
      <div
        className={`bg-[#F4EFE6] border-b border-[#D9D0C5]/70 h-[74px] sm:h-[80px] md:h-[82px] px-3 sm:px-6 lg:px-7 flex items-center justify-between gap-2 sm:gap-4 transition-all duration-300 ${
          scrolled ? 'shadow-md' : ''
        }`}
      >
        {/* Left: Newark Medical Associates Logo Wrapper */}
        <Link
          to="/"
          className="flex items-center min-w-0 flex-shrink-1 py-1 group"
          aria-label="Newark Medical Associates - Dr. Deval Gadhvi"
        >
          <BrandLogo layout="horizontal" colorScheme="colored" size="navbar" />
        </Link>

        {/* Center: Main Navigation with Editorial Typography */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              end={link.href === '/'}
              className={({ isActive }) =>
                `text-[15.5px] xl:text-[16px] tracking-[-0.01em] transition-all relative py-2 ${
                  isActive
                    ? 'text-[#0B1F2A] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#0B1F2A]'
                    : 'text-[#252A2B]/80 hover:text-[#0B1F2A] font-medium'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Right: Editorial BOOK APPOINTMENT Button (Tablet / Desktop) */}
        <div className="hidden sm:flex items-center gap-3 md:gap-4 shrink-0">
          <Link
            to="/appointments"
            className="inline-flex items-center justify-center min-h-[44px] px-5 sm:px-6 py-3 bg-[#0B1F2A] hover:bg-[#153444] text-[#FCFBF8] text-[13.5px] sm:text-[14px] font-semibold tracking-wider uppercase rounded-none border border-[#0B1F2A] hover:border-[#B39A68] shadow-xs transition-all duration-200 active:scale-[0.99]"
          >
            Book Appointment
          </Link>
        </div>

        {/* Mobile Hamburger & Quick CTA Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 lg:hidden">
          <Link
            to="/appointments"
            className="sm:hidden inline-flex items-center justify-center min-h-[38px] px-3 py-1.5 bg-[#0B1F2A] hover:bg-[#153444] text-[#FCFBF8] text-[11px] font-semibold uppercase tracking-wider shrink-0 transition-colors"
          >
            Book
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-11 h-11 flex items-center justify-center p-2 text-[#0B1F2A] hover:text-[#315B52] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B39A68] rounded-md shrink-0 cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={26} className="shrink-0" /> : <Menu size={26} className="shrink-0" />}
          </button>
        </div>
      </div>

      {/* Clean Mobile Dropdown Menu attached directly below navbar */}
      <div
        id="mobile-navigation-menu"
        className={`lg:hidden absolute top-full left-0 right-0 w-full bg-[#F4EFE6] border-b border-[#D9D0C5] shadow-2xl transition-all duration-250 ease-out z-50 ${
          mobileMenuOpen
            ? 'opacity-100 visible pointer-events-auto translate-y-0'
            : 'opacity-0 invisible pointer-events-none -translate-y-2'
        }`}
      >
        <div className="px-5 sm:px-8 py-5 flex flex-col justify-between max-h-[calc(100dvh-115px)] overflow-y-auto">
          <nav className="flex flex-col gap-0.5 pt-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.href}
                end={link.href === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `min-h-[48px] text-[20px] sm:text-2xl font-serif py-2.5 border-b border-[#D9D0C5]/50 flex items-center justify-between transition-colors ${
                    isActive ? 'text-[#0B1F2A] font-bold pl-1' : 'text-[#252A2B]/80 hover:text-[#0B1F2A]'
                  }`
                }
              >
                <span>{link.name}</span>
                <ArrowRight size={18} className="text-[#B39A68] shrink-0" />
              </NavLink>
            ))}
          </nav>

          <div
            className="mt-6 pt-5 border-t border-[#D9D0C5] flex flex-col gap-3"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <Link
              to="/appointments"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full min-h-[48px] flex items-center justify-center py-3 text-center bg-[#0B1F2A] hover:bg-[#153444] text-white font-semibold uppercase tracking-wider text-[13.5px] transition-colors"
            >
              Book Appointment
            </Link>
            <a
              href={`tel:${NEWARK_PRACTICE_INFO.rawPhone}`}
              className="w-full min-h-[48px] flex items-center justify-center py-2.5 text-center border border-[#0B1F2A] text-[#0B1F2A] hover:bg-[#0B1F2A]/5 font-semibold uppercase tracking-wider text-[13px] transition-colors"
            >
              Call {NEWARK_PRACTICE_INFO.phone}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
