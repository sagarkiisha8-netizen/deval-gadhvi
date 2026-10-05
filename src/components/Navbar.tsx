import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
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

      {/* MAIN HEADER: Warm Ivory (#F4EFE6), Responsive Height */}
      <div
        className={`bg-[#F4EFE6] border-b border-[#D9D0C5]/70 h-[76px] sm:h-[80px] md:h-[82px] px-4 sm:px-6 lg:px-7 flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'shadow-md backdrop-blur-md bg-[#F4EFE6]/98' : ''
        }`}
      >
        {/* Left: Newark Medical Associates Logo */}
        <Link to="/" className="shrink-0 flex items-center group py-2 max-w-[170px] xs:max-w-none" aria-label="Newark Medical Associates">
          <BrandLogo layout="horizontal" colorScheme="colored" size="md" />
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

        {/* Right: Large Editorial BOOK APPOINTMENT Button */}
        <div className="hidden sm:flex items-center gap-3 md:gap-4">
          <Link
            to="/appointments"
            className="inline-flex items-center justify-center min-h-[44px] px-5 sm:px-6 py-3 bg-[#0B1F2A] hover:bg-[#153444] text-[#FCFBF8] text-[13.5px] sm:text-[14px] font-semibold tracking-wider uppercase rounded-none border border-[#0B1F2A] hover:border-[#B39A68] shadow-xs transition-all duration-200 active:scale-[0.99]"
          >
            Book Appointment
          </Link>
        </div>

        {/* Mobile Hamburger & Quick CTA Toggle */}
        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 lg:hidden shrink-0">
          <Link
            to="/appointments"
            className="sm:hidden shrink-0 inline-flex items-center justify-center h-[38px] px-2.5 xs:px-3 bg-[#0B1F2A] text-[#FCFBF8] text-[11px] font-semibold uppercase tracking-wider"
          >
            Book
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-[44px] h-[44px] shrink-0 flex items-center justify-center text-[#0B1F2A] hover:text-[#315B52] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B39A68]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <motion.div
              animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </motion.div>
          </button>
        </div>
      </div>

      {/* Animated Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="lg:hidden absolute top-full left-0 right-0 bg-[#F4EFE6] z-50 flex flex-col justify-between px-5 sm:px-8 pt-4 sm:pt-6 overflow-y-auto border-t border-[#D9D0C5] shadow-2xl"
            style={{ height: 'calc(100dvh - 100%)' }}
          >
            <nav className="flex flex-col gap-0.5 pt-1">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx, duration: 0.3 }}
                >
                  <NavLink
                    to={link.href}
                    end={link.href === '/'}
                    className={({ isActive }) =>
                      `min-h-[52px] text-[22px] sm:text-2xl font-serif py-3 border-b border-[#D9D0C5]/50 flex items-center justify-between transition-colors ${
                        isActive ? 'text-[#0B1F2A] font-bold pl-1' : 'text-[#252A2B]/80 hover:text-[#0B1F2A]'
                      }`
                    }
                  >
                    <span>{link.name}</span>
                    <ArrowRight size={18} className="text-[#B39A68] shrink-0" />
                  </NavLink>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              className="mt-6 pt-5 border-t border-[#D9D0C5] flex flex-col gap-3"
              style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
            >
              <Link
                to="/appointments"
                className="w-full min-h-[52px] flex items-center justify-center py-3.5 text-center bg-[#0B1F2A] hover:bg-[#153444] text-white font-semibold uppercase tracking-wider text-[14px] transition-colors"
              >
                Book Appointment
              </Link>
              <a
                href={`tel:${NEWARK_PRACTICE_INFO.rawPhone}`}
                className="w-full min-h-[52px] flex items-center justify-center py-3 text-center border border-[#0B1F2A] text-[#0B1F2A] hover:bg-[#0B1F2A]/5 font-semibold uppercase tracking-wider text-[13px] transition-colors"
              >
                Call {NEWARK_PRACTICE_INFO.phone}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
