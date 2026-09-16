import React from 'react';
import SeoHead from '../components/SeoHead';
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  CreditCard, 
  HelpCircle, 
  Phone, 
  Calendar,
  ExternalLink 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PatientResourcesPage() {
  const forms = [
    {
      title: "New Patient Registration Form",
      description: "Complete your demographic, emergency contact, and basic medical history before your initial visit.",
      format: "PDF (Printable)",
      size: "240 KB"
    },
    {
      title: "Medical History & Health Questionnaire",
      description: "Comprehensive health questionnaire detailing previous surgeries, family history, and allergies.",
      format: "PDF (Printable)",
      size: "185 KB"
    },
    {
      title: "Medical Records Release Authorization",
      description: "Request records transferred from a previous primary care physician or specialist to our office.",
      format: "PDF (Printable)",
      size: "140 KB"
    },
    {
      title: "HIPAA Notice of Privacy Practices Acknowledgement",
      description: "Formal acknowledgment of our federal HIPAA privacy practices and disclosure safeguards.",
      format: "PDF (Printable)",
      size: "165 KB"
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <SeoHead
        title="Patient Resources & Registration Forms | Newark Medical Associates"
        description="Access new patient forms, insurance guidelines, what to bring to your appointment, and medical records release requests for Newark Medical Associates in Newark, NJ."
        keywords={[
          "patient forms Newark NJ",
          "new patient registration Newark Medical",
          "medical records release Newark",
          "patient portal Newark NJ",
          "337 Bloomfield Ave patient resources"
        ]}
        canonicalUrl="https://newarkmed.com/patient-resources"
      />

      {/* Header */}
      <section className="bg-white border-b border-slate-200/80 pt-12 pb-16 md:pt-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold uppercase tracking-wider mb-4">
              <FileText size={14} className="text-primary-500" />
              <span>Helpful Resources</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
              Patient Resources & Information
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
              Everything you need to prepare for your appointment at Newark Medical Associates. Download new patient intake forms, review insurance instructions, and learn what to bring on the day of your visit.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-7 py-3.5 rounded-full text-sm shadow-md transition-colors"
              >
                <Calendar size={17} />
                <span>Book an Appointment</span>
              </Link>
              <a
                href="tel:+19734129404"
                className="inline-flex items-center gap-2 text-slate-700 hover:text-primary-600 border border-slate-200 bg-white hover:bg-slate-50 font-semibold px-6 py-3.5 rounded-full text-sm transition-colors"
              >
                <Phone size={17} className="text-primary-500" />
                <span>Call (973) 412-9404</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        {/* Downloadable Forms */}
        <div className="mb-16">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Downloadable Patient Forms
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Printing and completing these forms prior to your visit reduces waiting room time and accelerates your intake.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {forms.map((form) => (
              <div
                key={form.title}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-md">
                      {form.format}
                    </span>
                    <span className="text-xs text-slate-400">{form.size}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {form.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                    {form.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Bring to reception</span>
                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault();
                      window.print();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download / Print</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What to Bring Checklist */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs mb-16">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
              <CheckCircle2 size={13} />
              <span>Appointment Checklist</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              What to Bring to Your First Visit
            </h2>
            <p className="text-slate-600 text-sm">
              Please arrive 15 minutes before your scheduled appointment time with the following items:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Government Photo ID</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Driver's license, state ID card, passport, or municipal photo identification.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                <CreditCard size={18} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Current Health Insurance Card</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Primary and secondary insurance cards, Medicare, or HMO authorization if needed.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                <FileText size={18} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">List of Medications</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Current prescription pill bottles, over-the-counter vitamins, and dosage frequencies.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                <Clock size={18} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Copay or Payment</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Insurance copays or self-pay fees are collected at check-in. Credit cards and cash accepted.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                <FileText size={18} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Prior Medical Records</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Recent blood test results, specialist consult notes, surgical histories, or immunization cards.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                <HelpCircle size={18} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Questions for Your Doctor</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A written list of specific symptoms, questions, or goals you wish to discuss with our physician.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Records & Privacy Notice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-7 border border-slate-200/80">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Requesting Medical Records</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              To request copies of your health records, complete a signed Medical Records Release form. Written authorization is required to safeguard your protected health information in accordance with HIPAA guidelines.
            </p>
            <p className="text-xs text-slate-500">
              Standard processing time: 3 to 5 business days. Call (973) 412-9404 for urgent hospital or specialist records transfers.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-slate-200/80">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Prescription Refill Policy</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              For routine chronic medication refills, please have your pharmacy submit an electronic refill request directly to Newark Medical Associates, or contact our clinic 48 to 72 hours before running out of medication.
            </p>
            <p className="text-xs text-slate-500">
              Patients taking ongoing maintenance therapies must be evaluated in-person at least once every 3 to 6 months.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
