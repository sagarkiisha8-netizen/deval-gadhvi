import React from 'react';
import { motion } from 'motion/react';
import SeoHead from '../components/SeoHead';
import { 
  Activity, 
  Droplets, 
  Sparkles, 
  ShieldAlert, 
  HeartHandshake, 
  Waves, 
  Gauge, 
  FileCheck2,
  Calendar,
  CheckCircle2,
  Phone,
  Clock,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DiagnosticsPage() {
  const diagnosticsList = [
    {
      id: "annual-work-physicals",
      title: "Annual & Work Physicals",
      category: "Preventive & Employment",
      icon: FileCheck2,
      color: "text-blue-600",
      bg: "bg-blue-50",
      description: "Routine yearly exams, DOT driver medical certifications, pre-employment physical screenings, school, sports, and camp clearances.",
      turnaround: "Same-Day Forms Completion",
      inclusions: [
        "Vital signs, BMI & biometric screening",
        "Vision, hearing & cardiopulmonary exam",
        "Required employer paperwork completion",
        "DOT CDL medical card certification"
      ]
    },
    {
      id: "ekg-testing",
      title: "12-Lead EKG Testing",
      category: "Cardiac Diagnostics",
      icon: Activity,
      color: "text-rose-600",
      bg: "bg-rose-50",
      description: "Rapid, non-invasive resting 12-lead electrocardiograms to measure the electrical activity of your heart, detect arrhythmias, and screen for cardiac ischemia.",
      turnaround: "Immediate Physician Review",
      inclusions: [
        "Immediate printed trace & physician interpretation",
        "Arrhythmia & conduction defect detection",
        "Pre-operative baseline cardiac evaluation",
        "Chest pain / palpitations triage"
      ]
    },
    {
      id: "blood-testing",
      title: "Certified In-Office Blood Testing",
      category: "Laboratory Services",
      icon: Droplets,
      color: "text-purple-600",
      bg: "bg-purple-50",
      description: "Convenient in-clinic phlebotomy draws analyzed by accredited reference laboratories for comprehensive routine and diagnostic blood panels.",
      turnaround: "24–48 Hour Results Portal",
      inclusions: [
        "Comprehensive Metabolic Panel (CMP) & CBC",
        "Lipid & cholesterol profile",
        "Hemoglobin A1c diabetes screening & monitoring",
        "Thyroid panel (TSH, Free T4) & Vitamin levels"
      ]
    },
    {
      id: "allergy-testing",
      title: "Allergy Testing & Consultation",
      category: "Specialized Diagnostics",
      icon: Sparkles,
      color: "text-amber-600",
      bg: "bg-amber-50",
      description: "Evidence-based testing to detect environmental allergens, pollen, dust, pet dander, mold, and food sensitivities with physician guidance.",
      turnaround: "Physician Assessment",
      inclusions: [
        "Environmental allergen identification",
        "Respiratory allergy evaluation",
        "Food sensitivity consultation",
        "Personalized avoidance & treatment protocols"
      ]
    },
    {
      id: "std-testing",
      title: "Confidential STD Testing",
      category: "Sexual Health",
      icon: ShieldAlert,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      description: "Discrete, compassionate, and 100% confidential in-office screenings for common sexually transmitted infections in a supportive environment.",
      turnaround: "Discrete Digital Delivery",
      inclusions: [
        "Comprehensive blood & urine testing panels",
        "HIV, Syphilis, Hepatitis B & C screenings",
        "Chlamydia & Gonorrhea molecular testing",
        "Prompt, confidential treatment & partner counseling"
      ]
    },
    {
      id: "pre-operative-exams",
      title: "Pre-Operative Medical Clearance",
      category: "Surgical Readiness",
      icon: HeartHandshake,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      description: "Thorough pre-surgical risk assessments and formal documentation required by surgeons and anesthesiologists before elective or inpatient operations.",
      turnaround: "Expedited for Surgery Dates",
      inclusions: [
        "Detailed surgical risk stratification",
        "Pre-op 12-lead EKG & complete lab panel",
        "Direct communication with operating surgeons",
        "Official signed medical clearance reports"
      ]
    },
    {
      id: "echo-testing",
      title: "Echocardiogram (ECHO)",
      category: "Cardiovascular Imaging",
      icon: Waves,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      description: "State-of-the-art non-invasive ultrasound imaging providing high-resolution moving pictures of your heart valves, chambers, and blood flow velocity.",
      turnaround: "Board-Certified Cardiologist Read",
      inclusions: [
        "Assessment of heart muscle thickness & chamber sizes",
        "Evaluation of aortic, mitral, and tricuspid valve function",
        "Measurement of cardiac ejection fraction (EF)",
        "Detection of cardiomyopathy and heart failure indicators"
      ]
    },
    {
      id: "stress-testing",
      title: "Cardiac Stress Testing",
      category: "Cardiovascular Evaluation",
      icon: Gauge,
      color: "text-red-600",
      bg: "bg-red-50",
      description: "Supervised exercise or pharmacological stress tests to evaluate coronary blood flow and myocardial performance under controlled exertion.",
      turnaround: "Specialist Follow-Up",
      inclusions: [
        "Continuous heart rhythm and blood pressure monitoring",
        "Assessment for coronary artery disease (CAD)",
        "Exercise tolerance and functional capacity score",
        "Guided by cardiology specialists"
      ]
    }
  ];

  const diagnosticFaqs = [
    {
      question: "Do I need to fast before getting blood tests drawn?",
      answer: "Certain tests, such as fasting lipid panels (cholesterol) and fasting glucose / metabolic panels, typically require 8 to 12 hours of water-only fasting. When scheduling your appointment, our staff will provide clear instructions on whether your specific tests require fasting."
    },
    {
      question: "Can I get an EKG or blood draw on the same day as my appointment?",
      answer: "Yes! Newark Medical Associates offers certified phlebotomy and 12-lead EKG testing directly during your primary care or physical exam visit at 337 Bloomfield Ave."
    },
    {
      question: "How quickly will I receive my diagnostic results?",
      answer: "EKG interpretations and routine physical clearances are provided immediately during your visit. Most standard blood test panels return in 24 to 48 hours, and our medical team will contact you directly to review the findings."
    },
    {
      question: "Are diagnostic tests covered by insurance?",
      answer: "Most commercial insurances, Medicare, and Managed Medicaid cover medically necessary diagnostic tests, routine screening blood work, EKGs, and echocardiograms. We also offer affordable, transparent self-pay rates."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <SeoHead
        title="On-Site Diagnostic Testing Newark NJ | EKGs, Blood Work, Ultrasounds"
        description="Certified in-office diagnostic services in Newark, NJ at Newark Medical Associates. 12-lead EKGs, phlebotomy lab testing, echocardiograms, allergy testing, pre-op clearances, and physicals at 337 Bloomfield Ave."
        keywords={[
          "diagnostic testing Newark NJ",
          "blood work Newark NJ",
          "EKG test Newark NJ",
          "echocardiogram Newark",
          "allergy testing Newark",
          "pre-operative exam Newark NJ",
          "STD testing Newark NJ",
          "medical clinic Bloomfield Ave Newark"
        ]}
        canonicalUrl="https://newarkmed.com/diagnostics"
        faqs={diagnosticFaqs}
      />

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200/80 pt-12 pb-16 md:pt-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles size={14} className="text-primary-500" />
              <span>In-Office Testing Center</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
              On-Site Diagnostic Testing in Newark, NJ
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
              Fast, reliable diagnostic evaluations performed directly inside our 337 Bloomfield Avenue medical clinic without third-party imaging facility delays. From rapid EKGs and blood draws to comprehensive cardiac ultrasounds and surgical clearances.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-7 py-3.5 rounded-full text-sm shadow-md shadow-primary-600/20 transition-all hover:scale-105"
              >
                <Calendar size={17} />
                <span>Schedule Diagnostic Testing</span>
              </Link>
              <a
                href="tel:+19734129404"
                className="inline-flex items-center gap-2 text-slate-700 hover:text-primary-600 border border-slate-200 bg-white hover:bg-slate-50 font-semibold px-6 py-3.5 rounded-full text-sm transition-colors"
              >
                <Phone size={17} className="text-primary-500" />
                <span>(973) 412-9404</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Diagnostic Services Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
              Available In-Office Diagnostic Tests
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              All tests are administered by trained medical personnel and interpreted by board-certified physicians.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {diagnosticsList.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center`}>
                        <Icon size={24} />
                      </div>
                      <span className="text-[11px] font-bold text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                        {item.turnaround}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {item.title}
                    </h3>

                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                      {item.description}
                    </p>

                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Includes & Evaluates:
                    </h4>
                    <div className="space-y-2 mb-6">
                      {item.inclusions.map((inc) => (
                        <div key={inc} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                          <CheckCircle2 size={15} className="text-primary-500 shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Performed at 337 Bloomfield Ave</span>
                    <Link
                      to={`/contact?service=${encodeURIComponent(item.title)}`}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      <span>Book Test</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Patient Preparation Guide */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Preparing for Your Diagnostic Appointment
            </h2>
            <p className="text-slate-600 text-sm">
              Simple steps to ensure your diagnostic tests proceed smoothly and accurately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Fasting Instructions</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                If scheduled for cholesterol or blood glucose panels, fast for 8–12 hours prior. Drinking plenty of plain water is encouraged to assist with blood draws.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Comfortable Attire</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                For EKGs, echocardiograms, or stress tests, wear comfortable, two-piece loose clothing and walking shoes for effortless sensor placement.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Medication List</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Bring a list or photo of all current prescription medications, supplements, and dosages so our physicians can correlate your diagnostic findings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Diagnostics FAQ */}
      <section className="py-16 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-8">
            Frequently Asked Diagnostic Questions
          </h2>

          <div className="space-y-4">
            {diagnosticFaqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200/80">
                <h3 className="text-base font-bold text-slate-900 mb-2">{faq.question}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-14 bg-primary-700 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Need Timely Diagnostic Testing in Newark?
          </h2>
          <p className="text-primary-100 text-sm sm:text-base mb-8 max-w-xl mx-auto">
            Book online or call our clinical desk at 337 Bloomfield Avenue for prompt same-week scheduling.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="bg-white text-primary-700 hover:bg-primary-50 font-bold px-7 py-3 rounded-full text-sm shadow-md transition-colors"
            >
              Book an Appointment
            </Link>
            <a
              href="tel:+19734129404"
              className="bg-primary-800/80 hover:bg-primary-800 text-white border border-primary-500 font-bold px-7 py-3 rounded-full text-sm transition-colors"
            >
              Call (973) 412-9404
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
