import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, User, Plus, Filter, Activity, X, Loader2, 
  Phone, Eye, CheckCircle2 
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { Appointment } from '../../types';
import { useCmsData } from '../../context/CmsContext';

export default function CalendarView() {
  const { providers } = useCmsData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<string>('all');

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const weekDays = [...Array(7)].map((_, i) => addDays(startDate, i));

  const activeProviders = providers.filter(p => p.isActive !== false);

  useEffect(() => {
    setLoading(true);
    try {
      const db = getDb();
      const q = query(collection(db, 'appointments'), orderBy('preferredDate', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: Appointment[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        setAppointments(list);
        setLoading(false);
      }, (err) => {
        console.warn('Calendar sync error:', err);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch {
      setLoading(false);
    }
  }, []);

  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', 
    '04:00 PM', '05:00 PM'
  ];

  // Filtered by selected provider
  const filteredAppointments = appointments.filter(apt => {
    if (selectedProviderFilter === 'all') return true;
    return apt.providerId === selectedProviderFilter || apt.providerName === selectedProviderFilter;
  });

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Calendar</h1>
          <p className="text-sm text-slate-500 mt-1">
            Weekly provider schedule, clinical consult slots, and booked sessions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Provider Filter */}
          <select
            value={selectedProviderFilter}
            onChange={(e) => setSelectedProviderFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-xs"
          >
            <option value="all">All Providers</option>
            {activeProviders.map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>

          <Link
            to="/admin/appointments"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            Table View
          </Link>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1">
        {/* Navigation Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-bold text-slate-900">
              {format(startDate, 'MMMM yyyy')}
            </h2>
            <span className="text-xs text-slate-500 hidden sm:inline-block">
              Week of {format(startDate, 'MMM d')} – {format(addDays(startDate, 6), 'MMM d, yyyy')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden shadow-xs">
              <button 
                type="button"
                className="p-2 hover:bg-slate-50 border-r border-slate-200 text-slate-600" 
                onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                type="button"
                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </button>
              <button 
                type="button"
                className="p-2 hover:bg-slate-50 border-l border-slate-200 text-slate-600" 
                onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[850px] divide-y divide-slate-200">
            {/* Week Days Header */}
            <div className="grid grid-cols-8 bg-slate-50 text-slate-700">
              <div className="p-3 text-center text-xs font-bold text-slate-400 border-r border-slate-200">
                Time
              </div>
              {weekDays.map((day, i) => {
                const isToday = isSameDay(day, new Date());
                return (
                  <div 
                    key={i} 
                    className={`p-3 text-center border-r border-slate-200 ${
                      isToday ? 'bg-primary-50/80 text-primary-900 font-bold' : ''
                    }`}
                  >
                    <p className="text-[11px] uppercase tracking-wider text-slate-400">{format(day, 'EEE')}</p>
                    <p className={`text-sm mt-0.5 ${isToday ? 'text-primary-700 font-bold' : 'text-slate-800 font-semibold'}`}>
                      {format(day, 'd')}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Time Grid Rows */}
            <div className="divide-y divide-slate-100 bg-white">
              {timeSlots.map((time, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-8 min-h-[72px]">
                  {/* Time label */}
                  <div className="p-2 border-r border-slate-200 text-center text-[11px] font-mono text-slate-400 flex items-center justify-center bg-slate-50/50">
                    {time}
                  </div>

                  {/* Day cells */}
                  {weekDays.map((day, colIdx) => {
                    const dayString = format(day, 'yyyy-MM-dd');
                    const cellAppointments = filteredAppointments.filter(a => {
                      return a.preferredDate === dayString && (
                        a.preferredTime?.startsWith(time.substring(0, 2)) ||
                        a.preferredTime === time
                      );
                    });

                    return (
                      <div 
                        key={colIdx} 
                        className="p-1 border-r border-slate-100 relative hover:bg-slate-50/60 transition-colors flex flex-col gap-1"
                      >
                        {cellAppointments.map((apt) => {
                          const isConfirmed = apt.status === 'confirmed' || apt.status === 'Confirmed';
                          const isCompleted = apt.status === 'completed' || apt.status === 'Completed';
                          const isCancelled = apt.status === 'cancelled' || apt.status === 'Cancelled';

                          return (
                            <button
                              key={apt.id}
                              type="button"
                              onClick={() => setSelectedAppointment(apt)}
                              className={`w-full text-left p-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer truncate shadow-2xs ${
                                isCompleted
                                  ? 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
                                  : isConfirmed
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                                  : isCancelled
                                  ? 'bg-slate-100 text-slate-500 border-slate-200 line-through'
                                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                              }`}
                            >
                              <div className="font-bold truncate">{apt.patientName}</div>
                              <div className="text-[10px] opacity-75 truncate">{apt.preferredTime} • {apt.providerName}</div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Quick Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Appointment Summary</h3>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                  {selectedAppointment.patientName?.charAt(0) || 'P'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedAppointment.patientName}</h4>
                  <p className="text-slate-500 font-mono">{selectedAppointment.id}</p>
                </div>
              </div>

              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-bold text-slate-900">{selectedAppointment.preferredDate} @ {selectedAppointment.preferredTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Provider:</span>
                  <span className="font-bold text-slate-900">{selectedAppointment.providerName || 'Dr. Deval Gadhvi'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-semibold text-slate-900">{selectedAppointment.serviceName || 'Consultation'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold uppercase text-primary-700">{selectedAppointment.status}</span>
                </div>
                {(selectedAppointment.patientPhone || selectedAppointment.phone) && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-semibold text-slate-900">{selectedAppointment.patientPhone || selectedAppointment.phone}</span>
                  </div>
                )}
              </div>

              {(selectedAppointment.notes || selectedAppointment.reasonForVisit) && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-700">Patient Notes:</span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {selectedAppointment.notes || selectedAppointment.reasonForVisit}
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <Link
                  to={`/admin/appointments/${selectedAppointment.id}`}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Open Full Record →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
