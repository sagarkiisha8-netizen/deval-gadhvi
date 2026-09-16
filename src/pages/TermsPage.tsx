import React from 'react';
import SeoHead from '../components/SeoHead';
import { FileText, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <SeoHead
        title="Terms of Service & Medical Disclaimer | Newark Medical Associates"
        description="Review terms of use, appointment cancellation guidelines, emergency medical disclaimers, and legal policies for Newark Medical Associates website visitors."
        keywords={[
          "terms of service Newark Medical Associates",
          "medical disclaimer Newark NJ",
          "clinic terms Bloomfield Ave Newark"
        ]}
        canonicalUrl="https://newarkmed.com/terms"
      />

      <section className="bg-white border-b border-slate-200/80 pt-12 pb-14 md:pt-16 md:pb-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <FileText size={14} className="text-primary-500" />
            <span>Legal Agreement</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-4">
            Terms of Use & Medical Disclaimer
          </h1>
          <p className="text-slate-500 text-sm">
            Last Updated: January 2026 • Newark Medical Associates (337 Bloomfield Ave, Newark, NJ 07107)
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12 md:py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
          {/* Emergency Alert Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6 flex items-start gap-4">
            <AlertTriangle className="text-amber-600 shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-amber-950 text-base mb-1">
                Medical Emergency Disclaimer — Do Not Use This Site for Emergencies
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                If you are experiencing a life-threatening medical emergency (such as severe chest pain, shortness of breath, sudden numbness or speech difficulty, or severe uncontrolled bleeding), immediately call <strong>911</strong> or proceed to the nearest emergency department (such as University Hospital or Clara Maass Medical Center).
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using this website (https://newarkmedicalassociates.com/ or https://newarkmed.com/), you acknowledge that you have read, understood, and agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree to these terms, please do not use our website.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              2. Informational Medical Content Only
            </h2>
            <p className="mb-3">
              The articles, service descriptions, blog posts, and educational materials published on this website are provided strictly for general educational and informational purposes. They do not constitute formal medical advice, diagnosis, or personalized treatment recommendations.
            </p>
            <p>
              Viewing or interacting with this website does NOT establish a doctor-patient relationship. A formal physician-patient relationship is established only upon completing an in-person clinical consultation and mutual agreement at our Newark, NJ facility.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              3. Online Appointment Requests & Confirmations
            </h2>
            <p className="mb-3">
              Submitting an online appointment request through our digital booking form expresses your requested date and clinical preference. Appointments are confirmed only after our scheduling staff contacts you by phone, email, or SMS to verify your insurance and slot availability.
            </p>
            <p>
              Please notify our office at least 24 hours in advance if you need to reschedule or cancel your appointment so we can offer that slot to other waiting patients.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              4. Intellectual Property
            </h2>
            <p>
              All content, brand design, logos, clinical text, graphics, and software code on this website are the property of Newark Medical Associates and protected by United States and international copyright and trademark laws. Unauthorized copying or redistribution is strictly prohibited.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              5. Governing Law
            </h2>
            <p>
              These Terms of Use are governed by and construed in accordance with the laws of the State of New Jersey, without regard to its conflict of law principles. Any legal proceedings related to this website shall be brought exclusively in Essex County, New Jersey.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              6. Contact Information
            </h2>
            <p>
              For questions regarding these Terms of Use, please reach out to Newark Medical Associates, 337 Bloomfield Avenue, Newark, NJ 07107, phone: (973) 412-9404.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
