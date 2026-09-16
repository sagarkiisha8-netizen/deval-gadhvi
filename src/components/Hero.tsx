import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Phone, X, Sparkles, Stethoscope, Play, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCmsData } from '../context/CmsContext';
import { NEWARK_PRACTICE_INFO } from '../data/localSeoData';
import { DEFAULT_HOME_PAGE } from '../data/defaultCmsData';
import AppointmentBookingForm from './AppointmentBookingForm';

export default function Hero() {
  const { homeContent, getMediaUrl, getSiteMedia } = useCmsData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Configurable fields from CMS with fallback to defaults
  const heroSubtitle = homeContent?.hero?.heroSubtitle || homeContent?.hero?.badgeText || 'PRIMARY CARE IN NEWARK';
  const heroTitle = homeContent?.hero?.heroTitle || 'Medicine That Feels Personal.';
  const heroDescription = homeContent?.hero?.heroDescription || homeContent?.hero?.subtitle || 'Thoughtful primary and preventive care built around unhurried consultations and long-term doctor-patient relationships.';
  
  // Hero Doctor Portrait: defaults to Dr. Deval Gadhvi portrait 2 (second image)
  const defaultDoctorPhoto = '/newark_internal_medicine_4.webp';
  const fallbackDoctorPhoto = 'https://images.unsplash.com/photo-1594824813627-2c9ffea824f9?auto=format&fit=crop&q=85&w=1200';
  const siteMediaHero = getMediaUrl('homepage', 'hero', 'main');
  const heroMediaItem = getSiteMedia('homepage', 'hero', 'main');
  const heroImage = siteMediaHero || homeContent?.hero?.heroImage || homeContent?.hero?.heroImageUrl || DEFAULT_HOME_PAGE.hero.heroImage || defaultDoctorPhoto;
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
      {/* 
        HERO CONTAINER:
        Balanced 12-column grid inside a max-w-[1360px] container.
        Eliminates empty middle space and seamlessly integrates doctor portrait visual.
      */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* =========================================================================
              1. LEFT CONTENT COLUMN (lg:col-span-7)
              ========================================================================= */}
          <div id="hero-left-column" className="lg:col-span-7 flex flex-col justify-center">
            
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
              className="font-serif text-[38px] sm:text-[50px] lg:text-[58px] xl:text-[64px] text-[#0B1F2A] leading-[1.06] tracking-[-0.025em] mb-4 sm:mb-6"
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
              className="font-sans text-[16px] sm:text-[17.5px] lg:text-[18.5px] text-[#5A6264] leading-[1.65] mb-8 sm:mb-9 max-w-[580px]"
            >
              {heroDescription}
            </motion.p>

            {/* If inline form is toggled in CMS, display inline; otherwise render CTAs */}
            {showInlineAppointmentForm ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="bg-white p-5 border border-[#D9D0C5] rounded-xl shadow-editorial mb-6 max-w-xl"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0B1F2A]">Quick Appointment Request</span>
                  <span className="text-[11px] text-[#315B52] font-semibold">Same-Week Openings</span>
                </div>
                <AppointmentBookingForm onSuccess={() => {}} />
              </motion.div>
            ) : (
              /* Two Primary CTAs */
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.25, ease: 'easeOut' }}
                className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3.5 sm:gap-4 mb-8 sm:mb-10"
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
                    className="inline-flex items-center justify-center min-h-[48px] gap-2.5 px-5 py-3.5 bg-[#B39A68]/15 hover:bg-[#B39A68]/25 text-[#735D33] hover:text-[#524121] border border-[#B39A68]/40 text-[13px] sm:text-[13.5px] font-bold tracking-wide transition-all active:scale-[0.99] group cursor-pointer"
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
              className="pt-5 border-t border-[#D9D0C5]/70 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 text-[12.5px] sm:text-[13.5px] text-[#5A6264] max-w-xl"
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

          {/* =========================================================================
              2. RIGHT VISUAL COLUMN (lg:col-span-5)
              Elegant, seamlessly integrated doctor portrait frame with warm ambient styling
              ========================================================================= */}
          <div id="hero-right-column" className="lg:col-span-5 relative flex justify-center lg:justify-end">
            
            <div className="relative w-full max-w-[440px] sm:max-w-[460px] lg:max-w-[480px]">
              
              {/* Soft ambient warm glow behind card */}
              <div 
                className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#B39A68]/15 via-[#315B52]/10 to-transparent blur-2xl -z-10 pointer-events-none" 
                aria-hidden="true" 
              />

              {/* Main Portrait Card Stage */}
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative aspect-[4/4.8] sm:aspect-[4/4.9] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#F4EFE6] border border-[#D9D0C5] shadow-[0_20px_50px_-10px_rgba(11,31,42,0.18)] group"
              >
                {/* Embedded Video Mode OR Doctor Portrait */}
                {videoUrl && videoMode === 'embed' ? (
                  <div className="w-full h-full relative z-10 flex flex-col items-center justify-center bg-black/80">
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
                        objectPosition: heroMediaItem?.position || 'top center'
                      }}
                      onError={() => {
                        if (imgSrc !== fallbackDoctorPhoto) {
                          setImgSrc(fallbackDoctorPhoto);
                        }
                      }}
                      className="w-full h-full group-hover:scale-103 transition-transform duration-700"
                    />

                    {/* Gradient overlay for text legibility at bottom */}
                    <div 
                      className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0B1F2A]/90 via-[#0B1F2A]/40 to-transparent pointer-events-none" 
                      aria-hidden="true" 
                    />
                  </>
                )}

                {/* Floating Video Quick Play Pill (When video exists and in modal mode) */}
                {videoUrl && videoMode !== 'embed' && (
                  <button
                    type="button"
                    onClick={() => setIsVideoModalOpen(true)}
                    className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3.5 py-2 bg-[#0B1F2A]/85 hover:bg-[#0B1F2A] backdrop-blur-md border border-white/20 text-white text-xs font-semibold rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 group cursor-pointer"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#B39A68] text-white flex items-center justify-center">
                      <Play size={10} className="fill-white translate-x-[0.5px]" />
                    </span>
                    <span className="text-[11.5px] tracking-wide">{videoBadge}</span>
                  </button>
                )}

                {/* Compact Floating Glassmorphism Info Badge at Bottom of Card */}
                <div className="absolute inset-x-4 bottom-4 z-20 bg-[#0B1F2A]/88 backdrop-blur-md border border-[#D9D0C5]/30 p-4 rounded-xl text-left">
                  <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/15">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                      <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#B39A68]">
                        Physician-Led Care
                      </span>
                    </div>
                    <span className="text-[10.5px] text-[#D9D0C5]/80 font-mono">EST. 1989</span>
                  </div>

                  <h3 className="font-serif text-[16px] sm:text-[18px] text-[#FCFBF8] leading-snug mb-2 font-medium">
                    Board-Certified Physicians
                  </h3>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11.5px] text-[#D9D0C5] font-medium">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-[#B39A68] shrink-0" />
                      <span className="whitespace-nowrap">Preventive Care</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-[#B39A68] shrink-0" />
                      <span className="whitespace-nowrap">Chronic Disease</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-[#B39A68] shrink-0" />
                      <span className="whitespace-nowrap">Same-Week Visits</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-[#B39A68] shrink-0" />
                      <span className="whitespace-nowrap">Compassionate</span>
                    </div>
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

    </section>
  );
}
