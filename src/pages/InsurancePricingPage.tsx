import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, CheckCircle2, Phone, Calendar, 
  HelpCircle, ChevronDown, ChevronUp, FileText, 
  CreditCard, AlertCircle, ArrowRight, UserCheck, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { NEWARK_PRACTICE_INFO } from '../data/localSeoData';
import AppointmentBookingForm from '../components/AppointmentBookingForm';

export default function InsurancePricingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const insuranceCategories = [
    {
      category: 'Medicare & Medicare Advantage',
      plans: [
        'Traditional Medicare Part B',
        'Horizon Blue Cross Blue Shield Medicare Advantage',
        'Aetna Medicare Advantage',
        'UnitedHealthcare Medicare Complete',
        'Braven Health Medicare Plans',
        'Clover Health Medicare Advantage',
        'Humana Medicare Advantage'
      ]
    },
    {
      category: 'Commercial & Employer Health Plans',
      plans: [
        'Horizon Blue Cross Blue Shield of NJ (Omnia, EPO, PPO, POS, Direct Access)',
        'Aetna Health (HMO, PPO, Open Choice, POS)',
        'Cigna Healthcare (Open Access, PPO, POS)',
        'UnitedHealthcare / Oxford Health Plan (Liberty, Freedom, Choice Plus)',
        'QualCare Network Plans',
        'MultiPlan / PHCS PPO Network',
        'EmblemHealth / GHI (PPO & Select Networks)'
      ]
    },
    {
      category: 'NJ FamilyCare & Managed Medicaid',
      plans: [
        'Amerigroup / Wellpoint New Jersey',
        'Horizon NJ Health (Selected primary care panels)',
        'UnitedHealthcare Community Plan (Please call to verify current panel)'
      ]
    }
  ];

  const whatToBring = [
    {
      title: 'Valid Government Photo ID',
      desc: 'Driver’s license, state identification card, or passport.'
    },
    {
      title: 'Active Health Insurance Card',
      desc: 'Physical card or clear digital copy showing policy and group numbers.'
    },
    {
      title: 'Current Medication Bottles or List',
      desc: 'All prescription drugs, over-the-counter vitamins, and supplements with dosages.'
    },
    {
      title: 'Past Medical & Immunization Records',
      desc: 'Recent lab results, specialist notes, or hospital discharge summaries if transferring care.'
    },
    {
      title: 'Copay or Payment Method',
      desc: 'Credit card, debit card, HSA/FSA card, or cash for any applicable specialist copay.'
    }
  ];

  const insuranceFaqs = [
    {
      question: 'What if my insurance requires a primary care physician (PCP) selection?',
      answer: 'For HMO and POS plans that require a designated PCP, you can easily designate Dr. Prahlad Gadhvi or Dr. Deval Gadhvi as your PCP through your insurance portal or by calling the member services number on the back of your insurance card.'
    },
    {
      question: 'Is preventive care completely free under my insurance?',
      answer: 'Under the Affordable Care Act (ACA), most private insurance plans, Horizon BCBS, and Medicare cover routine annual wellness physicals and recommended preventive screenings with $0 patient copay or deductible.'
    },
    {
      question: 'Do you offer options for patients without health insurance (Self-Pay)?',
      answer: 'Yes! We believe quality healthcare should be accessible to everyone in Newark. We provide transparent, discounted self-pay rates for office visits, routine blood work, and on-site diagnostic tests. Please call (973) 412-9404 for fee details.'
    },
    {
      question: 'How do copays, deductibles, and coinsurance work?',
      answer: 'A copay is a fixed fee set by your insurer due at the time of your visit. Deductibles and coinsurance depend on your individual plan tier. Our billing team verifies your benefits prior to your appointment to prevent unexpected surprises.'
    },
    {
      question: 'Can I use my HSA (Health Savings Account) or FSA (Flexible Spending Account)?',
      answer: 'Yes! All medical consultations, on-site diagnostics, EKGs, ultrasound scans, lab tests, and medical weight management visits are eligible HSA/FSA medical expenses.'
    }
  ];

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Insurance & Pricing', url: '/insurance-pricing' }
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <SeoHead
        title="Accepted Insurance & Patient Information Newark NJ | Newark Medical Associates"
        description="View accepted health insurances (Medicare, Horizon BCBS, Aetna, Cigna, UnitedHealthcare) and affordable self-pay options at Newark Medical Associates in Newark, NJ."
        keywords={[
          'insurance accepted Newark medical',
          'Medicare doctor Newark NJ',
          'Horizon BCBS primary care Newark',
          'Aetna doctor Newark NJ',
          'self-pay doctor Newark',
          'medical clinic insurance Newark'
        ]}
        canonicalUrl="https://newarkmed.com/insurance-pricing"
        breadcrumbs={breadcrumbs}
        faqs={insuranceFaqs}
      />

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200 pt-28 pb-4">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Insurance & Patient Information</span>
        </div>
      </div>

      {/* Hero Header */}
      <section className="bg-white border-b border-slate-200 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Transparent, Accessible Healthcare</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15] mb-6">
            Accepted Insurance Plans & Patient Billing Information
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
            At Newark Medical Associates, we partner with all major health insurance providers and offer clear, affordable self-pay rates so you receive prompt, high-quality medical care without financial stress.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-7 py-3.5 rounded-full text-base font-semibold hover:bg-primary-700 shadow-md shadow-primary-600/20 transition-all hover:scale-105"
            >
              <Calendar size={18} />
              <span>Book Appointment</span>
            </button>
            <a
              href={`tel:${NEWARK_PRACTICE_INFO.rawPhone}`}
              className="inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-800 border border-slate-300 px-7 py-3.5 rounded-full text-base font-semibold hover:bg-slate-200 transition-all"
            >
              <Phone size={18} className="text-primary-600" />
              <span>Verify Your Plan: (973) 412-9404</span>
            </a>
          </div>
        </div>
      </section>

      {/* Insurances Accepted Grid */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Insurances We Proudly Accept
          </h2>
          <p className="text-sm text-slate-600">
            If your insurance provider is not listed below, please contact our office at (973) 412-9404 as we frequently update our network participation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {insuranceCategories.map((cat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-7 md:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold mb-5">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">{cat.category}</h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                  {cat.plans.map((p, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="text-primary-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-100 text-xs text-slate-500">
                <span>In-Network Benefits Verified In Advance</span>
              </div>
            </div>
          ))}
        </div>

        {/* Self-Pay & Uninsured Patients Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 md:p-12 shadow-xl mb-16">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="text-primary-400 text-xs font-bold uppercase tracking-wider block mb-2">
                Uninsured & Self-Pay Options
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Affordable Medical Care for Every Newark Resident
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                Don’t have health insurance? We provide discounted, upfront pricing for doctor consultations, routine physicals, on-site lab testing, and diagnostic ultrasounds so you never delay essential medical care.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-primary-400 shrink-0" />
                  <span>Transparent Upfront Pricing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-primary-400 shrink-0" />
                  <span>No Hidden Facility Fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-primary-400 shrink-0" />
                  <span>HSA / FSA Cards Accepted</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <a
                href="tel:+19734129404"
                className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all text-sm"
              >
                <Phone size={16} />
                <span>Inquire About Self-Pay Fees</span>
              </a>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3.5 px-6 rounded-2xl border border-white/20 transition-all text-sm"
              >
                <Calendar size={16} />
                <span>Book a Self-Pay Visit</span>
              </button>
            </div>
          </div>
        </div>

        {/* What to Bring Checklist */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/80 shadow-xs mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
              What to Bring to Your Appointment
            </h2>
            <p className="text-sm text-slate-600">
              Having these items ready helps our front desk team register you quickly and avoid delays.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whatToBring.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col justify-start"
              >
                <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs mb-4">
                  0{idx + 1}
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Insurance FAQs */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/80 shadow-xs">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight flex items-center gap-3">
            <HelpCircle className="text-primary-600" size={24} />
            <span>Insurance & Billing FAQs</span>
          </h2>

          <div className="space-y-4">
            {insuranceFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex justify-between items-center gap-4 bg-white hover:bg-slate-50 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="font-bold text-slate-900 text-base">{faq.question}</span>
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-5 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center font-bold"
              aria-label="Close booking modal"
            >
              ✕
            </button>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-900">Request an Appointment</h3>
              <p className="text-xs text-slate-500">In-Network Insurance & Affordable Self-Pay Options</p>
            </div>
            <AppointmentBookingForm
              onSuccess={() => setIsBookingModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
