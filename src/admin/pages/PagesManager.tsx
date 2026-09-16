import React, { useState } from 'react';
import { 
  FileText, ExternalLink, Edit, CheckCircle2, 
  Search, Shield, Compass, Phone, Activity, Calendar 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PageMeta {
  title: string;
  path: string;
  editRoute: string;
  category: 'Core Pages' | 'Clinical & Diagnostic' | 'Legal & Compliance';
  status: 'Published' | 'Dynamic Live';
  lastEdited: string;
  desc: string;
}

const WEBSITE_PAGES: PageMeta[] = [
  {
    title: 'Homepage',
    path: '/',
    editRoute: '/admin/pages/home',
    category: 'Core Pages',
    status: 'Dynamic Live',
    lastEdited: 'Synced with CMS',
    desc: 'Hero banner, provider highlights, clinical statistics, FAQ, and booking CTA.'
  },
  {
    title: 'About the Practice & Dr. Gadhvi',
    path: '/about',
    editRoute: '/admin/pages/about',
    category: 'Core Pages',
    status: 'Dynamic Live',
    lastEdited: 'Synced with CMS',
    desc: '35-year medical legacy, mission statement, philosophy of care, and facility overview.'
  },
  {
    title: 'Clinical Services Hub',
    path: '/services',
    editRoute: '/admin/services',
    category: 'Clinical & Diagnostic',
    status: 'Dynamic Live',
    lastEdited: 'Synced with CMS',
    desc: 'Catalog of primary care, chronic condition mitigation, preventive exams, and labs.'
  },
  {
    title: 'Patient Journey & Process',
    path: '/#process',
    editRoute: '/admin/pages/process',
    category: 'Core Pages',
    status: 'Dynamic Live',
    lastEdited: 'Synced with CMS',
    desc: '4-step patient onboarding workflow: Intake, examination, diagnostics, and customized treatment.'
  },
  {
    title: 'Medical Blog & Patient Education',
    path: '/blog',
    editRoute: '/admin/blogs',
    category: 'Core Pages',
    status: 'Dynamic Live',
    lastEdited: 'Synced with CMS',
    desc: 'Evidence-based health articles, preventive cardiology advice, and medical updates.'
  },
  {
    title: 'Online Appointment Booking',
    path: '/appointments',
    editRoute: '/admin/appointments',
    category: 'Core Pages',
    status: 'Dynamic Live',
    lastEdited: 'Synced with CMS',
    desc: 'Self-service patient scheduling form with provider and service selection.'
  },
  {
    title: 'Contact, Hours & Directions',
    path: '/contact',
    editRoute: '/admin/pages/contact',
    category: 'Core Pages',
    status: 'Dynamic Live',
    lastEdited: 'Synced with CMS',
    desc: 'Phone numbers, WhatsApp, clinic address, transit directions, and inquiry form.'
  },
  {
    title: 'Privacy Policy & HIPAA Notice',
    path: '/privacy-policy',
    editRoute: '/admin/seo',
    category: 'Legal & Compliance',
    status: 'Published',
    lastEdited: 'Standard 2026',
    desc: 'HIPAA privacy practices, patient rights, protected health information governance.'
  },
  {
    title: 'Terms of Use & Clinical Disclaimer',
    path: '/terms',
    editRoute: '/admin/seo',
    category: 'Legal & Compliance',
    status: 'Published',
    lastEdited: 'Standard 2026',
    desc: 'Website conditions of use, non-emergency medical disclaimer, teleconsult guidelines.'
  },
  {
    title: 'Accessibility Statement',
    path: '/accessibility',
    editRoute: '/admin/seo',
    category: 'Legal & Compliance',
    status: 'Published',
    lastEdited: 'Standard 2026',
    desc: 'WCAG 2.1 AA accessibility compliance and accommodations for patients with disabilities.'
  }
];

export default function PagesManager() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Core Pages', 'Clinical & Diagnostic', 'Legal & Compliance'];

  const filtered = WEBSITE_PAGES.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-bold mb-2">
            <FileText size={13} />
            <span>Content Structure Architecture</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Website Page Management</h1>
          <p className="text-xs text-slate-500">
            Overview of all published pages, content modules, and instant links to their dedicated CMS editors.
          </p>
        </div>
      </div>

      {/* Quick Access Page Editors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link
          to="/admin/pages/home"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-primary-500 hover:shadow-md transition-all group flex flex-col items-center text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-2 group-hover:bg-primary-600 group-hover:text-white transition-colors">
            <FileText size={18} />
          </div>
          <span className="text-xs font-bold text-slate-800 group-hover:text-primary-700">Homepage</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Hero & Sections</span>
        </Link>

        <Link
          to="/admin/pages/about"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-primary-500 hover:shadow-md transition-all group flex flex-col items-center text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Compass size={18} />
          </div>
          <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">About Practice</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Mission & History</span>
        </Link>

        <Link
          to="/admin/services"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-primary-500 hover:shadow-md transition-all group flex flex-col items-center text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Activity size={18} />
          </div>
          <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">Services</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Clinical Catalog</span>
        </Link>

        <Link
          to="/admin/pages/diagnostics"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-primary-500 hover:shadow-md transition-all group flex flex-col items-center text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Activity size={18} />
          </div>
          <span className="text-xs font-bold text-slate-800 group-hover:text-amber-700">Diagnostics</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Ultrasound & EKG</span>
        </Link>

        <Link
          to="/admin/pages/contact"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-primary-500 hover:shadow-md transition-all group flex flex-col items-center text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Phone size={18} />
          </div>
          <span className="text-xs font-bold text-slate-800 group-hover:text-purple-700">Contact Page</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Hours & Location</span>
        </Link>

        <Link
          to="/admin/popups"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-primary-500 hover:shadow-md transition-all group flex flex-col items-center text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <Shield size={18} />
          </div>
          <span className="text-xs font-bold text-slate-800 group-hover:text-rose-700">Popups & Alerts</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Announcements</span>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search page titles or descriptions..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                activeCategory === cat
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100">
          {filtered.map((page) => (
            <div key={page.path} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{page.title}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 text-primary-700 border border-primary-100">
                    {page.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                    {page.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{page.desc}</p>
                <p className="text-[11px] text-slate-400 font-mono">Route: {page.path}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={page.path}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>Preview Page</span>
                </a>
                <Link
                  to={page.editRoute}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-xs transition-colors"
                >
                  <Edit size={13} />
                  <span>Open Page CMS</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
