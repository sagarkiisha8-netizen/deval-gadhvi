import React from 'react';
import SeoHead from '../components/SeoHead';
import { Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <SeoHead
        title="Privacy Policy & HIPAA Notice | Newark Medical Associates"
        description="Learn how Newark Medical Associates protects your sensitive personal and medical data in accordance with the Health Insurance Portability and Accountability Act (HIPAA)."
        keywords={[
          "privacy policy Newark Medical Associates",
          "HIPAA policy Newark NJ",
          "medical privacy practices",
          "protected health information"
        ]}
        canonicalUrl="https://newarkmed.com/privacy-policy"
      />

      <section className="bg-white border-b border-slate-200/80 pt-12 pb-14 md:pt-16 md:pb-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <Shield size={14} className="text-primary-500" />
            <span>Legal & Compliance</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-4">
            Privacy Policy & HIPAA Notice
          </h1>
          <p className="text-slate-500 text-sm">
            Last Updated: January 2026 • Newark Medical Associates (337 Bloomfield Ave, Newark, NJ 07107)
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12 md:py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Lock size={20} className="text-primary-600" />
              <span>1. Commitment to Your Privacy & HIPAA Compliance</span>
            </h2>
            <p>
              Newark Medical Associates ("we," "our," or "the Practice") is dedicated to maintaining the privacy and security of your personal and medical information. This Notice of Privacy Practices describes how Protected Health Information (PHI) about you may be used and disclosed, and how you can obtain access to this information in compliance with the Health Insurance Portability and Accountability Act of 1996 (HIPAA) and New Jersey state laws.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              2. How We May Use and Disclose Health Information
            </h2>
            <ul className="list-disc list-inside space-y-2 text-slate-600 pl-2">
              <li>
                <strong className="text-slate-800">For Treatment:</strong> We use your medical history, examination findings, and diagnostic results to diagnose and treat you, coordinate specialist referrals, and order appropriate lab tests.
              </li>
              <li>
                <strong className="text-slate-800">For Payment:</strong> We may submit your clinical documentation to your health insurance provider, Medicare, or third-party payers to bill and collect payment for services rendered.
              </li>
              <li>
                <strong className="text-slate-800">For Healthcare Operations:</strong> We utilize medical data to assess quality of care, conduct internal audits, train administrative staff, and improve patient clinic workflows.
              </li>
              <li>
                <strong className="text-slate-800">Required by Law:</strong> We disclose information when federally mandated, such as reporting certain communicable diseases to the New Jersey Department of Health or responding to court orders.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              3. Online Information Collection via This Website
            </h2>
            <p className="mb-3">
              When you submit appointment requests, contact messages, or consultation inquiries through our website forms, we collect information including your name, contact phone number, email address, preferred appointment date, and requested service.
            </p>
            <p>
              All online form transmissions are encrypted using standard Transport Layer Security (TLS 1.3 / SSL) cryptography. We do NOT sell, rent, or trade your contact information or personal data to third-party commercial advertisers.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              4. Cookies and Analytical Technologies
            </h2>
            <p>
              Our website uses privacy-respecting functional cookies to remember user preferences and anonymous web traffic analytics to evaluate site performance. These cookies do not store identifiable personal medical histories or diagnoses.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              5. Your Rights Regarding Your Health Information
            </h2>
            <p className="mb-3">Under federal HIPAA regulations, you have the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
              <li>Inspect and receive paper or electronic copies of your medical records.</li>
              <li>Request amendments or corrections to inaccurate information in your clinical chart.</li>
              <li>Request confidential communication channels (e.g., cell phone only, alternate address).</li>
              <li>Receive an accounting of non-routine disclosures of your protected health information.</li>
              <li>Obtain a physical printed copy of this Notice of Privacy Practices upon request.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              6. Contact Our Privacy Officer
            </h2>
            <p className="mb-2">
              If you have any questions about this Privacy Policy or wish to exercise your patient privacy rights, please contact our clinic directly:
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-1">
              <p><strong>Privacy Officer:</strong> Newark Medical Associates</p>
              <p><strong>Address:</strong> 337 Bloomfield Avenue, Newark, NJ 07107</p>
              <p><strong>Phone:</strong> (973) 412-9404</p>
              <p><strong>Email:</strong> privacy@newarkmedicalassociates.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
