import React, { useState, useEffect } from 'react';
import { X, Sparkles, Calendar, ArrowRight, Bell } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { getDb } from '../lib/firebase';
import { PopupAnnouncement } from '../types';

export default function AnnouncementPopup() {
  const [popup, setPopup] = useState<PopupAnnouncement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const db = getDb();
      const unsub = onSnapshot(doc(db, 'settings', 'popup'), (snap) => {
        if (snap.exists()) {
          const data = snap.data() as PopupAnnouncement;
          if (data.isEnabled) {
            // Check date range if specified
            const today = new Date().toISOString().split('T')[0];
            if (data.startDate && data.startDate > today) {
              setIsOpen(false);
              return;
            }
            if (data.endDate && data.endDate < today) {
              setIsOpen(false);
              return;
            }

            // Check if dismissed in this session
            const dismissed = sessionStorage.getItem('dismissed_announcement_id');
            if (dismissed !== data.id + data.heading) {
              setPopup(data);
              setIsOpen(true);
            }
          } else {
            setIsOpen(false);
          }
        }
      });
      return () => unsub();
    } catch {
      // offline fallback
    }
  }, []);

  const handleDismiss = () => {
    if (popup) {
      sessionStorage.setItem('dismissed_announcement_id', popup.id + popup.heading);
    }
    setIsOpen(false);
  };

  if (!isOpen || !popup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 flex items-center justify-center transition-colors shadow-sm"
          aria-label="Close Announcement"
        >
          <X size={16} />
        </button>

        {popup.imageUrl && (
          <div className="h-44 w-full relative overflow-hidden bg-slate-100">
            <img
              src={popup.imageUrl}
              alt={popup.heading}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-600/90 text-white text-[11px] font-bold backdrop-blur-xs shadow-xs">
                <Bell size={12} />
                <span>Clinic Notice</span>
              </span>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 leading-snug">
              {popup.heading}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {popup.description}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleDismiss}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Remind Me Later
            </button>

            {popup.ctaText && popup.ctaLink && (
              <a
                href={popup.ctaLink}
                onClick={handleDismiss}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                <span>{popup.ctaText}</span>
                <ArrowRight size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
