import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar as CalendarIcon, Users, Settings, 
  Search, FileText, Menu, X, Inbox, HeartPulse, Activity,
  LineChart, LogOut, ShieldCheck, ExternalLink,
  HelpCircle, MessageSquareQuote, Compass, Sliders, ChevronDown, ChevronRight,
  BookOpen, UserCheck, Stethoscope, MapPin, Image as ImageIcon,
  Bell, History, FolderKanban, Layers, Tag, PenSquare, Wrench
} from 'lucide-react';
import { useAdminAuth } from './context/AdminAuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
  isAdvanced?: boolean;
}

const MAIN_NAV_GROUPS: NavGroup[] = [
  {
    groupTitle: 'Clinic',
    items: [
      { name: 'Appointments', path: '/admin/appointments', icon: CalendarIcon },
      { name: 'Patient Inquiries', path: '/admin/leads', icon: Inbox },
      { name: 'Calendar', path: '/admin/calendar', icon: CalendarIcon },
    ]
  },
  {
    groupTitle: 'Website',
    items: [
      { name: 'Homepage', path: '/admin/pages/home', icon: FileText },
      { name: 'Providers / Doctors', path: '/admin/providers', icon: Users },
      { name: 'Services', path: '/admin/services', icon: Activity },
      { name: 'Conditions & Treatments', path: '/admin/conditions', icon: Stethoscope },
      { name: 'Reviews', path: '/admin/pages/testimonials', icon: MessageSquareQuote },
      { name: 'FAQs', path: '/admin/faqs', icon: HelpCircle },
      { name: 'Locations', path: '/admin/locations', icon: MapPin },
    ]
  },
  {
    groupTitle: 'Blog',
    items: [
      { name: 'All Blogs', path: '/admin/blogs', icon: BookOpen },
      { name: 'Add New Blog', path: '/admin/blogs/new', icon: PenSquare },
    ]
  },
  {
    groupTitle: 'Images',
    items: [
      { name: 'Website Images', path: '/admin/website-images', icon: ImageIcon },
    ]
  },
  {
    groupTitle: 'Settings',
    items: [
      { name: 'Practice Details', path: '/admin/settings', icon: Settings },
      { name: 'Header & Footer', path: '/admin/layout/header', icon: Sliders },
    ]
  }
];

const ADVANCED_ITEMS: NavItem[] = [
  { name: 'All Pages Directory', path: '/admin/page-directory', icon: FolderKanban },
  { name: 'Authors', path: '/admin/blog-authors', icon: UserCheck },
  { name: 'Categories', path: '/admin/blog-categories', icon: Layers },
  { name: 'Tags', path: '/admin/blog-tags', icon: Tag },
  { name: 'Audit Logs', path: '/admin/audit-logs', icon: History },
  { name: 'SEO', path: '/admin/seo', icon: Search },
  { name: 'Technical / Analytics', path: '/admin/analytics', icon: LineChart },
  { name: 'Staff Users & Roles', path: '/admin/users', icon: ShieldCheck },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  // Auto-expand advanced section if currently on an advanced route
  const isCurrentOnAdvanced = ADVANCED_ITEMS.some(item => location.pathname.startsWith(item.path));
  const [advancedOpen, setAdvancedOpen] = useState(isCurrentOnAdvanced);

  useEffect(() => {
    if (isCurrentOnAdvanced) {
      setAdvancedOpen(true);
    }
  }, [isCurrentOnAdvanced]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const userInitial = user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'A';

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`bg-slate-900 text-slate-300 w-64 flex-shrink-0 transition-all duration-300 fixed inset-y-0 left-0 md:static z-50 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 shrink-0">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-sm font-bold">
              <HeartPulse size={18} />
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-tight block">Newark Medical</span>
              <span className="text-[10px] text-primary-400 font-semibold block uppercase tracking-wider">CMS & Clinic Hub</span>
            </div>
          </Link>
          <button 
            type="button" 
            className="md:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* Top-Level Dashboard Link */}
          <div>
            <NavLink
              to="/admin"
              end
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary-600 text-white shadow-sm' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <LayoutDashboard size={17} className="mr-3 flex-shrink-0 text-primary-400" />
              <span>DASHBOARD</span>
            </NavLink>
          </div>

          {/* Primary Nav Groups */}
          {MAIN_NAV_GROUPS.map((group) => (
            <div key={group.groupTitle} className="space-y-1">
              <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {group.groupTitle}
              </h3>
              <nav className="space-y-0.5 pt-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                        isActive 
                          ? 'bg-primary-600 text-white shadow-sm' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <item.icon size={15} className="mr-3 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}

          {/* Collapsible ADVANCED Group (Collapsed by default) */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-200 uppercase tracking-wider rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Wrench size={13} className="text-slate-400" />
                <span>ADVANCED</span>
              </div>
              {advancedOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {advancedOpen && (
              <nav className="space-y-0.5 pt-1 pl-2 animate-in fade-in duration-150">
                {ADVANCED_ITEMS.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
                        isActive 
                          ? 'bg-primary-600/80 text-white shadow-sm font-semibold' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <item.icon size={14} className="mr-2.5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </NavLink>
                ))}
              </nav>
            )}
          </div>

        </div>

        {/* Footer User & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2 shrink-0">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-primary-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {userInitial.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {user?.displayName || 'Admin'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.email || 'admin@newarkmed.com'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Management Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-primary-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>View Live Website</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
