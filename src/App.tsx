import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import AnnouncementPopup from './components/AnnouncementPopup';

// Public Website Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import DiagnosticsPage from './pages/DiagnosticsPage';
import ProvidersPage from './pages/ProvidersPage';
import ProviderDetailPage from './pages/ProviderDetailPage';
import ContactPage from './pages/ContactPage';
import NewarkLocationPage from './pages/NewarkLocationPage';
import InsurancePricingPage from './pages/InsurancePricingPage';
import PatientResourcesPage from './pages/PatientResourcesPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import AccessibilityPage from './pages/AccessibilityPage';
import NotFoundPage from './pages/NotFoundPage';
import BlogArchivePage from './pages/BlogArchivePage';
import BlogDetailPage from './pages/BlogDetailPage';
import AppointmentsPage from './pages/AppointmentsPage';
import BrandLogoPage from './pages/BrandLogoPage';

// Admin Context & Auth
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import { CmsProvider } from './context/CmsContext';
import ProtectedRoute from './admin/components/ProtectedRoute';
import AdminLogin from './admin/pages/AdminLogin';

// Admin Dashboard & Operations
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import AppointmentsList from './admin/pages/AppointmentsList';
import AppointmentDetail from './admin/pages/AppointmentDetail';
import CalendarView from './admin/pages/CalendarView';
import LeadsList from './admin/pages/LeadsList';

// Blog Admin CMS
import BlogsList from './admin/pages/blogs/BlogsList';
import BlogEditor from './admin/pages/blogs/BlogEditor';
import BlogAuthorsPage from './admin/pages/blogs/BlogAuthorsPage';
import BlogCategoriesPage from './admin/pages/blogs/BlogCategoriesPage';
import BlogTagsPage from './admin/pages/blogs/BlogTagsPage';

// Admin CMS & Dynamic Management
import ProvidersManager from './admin/pages/ProvidersManager';
import ServicesManager from './admin/pages/ServicesManager';
import MediaLibrary from './admin/pages/MediaLibrary';
import WebsiteMediaManager from './admin/pages/WebsiteMediaManager';
import WebsiteImagesManager from './admin/pages/WebsiteImagesManager';
import TestimonialsManager from './admin/pages/TestimonialsManager';

// Page-by-Page CMS Editors
import HomePageCms from './admin/pages/cms/HomePageCms';
import AboutPageCms from './admin/pages/cms/AboutPageCms';
import DiagnosticsPageCms from './admin/pages/cms/DiagnosticsPageCms';
import ProcessPageCms from './admin/pages/cms/ProcessPageCms';
import ContactPageCms from './admin/pages/cms/ContactPageCms';
import HeaderCms from './admin/pages/cms/HeaderCms';
import FooterCms from './admin/pages/cms/FooterCms';

// Advanced Medical & Clinic Modules
import DoctorProfileManager from './admin/pages/DoctorProfileManager';
import ConditionsManager from './admin/pages/ConditionsManager';
import FaqManager from './admin/pages/FaqManager';
import LocationsManager from './admin/pages/LocationsManager';
import GalleryManager from './admin/pages/GalleryManager';
import PopupManager from './admin/pages/PopupManager';
import PagesManager from './admin/pages/PagesManager';
import AuditLogsViewer from './admin/pages/AuditLogsViewer';

// System & Analytics
import SeoManager from './admin/pages/seo/SeoManager';
import AnalyticsPage from './admin/pages/AnalyticsPage';
import WebsiteSettings from './admin/pages/WebsiteSettings';
import AdminUsers from './admin/pages/AdminUsers';

import ConditionsPage from './pages/ConditionsPage';
import ConditionDetailPage from './pages/ConditionDetailPage';
import MobileFloatingBar from './components/MobileFloatingBar';

function PublicLayout() {
  return (
    <div data-public-theme="premium-editorial-v1" className="min-h-screen flex flex-col font-sans selection:bg-primary-100 selection:text-primary-900 bg-[#FCFBF8] text-[#252A2B] pb-16 md:pb-0">
      <ScrollToTop />
      <AnnouncementPopup />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <MobileFloatingBar />
    </div>
  );
}

export default function App() {
  return (
    <CmsProvider>
      <AdminAuthProvider>
        <Routes>
          {/* Public multi-page website routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:slug" element={<ServiceDetailPage />} />
            <Route path="/diagnostics" element={<DiagnosticsPage />} />
            
            {/* Clinical Conditions & Chronic Disease Education */}
            <Route path="/conditions" element={<ConditionsPage />} />
            <Route path="/conditions/:slug" element={<ConditionDetailPage />} />
            <Route path="/treatments" element={<ConditionsPage />} />
            
            {/* Dedicated Canonical Local SEO Service Landing Pages for Newark NJ */}
            <Route path="/primary-care-newark-nj" element={<ServiceDetailPage />} />
            <Route path="/internal-medicine-newark-nj" element={<ServiceDetailPage />} />
            <Route path="/preventive-care-newark-nj" element={<ServiceDetailPage />} />
            <Route path="/chronic-disease-management-newark-nj" element={<ServiceDetailPage />} />
            <Route path="/annual-physical-newark-nj" element={<ServiceDetailPage />} />
            <Route path="/diabetes-management-newark-nj" element={<ServiceDetailPage />} />
            <Route path="/hypertension-treatment-newark-nj" element={<ServiceDetailPage />} />
            <Route path="/in-office-diagnostics-newark-nj" element={<ServiceDetailPage />} />
            <Route path="/onsite-laboratory-newark-nj" element={<ServiceDetailPage />} />
            <Route path="/medical-weight-loss-newark-nj" element={<ServiceDetailPage />} />
            <Route path="/immigration-physicals-newark-nj" element={<ServiceDetailPage />} />

            {/* Dedicated Provider Profile Routes */}
            <Route path="/providers" element={<ProvidersPage />} />
            <Route path="/providers/:slug" element={<ProviderDetailPage />} />

            {/* Dedicated Newark Location & Transit Guide */}
            <Route path="/locations/newark-nj" element={<NewarkLocationPage />} />
            <Route path="/newark-nj" element={<NewarkLocationPage />} />

            {/* Insurance, Resources & Patient Guides */}
            <Route path="/insurance-pricing" element={<InsurancePricingPage />} />
            <Route path="/insurance" element={<InsurancePricingPage />} />
            <Route path="/patient-resources" element={<PatientResourcesPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/accessibility" element={<AccessibilityPage />} />

            <Route path="/contact" element={<ContactPage />} />
            <Route path="/brand-logo" element={<BrandLogoPage />} />
            <Route path="/logo" element={<BrandLogoPage />} />
            <Route path="/blog" element={<BlogArchivePage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin Login Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin CMS & Clinic Portal */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="appointments" element={<AppointmentsList />} />
            <Route path="appointments/:id" element={<AppointmentDetail />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="leads" element={<LeadsList />} />

            {/* Blog CMS Routes */}
            <Route path="blogs" element={<BlogsList />} />
            <Route path="blogs/new" element={<BlogEditor />} />
            <Route path="blogs/:id" element={<BlogEditor />} />
            <Route path="blog-authors" element={<BlogAuthorsPage />} />
            <Route path="blog-categories" element={<BlogCategoriesPage />} />
            <Route path="blog-tags" element={<BlogTagsPage />} />
            
            {/* Core Dynamic Collections */}
            <Route path="doctor-profile" element={<DoctorProfileManager />} />
            <Route path="conditions" element={<ConditionsManager />} />
            <Route path="faqs" element={<FaqManager />} />
            <Route path="locations" element={<LocationsManager />} />
            <Route path="gallery" element={<GalleryManager />} />
            <Route path="popups" element={<PopupManager />} />
            <Route path="page-directory" element={<PagesManager />} />
            <Route path="audit-logs" element={<AuditLogsViewer />} />

            <Route path="providers" element={<ProvidersManager />} />
            <Route path="services" element={<ServicesManager />} />
            <Route path="website-images" element={<WebsiteImagesManager />} />
            <Route path="media" element={<WebsiteImagesManager />} />
            <Route path="page-images" element={<WebsiteImagesManager />} />
            <Route path="media-manager" element={<WebsiteImagesManager />} />
            <Route path="website-media" element={<WebsiteImagesManager />} />
            
            {/* CMS Page Editors */}
            <Route path="pages/home" element={<HomePageCms />} />
            <Route path="pages/about" element={<AboutPageCms />} />
            <Route path="pages/diagnostics" element={<DiagnosticsPageCms />} />
            <Route path="pages/process" element={<ProcessPageCms />} />
            <Route path="pages/testimonials" element={<TestimonialsManager />} />
            <Route path="pages/contact" element={<ContactPageCms />} />

            {/* Layout Editors */}
            <Route path="layout/header" element={<HeaderCms />} />
            <Route path="layout/footer" element={<FooterCms />} />

            {/* System, Settings & Analytics */}
            <Route path="seo" element={<SeoManager />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<WebsiteSettings />} />
            <Route path="users" element={<AdminUsers />} />

            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </AdminAuthProvider>
    </CmsProvider>
  );
}
