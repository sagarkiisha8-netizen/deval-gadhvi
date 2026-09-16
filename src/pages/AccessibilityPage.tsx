import React from 'react';
import SeoHead from '../components/SeoHead';
import { Eye, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AccessibilityPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <SeoHead
        title="Accessibility Statement | Newark Medical Associates"
        description="Newark Medical Associates is committed to ensuring digital accessibility for people with disabilities in accordance with WCAG 2.1 AA standards."
        keywords={[
          "accessibility statement Newark Medical",
          "ADA compliance medical website Newark",
          "WCAG medical website"
        ]}
        canonicalUrl="https://newarkmed.com/accessibility"
      />

      <section className="bg-white border-b border-slate-200/80 pt-12 pb-14 md:pt-16 md:pb-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <Eye size={14} className="text-primary-500" />
            <span>Inclusive Design</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-4">
            Accessibility Statement
          </h1>
          <p className="text-slate-500 text-sm">
            Committed to WCAG 2.1 AA Accessibility Standards • Newark Medical Associates
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12 md:py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              1. Our Digital Accessibility Commitment
            </h2>
            <p>
              Newark Medical Associates is committed to ensuring that our digital healthcare experience is accessible to everyone, including individuals with disabilities. We continually improve the user experience for all patients by applying relevant accessibility standards based on the World Wide Web Consortium (W3C) Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              2. Accessibility Features on This Website
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-primary-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Keyboard Navigation:</strong>
                  <span className="text-slate-600 text-sm block">All interactive controls, booking forms, modal dialogs, and navigation links are accessible via keyboard Tab, Enter, and Esc keys.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-primary-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">High Color Contrast:</strong>
                  <span className="text-slate-600 text-sm block">All body text and heading typography meet or exceed the minimum 4.5:1 WCAG AA contrast ratio against backgrounds.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-primary-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Alternative Text on Visuals:</strong>
                  <span className="text-slate-600 text-sm block">Meaningful images, provider portraits, and clinic illustrations feature descriptive alternative text attributes for screen readers.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-primary-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Responsive Scalability:</strong>
                  <span className="text-slate-600 text-sm block">The site layout adapts fluidly across mobile phones, tablets, and desktop displays with full support for browser font zooming up to 200%.</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              3. Physical Clinic Accessibility at 337 Bloomfield Ave
            </h2>
            <p className="mb-3">
              Our Newark medical clinic is designed to be fully ADA compliant:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2 text-sm sm:text-base">
              <li>Ground-floor, step-free patient entrance with automated door accessibility.</li>
              <li>Dedicated ADA-accessible parking spaces adjacent to the main clinic doors.</li>
              <li>Wheelchair-accessible examination rooms and ADA-compliant patient restrooms.</li>
              <li>Accommodations for service animals and multilingual translation assistance.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              4. Accessibility Feedback & Assistance
            </h2>
            <p className="mb-4">
              If you experience any difficulty accessing content on this website or need assistance scheduling an appointment, our dedicated team is available to assist you via phone or email:
            </p>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-sm text-slate-700 space-y-2">
              <p className="flex items-center gap-2">
                <Phone size={16} className="text-primary-600" />
                <span><strong>Phone Assistance:</strong> <a href="tel:+19734129404" className="text-primary-700 hover:underline">(973) 412-9404</a></span>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={16} className="text-primary-600" />
                <span><strong>Email:</strong> <a href="mailto:accessibility@newarkmedicalassociates.com" className="text-primary-700 hover:underline">accessibility@newarkmedicalassociates.com</a></span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-primary-600" />
                <span><strong>In Person:</strong> 337 Bloomfield Avenue, Newark, NJ 07107</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
