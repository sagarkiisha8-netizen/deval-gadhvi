import { Provider, Appointment } from '../types';
import { format, parse, addMinutes, isBefore, isAfter, isEqual } from 'date-fns';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getDb } from '../lib/firebase';

export interface TimeSlot {
  time: string; // e.g. "09:00 AM"
  available: boolean;
  reason?: string;
}

const DEFAULT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DEFAULT_START = '08:30 AM';
const DEFAULT_END = '05:00 PM';
const DEFAULT_DURATION = 30;
const DEFAULT_BREAK_START = '12:30 PM';
const DEFAULT_BREAK_END = '01:30 PM';

/**
 * Generate standard time slots for a given provider on a specific date (YYYY-MM-DD)
 */
export async function getAvailableTimeSlots(
  provider: Provider | null,
  dateString: string // "YYYY-MM-DD"
): Promise<TimeSlot[]> {
  if (!dateString) return [];

  const selectedDate = new Date(`${dateString}T00:00:00`);
  const dayName = format(selectedDate, 'EEEE'); // e.g. "Monday"

  // Check provider settings or fallback to defaults
  const avail = provider?.availability;
  const workingDays = avail?.workingDays || provider?.appointmentDays || DEFAULT_DAYS;
  const blockedDates = avail?.blockedDates || [];

  // Check if provider works on this day
  if (!workingDays.includes(dayName)) {
    return [];
  }

  // Check if date is blocked/holiday
  if (blockedDates.includes(dateString)) {
    return [];
  }

  const startTimeStr = avail?.startTime || DEFAULT_START;
  const endTimeStr = avail?.endTime || DEFAULT_END;
  const duration = avail?.appointmentDuration || DEFAULT_DURATION;
  const breakStartStr = avail?.breakStartTime || DEFAULT_BREAK_START;
  const breakEndStr = avail?.breakEndTime || DEFAULT_BREAK_END;

  // Generate base time intervals
  const baseSlots: string[] = [];
  const referenceDate = dateString; // "2026-08-20"

  try {
    let current = parse(`${referenceDate} ${startTimeStr}`, 'yyyy-MM-dd hh:mm a', new Date());
    const end = parse(`${referenceDate} ${endTimeStr}`, 'yyyy-MM-dd hh:mm a', new Date());
    const breakStart = parse(`${referenceDate} ${breakStartStr}`, 'yyyy-MM-dd hh:mm a', new Date());
    const breakEnd = parse(`${referenceDate} ${breakEndStr}`, 'yyyy-MM-dd hh:mm a', new Date());

    while (isBefore(current, end)) {
      const slotEnd = addMinutes(current, duration);
      
      // Check if slot falls in break time
      const isDuringBreak = 
        (isEqual(current, breakStart) || (isAfter(current, breakStart) && isBefore(current, breakEnd))) ||
        (isAfter(slotEnd, breakStart) && isBefore(slotEnd, breakEnd));

      if (!isDuringBreak && (isBefore(slotEnd, end) || isEqual(slotEnd, end))) {
        baseSlots.push(format(current, 'hh:mm a'));
      }

      current = addMinutes(current, duration);
    }
  } catch (err) {
    console.warn('Error computing base slots, using fallback list:', err);
    return [
      { time: '09:00 AM', available: true },
      { time: '09:30 AM', available: true },
      { time: '10:00 AM', available: true },
      { time: '10:30 AM', available: true },
      { time: '11:00 AM', available: true },
      { time: '11:30 AM', available: true },
      { time: '01:30 PM', available: true },
      { time: '02:00 PM', available: true },
      { time: '02:30 PM', available: true },
      { time: '03:00 PM', available: true },
      { time: '03:30 PM', available: true },
      { time: '04:00 PM', available: true }
    ];
  }

  // Query booked appointments from Firestore for this provider on this date
  const bookedTimes = new Set<string>();
  try {
    const db = getDb();
    const q = query(
      collection(db, 'appointments'),
      where('preferredDate', '==', dateString)
    );
    const snap = await getDocs(q);
    snap.forEach((doc) => {
      const data = doc.data() as Appointment;
      // If appointment is not cancelled or rejected, and matches provider (or provider is general)
      if (
        data.status !== 'cancelled' && 
        data.status !== 'Cancelled' && 
        data.status !== 'No Show'
      ) {
        if (!provider || !data.providerName || data.providerName === provider.name) {
          if (data.preferredTime) {
            bookedTimes.add(data.preferredTime.trim());
          }
        }
      }
    });
  } catch (err) {
    console.warn('Could not check booked appointments from Firestore:', err);
  }

  return baseSlots.map((time) => ({
    time,
    available: !bookedTimes.has(time),
    reason: bookedTimes.has(time) ? 'Booked' : undefined
  }));
}
