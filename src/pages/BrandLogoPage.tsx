import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  Maximize2, 
  FileText, 
  CreditCard, 
  Building2, 
  Stethoscope, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandLogo, { BrandIcon } from '../components/BrandLogo';
import SeoHead from '../components/SeoHead';

export default function BrandLogoPage() {
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'colored' | 'black' | 'white'>('all');

  const rawSvgCode = `<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="54" height="54" rx="15" fill="#DDF4F1" fill-opacity="0.45" stroke="#129A8F" stroke-opacity="0.18" stroke-width="1.2"/>
  <!-- Left Wing & Ascender - Deep Navy (#0F2740) -->
  <path d="M19 14.5C15.5 14.5 13 17.5 13 21.5C13 27.5 18 33.5 28 41.5C28.6 42 29.4 42 30 41.5C33 39 36 36 38.5 33L32 26.5C30.5 28 28.5 29.5 26 31.5C21 27 18 23 18 20.5C18 18.5 19 17.5 20.5 17.5C22 17.5 23.5 18.5 25 20.5L28 17C26 15 23 14.5 19 14.5Z" fill="#0F2740"/>
  <!-- Right Wing & Descender - Rich Teal (#129A8F) -->
  <path d="M37 14.5C41 14.5 43 17.5 43 21.5C43 27 38.5 33 28.5 41C28.2 41.2 27.8 41.2 27.5 41C26.5 40.2 25.5 39.4 24.5 38.5L30.5 32.5C31.5 33.3 32.5 34 33.5 34.8C37.5 31.5 38.5 27 38.5 22C38.5 19 37.5 17.5 35.5 17.5C33.5 17.5 32 19 30.5 20.8L28 17.2C30 15 33 14.5 37 14.5Z" fill="#129A8F"/>
  <!-- Central Clinical Cross (+) -->
  <rect x="21" y="23" width="14" height="5" rx="2.5" fill="#129A8F"/>
  <rect x="25.5" y="18.5" width="5" height="14" rx="2.5" fill="#0F2740"/>
  <circle cx="28" cy="25.5" r="1.75" fill="#FFFFFF"/>
</svg>`;

  const handleCopySvg = () => {
    navigator.clipboard.writeText(rawSvgCode);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 2400);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] pt-24 sm:pt-28 pb-20">
      <SeoHead 
        title="Brand Identity & Master Logo System | Newark Medical Associates"
        description="Official brand identity, vector logos, and design standards for Newark Medical Associates - Primary & Preventive Care in Newark, NJ."
      />

      {/* Header Banner */}
      <section className="relative overflow-hidden py-12 sm:py-16 border-b border-[#DDE7E5] bg-gradient-to-b from-white via-[#F8FAF9] to-[#F1F7F6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#129A8F]/10 border border-[#129A8F]/20 text-[#0F766E] text-xs font-semibold uppercase tracking-wider mb-5">
              <ShieldCheck size={14} className="text-[#129A8F]" />
              <span>Official Healthcare Brand System</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-[#0F2740] tracking-tight leading-tight mb-4">
              Newark Medical Associates <br />
              <span className="text-[#129A8F]">Master Brand Identity</span>
            </h1>

            <p className="text-base sm:text-lg text-[#526579] font-normal leading-relaxed mb-7 max-w-2xl">
              An elegant, modern, and clinically credible brand emblem unifying the compassionate heart of preventive medicine, the strength of the medical cross, and the geographic identity of Newark.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3.5">
              <button
                onClick={handleCopySvg}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F2740] hover:bg-[#102A43] text-white font-medium text-sm transition-all shadow-sm shadow-[#0F2740]/20"
              >
                {copiedSvg ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                <span>{copiedSvg ? 'Vector SVG Copied!' : 'Copy Vector SVG'}</span>
              </button>

              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-[#F4F9F8] text-[#0F2740] border border-[#DCE6E4] font-medium text-sm transition-all shadow-xs"
              >
                <span>Return to Live Website</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Showcase Section */}
      <section className="py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          {/* Section 1: The Three Master Color Variations on Clean Backgrounds */}
          <div>
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#DDE7E5]">
              <div>
                <h2 className="text-2xl font-heading font-bold text-[#0F2740]">Master Color Variations</h2>
                <p className="text-sm text-[#526579] mt-1">Calibrated for light clinic applications, monochrome documentation, and dark signage.</p>
              </div>
              
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#129A8F]/10 text-[#0F766E]">
                3 Core Profiles
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. Primary Colored Version on Pure White Canvas */}
              <div className="bg-white rounded-2xl p-8 border border-[#DDE7E5] shadow-sm flex flex-col items-center justify-between text-center min-h-[300px] relative group hover:shadow-md transition-shadow">
                <div className="w-full flex justify-between items-center text-xs text-[#526579] mb-4">
                  <span className="font-semibold text-[#0F2740]">01. Primary Full-Color</span>
                  <span className="bg-[#DDF4F1] text-[#0F766E] px-2 py-0.5 rounded text-[11px] font-medium">Standard</span>
                </div>

                <div className="my-auto py-6">
                  <BrandLogo layout="compact" colorScheme="colored" size="lg" />
                </div>

                <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>Deep Navy & Rich Teal</span>
                  <code>#0F2740 • #129A8F</code>
                </div>
              </div>

              {/* 2. Black / Monochrome Version on Pure White Canvas */}
              <div className="bg-white rounded-2xl p-8 border border-[#DDE7E5] shadow-sm flex flex-col items-center justify-between text-center min-h-[300px] relative group hover:shadow-md transition-shadow">
                <div className="w-full flex justify-between items-center text-xs text-[#526579] mb-4">
                  <span className="font-semibold text-[#111827]">02. Monochrome Black</span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">Print & Fax</span>
                </div>

                <div className="my-auto py-6">
                  <BrandLogo layout="compact" colorScheme="black" size="lg" />
                </div>

                <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>Single-Color Ink</span>
                  <code>100% K / #111827</code>
                </div>
              </div>

              {/* 3. Reversed White Version on Deep Navy Canvas */}
              <div className="bg-[#0F2740] rounded-2xl p-8 border border-[#1E3A5F] shadow-sm flex flex-col items-center justify-between text-center min-h-[300px] relative group hover:shadow-lg transition-shadow">
                <div className="w-full flex justify-between items-center text-xs text-slate-300 mb-4">
                  <span className="font-semibold text-white">03. Reversed White</span>
                  <span className="bg-white/15 text-white px-2 py-0.5 rounded text-[11px] font-medium">Dark / Night</span>
                </div>

                <div className="my-auto py-6">
                  <BrandLogo layout="compact" colorScheme="white" size="lg" />
                </div>

                <div className="w-full pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300/80">
                  <span>Inverted White Mask</span>
                  <code>#FFFFFF on #0F2740</code>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Master Layout Formats (Horizontal, Compact, Icon-Only) */}
          <div>
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#DDE7E5]">
              <div>
                <h2 className="text-2xl font-heading font-bold text-[#0F2740]">Layout Formats & Lockups</h2>
                <p className="text-sm text-[#526579] mt-1">Structured lockups engineered for digital headers, stationery, and micro-icons.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Format 1: Horizontal Lockup (The Header Standard) */}
              <div className="lg:col-span-8 bg-white rounded-2xl p-8 border border-[#DDE7E5] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#129A8F]">Format A</span>
                    <h3 className="text-lg font-bold text-[#0F2740] mt-0.5">Horizontal Primary Lockup</h3>
                  </div>
                  <span className="text-xs text-[#526579] bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                    Website Headers, Letterhead, Signage
                  </span>
                </div>

                <div className="py-10 px-6 bg-[#F8FAF9]/60 rounded-xl border border-dashed border-[#DDE7E5] flex items-center justify-center my-auto">
                  <BrandLogo layout="horizontal" colorScheme="colored" size="lg" />
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-[#526579]">
                  <span className="font-mono text-[11.5px]">Aspect Ratio: ~4.5:1</span>
                  <span>Minimum Recommended Width: 180px</span>
                </div>
              </div>

              {/* Format 2: Icon-Only Version */}
              <div className="lg:col-span-4 bg-white rounded-2xl p-8 border border-[#DDE7E5] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#129A8F]">Format B</span>
                    <h3 className="text-lg font-bold text-[#0F2740] mt-0.5">Standalone Emblem</h3>
                  </div>
                  <span className="text-xs text-[#526579] bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                    Favicon & Applet
                  </span>
                </div>

                <div className="py-10 px-6 bg-[#F8FAF9]/60 rounded-xl border border-dashed border-[#DDE7E5] flex items-center justify-center my-auto">
                  <BrandLogo layout="icon-only" colorScheme="colored" size="xl" />
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-[#526579]">
                  <span className="font-mono text-[11.5px]">Square: 1:1</span>
                  <span>Vector Scalable 16px–2000px</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Micro-Scale Fidelity Matrix */}
          <div className="bg-white rounded-2xl p-8 border border-[#DDE7E5] shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-heading font-bold text-[#0F2740]">Optical Clarity Across Screen Scales</h3>
              <p className="text-sm text-[#526579] mt-1">Verified rendering precision down to 16px favicon resolution without optical blur or detail collapse.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-4">
              {/* 16px */}
              <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#DDE7E5] flex flex-col items-center justify-center text-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-slate-200 shadow-xs">
                  <BrandIcon size={16} colorScheme="colored" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0F2740] block">16 × 16 px</span>
                  <span className="text-[10px] text-[#64748B]">Browser Favicon</span>
                </div>
              </div>

              {/* 24px */}
              <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#DDE7E5] flex flex-col items-center justify-center text-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-slate-200 shadow-xs">
                  <BrandIcon size={24} colorScheme="colored" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0F2740] block">24 × 24 px</span>
                  <span className="text-[10px] text-[#64748B]">App Status Bar</span>
                </div>
              </div>

              {/* 32px */}
              <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#DDE7E5] flex flex-col items-center justify-center text-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-slate-200 shadow-xs">
                  <BrandIcon size={32} colorScheme="colored" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0F2740] block">32 × 32 px</span>
                  <span className="text-[10px] text-[#64748B]">Navigation Bar</span>
                </div>
              </div>

              {/* 48px */}
              <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#DDE7E5] flex flex-col items-center justify-center text-center gap-3">
                <div className="w-14 h-14 flex items-center justify-center bg-white rounded-lg border border-slate-200 shadow-xs">
                  <BrandIcon size={44} colorScheme="colored" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0F2740] block">48 × 48 px</span>
                  <span className="text-[10px] text-[#64748B]">Card Icon</span>
                </div>
              </div>

              {/* 64px */}
              <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#DDE7E5] flex flex-col items-center justify-center text-center gap-3">
                <div className="w-16 h-16 flex items-center justify-center bg-white rounded-lg border border-slate-200 shadow-xs">
                  <BrandIcon size={56} colorScheme="colored" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0F2740] block">64 × 64 px</span>
                  <span className="text-[10px] text-[#64748B]">Door Plaque</span>
                </div>
              </div>

              {/* 96px */}
              <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#DDE7E5] flex flex-col items-center justify-center text-center gap-3">
                <div className="w-20 h-20 flex items-center justify-center bg-white rounded-lg border border-slate-200 shadow-xs">
                  <BrandIcon size={72} colorScheme="colored" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0F2740] block">96 × 96 px</span>
                  <span className="text-[10px] text-[#64748B]">Reception Wall</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Visual Concept & Meaning Anatomy */}
          <div>
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#DDE7E5]">
              <div>
                <h2 className="text-2xl font-heading font-bold text-[#0F2740]">Symbolic Design Anatomy</h2>
                <p className="text-sm text-[#526579] mt-1">Every contour and stroke represents a foundational pillar of the medical practice.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Concept 1 */}
              <div className="bg-white rounded-2xl p-7 border border-[#DDE7E5] shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#0F2740]/10 text-[#0F2740] flex items-center justify-center font-bold mb-5">
                  1
                </div>
                <h4 className="text-lg font-bold text-[#0F2740] mb-2">The Shield of Protection</h4>
                <p className="text-sm text-[#526579] leading-relaxed">
                  The continuous outer silhouette evokes both a protective medical shield and a heart contour — representing comprehensive primary care, preventative health defenses, and whole-person clinical wellness.
                </p>
              </div>

              {/* Concept 2 */}
              <div className="bg-white rounded-2xl p-7 border border-[#DDE7E5] shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#129A8F]/10 text-[#129A8F] flex items-center justify-center font-bold mb-5">
                  2
                </div>
                <h4 className="text-lg font-bold text-[#0F2740] mb-2">The "N" Ribbon Monogram</h4>
                <p className="text-sm text-[#526579] leading-relaxed">
                  Two intertwining geometric ribbon wings form a graceful letter <strong>"N"</strong> in continuous flow, grounding the institution proudly in Newark, New Jersey and symbolizing patient-physician continuity.
                </p>
              </div>

              {/* Concept 3 */}
              <div className="bg-white rounded-2xl p-7 border border-[#DDE7E5] shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#DDF4F1] text-[#0F766E] flex items-center justify-center font-bold mb-5">
                  3
                </div>
                <h4 className="text-lg font-bold text-[#0F2740] mb-2">The Clinical Healing Cross</h4>
                <p className="text-sm text-[#526579] leading-relaxed">
                  A balanced medical cross anchored at the focal center, crafted with smooth pill caps to project clinical rigor, diagnostic precision, and board-certified internal medicine authority.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Brand Color Palette & Typography Specifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Palette */}
            <div className="bg-white rounded-2xl p-8 border border-[#DDE7E5] shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-heading font-bold text-[#0F2740] mb-2">Prescribed Color Palette</h3>
                <p className="text-sm text-[#526579] mb-6">High-contrast, calming, and medically credible tones.</p>

                <div className="space-y-4">
                  {/* Swatch 1 */}
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="w-12 h-12 rounded-lg bg-[#0F2740] shadow-sm shrink-0 border border-black/10" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#0F2740]">Deep Navy</span>
                        <code className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200">#0F2740</code>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">Authority, Diagnostic Rigor, Clinical Excellence</p>
                    </div>
                  </div>

                  {/* Swatch 2 */}
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="w-12 h-12 rounded-lg bg-[#129A8F] shadow-sm shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#0F2740]">Rich Teal</span>
                        <code className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200">#129A8F</code>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">Compassion, Healing, Preventative Vitality</p>
                    </div>
                  </div>

                  {/* Swatch 3 */}
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="w-12 h-12 rounded-lg bg-[#DDF4F1] shadow-sm shrink-0 border border-[#129A8F]/30" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#0F2740]">Soft Teal Accent</span>
                        <code className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200">#DDF4F1</code>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">Gentle Clinical Atmosphere, Backdrops & Badging</p>
                    </div>
                  </div>

                  {/* Swatch 4 */}
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="w-12 h-12 rounded-lg bg-white shadow-sm shrink-0 border border-slate-300" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#0F2740]">Pure White Canvas</span>
                        <code className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200">#FFFFFF</code>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">Sterile Clarity, Clean Negative Space</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="bg-white rounded-2xl p-8 border border-[#DDE7E5] shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-heading font-bold text-[#0F2740] mb-2">Typography Hierarchy</h3>
                <p className="text-sm text-[#526579] mb-6">Paired geometric display typography with high-legibility body sans.</p>

                <div className="space-y-6">
                  {/* Primary Heading Font */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#129A8F]">Primary Wordmark Font</span>
                    <h4 className="font-heading font-bold text-2xl text-[#0F2740] mt-1 mb-1">Manrope (Semi-Bold & Bold)</h4>
                    <p className="text-xs text-[#64748B] mb-3">Geometric sans-serif with rounded humanist terminals designed for clinical authority and warmth.</p>
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-heading font-bold text-lg text-[#0F2740]">
                      Newark Medical Associates
                    </div>
                  </div>

                  {/* Secondary Tagline Font */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#129A8F]">Supporting Tagline Font</span>
                    <h4 className="font-sans font-medium text-lg text-[#0F2740] mt-1 mb-1">Inter (Medium, 500)</h4>
                    <p className="text-xs text-[#64748B] mb-3">Neutral readability, wide aperture, and balanced optical metrics for small print.</p>
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-sans font-medium text-sm text-[#526579] tracking-normal">
                      Primary & Preventive Care
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Real-World Medical Application Previews */}
          <div>
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#DDE7E5]">
              <div>
                <h2 className="text-2xl font-heading font-bold text-[#0F2740]">Real-World Healthcare Applications</h2>
                <p className="text-sm text-[#526579] mt-1">Simulated clinic physical touchpoints showing consistent institutional prestige.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Mockup 1: Clinic Plaque */}
              <div className="bg-gradient-to-b from-slate-100 to-slate-200 p-8 rounded-2xl border border-slate-300 shadow-inner flex flex-col items-center justify-center text-center relative overflow-hidden">
                {/* Brushed steel plaque */}
                <div className="w-full max-w-[280px] bg-gradient-to-b from-white via-slate-50 to-slate-100 p-6 rounded-xl border border-slate-300 shadow-md relative">
                  {/* Plaque Screws */}
                  <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-400" />
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-400" />
                  <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-400" />
                  <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-400" />

                  <BrandLogo layout="compact" colorScheme="colored" size="sm" />
                  <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] text-slate-500 font-medium">
                    337 Bloomfield Ave • Newark, NJ
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-700 mt-4">Clinic Entrance Plaque</span>
              </div>

              {/* Mockup 2: Physician Prescription / Letterhead */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-[#DDE7E5] flex flex-col items-center justify-center">
                <div className="w-full bg-white p-5 rounded-lg border border-slate-200 shadow-sm relative text-left">
                  <div className="flex items-start justify-between border-b border-slate-200 pb-3 mb-4">
                    <BrandLogo layout="horizontal" colorScheme="colored" size="sm" />
                    <div className="text-[9px] text-slate-400 text-right leading-tight">
                      Lic. #25MA01234500<br />
                      NPI: 1982736450
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-2 bg-slate-100 rounded w-3/4" />
                    <div className="h-2 bg-slate-100 rounded w-1/2" />
                    <div className="h-2 bg-slate-100 rounded w-5/6" />
                  </div>
                  <div className="text-[10px] font-serif text-slate-700 italic border-t border-dashed border-slate-200 pt-2 flex justify-between">
                    <span>Rx: Comprehensive Care</span>
                    <span className="font-sans text-[9px] text-slate-400">Dr. Prahlad Gadhvi, MD</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-700 mt-4">Physician Letterhead & Rx Pad</span>
              </div>

              {/* Mockup 3: Patient Appointment Card */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-[#DDE7E5] flex flex-col items-center justify-center">
                <div className="w-full bg-[#0F2740] text-white p-6 rounded-xl border border-[#1E3A5F] shadow-md relative text-left">
                  <BrandLogo layout="horizontal" colorScheme="white" size="sm" />
                  <div className="mt-6 pt-4 border-t border-white/15 flex justify-between items-end">
                    <div>
                      <div className="text-[9px] text-slate-300 uppercase tracking-wider">Next Appointment</div>
                      <div className="text-xs font-bold text-white mt-0.5">Tuesday, 10:30 AM</div>
                    </div>
                    <div className="text-[10px] text-[#129A8F] font-semibold">
                      (973) 412-9404
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-700 mt-4">Patient Appointment Card</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
