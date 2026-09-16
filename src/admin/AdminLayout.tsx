import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar as CalendarIcon, Users, Settings, 
  Search, FileText, Menu, X, Inbox, HeartPulse, Activity,
  LineChart, LogOut, FileImage, ShieldCheck, ExternalLink,
  HelpCircle, Compass, Sliders, ChevronDown,
  BookOpen, UserCheck, Stethoscope, MapPin, Image as ImageIcon,
  Bell, History, FolderKanban, Layers, Tag, PenSquare
} from 'lucide-react';
import { useAdminAuth } from './context/AdminAuthContext';

interface NavGroup {
  groupTitle: string;
  items: {
    name: string;
    path: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: string;
  }[];
}

const SIDEBAR_GROUPS: NavGroup[] = [
  {
    groupTitle: 'Clinic Hub',
    items: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Appointments', path: '/admin/appointments', icon: CalendarIcon },
      { name: 'Patient Leads', path: '/admin/leads', icon: Inbox },
    ]
  },
  {
    groupTitle: 'Doctors & Clinical',
    items: [
      { name: 'Physicians & Doctors', path: '/admin/providers', icon: UserCheck, badge: 'Main' },
      { name: 'Clinical Services', path: '/admin/services', icon: Activity },
    ]
  },
  {
    groupTitle: 'Website Content',
    items: [
      { name: 'Page Sections', path: '/admin/page-directory', icon: FolderKanban },
      { name: 'Website Photos', path: '/admin/media-manager', icon: FileImage },
      { name: 'Patient Blogs', path: '/admin/blogs', icon: BookOpen },
    ]
  },
  {
    groupTitle: 'Settings',
    items: [
      { name: 'Practice Settings', path: '/admin/settings', icon: Settings },
    ]
  }
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

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
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {SIDEBAR_GROUPS.map((group) => (
            <div key={group.groupTitle} className="space-y-1">
              <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {group.groupTitle}
              </h3>
              <nav className="space-y-0.5 pt-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end={item.path === '/admin'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                        isActive 
                          ? 'bg-primary-600 text-white shadow-sm' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center min-w-0">
                      <item.icon size={16} className="mr-3 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="ml-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer User & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2 shrink-0">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-primary-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {userInitial.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.displayName || 'Admin User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@newarkmed.com'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-100">
                Clinic CMS Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/media-manager"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 border border-primary-200 px-3 py-1.5 rounded-xl transition-colors"
              title="Manage Website Photos & Media"
            >
              <ImageIcon size={14} className="text-primary-600" />
              <span className="hidden sm:inline">Website Photos</span>
            </Link>

            <Link
              to="/admin/page-directory"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors"
              title="All Website Page CMS Editors"
            >
              <FolderKanban size={14} className="text-slate-500" />
              <span className="hidden sm:inline">Page Editors</span>
            </Link>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              <ExternalLink size={13} />
              <span className="hidden md:inline">Preview Live</span>
            </a>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs border border-primary-200">
                {userInitial.toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-800 hidden md:block">
                {user?.displayName || 'Administrator'}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
