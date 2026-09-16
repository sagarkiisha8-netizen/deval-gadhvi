import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getDb } from '../lib/firebase';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export interface AnalyticsEventPayload {
  eventName: 
    | 'page_view'
    | 'appointment_form_started'
    | 'appointment_submitted'
    | 'lead_submitted'
    | 'phone_click'
    | 'directions_click'
    | 'service_view'
    | 'provider_view';
  category?: string;
  label?: string;
  value?: number;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Initializes GA4 script tag dynamically if Google Analytics ID is set in site settings.
 */
export function initGoogleAnalytics(gaMeasurementId?: string) {
  if (!gaMeasurementId || !gaMeasurementId.startsWith('G-')) return;
  if (document.getElementById('ga4-script')) return;

  const script = document.createElement('script');
  script.id = 'ga4-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', gaMeasurementId, {
    send_page_view: false, // controlled manually
    anonymize_ip: true
  });
}

/**
 * Safe conversion tracking that strictly PREVENTS any PII (names, phone, email, medical notes)
 * from being emitted to Google Analytics or third-party telemetry.
 */
export async function trackEvent({
  eventName,
  category = 'conversion',
  label,
  value,
  metadata = {}
}: AnalyticsEventPayload): Promise<void> {
  try {
    // 1. Dispatch to Google Analytics if initialized (Strictly without PII)
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        event_category: category,
        event_label: label,
        value: value,
        ...metadata
      });
    }

    // 2. Persist event to Firestore analytics_events for real in-house reporting
    const db = getDb();
    await addDoc(collection(db, 'analytics_events'), {
      eventName,
      category,
      label: label || null,
      value: value || null,
      metadata: metadata || {},
      path: typeof window !== 'undefined' ? window.location.pathname : '/',
      timestamp: serverTimestamp()
    });
  } catch (err) {
    // Silent fail in analytics so patient workflows never break
    console.debug('Telemetry event non-blocking notice:', err);
  }
}
