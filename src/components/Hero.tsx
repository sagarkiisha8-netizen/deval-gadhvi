import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Phone, X, Sparkles, Stethoscope, Play, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCmsData } from '../context/CmsContext';
import { NEWARK_PRACTICE_INFO } from '../data/localSeoData';
import { DEFAULT_HOME_PAGE } from '../data/defaultCmsData';
import AppointmentBookingForm from './AppointmentBookingForm';

export default function Hero() {
  const { homeContent, getMediaUrl, getSiteMedia, providers } = useCmsData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Configurable fields from CMS with fallback to defaults
  const heroSubtitle = homeContent?.hero?.heroSubtitle || homeContent?.hero?.badgeText || 'PRIMARY CARE IN NEWARK';
  const heroTitle = homeContent?.hero?.heroTitle || 'Medicine That Feels Personal.';
  const heroDescription = homeContent?.hero?.heroDescription || homeContent?.hero?.subtitle || 'Thoughtful primary and preventive care built around unhurried consultations and long-term doctor-patient relationships.';
  
  // Hero Doctor Portrait: defaults to Dr. Deval Gadhvi portrait 2 (second image)
  const defaultDoctorPhoto = '/newark_internal_medicine_4.webp';
  const fallbackDoctorPhoto = 'https://images.unsplash.com/photo-1594824813627-2c9ffea824f9?auto=format&fit=crop&q=85&w=1200';
  const siteMediaHero = getMediaUrl('home', 'hero', 'hero-image');
  const heroMediaItem = getSiteMedia('home', 'hero', 'hero-image');

  // Check if Dr. Deval has an uploaded provider imageUrl from R2
  const drDeval = providers?.find(p => p.id === 'dr-deval-gadhvi' || p.slug === 'dr-deval-gadhvi' || p.name?.toLowerCase().includes('deval'));
  const isStockPhoto = (url?: string) => !url || url.includes('/newark_internal_medicine_') || url.includes('images.unsplash.com');
  const configuredHero = siteMediaHero || homeContent?.hero?.heroImage || homeContent?.hero?.heroImageUrl;

  const heroImage = (configuredHero && !isStockPhoto(configuredHero))
    ? configuredHero
    : (drDeval?.imageUrl || configuredHero || defaultDoctorPhoto);
  const heroImageAlt = heroMediaItem?.altText || homeContent?.hero?.heroImageAlt || 'Dr. Deval Gadhvi, Board-Certified Internal Medicine Physician at Newark Medical Associates';

  // Video configurations
  const videoUrl = homeContent?.hero?.videoUrl || '';
  const videoTitle = homeContent?.hero?.videoTitle || 'Watch Clinic Video';
  const videoBadge = homeContent?.hero?.videoBadge || 'Newark Clinic Video';
  const videoMode = homeContent?.hero?.videoMode || 'modal';

  const embedVideoUrl = useMemo(() => {
    if (!videoUrl) return '';
    try {
      if (videoUrl.includes('youtube.com/watch')) {
        const urlParams = new URL(videoUrl).searchParams;
        const v = urlParams.get('v');
        return v ? `https://www.youtube-nocookie.com/embed/${v}?autoplay=1&rel=0` : videoUrl;
      }
      if (videoUrl.includes('youtu.be/')) {
        const id = videoUrl.split('youtu.be/')[1]?.split('?')[0];
        return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : videoUrl;
      }
      if (videoUrl.includes('vimeo.com/')) {
        const id = videoUrl.split('vimeo.com/')[1]?.split('?')[0]?.split('/')[0];
        return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : videoUrl;
      }
    } catch {
      return videoUrl;
    }
    return videoUrl;
  }, [videoUrl]);

  const [imgSrc, setImgSrc] = useState<string>(heroImage);

  useEffect(() => {
    setImgSrc(heroImage);
  }, [heroImage]);

  const primaryCtaText = homeContent?.hero?.primaryCtaText || 'BOOK APPOINTMENT';
  const secondaryCtaText = homeContent?.hero?.secondaryCtaText === 'Call (973) 412-9404' 
    ? 'Explore Services' 
    : (homeContent?.hero?.secondaryCtaText || 'Explore Services');
  const secondaryCtaLink = homeContent?.hero?.secondaryCtaLink || '/services';
  const showInlineAppointmentForm = homeContent?.hero?.showInlineAppointmentForm ?? false;

  // Handle ESC key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setIsVideoModalOpen(false);
      }
    };
    if (isModalOpen || isVideoModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isModalOpen, isVideoModalOpen]);

  return (
    <section 
      id="hero-section"
      className="relative w-full overflow-hidden bg-[#FCFBF8] border-b border-[#D9D0C5]/70"
    >
      {/* 
        TWO-COLUMN HERO COMPOSITION:
        - Left: ~57% Warm ivory / off-white editorial layout with generous whitespace
        - Right: ~43% Deep oceanic navy / teal gradient panel with crisp diagonal split and prominent doctor portrait
      */}
      <div className="w-full flex flex-col md:flex-row items-stretch min-h-[640px] sm:min-h-[680px] md:h-[680px] lg:h-[720px] xl:h-[750px] relative">
        
        {/* =========================================================================
            1. LEFT CONTENT AREA (~57% width on desktop)
            Warm off-white (#FCFBF8) background, bespoke serif typography, unhurried feel
            ========================================================================= */}
        <div 
          id="hero-left-column"
          className="w-full md:w-[57%] lg:w-[58%] xl:w-[60%] flex flex-col justify-center bg-[#FCFBF8] relative z-20 px-6 sm:px-10 md:px-8 lg:px-14 xl:px-20 py-12 sm:py-16 md:py-14 lg:py-16"
        >
          <div className="max-w-[620px] w-full mr-auto">
            
            {/* Fine Gold Accent Rule & Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex items-center gap-3 mb-4 sm:mb-5"
            >
              <span className="w-8 sm:w-10 h-[2px] bg-[#B39A68] shrink-0" aria-hidden="true" />
              <p className="font-sans text-[11px] sm:text-[12px] uppercase font-bold tracking-[0.24em] text-[#B39A68]">
                {heroSubtitle}
              </p>
            </motion.div>

            {/* Main Headline: "Medicine That Feels Personal." */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-[38px] sm:text-[50px] md:text-[46px] lg:text-[62px] xl:text-[70px] text-[#0B1F2A] leading-[1.06] tracking-[-0.025em] mb-4 sm:mb-6"
            >
              {heroTitle.includes('Feels Personal') ? (
                <>
                  Medicine That<br />
                  <span className="italic font-normal text-[#0B1F2A]">Feels Personal.</span>
                </>
              ) : (
                heroTitle
              )}
            </motion.h1>

            {/* Supporting Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="font-sans text-[15.5px] sm:text-[17px] lg:text-[18px] text-[#5A6264] leading-[1.65] mb-8 sm:mb-9 max-w-[530px]"
            >
              {heroDescription}
            </motion.p>

            {/* If inline form is toggled in CMS, display inline; otherwise render the two high-converting CTAs */}
            {showInlineAppointmentForm ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="bg-white p-5 border border-[#D9D0C5] rounded-xl shadow-editorial mb-6"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0B1F2A]">Quick Appointment Request</span>
                  <span className="text-[11px] text-[#315B52] font-semibold">Same-Week Openings</span>
                </div>
                <AppointmentBookingForm onSuccess={() => {}} />
              </motion.div>
            ) : (
              /* Two CTAs: Primary (BOOK APPOINTMENT) & Secondary (Explore Services) */
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.25, ease: 'easeOut' }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8 sm:mb-10"
              >
                {/* Primary Button: Dark Navy Filled */}
                <button
                  type="button"
                  id="hero-book-appointment-btn"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center justify-center min-h-[48px] gap-3 px-8 py-4 bg-[#0B1F2A] hover:bg-[#163547] text-[#FCFBF8] text-[13px] sm:text-[13.5px] font-bold uppercase tracking-[0.14em] shadow-editorial transition-all duration-200 active:scale-[0.99] group cursor-pointer"
                >
                  <span>{primaryCtaText}</span>
                  <ArrowRight 
                    size={16} 
                    className="text-[#B39A68] transition-transform duration-200 group-hover:translate-x-1" 
                  />
                </button>

                {/* Secondary Button: Outlined / Light Style */}
                <Link
                  id="hero-explore-services-btn"
                  to={secondaryCtaLink.startsWith('tel:') ? '/services' : secondaryCtaLink}
                  className="inline-flex items-center justify-center min-h-[48px] gap-2.5 px-6 py-4 border border-[#0B1F2A]/30 hover:border-[#0B1F2A] hover:bg-[#0B1F2A]/5 text-[#0B1F2A] text-[13.5px] sm:text-[14px] font-semibold tracking-wide transition-colors active:scale-[0.99] group"
                >
                  <Stethoscope size={15} className="text-[#315B52]" />
                  <span>{secondaryCtaText}</span>
                  <ArrowRight 
                    size={14} 
                    className="text-[#315B52] transition-transform duration-200 group-hover:translate-x-0.5" 
                  />
                </Link>

                {/* Optional Video Trigger Button */}
                {videoUrl && (
                  <button
                    type="button"
                    id="hero-watch-video-btn"
                    onClick={() => setIsVideoModalOpen(true)}
                    className="inline-flex items-center justify-center min-h-[48px] gap-2.5 px-5 py-3.5 bg-[#B39A68]/15 hover:bg-[#B39A68]/25 text-[#735D33] hover:text-[#524121] border border-[#B39A68]/40 rounded-none text-[13px] sm:text-[13.5px] font-bold tracking-wide transition-all active:scale-[0.99] group cursor-pointer"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#B39A68] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                      <Play size={11} className="fill-white translate-x-[0.5px]" />
                    </span>
                    <span>{videoTitle}</span>
                  </button>
                )}
              </motion.div>
            )}

            {/* Lower Row: Practice Location & Accepting New Patients Status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="pt-5 border-t border-[#D9D0C5]/70 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 text-[12px] sm:text-[13px] text-[#5A6264]"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B39A68]" aria-hidden="true" />
                <span className="font-medium text-[#252A2B]">337 Bloomfield Ave, Newark NJ</span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <a 
                  href={`tel:${NEWARK_PRACTICE_INFO.rawPhone}`} 
                  className="hidden sm:inline text-[#0B1F2A] font-semibold hover:underline"
                >
                  (973) 412-9404
                </a>
              </div>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F3EE] border border-[#315B52]/20 text-[#315B52] font-semibold text-[11.5px] sm:text-[12px]">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" aria-hidden="true" />
                <span>Accepting New Patients</span>
              </div>
            </motion.div>

          </div>
        </div>

        {/* =========================================================================
            2. RIGHT VISUAL AREA (~43% width on desktop)
            Premium oceanic blue / teal / cyan gradient panel with diagonal left edge
            Main visual focus: Prominent, sharp, beautifully integrated doctor portrait
            Enhanced with subtle medical graphics & compact floating info card
            ========================================================================= */}
        <div 
          id="hero-right-column"
          className="w-full md:w-[43%] lg:w-[42%] xl:w-[40%] relative flex flex-col justify-end overflow-hidden min-h-[460px] sm:min-h-[520px] md:min-h-full"
        >
          {/* Diagonal / Slanted Left Edge Background Panel */}
          <div 
            id="hero-right-bg"
            className="absolute inset-0 z-0 bg-gradient-to-br from-[#061826] via-[#0B3556] to-[#0A647B] transition-all"
          >
            {/* Ambient Cyan & Teal Radial Glows */}
            <div 
              className="absolute -top-24 -right-24 w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" 
              aria-hidden="true"
            />
            <div 
              className="absolute bottom-12 left-6 w-72 h-72 rounded-full bg-teal-400/15 blur-2xl pointer-events-none" 
              aria-hidden="true"
            />

            {/* Subtle Classy Medical Background Graphics (Classy, minimal, not busy) */}
            <svg 
              className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 500 700"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                {/* Soft clinical grid pattern */}
                <pattern id="medicalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#A5F3FC" strokeWidth="0.5" strokeOpacity="0.4" />
                </pattern>
                <linearGradient id="curveGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              {/* Grid overlay */}
              <rect width="100%" height="100%" fill="url(#medicalGrid)" />

              {/* Concentric subtle radar / focal rings in upper right */}
              <circle cx="380" cy="160" r="85" stroke="#A5F3FC" strokeWidth="1" strokeDasharray="3 4" fill="none" opacity="0.6" />
              <circle cx="380" cy="160" r="140" stroke="#A5F3FC" strokeWidth="0.8" strokeDasharray="5 5" fill="none" opacity="0.35" />
              <circle cx="380" cy="160" r="220" stroke="#A5F3FC" strokeWidth="0.6" fill="none" opacity="0.2" />

              {/* Gentle curved rhythm / cardiac pulse line */}
              <path 
                d="M 20 420 L 130 420 L 145 400 L 160 450 L 180 380 L 200 440 L 215 420 L 480 420" 
                stroke="url(#curveGlow)" 
                strokeWidth="1.5" 
                strokeLinecap="round"
                fill="none" 
              />
              
              {/* Perspective structural guides */}
              <line x1="90" y1="0" x2="20" y2="700" stroke="#5EEAD4" strokeWidth="0.75" strokeOpacity="0.25" />
              <line x1="240" y1="0" x2="170" y2="700" stroke="#5EEAD4" strokeWidth="0.75" strokeOpacity="0.15" />
            </svg>
          </div>

          {/* 
            DOCTOR PORTRAIT CONTAINER
            - Main visual focus of the right side
            - Mid-length / 3/4 prominent placement
            - High resolution, natural lighting, sharp focus
            - Architectural curved arch frame with soft edge blend at base
          */}
          <div 
            id="hero-doctor-container"
            className="relative z-10 w-full h-full flex flex-col justify-end items-center md:items-end px-4 sm:px-6 md:px-4 lg:px-10 xl:px-12 pb-0 pt-8 sm:pt-12"
          >
            <div className="relative w-full max-w-[360px] sm:max-w-[420px] md:max-w-[380px] lg:max-w-[450px] xl:max-w-[490px] h-[440px] sm:h-[490px] md:h-[550px] lg:h-[620px] xl:h-[660px] flex items-end justify-center md:justify-end">
              
              {/* Soft ambient backglow behind doctor */}
              <div 
                className="absolute inset-x-6 top-16 bottom-16 rounded-full bg-cyan-400/25 blur-3xl -z-10 pointer-events-none" 
                aria-hidden="true" 
              />
              <div 
                className="absolute -right-4 top-1/3 w-40 h-40 rounded-full bg-teal-300/15 blur-2xl -z-10 pointer-events-none" 
                aria-hidden="true" 
              />

              {/* Modern Unrounded Portrait Stage (Flat straight top, no upper rounding) */}
              <motion.div
                initial={{ opacity: 0, y: 32, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full h-full rounded-none overflow-hidden border-t border-x border-cyan-400/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65)] bg-gradient-to-b from-[#08293E] via-[#092233] to-[#061826] flex items-end justify-center"
              >
                {/* Embedded Video Mode OR Doctor Portrait */}
                {videoUrl && videoMode === 'embed' ? (
                  <div className="w-full h-full relative z-10 flex flex-col items-center justify-center bg-black/60">
                    {embedVideoUrl.includes('embed') ? (
                      <iframe
                        src={embedVideoUrl}
                        title={videoTitle}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    ) : (
                      <video
                        src={videoUrl}
                        controls
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ) : (
                  <>
                    {/* Doctor Portrait Image */}
                    <img
                      src={imgSrc}
                      alt={heroImageAlt}
                      loading="eager"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      style={{
                        objectFit: (heroMediaItem?.objectFit as any) || 'cover',
                        objectPosition: heroMediaItem?.position || 'top'
                      }}
                      onError={() => {
                        if (imgSrc !== fallbackDoctorPhoto) {
                          setImgSrc(fallbackDoctorPhoto);
                        }
                      }}
                      className="w-full h-full filter brightness-[1.02] contrast-[1.04] select-none"
                    />

                    {/* Seamless gradient fade at bottom to blend naturally with hero base */}
                    <div 
                      className="absolute inset-x-0 bottom-0 h-32 sm:h-40 bg-gradient-to-t from-[#061826] via-[#061826]/75 to-transparent pointer-events-none" 
                      aria-hidden="true" 
                    />

                    {/* Refined glass rim reflection (flat/unrounded) */}
                    <div 
                      className="absolute inset-0 rounded-none ring-1 ring-inset ring-white/15 pointer-events-none" 
                      aria-hidden="true" 
                    />
                  </>
                )}

                {/* Floating Video Quick Play Pill (When video exists and in modal mode) */}
                {videoUrl && videoMode !== 'embed' && (
                  <button
                    type="button"
                    onClick={() => setIsVideoModalOpen(true)}
                    className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3.5 py-2 bg-[#061826]/85 hover:bg-[#061826] backdrop-blur-md border border-cyan-400/40 text-cyan-200 text-xs font-semibold rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 group cursor-pointer"
                  >
                    <span className="w-5 h-5 rounded-full bg-cyan-400 text-[#061826] flex items-center justify-center">
                      <Play size={10} className="fill-[#061826] translate-x-[0.5px]" />
                    </span>
                    <span className="text-[11.5px] tracking-wide">{videoBadge}</span>
                  </button>
                )}
              </motion.div>

              {/* 
                COMPACT FLOATING INFORMATIONAL CARD
                - Positioned strategically in the lower-left area of the right panel
                - Accentuates clinical credibility without obstructing doctor's face or upper body
              */}
              <motion.div
                initial={{ opacity: 0, y: 22, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.65, delay: 0.3, ease: 'easeOut' }}
                className="absolute bottom-4 sm:bottom-6 -left-2 sm:left-0 md:-left-8 lg:-left-12 xl:-left-14 z-20 w-[240px] sm:w-[270px] lg:w-[290px] bg-[#051824]/92 backdrop-blur-md border border-cyan-400/30 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.55)] text-left"
              >
                {/* Card Top Label */}
                <div className="flex items-center justify-between gap-1 pb-2 mb-2 border-b border-cyan-900/60">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span className="text-[10px] sm:text-[10.5px] font-bold tracking-[0.16em] uppercase text-cyan-200">
                      Physician-Led Care
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-300/80 font-mono">EST. 1989</span>
                </div>

                {/* Card Title */}
                <h3 className="font-serif text-[15px] sm:text-[17px] text-white leading-snug mb-2.5">
                  Board-Certified Physicians
                </h3>

                {/* 4 Crisp Feature Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] sm:text-[11.5px] text-cyan-100/90 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-[#2DD4BF] shrink-0" />
                    <span className="whitespace-nowrap">Preventive Care</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-[#2DD4BF] shrink-0" />
                    <span className="whitespace-nowrap">Chronic Disease</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-[#2DD4BF] shrink-0" />
                    <span className="whitespace-nowrap">Same-Week Visits</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-[#2DD4BF] shrink-0" />
                    <span className="whitespace-nowrap">Compassionate</span>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>

        </div>

      </div>

      {/* =========================================================================
          APPOINTMENT MODAL POPUP
          Interactive booking dialog when "BOOK APPOINTMENT" is clicked
          ========================================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#0B1F2A]/75 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Modal Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
              className="relative w-full max-w-2xl bg-[#FCFBF8] border border-[#D9D0C5] shadow-2xl rounded-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-[#F4EFE6] border-b border-[#D9D0C5]">
                <div>
                  <p className="text-[11px] uppercase font-bold tracking-[0.2em] text-[#B39A68]">
                    Newark Medical Associates
                  </p>
                  <h2 id="modal-headline" className="font-serif text-[22px] sm:text-[24px] text-[#0B1F2A] leading-tight">
                    Schedule Your Appointment
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-[#5A6264] hover:text-[#0B1F2A] hover:bg-[#D9D0C5]/40 rounded-full transition-colors cursor-pointer"
                  aria-label="Close appointment modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body: Interactive Booking Form */}
              <div className="p-6 overflow-y-auto flex-1">
                <p className="text-xs text-[#5A6264] mb-4">
                  Request a consultation with Dr. Prahlad Gadhavi or Dr. Deval Gadhvi at our 337 Bloomfield Ave clinic. We will confirm your appointment time promptly.
                </p>
                <AppointmentBookingForm onSuccess={() => {
                  setTimeout(() => setIsModalOpen(false), 2500);
                }} />
              </div>

              {/* Modal Footer Link */}
              <div className="px-6 py-3 bg-[#F4EFE6] border-t border-[#D9D0C5] flex items-center justify-between text-xs text-[#5A6264]">
                <span>Prefer to speak directly? Call <a href={`tel:${NEWARK_PRACTICE_INFO.rawPhone}`} className="font-bold text-[#0B1F2A] underline">(973) 412-9404</a></span>
                <Link 
                  to="/appointments" 
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#315B52] font-semibold hover:underline"
                >
                  Open Full Page Scheduler →
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          VIDEO MODAL POPUP
          Interactive modal video player when "Watch Clinic Video" is clicked
          ========================================================================= */}
      <AnimatePresence>
        {isVideoModalOpen && videoUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute inset-0 bg-[#061826]/85 backdrop-blur-md"
              aria-hidden="true"
            />

            {/* Modal Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="video-modal-headline"
              className="relative w-full max-w-4xl bg-[#0B1F2A] border border-cyan-500/30 shadow-2xl rounded-2xl overflow-hidden z-10 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-[#061826] border-b border-cyan-900/60">
                <div className="flex items-center gap-2">
                  <Film size={18} className="text-cyan-400" />
                  <h3 id="video-modal-headline" className="font-serif text-lg text-white font-medium">
                    {videoTitle}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                  aria-label="Close video player"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Video Player Area */}
              <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
                {embedVideoUrl.includes('embed') ? (
                  <iframe
                    src={embedVideoUrl}
                    title={videoTitle}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Responsive CSS for Diagonal Separation Boundary */}
      <style>{`
        @media (min-width: 1024px) {
          #hero-right-bg {
            clip-path: polygon(80px 0%, 100% 0%, 100% 100%, 0% 100%);
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          #hero-right-bg {
            clip-path: polygon(50px 0%, 100% 0%, 100% 100%, 0% 100%);
          }
        }
        @media (max-width: 767px) {
          #hero-right-bg {
            clip-path: polygon(0% 20px, 100% 0%, 100% 100%, 0% 100%);
          }
        }
      `}</style>
    </section>
  );
}
