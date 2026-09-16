import React, { useEffect } from 'react';
import { NEWARK_PRACTICE_INFO } from '../data/localSeoData';
import { useCmsData } from '../context/CmsContext';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FaqItemSchema {
  question: string;
  answer: string;
}

export interface SeoHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  keywords?: string[];
  ogType?: string;
  ogImage?: string;
  schema?: Record<string, any> | Record<string, any>[];
  breadcrumbs?: BreadcrumbItem[];
  faqs?: FaqItemSchema[];
}

export default function SeoHead({
  title,
  description,
  canonicalUrl,
  keywords,
  ogType = 'website',
  ogImage,
  schema,
  breadcrumbs,
  faqs
}: SeoHeadProps) {
  const { getMediaUrl } = useCmsData();
  const defaultCmsOg = getMediaUrl('seo', 'og-meta', 'default-share') || getMediaUrl('home', 'hero', 'main-physician');
  const finalOgImage = ogImage || defaultCmsOg || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=1200';

  const defaultTitle = 'Primary Care Doctor Newark NJ | Newark Medical Associates';
  const defaultDesc = 'Newark Medical Associates provides compassionate primary care, internal medicine, preventive health checkups, on-site ultrasound, EKGs, and lab blood testing in Newark, New Jersey.';
  const defaultKeywords = [
    'primary care doctor Newark NJ',
    'doctor in Newark NJ',
    'primary care physician Newark NJ',
    'internal medicine doctor Newark NJ',
    'family doctor Newark NJ',
    'medical clinic Newark NJ',
    'physician near me',
    'doctor near me',
    'primary care near me',
    'healthcare clinic Newark NJ',
    'preventive care Newark NJ',
    'hypertension doctor Newark NJ',
    'diabetes doctor Newark NJ'
  ];

  const fullTitle = title || defaultTitle;
  const fullDesc = description || defaultDesc;
  const fullKeywords = keywords && keywords.length > 0 ? keywords.join(', ') : defaultKeywords.join(', ');
  const fullCanonical = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : 'https://newarkmed.com');

  useEffect(() => {
    // 1. Update Document Title
    document.title = fullTitle;

    // 2. Helper to set or create meta tag
    const setMetaTag = (attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta
    setMetaTag('name', 'description', fullDesc);
    setMetaTag('name', 'keywords', fullKeywords);
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // Geo Meta Tags for Newark, NJ
    setMetaTag('name', 'geo.region', 'US-NJ');
    setMetaTag('name', 'geo.placename', 'Newark, New Jersey');
    setMetaTag('name', 'geo.position', `${NEWARK_PRACTICE_INFO.geo.latitude};${NEWARK_PRACTICE_INFO.geo.longitude}`);
    setMetaTag('name', 'ICBM', `${NEWARK_PRACTICE_INFO.geo.latitude}, ${NEWARK_PRACTICE_INFO.geo.longitude}`);

    // Open Graph
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', fullDesc);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', fullCanonical);
    setMetaTag('property', 'og:image', finalOgImage);
    setMetaTag('property', 'og:site_name', NEWARK_PRACTICE_INFO.name);
    setMetaTag('property', 'og:locale', 'en_US');

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', fullDesc);
    setMetaTag('name', 'twitter:image', finalOgImage);

    // Canonical Link
    let canonicalTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', fullCanonical);

    // 3. Inject JSON-LD Schema
    const scriptIds: string[] = [];

    // Core MedicalClinic Schema (Always present)
    const baseClinicSchema = {
      '@context': 'https://schema.org',
      '@type': 'MedicalClinic',
      '@id': 'https://newarkmed.com/#medicalclinic',
      name: NEWARK_PRACTICE_INFO.name,
      legalName: NEWARK_PRACTICE_INFO.legalName,
      url: 'https://newarkmed.com',
      logo: 'https://newarkmed.com/logo.png',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=1200',
      description: 'Comprehensive primary care, internal medicine, preventive care, and on-site diagnostics medical clinic in Newark, New Jersey.',
      telephone: NEWARK_PRACTICE_INFO.rawPhone,
      email: NEWARK_PRACTICE_INFO.email,
      priceRange: '$$',
      isAcceptingNewPatients: true,
      medicalSpecialty: [
        'PrimaryCare',
        'InternalMedicine',
        'PreventiveMedicine',
        'Cardiovascular'
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: NEWARK_PRACTICE_INFO.address.streetAddress,
        addressLocality: NEWARK_PRACTICE_INFO.address.addressLocality,
        addressRegion: NEWARK_PRACTICE_INFO.address.addressRegion,
        postalCode: NEWARK_PRACTICE_INFO.address.postalCode,
        addressCountry: NEWARK_PRACTICE_INFO.address.addressCountry
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: NEWARK_PRACTICE_INFO.geo.latitude,
        longitude: NEWARK_PRACTICE_INFO.geo.longitude
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:30',
          closes: '18:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens: '09:00',
          closes: '14:00'
        }
      ],
      areaServed: NEWARK_PRACTICE_INFO.neighborhoodsServed.map(n => ({
        '@type': 'AdministrativeArea',
        name: `${n}, NJ`
      })),
      hasMap: NEWARK_PRACTICE_INFO.googleMapsDirectionsUrl,
      sameAs: [
        'https://www.facebook.com/newarkmed',
        'https://www.instagram.com/newarkmed',
        'https://www.linkedin.com/company/newark-medical-associates'
      ]
    };

    const injectScript = (id: string, jsonObj: any) => {
      let script = document.getElementById(id) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(jsonObj);
      scriptIds.push(id);
    };

    // Inject Base Clinic
    injectScript('schema-base-clinic', baseClinicSchema);

    // Inject Breadcrumbs if provided
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          item: b.url.startsWith('http') ? b.url : `https://newarkmed.com${b.url}`
        }))
      };
      injectScript('schema-breadcrumbs', breadcrumbSchema);
    }

    // Inject FAQ Schema if provided
    if (faqs && faqs.length > 0) {
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer
          }
        }))
      };
      injectScript('schema-faq', faqSchema);
    }

    // Inject custom specific schemas
    if (schema) {
      const schemaArray = Array.isArray(schema) ? schema : [schema];
      schemaArray.forEach((s, idx) => {
        injectScript(`schema-custom-${idx}`, s);
      });
    }

    // Cleanup when unmounting or switching pages
    return () => {
      scriptIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
    };
  }, [fullTitle, fullDesc, fullKeywords, fullCanonical, ogType, ogImage, schema, breadcrumbs, faqs]);

  return null;
}
