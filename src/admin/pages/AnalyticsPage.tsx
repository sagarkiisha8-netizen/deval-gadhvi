import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Calendar, 
  MousePointerClick, ArrowUpRight, Globe, 
  Smartphone, Monitor, RefreshCw, Loader2, 
  ShieldCheck, AlertCircle, ExternalLink, Settings, 
  CheckCircle2, Sparkles 
} from 'lucide-react';
import { 
  collection, query, orderBy, limit, getDocs, onSnapshot 
} from 'firebase/firestore';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, BarChart, Bar, CartesianGrid 
} from 'recharts';
import { Link } from 'react-router-dom';
import { getDb } from '../../lib/firebase';
import { useCmsData } from '../../context/CmsContext';
import { AnalyticsEvent } from '../../types';

export default function AnalyticsPage() {
  const { settings } = useCmsData();
  const [loading, setLoading] = useState(true);
  
  // Real Firestore Aggregations
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [newAppointmentsCount, setNewAppointmentsCount] = useState(0);
  const [leadsCount, setLeadsCount] = useState(0);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [recentEvents, setRecentEvents] = useState<AnalyticsEvent[]>([]);

  // Check GA4 integration status
  const gaId = settings?.ga4MeasurementId || '';
  const isGaConnected = Boolean(gaId && gaId.trim() !== '');

  useEffect(() => {
    setLoading(true);
    try {
      const db = getDb();
      
      // Real appointments listener
      const unsubAppts = onSnapshot(collection(db, 'appointments'), (snap) => {
        setAppointmentsCount(snap.size);
        let newCount = 0;
        snap.forEach(d => {
          const s = d.data().status;
          if (s === 'new' || s === 'New') newCount++;
        });
        setNewAppointmentsCount(newCount);
      });

      // Real leads listener
      const unsubLeads = onSnapshot(collection(db, 'leads'), (snap) => {
        setLeadsCount(snap.size);
        let newL = 0;
        snap.forEach(d => {
          if (d.data().status === 'new') newL++;
        });
        setNewLeadsCount(newL);
      });

      // Real conversion events listener
      const qEvents = query(collection(db, 'analytics_events'), orderBy('timestamp', 'desc'), limit(25));
      const unsubEvents = onSnapshot(qEvents, (snap) => {
        const list: AnalyticsEvent[] = [];
        snap.forEach(d => {
          list.push({ id: d.id, ...d.data() } as AnalyticsEvent);
        });
        setRecentEvents(list);
        setLoading(false);
      }, () => {
        setLoading(false);
      });

      return () => {
        unsubAppts();
        unsubLeads();
        unsubEvents();
      };
    } catch {
      setLoading(false);
    }
  }, []);

  // Compute conversion summary from real events
  const totalConversions = appointmentsCount + leadsCount;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Website Analytics & Conversion Tracking</h1>
          <p className="text-sm text-slate-500 mt-1">
            HIPAA-compliant, privacy-first conversion tracking and Google Analytics 4 integration.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isGaConnected ? (
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>GA4 Connected ({gaId})</span>
            </div>
          ) : (
            <Link
              to="/admin/settings"
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs"
            >
              <Settings size={14} />
              <span>Configure GA4 in Settings</span>
            </Link>
          )}
        </div>
      </div>

      {/* HIPAA / Privacy Notice Card */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-900">
        <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">HIPAA & Patient Privacy Safe Tracking</span>
          <span>
            Under strict healthcare privacy rules, patient names, phone numbers, emails, and medical complaint notes are NEVER transmitted to external analytics providers. Only non-identifiable conversion signals are tracked.
          </span>
        </div>
      </div>

      {/* Real Firestore KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Patient Bookings</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{appointmentsCount}</span>
            <span className="text-xs font-semibold text-blue-600">
              {newAppointmentsCount} pending review
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Real verified appointment requests</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Patient Inquiries</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{leadsCount}</span>
            <span className="text-xs font-semibold text-indigo-600">
              {newLeadsCount} unread leads
            </span>
          </div>
          <p className="text-[11px] text-slate-400">General contact submissions</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Conversions</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{totalConversions}</span>
            <span className="text-xs font-semibold text-emerald-600">
              Active intake
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Combined appointments & inquiries</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Google Analytics 4</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BarChart3 size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold text-slate-900">
              {isGaConnected ? 'Active GA4 Stream' : 'Not Connected'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {isGaConnected ? `Stream ID: ${gaId}` : 'Requires GA4 Measurement ID'}
          </p>
        </div>
      </div>

      {/* Google Analytics 4 Connection State / Visualizer */}
      {!isGaConnected ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2 border border-amber-200">
            <BarChart3 size={32} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900">
            Connect Google Analytics to display website analytics
          </h3>
          
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            In compliance with our genuine data policy, visitor traffic and clickstream charts will populate directly from your Google Analytics 4 property once connected.
          </p>

          <div className="pt-3">
            <Link
              to="/admin/settings"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-sm transition-all"
            >
              <Settings size={15} />
              <span>Go to Settings & Add Measurement ID</span>
            </Link>
          </div>

          <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-800 block mb-1">1. Create Property</span>
              <span className="text-[11px] text-slate-500">Create a GA4 web property in Google Analytics console.</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-800 block mb-1">2. Copy ID</span>
              <span className="text-[11px] text-slate-500">Copy your Measurement ID starting with G-XXXXXXXXXX.</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-800 block mb-1">3. Save in Admin</span>
              <span className="text-[11px] text-slate-500">Paste in Settings → Website Configurations.</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Google Analytics 4 Live Integration</h3>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Stream Measurement ID: <strong className="font-mono text-slate-800">{gaId}</strong>
              </p>
            </div>

            <a
              href="https://analytics.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              <span>Open Google Analytics Console</span>
              <ExternalLink size={13} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Appointment Conversion Event</span>
              </span>
              <p className="text-slate-500 text-[11px]">
                Event <code className="text-primary-700 bg-white px-1.5 py-0.5 rounded border">appointment_requested</code> automatically fires on successful booking submission.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Contact Lead Event</span>
              </span>
              <p className="text-slate-500 text-[11px]">
                Event <code className="text-primary-700 bg-white px-1.5 py-0.5 rounded border">lead_submitted</code> automatically tracks general question form submissions.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Zero PII Policy</span>
              </span>
              <p className="text-slate-500 text-[11px]">
                All personal patient identifiers are stripped at the boundary to maintain strict HIPAA compliance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Real Firestore Conversion Audit Log */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Real-Time Conversion Event Log</h3>
            <p className="text-[11px] text-slate-500">Live stream of verified patient interaction events recorded in database</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {recentEvents.length} events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="px-6 py-3">Event Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Action Description</th>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3 text-right">Privacy Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-xs">
                    No conversion events recorded yet. Try booking an appointment or submitting a contact inquiry on the public website!
                  </td>
                </tr>
              ) : (
                recentEvents.map((evt, idx) => (
                  <tr key={evt.id || idx} className="hover:bg-slate-50/75">
                    <td className="px-6 py-3 font-mono font-bold text-primary-700">
                      {evt.eventName}
                    </td>
                    <td className="px-6 py-3 capitalize text-slate-600 font-medium">
                      {evt.category || 'conversion'}
                    </td>
                    <td className="px-6 py-3 text-slate-800">
                      {evt.label || 'Website conversion action'}
                    </td>
                    <td className="px-6 py-3 text-slate-400 text-[11px]">
                      {evt.timestamp?.toDate ? evt.timestamp.toDate().toLocaleTimeString() : 'Recent'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck size={10} />
                        <span>No PII</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
