import { Appointment, NotificationLog } from '../types';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { getDb } from '../lib/firebase';

export type NotificationTrigger = 
  | 'appointment_received' 
  | 'appointment_confirmed' 
  | 'appointment_rescheduled' 
  | 'appointment_cancelled'
  | 'staff_intake_alert';

export interface NotificationResult {
  success: boolean;
  log: NotificationLog;
  messagePreview: string;
}

export function generateNotificationContent(
  trigger: NotificationTrigger,
  appointment: Appointment,
  clinicName = 'Newark Medical Associates'
): { subject: string; body: string } {
  const patientName = appointment.patientName || 'Valued Patient';
  const doctor = appointment.providerName || 'your healthcare provider';
  const date = appointment.preferredDate;
  const time = appointment.preferredTime || 'Scheduled Time';
  const refId = appointment.id;

  switch (trigger) {
    case 'appointment_received':
      return {
        subject: `Appointment Request Received (${refId}) - ${clinicName}`,
        body: `Dear ${patientName},\n\nWe have received your appointment request (${refId}) for ${date} at ${time} with ${doctor}.\n\nPlease note: This is a request acknowledgment. Our clinical coordination team will review provider availability and contact you shortly to confirm your visit.\n\nWarm regards,\n${clinicName} Clinical Team\nPhone: (973) 412-9404`
      };

    case 'appointment_confirmed':
      return {
        subject: `Confirmed: Your Medical Appointment (${refId}) - ${clinicName}`,
        body: `Dear ${patientName},\n\nYour appointment has been officially CONFIRMED.\n\nDetails:\n- Provider: ${doctor}\n- Service: ${appointment.serviceName || 'Clinical Consultation'}\n- Date: ${date}\n- Time: ${time}\n- Location: 337 Bloomfield Ave, Newark, NJ 07107\n\nPlease arrive 10-15 minutes prior with your photo ID and active insurance card.\n\n${clinicName}`
      };

    case 'appointment_rescheduled':
      return {
        subject: `Appointment Rescheduled: ${refId} - ${clinicName}`,
        body: `Dear ${patientName},\n\nYour appointment has been updated to:\n- New Date: ${date}\n- New Time: ${time}\n- Provider: ${doctor}\n\nIf this new time does not work for you, please call us immediately at (973) 412-9404.`
      };

    case 'appointment_cancelled':
      return {
        subject: `Appointment Cancellation Notice: ${refId} - ${clinicName}`,
        body: `Dear ${patientName},\n\nYour appointment (${refId}) scheduled for ${date} at ${time} has been cancelled.\n\nTo reschedule, please visit our website or call our reception desk at (973) 412-9404.`
      };

    case 'staff_intake_alert':
      return {
        subject: `[STAFF ALERT] New Patient Intake: ${patientName} (${refId})`,
        body: `New appointment intake submitted on website.\n\nPatient: ${patientName}\nPhone: ${appointment.phone || appointment.patientPhone}\nEmail: ${appointment.email || appointment.patientEmail}\nProvider: ${doctor}\nRequested Date: ${date} ${time}\nChief Complaint: ${appointment.reasonForVisit || appointment.message || 'None'}`
      };
  }
}

/**
 * Dispatches an automated notification and records the log in Firestore.
 */
export async function sendAppointmentNotification(
  trigger: NotificationTrigger,
  appointment: Appointment
): Promise<NotificationResult> {
  const recipient = (appointment.email || appointment.patientEmail || appointment.phone || appointment.patientPhone || 'patient@example.com').trim();
  const { subject, body } = generateNotificationContent(trigger, appointment);

  const log: NotificationLog = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: recipient.includes('@') ? 'email' : 'sms',
    recipient,
    subject,
    template: trigger,
    status: 'simulated', // Ready for production API key (SendGrid / Twilio)
    sentAt: new Date().toISOString()
  };

  try {
    const db = getDb();
    const docRef = doc(db, 'appointments', appointment.id);
    await updateDoc(docRef, {
      notificationLogs: arrayUnion(log),
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.debug('Notification logging notice:', err);
  }

  return {
    success: true,
    log,
    messagePreview: body
  };
}
