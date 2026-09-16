import React, { useState, useEffect } from 'react';
import { 
  Calendar, Inbox, CheckCircle2, Clock, Users, 
  Activity, ArrowRight, Plus, ExternalLink, 
  Sparkles, TrendingUp, ChevronRight, FileText, 
  Image as ImageIcon, Settings, HeartPulse, 
  CalendarDays, MessageSquare, UserCheck, Stethoscope,
  HelpCircle, MapPin, Bell, History, FolderKanban,
  BookOpen, Layers, Tag, PenSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { useCmsData } from '../../context/CmsContext';
import { Appointment, LeadItem } from '../../types';

export default function AdminDashboard() {
  const { blogs, blogAuthors, blogCategories } = useCmsData();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const db = getDb();
      
      // Listen to appointments
      const qAppt = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'), limit(8));
      const unsubAppt = onSnapshot(qAppt, (snap) => {
        const list: Appointment[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() as any }));
        setAppointments(list);
        setLoading(false);
      }, (err) => {
        console.warn('Dashboard appointments sync:', err);
        setLoading(false);
      });

      // Listen to leads
      const qLeads = query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(8));
      const unsubLeads = onSnapshot(qLeads, (snap) => {
        const list: LeadItem[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() as any }));
        setLeads(list);
      }, (err) => {
        console.warn('Dashboard leads sync:', err);
      });

      return () => {
        unsubAppt();
        unsubLeads();
      };
    } catch {
      setLoading(false);
    }
  }, []);

  const totalApptsCount = appointments.length;
  const newIntakeCount = appointments.filter(a => a.status === 'new' || a.status === 'New').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed' || a.status === 'Confirmed').length;
  const unreadLeadsCount = leads.filter(l => l.status === 'new').length;

  const publishedBlogsCount = blogs.filter(b => b.status === 'published').length;
  const draftBlogsCount = blogs.filter(b => b.status === 'draft').length;

  const quickShortcuts = [
    { name: 'Medical Blog & Articles', path: '/admin/blogs', icon: BookOpen, desc: 'Write, publish, schedule health posts & SEO' },
    { name: 'Medical Authors & Reviewers', path: '/admin/blog-authors', icon: UserCheck, desc: 'Manage doctor credentials, bios & NPI' },
    { name: 'Clinical Categories & Tags', path: '/admin/blog-categories', icon: Layers, desc: 'Cardiovascular, wellness & taxonomy' },
    { name: 'Doctor Profile Manager', path: '/admin/doctor-profile', icon: UserCheck, desc: 'Credentials, fees, timings & biography' },
    { name: 'Conditions & Treatments', path: '/admin/conditions', icon: Stethoscope, desc: 'Hypertension, diabetes & clinical guides' },
    { name: 'Patient Appointments', path: '/admin/appointments', icon: Calendar, desc: 'View bookings, verify slots, export CSV' },
    { name: 'Calendar Schedule', path: '/admin/calendar', icon: CalendarDays, desc: 'Weekly provider consult schedule' },
    { name: 'Patient FAQs', path: '/admin/faqs', icon: HelpCircle, desc: 'Insurance, Medicare, labs & new patient info' },
    { name: 'Clinic Locations', path: '/admin/locations', icon: MapPin, desc: 'Newark offices, maps & transit directions' },
    { name: 'Photo & Awards Gallery', path: '/admin/gallery', icon: ImageIcon, desc: 'Clinic suites, awards & certifications' },
    { name: 'Popups & Announcements', path: '/admin/popups', icon: Bell, desc: 'Prominent alerts, hours & clinic notices' },
    { name: 'All Pages Directory', path: '/admin/page-directory', icon: FolderKanban, desc: 'Instant links to all page CMS editors' },
    { name: 'Homepage CMS Editor', path: '/admin/pages/home', icon: FileText, desc: 'Hero banners, statistics & trust badges' },
    { name: 'Security Audit Logs', path: '/admin/audit-logs', icon: History, desc: 'Login events, content changes & activity trail' },
    { name: 'Practice Settings & GA4', path: '/admin/settings', icon: Settings, desc: 'NPI, hours, phone, address & analytics' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-primary-200 backdrop-blur-xs">
            <Sparkles size={13} />
            <span>Newark Medical Associates Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Clinic Practice Portal & CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time appointment schedule, patient intake requests, and clinical management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors backdrop-blur-xs"
          >
            <ExternalLink size={14} />
            <span>View Live Website</span>
          </a>
          <Link
            to="/admin/appointments"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Plus size={14} />
            <span>Book Patient</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Recent Appointments</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{totalApptsCount}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp size={12} />
              <span>Real Firestore</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Total patient booking records</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">New Intake Requests</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{newIntakeCount}</span>
            {newIntakeCount > 0 ? (
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Needs Review
              </span>
            ) : (
              <span className="text-xs font-semibold text-emerald-600">All Cleared</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">Pending clinic confirmation</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Confirmed Slots</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{confirmedCount}</span>
            <span className="text-xs font-semibold text-emerald-600">On Schedule</span>
          </div>
          <p className="text-[11px] text-slate-400">Ready for patient arrival</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Patient Inquiries</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Inbox size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{leads.length}</span>
            <span className="text-xs font-semibold text-purple-600">{unreadLeadsCount} unread</span>
          </div>
          <p className="text-[11px] text-slate-400">Website lead submissions</p>
        </div>

        <Link 
          to="/admin/blogs"
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 hover:border-primary-300 hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-primary-700 transition-colors">Medical Articles</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{blogs.length}</span>
            <span className="text-xs font-semibold text-emerald-600">
              {publishedBlogsCount} Live
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">{draftBlogsCount} drafts • {blogCategories.length} categories</p>
        </Link>
      </div>

      {/* Quick CMS Action Shortcuts */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">Clinical & Website Management Hub</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickShortcuts.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-primary-300 transition-all flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                <item.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                  {item.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
        </div>
      </div>

      {/* 2-Column Split: Appointments & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Appointments */}
        <div className="bg-white shadow-sm rounded-3xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Recent Patient Appointments</h3>
            <Link to="/admin/appointments" className="text-xs text-primary-600 font-bold hover:underline">
              View All ({appointments.length})
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {appointments.length === 0 ? (
              <li className="px-6 py-8 text-center text-slate-400 text-xs">
                No appointments booked yet.
              </li>
            ) : (
              appointments.slice(0, 5).map((apt) => (
                <li key={apt.id} className="px-6 py-3.5 hover:bg-slate-50 transition-colors">
                  <Link to={`/admin/appointments/${apt.id}`} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-mono font-bold text-slate-700 w-20 shrink-0">
                        {apt.preferredTime}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{apt.patientName}</p>
                        <p className="text-[11px] text-slate-500">{apt.preferredDate} • {apt.providerName}</p>
                      </div>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        apt.status === 'confirmed' || apt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                        apt.status === 'new' || apt.status === 'New' ? 'bg-amber-100 text-amber-800' :
                        apt.status === 'completed' || apt.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {apt.status === 'new' || apt.status === 'New' ? '● New Intake' : apt.status}
                      </span>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white shadow-sm rounded-3xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Recent Patient Inquiries</h3>
            <Link to="/admin/leads" className="text-xs text-primary-600 font-bold hover:underline">
              View All ({leads.length})
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {leads.length === 0 ? (
              <li className="px-6 py-8 text-center text-slate-400 text-xs">
                No patient inquiries received yet.
              </li>
            ) : (
              leads.slice(0, 5).map((lead) => (
                <li key={lead.id} className="px-6 py-3.5 hover:bg-slate-50 transition-colors">
                  <Link to="/admin/leads" className="flex justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">{lead.name}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">"{lead.message}"</p>
                    </div>
                    <div className="shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        lead.status === 'new' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {lead.status}
                      </span>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Dedicated Blog & Health Insights Publications Panel */}
      <div className="bg-white shadow-sm rounded-3xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-2xs">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Medical Blog & Patient Insights Panel</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {publishedBlogsCount} Published • {draftBlogsCount} Drafts
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Evidence-based patient guides, clinical updates, E-E-A-T credentials & SEO indexation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/admin/blog-authors"
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Authors ({blogAuthors.length})
            </Link>
            <Link
              to="/admin/blog-categories"
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Categories ({blogCategories.length})
            </Link>
            <Link
              to="/admin/blogs"
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              View All ({blogs.length})
            </Link>
            <Link
              to="/admin/blogs/new"
              className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={14} />
              <span>Write Article</span>
            </Link>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="p-6">
          {blogs.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <p className="text-sm font-semibold text-slate-700">No blog articles created yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Start publishing evidence-based health insights and preventive guides for Newark patients.
              </p>
              <Link
                to="/admin/blogs/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-colors"
              >
                <Plus size={14} />
                <span>Create First Article</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {blogs.slice(0, 6).map((blog) => (
                <div
                  key={blog.id}
                  className="group bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-primary-300 rounded-2xl p-4 transition-all hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={blog.featuredImage || blog.coverImage || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600'}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                          blog.status === 'published'
                            ? 'bg-emerald-600/90 text-white'
                            : blog.status === 'scheduled'
                            ? 'bg-blue-600/90 text-white'
                            : 'bg-amber-600/90 text-white'
                        }`}>
                          {blog.status}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[10px] font-medium">
                        {blog.readTimeMinutes || 4} min read
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-primary-600 uppercase tracking-wider block">
                        {blog.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary-700 transition-colors line-clamp-2 mt-0.5">
                        {blog.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {blog.excerpt || 'Clinical article and patient education guide.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate text-[11px] font-medium">
                      By {blog.author}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {blog.status === 'published' && (
                        <a
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View live article"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <Link
                        to={`/admin/blogs/${blog.id}`}
                        className="px-2.5 py-1 bg-white hover:bg-primary-50 text-slate-700 hover:text-primary-700 border border-slate-200 hover:border-primary-300 rounded-lg font-bold text-xs transition-all flex items-center gap-1 shadow-2xs"
                      >
                        <span>Edit</span>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
