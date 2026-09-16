import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Activity, ArrowRight, ShieldCheck, Search, 
  Calendar, CheckCircle2, HeartPulse, Sparkles, 
  FileText, HelpCircle, Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { DEFAULT_CONDITIONS, ConditionItem } from '../data/conditionsData';
import { getDb } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { NEWARK_PRACTICE_INFO } from '../data/localSeoData';
import { useCmsData } from '../context/CmsContext';

export default function ConditionsPage() {
  const { getMediaUrl, getSiteMedia } = useCmsData();
  const [conditions, setConditions] = useState<ConditionItem[]>(DEFAULT_CONDITIONS);
  const [search, setSearch] = useState('');

  useEffect(() => {
    try {
      const db = getDb();
      const unsub = onSnapshot(collection(db, 'conditions'), (snap) => {
        if (!snap.empty) {
          const list: ConditionItem[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() as any }));
          list.sort((a, b) => a.displayOrder - b.displayOrder);
          setConditions(list);
        }
      }, (err) => console.warn('Conditions listener offline:', err));
      return () => unsub();
    } catch {
      // offline fallback
    }
  }, []);

  const activeConditions = conditions.filter(c => c.isActive !== false);

  const filtered = activeConditions.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.overview.toLowerCase().includes(search.toLowerCase()) ||
    c.symptoms.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <SeoHead
        title="Treatments & Conditions Treated | Newark Medical Associates | Newark, NJ"
        description="Explore adult medical conditions treated at Newark Medical Associates in Newark, NJ: hypertension, type 2 diabetes, high cholesterol, thyroid, and asthma."
        canonicalUrl="https://newarkmed.com/conditions"
        keywords={['conditions treated Newark NJ', 'hypertension doctor Newark', 'diabetes specialist Newark NJ', 'chronic disease Newark']}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f4f8fc] to-white border-b border-slate-200 pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <HeartPulse size={14} className="text-primary-600" />
            <span>Clinical Knowledge & Patient Care</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4 max-w-3xl mx-auto">
            Conditions We Diagnose & Treat
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Evidence-based medical management for common adult chronic illnesses, metabolic disorders, and acute symptoms in Newark, New Jersey.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by condition, symptom (e.g. fatigue, blood pressure)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-full border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-xs"
            />
          </div>
        </div>
      </section>

      {/* Conditions Grid */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:border-primary-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Photo */}
                <div className="h-48 relative overflow-hidden bg-slate-100">
                  {(() => {
                    const cMedia = getSiteMedia('conditions', item.slug, 'featured-image') || getSiteMedia('conditions', item.id, 'featured-image');
                    const cUrl = getMediaUrl('conditions', item.slug, 'featured-image') || getMediaUrl('conditions', item.id, 'featured-image') || item.featuredImage || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800';
                    return (
                      <img
                        src={cUrl}
                        alt={cMedia?.altText || item.name}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                        style={{
                          objectFit: (cMedia?.objectFit as any) || 'cover',
                          objectPosition: cMedia?.position || 'center'
                        }}
                        referrerPolicy="no-referrer"
                      />
                    );
                  })()}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-4 text-white text-xs font-bold bg-primary-600/90 backdrop-blur-xs px-2.5 py-1 rounded-full">
                    Internal Medicine
                  </span>
                </div>

                {/* Body */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {item.name}
                  </h2>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3">
                    {item.overview}
                  </p>

                  {/* Common symptoms snippet */}
                  <div className="pt-3 border-t border-slate-100 mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Key Clinical Indicators:
                    </span>
                    <div className="space-y-1">
                      {item.symptoms.slice(0, 3).map((sym, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                          <span className="truncate">{sym}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="px-6 pb-6 pt-2 border-t border-slate-50 flex items-center justify-between">
                <Link
                  to={`/conditions/${item.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 group-hover:text-primary-700 group-hover:translate-x-0.5 transition-all"
                >
                  <span>Learn Symptoms & Treatments</span>
                  <ArrowRight size={14} />
                </Link>

                <Link
                  to="/appointments"
                  className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-primary-50 text-[11px] font-semibold text-slate-700 hover:text-primary-600 transition-colors"
                >
                  Book Care
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto">
            <Activity className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No matching condition found</h3>
            <p className="text-xs text-slate-500 mb-4">
              We treat a comprehensive spectrum of adult acute and chronic illnesses. Contact our Newark medical team directly to discuss your specific symptoms.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors"
            >
              <Phone size={14} />
              <span>Contact Clinic</span>
            </Link>
          </div>
        )}

        {/* Bottom Booking Banner */}
        <div className="mt-16 bg-white rounded-3xl p-8 md:p-10 border border-slate-200/80 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              Have Questions About a Condition or Prescription?
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Schedule a comprehensive evaluation with our board-certified physicians in Newark. We offer same-week visits and on-site diagnostic testing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${NEWARK_PRACTICE_INFO.rawPhone}`}
              className="px-5 py-3 rounded-full border border-slate-300 text-slate-800 text-sm font-semibold hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
            >
              <Phone size={16} />
              <span>{NEWARK_PRACTICE_INFO.phone}</span>
            </a>
            <Link
              to="/appointments"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-md shadow-primary-600/20 transition-all"
            >
              <Calendar size={16} />
              <span>Book Appointment</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
