import React from 'react';
import SeoHead from '../components/SeoHead';
import { Home, Calendar, Phone, ArrowRight, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="bg-slate-50 min-h-[80vh] flex items-center justify-center py-16 px-6">
      <SeoHead
        title="Page Not Found | Newark Medical Associates"
        description="The page you are looking for cannot be found. Visit Newark Medical Associates homepage or book an appointment at 337 Bloomfield Ave, Newark NJ."
        canonicalUrl="https://newarkmed.com/404"
      />

      <div className="max-w-lg w-full text-center bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-md">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-6">
          <Stethoscope size={32} />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
          Error 404
        </span>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-4 mb-3">
          Page Not Found
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8">
          We couldn't find the page you're looking for. The link may have moved or been updated. You can return to our homepage or schedule an appointment below.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-full text-sm shadow-sm transition-colors"
          >
            <Home size={16} />
            <span>Go to Homepage</span>
          </Link>

          <Link
            to="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold px-6 py-3 rounded-full text-sm transition-colors"
          >
            <Calendar size={16} />
            <span>Book Appointment</span>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500">
          Need immediate assistance? Call our clinic at <a href="tel:+19734129404" className="font-semibold text-primary-600 hover:underline">(973) 412-9404</a>.
        </div>
      </div>
    </div>
  );
}
