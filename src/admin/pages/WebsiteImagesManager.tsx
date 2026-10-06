import React, { useState, useMemo, useRef } from 'react';
import { 
  Image as ImageIcon, Search, Check, Copy, ExternalLink, 
  RotateCcw, Save, Upload, Sparkles, Filter, Eye, AlertCircle,
  CheckCircle2, Globe, Layout, Layers, ShieldCheck, HeartPulse,
  BookOpen, Compass, Stethoscope, MapPin, Tag, Sliders, ChevronRight,
  Trash2, X, Plus, Loader2, FolderKanban, Info, Activity
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { useCmsData } from '../../context/CmsContext';
import { SiteMediaItem, Provider, ServiceItem, MediaItem } from '../../types';
import { DEFAULT_SITE_MEDIA } from '../../data/defaultSiteMedia';
import { normalizeProviderKey, DEFAULT_PROVIDER_IMAGES, getProviderImage } from '../../utils/providerImages';

export interface WebsiteImageCard {
  id: string;
  pageName: string;
  sectionName: string;
  itemName: string;
  fieldName: string;
  category: 'homepage' | 'providers' | 'services' | 'about' | 'conditions' | 'locations' | 'brand' | 'blogs' | 'other';
  url: string;
  defaultUrl?: string;
  altText: string;
  recommendedDimensions?: string;
  aspectRatio?: string;
  pageRoute: string;
  whereUsed: { label: string; pageRoute: string }[];
  entityType: 'siteMedia' | 'provider' | 'providerHomepage' | 'service' | 'homePage' | 'brand';
  entityId: string;
}

export default function WebsiteImagesManager() {
  const { 
    siteMedia, 
    updateSiteMediaItem, 
    resetSiteMediaItem, 
    providers, 
    updateProvider, 
    services, 
    updateService,
    homeContent,
    updateHomePageContent,
    siteSettings,
    updateSiteSettings
  } = useCmsData();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'cards' | 'library'>('cards');

  // Media Library uploaded assets state
  const [libraryAssets, setLibraryAssets] = useState<MediaItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);

  // Replace Modal state
  const [replacingCard, setReplacingCard] = useState<WebsiteImageCard | null>(null);
  const [replaceModalTab, setReplaceModalTab] = useState<'upload' | 'library' | 'url'>('upload');
  const [selectedAssetUrl, setSelectedAssetUrl] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSavingChange, setIsSavingChange] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Preview zoom modal
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string; subtitle: string } | null>(null);

  // Where used modal
  const [inspectWhereUsed, setInspectWhereUsed] = useState<WebsiteImageCard | null>(null);

  // Load uploaded raw assets from Firestore media_library
  React.useEffect(() => {
    try {
      setLibraryLoading(true);
      const db = getDb();
      const q = query(collection(db, 'media_library'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        const list: MediaItem[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() as any }));
        setLibraryAssets(list);
        setLibraryLoading(false);
      }, (err) => {
        console.warn('Library assets fetch:', err);
        setLibraryLoading(false);
      });
      return () => unsub();
    } catch {
      setLibraryLoading(false);
    }
  }, []);

  // Build the complete, unified catalog of every visible image across the entire website
  const catalog: WebsiteImageCard[] = useMemo(() => {
    const list: WebsiteImageCard[] = [];

    // ==========================================
    // 1. HOMEPAGE HERO & EDITORIAL SECTIONS
    // ==========================================
    const heroMedia = siteMedia['home-hero-main'] || DEFAULT_SITE_MEDIA['home-hero-main'];
    list.push({
      id: 'home-hero-main',
      pageName: 'Homepage',
      sectionName: 'Hero Section',
      itemName: 'Hero Main Doctor Portrait',
      fieldName: 'Dr. Deval Gadhvi Hero Photo',
      category: 'homepage',
      url: heroMedia?.url || homeContent.hero?.heroImage || '/newark_internal_medicine_4.webp',
      defaultUrl: '/newark_internal_medicine_4.webp',
      altText: heroMedia?.altText || 'Dr. Deval Gadhvi, Board-Certified Internal Medicine Physician',
      recommendedDimensions: '1200 × 1400 px',
      aspectRatio: '4:5',
      pageRoute: '/#hero',
      whereUsed: [
        { label: 'Homepage Hero Banner (Desktop & Mobile)', pageRoute: '/' }
      ],
      entityType: 'homePage',
      entityId: 'home-hero-main'
    });

    const philMedia = siteMedia['home-philosophy-portrait'] || DEFAULT_SITE_MEDIA['home-philosophy-portrait'];
    list.push({
      id: 'home-philosophy-portrait',
      pageName: 'Homepage',
      sectionName: 'Care Philosophy',
      itemName: 'Doctor Philosophy Consultation Portrait',
      fieldName: 'Care Philosophy Visual ("Listen First, Prevent Early")',
      category: 'homepage',
      url: philMedia?.url || homeContent.carePhilosophyImage || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=85&w=1400',
      defaultUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=85&w=1400',
      altText: philMedia?.altText || 'Physician in unhurried patient consultation room',
      recommendedDimensions: '1000 × 1250 px',
      aspectRatio: '4:5',
      pageRoute: '/#philosophy',
      whereUsed: [
        { label: 'Homepage Care Philosophy Section', pageRoute: '/#philosophy' }
      ],
      entityType: 'homePage',
      entityId: 'home-philosophy-portrait'
    });

    const approachMedia = siteMedia['home-patient-first'] || DEFAULT_SITE_MEDIA['home-patient-first'];
    list.push({
      id: 'home-patient-first',
      pageName: 'Homepage',
      sectionName: 'Whole-Person Approach',
      itemName: 'Attentive Patient Listening Photo',
      fieldName: 'Approach Photo ("Care Beyond Symptoms")',
      category: 'homepage',
      url: approachMedia?.url || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200',
      defaultUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200',
      altText: approachMedia?.altText || 'Doctor listening attentively to patient at Newark Medical Associates',
      recommendedDimensions: '1200 × 960 px',
      aspectRatio: '5:4',
      pageRoute: '/#approach',
      whereUsed: [
        { label: 'Homepage Whole-Person Approach / Patient-First Section', pageRoute: '/#approach' }
      ],
      entityType: 'siteMedia',
      entityId: 'home-patient-first'
    });

    const aboutPreviewMedia = siteMedia['home-about-preview'] || DEFAULT_SITE_MEDIA['home-about-preview'];
    list.push({
      id: 'home-about-preview',
      pageName: 'Homepage',
      sectionName: 'About Overview',
      itemName: 'Vision for Healthier Tomorrow Photo',
      fieldName: 'Practice Overview Feature Image',
      category: 'homepage',
      url: aboutPreviewMedia?.url || homeContent.aboutPreview?.imageUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=1200',
      defaultUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=1200',
      altText: aboutPreviewMedia?.altText || 'Doctor consulting with adult patient at Newark Medical Associates',
      recommendedDimensions: '1200 × 900 px',
      aspectRatio: '4:3',
      pageRoute: '/#about',
      whereUsed: [
        { label: 'Homepage About Practice Preview Section', pageRoute: '/#about' }
      ],
      entityType: 'homePage',
      entityId: 'home-about-preview'
    });

    const bannerMedia = siteMedia['home-fullwidth-banner'] || DEFAULT_SITE_MEDIA['home-fullwidth-banner'];
    list.push({
      id: 'home-fullwidth-banner',
      pageName: 'Homepage',
      sectionName: 'Full-Width Break',
      itemName: 'Panoramic Clinic Interior Banner',
      fieldName: 'Editorial Panorama Divider',
      category: 'homepage',
      url: bannerMedia?.url || homeContent.fullWidthImage || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1800',
      defaultUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1800',
      altText: bannerMedia?.altText || 'Modern medical clinic interior waiting and consultation suite',
      recommendedDimensions: '1800 × 750 px',
      aspectRatio: '16:7',
      pageRoute: '/#experience',
      whereUsed: [
        { label: 'Homepage Panoramic Break Section', pageRoute: '/#experience' }
      ],
      entityType: 'homePage',
      entityId: 'home-fullwidth-banner'
    });

    // ==========================================
    // 2. HOMEPAGE SERVICES GRID CARDS
    // ==========================================
    const serviceCardKeys = [
      { id: 'home-service-primary', name: 'Primary Care & Consultations Card', def: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=900' },
      { id: 'home-service-diagnostics', name: 'Diagnostics & In-House Labs Card', def: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=900' },
      { id: 'home-service-preventive', name: 'Preventive Health Screenings Card', def: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=900' },
      { id: 'home-service-womens', name: 'Women\'s Wellness & Health Card', def: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=900' },
      { id: 'home-service-chronic', name: 'Chronic Disease Management Card', def: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=900' },
      { id: 'home-service-cardiac', name: 'Cardiac Screening & EKG Card', def: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=900' },
    ];

    serviceCardKeys.forEach(s => {
      const media = siteMedia[s.id] || DEFAULT_SITE_MEDIA[s.id];
      list.push({
        id: s.id,
        pageName: 'Homepage',
        sectionName: 'Services Grid',
        itemName: s.name,
        fieldName: 'Service Card Thumbnail',
        category: 'homepage',
        url: media?.url || s.def,
        defaultUrl: s.def,
        altText: media?.altText || s.name,
        recommendedDimensions: '900 × 600 px',
        aspectRatio: '3:2',
        pageRoute: '/#services',
        whereUsed: [
          { label: 'Homepage Services Grid', pageRoute: '/#services' },
          { label: 'Services Overview Directory', pageRoute: '/services' }
        ],
        entityType: 'siteMedia',
        entityId: s.id
      });
    });

    // ==========================================
    // 3. PROVIDERS & DOCTORS (HOMEPAGE & PROFILE)
    // ==========================================
    providers.forEach(p => {
      const pKey = normalizeProviderKey(p.id || p.slug || p.name);
      const isDeval = pKey === 'deval-gadhvi';
      const isPrahlad = pKey === 'prahlad-gadhavi' || pKey === 'prahlad-gadhvi';
      const isSankalp = pKey === 'sankalp-pathak';

      const defaultProfile = isPrahlad 
        ? 'https://pub-463524c5dd1e422ca67b4960ad60e690.r2.dev/providers/dr-prahlad-gadhavi/1791280065505-dr-prahlad-gadhavi.png'
        : isDeval 
          ? 'https://pub-463524c5dd1e422ca67b4960ad60e690.r2.dev/providers/dr-deval-gadhvi/dr-deval-gadhvi.webp'
          : '/uploads/site-media/providers-dr-sankalp.png';

      const activeProfileUrl = getProviderImage(p);

      // Primary Provider Profile Portrait
      list.push({
        id: `provider-profile-${p.id}`,
        pageName: 'Providers / Doctors',
        sectionName: 'Doctor Profiles',
        itemName: p.name || 'Medical Physician',
        fieldName: 'Main Clinical Headshot & Profile Portrait',
        category: 'providers',
        url: activeProfileUrl,
        defaultUrl: defaultProfile,
        altText: p.altText || `${p.name} - ${p.title || 'Internal Medicine Physician'}`,
        recommendedDimensions: '800 × 1000 px',
        aspectRatio: '4:5',
        pageRoute: `/providers/${p.slug || p.id}`,
        whereUsed: [
          { label: `Homepage Medical Team ("${p.name}")`, pageRoute: '/#providers' },
          { label: `Providers Directory Page`, pageRoute: '/providers' },
          { label: `Individual Profile Page (/providers/${p.slug || p.id})`, pageRoute: `/providers/${p.slug || p.id}` }
        ],
        entityType: 'provider',
        entityId: p.id
      });

      // Homepage Specific Override Portrait
      list.push({
        id: `provider-homepage-override-${p.id}`,
        pageName: 'Homepage',
        sectionName: 'Medical Team (Override)',
        itemName: `${p.name} (Homepage Portrait)`,
        fieldName: 'Dedicated Homepage 4:5 Crop Override',
        category: 'providers',
        url: p.homepageImageOverride || activeProfileUrl,
        defaultUrl: defaultProfile,
        altText: `${p.name} - Homepage Portrait`,
        recommendedDimensions: '800 × 1000 px',
        aspectRatio: '4:5',
        pageRoute: '/#providers',
        whereUsed: [
          { label: `Homepage Medical Team Card for ${p.name}`, pageRoute: '/#providers' }
        ],
        entityType: 'providerHomepage',
        entityId: p.id
      });
    });

    // ==========================================
    // 4. ABOUT PRACTICE PAGE
    // ==========================================
    const aboutHeroMedia = siteMedia['about-facility-main'] || DEFAULT_SITE_MEDIA['about-facility-main'];
    list.push({
      id: 'about-facility-main',
      pageName: 'About Page',
      sectionName: 'Hero & Facility',
      itemName: 'Clinical Consultation Suites Photo',
      fieldName: 'About Hero Facility Visual',
      category: 'about',
      url: aboutHeroMedia?.url || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1400',
      defaultUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1400',
      altText: aboutHeroMedia?.altText || 'Newark Medical Associates clinical facility suites',
      recommendedDimensions: '1400 × 900 px',
      aspectRatio: '16:10',
      pageRoute: '/about',
      whereUsed: [
        { label: 'About Practice Page Hero', pageRoute: '/about' }
      ],
      entityType: 'siteMedia',
      entityId: 'about-facility-main'
    });

    const aboutHeritageMedia = siteMedia['about-heritage-photo'] || DEFAULT_SITE_MEDIA['about-heritage-photo'];
    list.push({
      id: 'about-heritage-photo',
      pageName: 'About Page',
      sectionName: 'Heritage & Legacy',
      itemName: 'Decades in Newark Community Photo',
      fieldName: 'Practice History & Doctor Consultation',
      category: 'about',
      url: aboutHeritageMedia?.url || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1200',
      defaultUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1200',
      altText: aboutHeritageMedia?.altText || 'Physician consultation reflecting decades of community medicine',
      recommendedDimensions: '1200 × 800 px',
      aspectRatio: '3:2',
      pageRoute: '/about#heritage',
      whereUsed: [
        { label: 'About Practice Heritage Section', pageRoute: '/about#heritage' }
      ],
      entityType: 'siteMedia',
      entityId: 'about-heritage-photo'
    });

    // ==========================================
    // 5. SERVICES DIRECTORY & INDIVIDUAL SERVICES
    // ==========================================
    const servicesHeroMedia = siteMedia['services-page-hero'] || DEFAULT_SITE_MEDIA['services-page-hero'];
    list.push({
      id: 'services-page-hero',
      pageName: 'Services',
      sectionName: 'Header Banner',
      itemName: 'Clinical Services Header Banner',
      fieldName: 'Services Directory Hero Image',
      category: 'services',
      url: servicesHeroMedia?.url || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1400',
      defaultUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1400',
      altText: servicesHeroMedia?.altText || 'Clinical services at Newark Medical Associates',
      recommendedDimensions: '1400 × 700 px',
      aspectRatio: '2:1',
      pageRoute: '/services',
      whereUsed: [
        { label: 'Services Main Directory Hero', pageRoute: '/services' }
      ],
      entityType: 'siteMedia',
      entityId: 'services-page-hero'
    });

    services.forEach(srv => {
      list.push({
        id: `service-item-${srv.id}`,
        pageName: 'Services',
        sectionName: 'Individual Service',
        itemName: srv.name || 'Clinical Service',
        fieldName: 'Service Detail & Card Feature Image',
        category: 'services',
        url: srv.imageUrl || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=900',
        defaultUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=900',
        altText: `${srv.name} at Newark Medical Associates`,
        recommendedDimensions: '900 × 600 px',
        aspectRatio: '3:2',
        pageRoute: `/services/${srv.slug || srv.id}`,
        whereUsed: [
          { label: `Services Directory Card ("${srv.name}")`, pageRoute: '/services' },
          { label: `Service Detail Page (/services/${srv.slug || srv.id})`, pageRoute: `/services/${srv.slug || srv.id}` }
        ],
        entityType: 'service',
        entityId: srv.id
      });
    });

    // ==========================================
    // 6. CONDITIONS & DIAGNOSTICS LABS
    // ==========================================
    const diagLabMedia = siteMedia['diagnostics-hero-banner'] || DEFAULT_SITE_MEDIA['diagnostics-hero-banner'];
    list.push({
      id: 'diagnostics-hero-banner',
      pageName: 'Diagnostics',
      sectionName: 'In-House Laboratory',
      itemName: 'Modern Laboratory Diagnostics & Blood Screen',
      fieldName: 'In-House Diagnostics Lab Visual',
      category: 'conditions',
      url: diagLabMedia?.url || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1200',
      defaultUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1200',
      altText: diagLabMedia?.altText || 'In-house diagnostic laboratory equipment at Newark Medical',
      recommendedDimensions: '1200 × 800 px',
      aspectRatio: '3:2',
      pageRoute: '/diagnostics',
      whereUsed: [
        { label: 'Diagnostics Page Hero & Lab Tour', pageRoute: '/diagnostics' }
      ],
      entityType: 'siteMedia',
      entityId: 'diagnostics-hero-banner'
    });

    const diagEkgMedia = siteMedia['diagnostics-ekg'] || DEFAULT_SITE_MEDIA['diagnostics-ekg'];
    list.push({
      id: 'diagnostics-ekg',
      pageName: 'Diagnostics',
      sectionName: 'Cardiovascular Lab',
      itemName: 'Cardiac Screening & 12-Lead EKG Station',
      fieldName: 'EKG & Echocardiogram Screening Visual',
      category: 'conditions',
      url: diagEkgMedia?.url || 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=900',
      defaultUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=900',
      altText: diagEkgMedia?.altText || '12-lead EKG cardiac diagnostic equipment in clinic',
      recommendedDimensions: '900 × 600 px',
      aspectRatio: '3:2',
      pageRoute: '/diagnostics#ekg',
      whereUsed: [
        { label: 'Diagnostics Page Cardiac Screening Section', pageRoute: '/diagnostics#ekg' }
      ],
      entityType: 'siteMedia',
      entityId: 'diagnostics-ekg'
    });

    // ==========================================
    // 7. LOCATIONS & CLINIC FACILITY
    // ==========================================
    const clinicExtMedia = siteMedia['contact-clinic-exterior'] || DEFAULT_SITE_MEDIA['contact-clinic-exterior'];
    list.push({
      id: 'contact-clinic-exterior',
      pageName: 'Locations',
      sectionName: '337 Bloomfield Ave',
      itemName: '337 Bloomfield Ave Building Exterior',
      fieldName: 'Clinic Exterior Building Front',
      category: 'locations',
      url: clinicExtMedia?.url || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=1200',
      defaultUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=1200',
      altText: clinicExtMedia?.altText || 'Newark Medical Associates clinic exterior on Bloomfield Ave',
      recommendedDimensions: '1200 × 800 px',
      aspectRatio: '3:2',
      pageRoute: '/contact',
      whereUsed: [
        { label: 'Contact Page Location Card', pageRoute: '/contact' },
        { label: 'Locations Page (337 Bloomfield Ave)', pageRoute: '/locations' },
        { label: 'Homepage Map & Address Footer Area', pageRoute: '/#contact' }
      ],
      entityType: 'siteMedia',
      entityId: 'contact-clinic-exterior'
    });

    const clinicLoungeMedia = siteMedia['contact-reception-lounge'] || DEFAULT_SITE_MEDIA['contact-reception-lounge'];
    list.push({
      id: 'contact-reception-lounge',
      pageName: 'Locations',
      sectionName: 'Reception Lobby',
      itemName: 'Patient Reception & Waiting Lounge',
      fieldName: 'Clinic Waiting Lobby Visual',
      category: 'locations',
      url: clinicLoungeMedia?.url || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200',
      defaultUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200',
      altText: clinicLoungeMedia?.altText || 'Patient intake and reception area at Newark Medical Associates',
      recommendedDimensions: '1200 × 800 px',
      aspectRatio: '3:2',
      pageRoute: '/contact#reception',
      whereUsed: [
        { label: 'Contact Page Facility Tour', pageRoute: '/contact#reception' }
      ],
      entityType: 'siteMedia',
      entityId: 'contact-reception-lounge'
    });

    // ==========================================
    // 8. BRANDING, LOGOS & LAYOUT
    // ==========================================
    const brandLogoMedia = siteMedia['brand-primary-logo'] || DEFAULT_SITE_MEDIA['brand-primary-logo'];
    list.push({
      id: 'brand-primary-logo',
      pageName: 'Brand / Layout',
      sectionName: 'Header Logo',
      itemName: 'Newark Medical Primary Logo',
      fieldName: 'Main Clinic Brand Logo (Header & Nav)',
      category: 'brand',
      url: brandLogoMedia?.url || siteSettings.logoUrl || '/logo.png',
      defaultUrl: '/logo.png',
      altText: brandLogoMedia?.altText || 'Newark Medical Associates Logo',
      recommendedDimensions: '400 × 120 px',
      aspectRatio: '3:1',
      pageRoute: '/',
      whereUsed: [
        { label: 'Top Navigation Bar on Every Page', pageRoute: '/' },
        { label: 'Mobile Hamburger Menu Header', pageRoute: '/' }
      ],
      entityType: 'brand',
      entityId: 'brand-primary-logo'
    });

    const brandFooterLogoMedia = siteMedia['brand-footer-logo'] || DEFAULT_SITE_MEDIA['brand-footer-logo'];
    list.push({
      id: 'brand-footer-logo',
      pageName: 'Brand / Layout',
      sectionName: 'Footer Brand',
      itemName: 'Inverted White Clinic Logo (Footer)',
      fieldName: 'Dark Footer Accent Logo',
      category: 'brand',
      url: brandFooterLogoMedia?.url || '/logo.png',
      defaultUrl: '/logo.png',
      altText: 'Newark Medical Associates Footer Logo',
      recommendedDimensions: '400 × 120 px',
      aspectRatio: '3:1',
      pageRoute: '/#footer',
      whereUsed: [
        { label: 'Universal Dark Website Footer', pageRoute: '/#footer' }
      ],
      entityType: 'brand',
      entityId: 'brand-footer-logo'
    });

    // ==========================================
    // 9. BLOG & PATIENT LIBRARY
    // ==========================================
    const blogDefaultCover = siteMedia['blog-default-cover'] || DEFAULT_SITE_MEDIA['blog-default-cover'];
    list.push({
      id: 'blog-default-cover',
      pageName: 'Blog & Articles',
      sectionName: 'Default Cover',
      itemName: 'Universal Health Article Cover Image',
      fieldName: 'Default Fallback Banner for Health Posts',
      category: 'blogs',
      url: blogDefaultCover?.url || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1200',
      defaultUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1200',
      altText: blogDefaultCover?.altText || 'Patient health education article banner',
      recommendedDimensions: '1200 × 630 px',
      aspectRatio: '1.91:1',
      pageRoute: '/blog',
      whereUsed: [
        { label: 'Blog Archive & Patient Education Index', pageRoute: '/blog' },
        { label: 'Social Share / OpenGraph Fallback', pageRoute: '/blog' }
      ],
      entityType: 'siteMedia',
      entityId: 'blog-default-cover'
    });

    return list;
  }, [siteMedia, providers, services, homeContent, siteSettings]);

  // Filtered list
  const filteredCatalog = useMemo(() => {
    return catalog.filter(card => {
      if (selectedCategory !== 'all' && card.category !== selectedCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        card.itemName.toLowerCase().includes(q) ||
        card.pageName.toLowerCase().includes(q) ||
        card.sectionName.toLowerCase().includes(q) ||
        card.fieldName.toLowerCase().includes(q) ||
        card.altText.toLowerCase().includes(q) ||
        card.url.toLowerCase().includes(q)
      );
    });
  }, [catalog, selectedCategory, searchQuery]);

  // Handle Replace Button Click
  const handleOpenReplace = (card: WebsiteImageCard) => {
    setReplacingCard(card);
    setSelectedAssetUrl(card.url);
    setUrlInput(card.url.startsWith('http') || card.url.startsWith('/') ? card.url : '');
    setUploadError(null);
    setReplaceModalTab('upload');
  };

  // Handle Direct Upload from PC to Cloudflare R2
  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingCard) return;

    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];
    if (!ALLOWED.includes(file.type)) {
      setUploadError('Please select a JPG, PNG, WebP, or AVIF image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds 10MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      let finalUrl = '';
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`/.netlify/functions/upload-provider-image?providerId=${encodeURIComponent(replacingCard.id)}`, {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const json = await res.json();
          if (json.imageUrl) {
            finalUrl = json.imageUrl;
          }
        }
      } catch (err) {
        console.warn('R2 direct endpoint fallback in website image manager:', err);
      }

      if (!finalUrl) {
        finalUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      setSelectedAssetUrl(finalUrl);
      setUrlInput(finalUrl);

      // Save to media library collection for persistent reuse
      try {
        const db = getDb();
        await addDoc(collection(db, 'media_library'), {
          name: file.name,
          url: finalUrl,
          size: file.size,
          type: file.type,
          altText: replacingCard.itemName || file.name.split('.')[0],
          source: finalUrl.startsWith('data:') ? 'local-upload' : 'r2',
          createdAt: serverTimestamp()
        });
      } catch (e) {}
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload photo from PC.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Commit the replaced image to the underlying database record
  const handleConfirmReplace = async () => {
    if (!replacingCard || !selectedAssetUrl) return;

    setIsSavingChange(true);
    try {
      const newUrl = selectedAssetUrl.trim();
      const entityType = replacingCard.entityType;
      const entityId = replacingCard.entityId;

      // 1. If updating a Provider Profile Photo
      if (entityType === 'provider') {
        await updateProvider(entityId, {
          imageUrl: newUrl,
          photoUrl: newUrl,
          profileImage: newUrl
        });
        // Also sync site_media registry for this doctor
        await updateSiteMediaItem(`provider-${entityId}`, { url: newUrl });
      } 
      // 2. If updating a Provider Homepage Override Photo
      else if (entityType === 'providerHomepage') {
        await updateProvider(entityId, {
          homepageImageOverride: newUrl
        });
      }
      // 3. If updating a Service Card Photo
      else if (entityType === 'service') {
        await updateService(entityId, {
          imageUrl: newUrl
        });
        await updateSiteMediaItem(`services-${entityId}`, { url: newUrl });
      }
      // 4. If updating a Homepage Section Visual
      else if (entityType === 'homePage') {
        if (entityId === 'home-hero-main') {
          await updateHomePageContent({
            hero: { ...homeContent.hero, heroImage: newUrl, heroImageUrl: newUrl }
          });
        } else if (entityId === 'home-philosophy-portrait') {
          await updateHomePageContent({
            carePhilosophyImage: newUrl
          });
        } else if (entityId === 'home-about-preview') {
          await updateHomePageContent({
            aboutPreview: { ...homeContent.aboutPreview, imageUrl: newUrl }
          });
        } else if (entityId === 'home-fullwidth-banner') {
          await updateHomePageContent({
            fullWidthImage: newUrl
          });
        }
        await updateSiteMediaItem(entityId, { url: newUrl });
      }
      // 5. If updating a Brand Logo
      else if (entityType === 'brand') {
        if (entityId === 'brand-primary-logo') {
          await updateSiteSettings({ logoUrl: newUrl });
        }
        await updateSiteMediaItem(entityId, { url: newUrl });
      }
      // 6. Generic Site Media
      else {
        await updateSiteMediaItem(entityId, { url: newUrl });
      }

      setActionSuccessMsg(`Successfully updated "${replacingCard.itemName}"! Live website refreshed.`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
      setReplacingCard(null);
    } catch (err: any) {
      alert(`Error updating image: ${err.message || 'Please check your connection.'}`);
    } finally {
      setIsSavingChange(false);
    }
  };

  // Handle Remove Image
  const handleRemoveImage = async (card: WebsiteImageCard) => {
    if (!window.confirm(`Are you sure you want to remove the image for "${card.itemName}"? This will safely revert to default or clear the image reference without breaking the page layout.`)) {
      return;
    }

    try {
      if (card.entityType === 'providerHomepage') {
        // Clearing homepage override makes it fall back to main profile photo
        await updateProvider(card.entityId, { homepageImageOverride: '' });
      } else if (card.entityType === 'provider') {
        // Reset to canonical authentic portrait
        const key = normalizeProviderKey(card.entityId);
        const def = DEFAULT_PROVIDER_IMAGES[key] || '';
        await updateProvider(card.entityId, { imageUrl: def, photoUrl: def, profileImage: def });
      } else if (card.defaultUrl) {
        // Reset to original factory asset
        await updateSiteMediaItem(card.entityId, { url: card.defaultUrl });
      } else {
        await updateSiteMediaItem(card.entityId, { url: '' });
      }

      setActionSuccessMsg(`Image for "${card.itemName}" has been reset/cleared.`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(`Failed to remove image: ${err.message}`);
    }
  };

  const setSearchTermSafe = (val: string) => {
    setSearchQuery(val);
  };

  const CATEGORY_CHIPS = [
    { key: 'all', label: 'All Website Images', icon: Globe, count: catalog.length },
    { key: 'homepage', label: 'Homepage', icon: Layout, count: catalog.filter(c => c.category === 'homepage').length },
    { key: 'providers', label: 'Providers / Doctors', icon: HeartPulse, count: catalog.filter(c => c.category === 'providers').length },
    { key: 'services', label: 'Services', icon: Stethoscope, count: catalog.filter(c => c.category === 'services').length },
    { key: 'about', label: 'About Practice', icon: BookOpen, count: catalog.filter(c => c.category === 'about').length },
    { key: 'conditions', label: 'Conditions & Labs', icon: Activity, count: catalog.filter(c => c.category === 'conditions').length },
    { key: 'locations', label: 'Locations & Clinic', icon: MapPin, count: catalog.filter(c => c.category === 'locations').length },
    { key: 'brand', label: 'Brand & Logos', icon: ShieldCheck, count: catalog.filter(c => c.category === 'brand').length },
    { key: 'blogs', label: 'Blog & Articles', icon: Layers, count: catalog.filter(c => c.category === 'blogs').length },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100">
                <Sparkles size={13} />
                Single Central Image Center
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                {catalog.length} Total Visual Content Locations
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Website Images
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Find, replace, remove, or trace every photo and logo displayed across the live Newark Medical website. Changes update the live site immediately without editing source code.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('cards')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'cards'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>Website Sections ({catalog.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>Uploaded Asset Files ({libraryAssets.length})</span>
            </button>
          </div>
        </div>

        {/* Global Toast Success Message */}
        {actionSuccessMsg && (
          <div className="mt-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Search Bar & Filter Chips (Only for Website Sections view) */}
        {activeTab === 'cards' && (
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
            <div className="relative">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search images by doctor name (e.g. Deval, Prahlad), page (Homepage), section (Hero), or service (Ultrasound)..."
                value={searchQuery}
                onChange={(e) => setSearchTermSafe(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {CATEGORY_CHIPS.map(chip => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setSelectedCategory(chip.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === chip.key
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <chip.icon size={13} />
                  <span>{chip.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === chip.key ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {chip.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ====================================================
          TAB 1: WEBSITE IMAGE SECTIONS (PAGE -> SECTION -> IMAGE)
          ==================================================== */}
      {activeTab === 'cards' && (
        <div>
          {filteredCatalog.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 py-20 text-center space-y-3">
              <ImageIcon size={40} className="mx-auto text-slate-300" />
              <p className="text-base font-bold text-slate-800">No images match your search</p>
              <p className="text-xs text-slate-500">
                Try searching for a doctor's name, section title, or clear the search query.
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCatalog.map(card => {
                const isCustom = card.url && card.defaultUrl && card.url !== card.defaultUrl;

                return (
                  <div
                    key={card.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image Preview Box */}
                      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden border-b border-slate-100">
                        {card.url ? (
                          <img
                            src={card.url}
                            alt={card.altText || card.itemName}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                            onError={(e) => {
                              if (card.defaultUrl) {
                                (e.target as HTMLImageElement).src = card.defaultUrl;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4">
                            <ImageIcon size={32} className="mb-2 text-slate-300" />
                            <span className="text-xs font-semibold text-slate-500">No custom photo assigned</span>
                            <span className="text-[10px] text-slate-400">(Uses layout fallback)</span>
                          </div>
                        )}

                        {/* Top Context Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                          <span className="px-2.5 py-1 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-xs">
                            {card.pageName}
                          </span>
                          <span className="px-2.5 py-1 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg flex items-center gap-1 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span>Live on Website</span>
                          </span>
                        </div>

                        {/* Hover Overlay Button to Zoom */}
                        {card.url && (
                          <button
                            type="button"
                            onClick={() => setPreviewImage({ url: card.url, title: card.itemName, subtitle: `${card.pageName} → ${card.sectionName}` })}
                            className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 text-xs font-semibold backdrop-blur-xs cursor-pointer"
                          >
                            <Eye size={16} />
                            <span>Enlarge Preview</span>
                          </button>
                        )}
                      </div>

                      {/* Content Metadata */}
                      <div className="p-5 space-y-3">
                        {/* Section & Item Hierarchy */}
                        <div>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary-600 uppercase tracking-wider">
                            <span>{card.sectionName}</span>
                            <ChevronRight size={11} className="text-slate-400" />
                            <span className="text-slate-500 font-semibold">{card.fieldName}</span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 mt-1">
                            {card.itemName}
                          </h3>
                        </div>

                        {/* Specs & Dimensions */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="font-semibold text-slate-700">Recommended: {card.recommendedDimensions || 'Responsive'}</span>
                          {card.aspectRatio && (
                            <span className="text-slate-400 font-mono">Ratio: {card.aspectRatio}</span>
                          )}
                        </div>

                        {/* Where Used Traceability Badge */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setInspectWhereUsed(card)}
                            className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors border border-slate-200/80 cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5">
                              <Compass size={13} className="text-primary-600" />
                              <span>Where Used?</span>
                            </div>
                            <span className="text-[11px] text-primary-700 font-bold bg-primary-100/70 px-2 py-0.5 rounded-full">
                              {card.whereUsed.length} Location(s)
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex flex-col gap-2">
                      <div className="flex items-center gap-2 pt-3">
                        <button
                          type="button"
                          onClick={() => handleOpenReplace(card)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          <Upload size={14} />
                          <span>Replace Image</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(card)}
                          className="px-3 py-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                          title="Remove image from this section without breaking layout"
                        >
                          <Trash2 size={14} />
                        </button>

                        <a
                          href={card.pageRoute}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1"
                          title="Open live page"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>

                      {/* Reset to Default Button if custom image was applied */}
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(card)}
                          className="text-[11px] text-slate-500 hover:text-slate-800 font-medium flex items-center justify-center gap-1 pt-1 cursor-pointer"
                        >
                          <RotateCcw size={11} />
                          <span>Reset to Original Default Photo</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ====================================================
          TAB 2: UPLOADED ASSETS BROWSER (RAW FILE LIBRARY)
          ==================================================== */}
      {activeTab === 'library' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Uploaded Asset Library
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All image files uploaded to Cloudflare R2 and stored for permanent website use.
              </p>
            </div>
            
            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all">
              <Upload size={14} />
              <span>Upload New File to Cloud Storage</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    let finalUrl = '';
                    const formData = new FormData();
                    formData.append('file', file);
                    const res = await fetch(`/.netlify/functions/upload-provider-image?providerId=asset-${Date.now()}`, {
                      method: 'POST',
                      body: formData
                    });
                    if (res.ok) {
                      const json = await res.json();
                      finalUrl = json.imageUrl;
                    }
                    if (!finalUrl) {
                      finalUrl = await new Promise<string>((resolve, reject) => {
                        const r = new FileReader();
                        r.onload = () => resolve(r.result as string);
                        r.onerror = reject;
                        r.readAsDataURL(file);
                      });
                    }
                    const db = getDb();
                    await addDoc(collection(db, 'media_library'), {
                      name: file.name,
                      url: finalUrl,
                      size: file.size,
                      type: file.type,
                      altText: file.name.split('.')[0],
                      createdAt: serverTimestamp()
                    });
                    setActionSuccessMsg(`File "${file.name}" uploaded to Cloudflare R2.`);
                    setTimeout(() => setActionSuccessMsg(null), 3000);
                  } catch (err: any) {
                    alert('Upload failed: ' + err.message);
                  } finally {
                    e.target.value = '';
                  }
                }}
                className="hidden"
              />
            </label>
          </div>

          {libraryLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-2" />
              <p className="text-xs">Loading uploaded files...</p>
            </div>
          ) : libraryAssets.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <ImageIcon size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-800">No raw files uploaded yet</p>
              <p className="text-xs text-slate-400 mt-1">Upload a photo to store it in your Cloudflare bucket.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {libraryAssets.map(asset => (
                <div
                  key={asset.id}
                  className="group bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div className="aspect-square bg-slate-200 relative overflow-hidden">
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewImage({ url: asset.url, title: asset.name, subtitle: `${(asset.size ? (asset.size / 1024).toFixed(0) : 0)} KB` })}
                      className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-semibold backdrop-blur-xs cursor-pointer"
                    >
                      <Eye size={15} />
                    </button>
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-xs font-bold text-slate-900 truncate" title={asset.name}>
                      {asset.name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{asset.size ? `${(asset.size / 1024).toFixed(0)} KB` : 'Asset'}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(asset.url);
                          setActionSuccessMsg('Asset URL copied to clipboard!');
                          setTimeout(() => setActionSuccessMsg(null), 2500);
                        }}
                        className="text-primary-600 hover:text-primary-800 font-semibold cursor-pointer"
                      >
                        Copy URL
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====================================================
          MODAL: REPLACE IMAGE (UPLOAD FROM PC, ASSET PICKER, OR URL)
          ==================================================== */}
      {replacingCard && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600 block">
                  Replace Website Image
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {replacingCard.itemName}
                </h3>
                <p className="text-xs text-slate-500">
                  Page: <span className="font-semibold text-slate-700">{replacingCard.pageName}</span> • Section: <span className="font-semibold text-slate-700">{replacingCard.sectionName}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReplacingCard(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={17} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-200 px-6 bg-white gap-6 text-xs font-bold">
              <button
                type="button"
                onClick={() => setReplaceModalTab('upload')}
                className={`py-3 border-b-2 transition-colors cursor-pointer ${
                  replaceModalTab === 'upload'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                1. Upload from Computer (PC)
              </button>
              <button
                type="button"
                onClick={() => setReplaceModalTab('library')}
                className={`py-3 border-b-2 transition-colors cursor-pointer ${
                  replaceModalTab === 'library'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                2. Select from Existing Assets ({libraryAssets.length})
              </button>
              <button
                type="button"
                onClick={() => setReplaceModalTab('url')}
                className={`py-3 border-b-2 transition-colors cursor-pointer ${
                  replaceModalTab === 'url'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                3. Paste Direct URL
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* TAB 1: UPLOAD FROM PC */}
              {replaceModalTab === 'upload' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-primary-200 hover:border-primary-400 bg-primary-50/30 rounded-2xl p-8 text-center space-y-3 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-600 mx-auto flex items-center justify-center">
                      <Upload size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Choose an image from your computer / desktop
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        JPG, PNG, WebP, AVIF up to 10MB. Stored automatically in Cloudflare R2 bucket.
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all">
                      {isUploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                      <span>{isUploading ? 'Uploading to Cloudflare...' : '📁 Browse Files on This Device'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={handleDirectUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {uploadError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SELECT FROM EXISTING ASSETS */}
              {replaceModalTab === 'library' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Click any previously uploaded file to apply it to this website section:
                  </p>
                  {libraryAssets.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      No files uploaded yet. Use the "Upload from Computer" tab to add one.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
                      {libraryAssets.map(asset => {
                        const isChosen = selectedAssetUrl === asset.url;
                        return (
                          <div
                            key={asset.id}
                            onClick={() => { setSelectedAssetUrl(asset.url); setUrlInput(asset.url); }}
                            className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                              isChosen ? 'border-primary-600 ring-4 ring-primary-100 shadow-sm' : 'border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                            {isChosen && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center">
                                <Check size={12} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PASTE DIRECT URL */}
              {replaceModalTab === 'url' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    Direct Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://... or /uploads/..."
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setSelectedAssetUrl(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Paste any hosted CDN URL, Unsplash URL, or local path.
                  </p>
                </div>
              )}

              {/* Selected Image Live Preview */}
              {selectedAssetUrl && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    New Image Preview:
                  </span>
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                    <img
                      src={selectedAssetUrl}
                      alt="Selected preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setReplacingCard(null)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedAssetUrl || isSavingChange}
                onClick={handleConfirmReplace}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSavingChange ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                <span>Save & Apply to Website</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: WHERE IS THIS IMAGE USED? (TRACEABILITY)
          ==================================================== */}
      {inspectWhereUsed && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                  <Compass size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Where is this image used?
                  </h3>
                  <p className="text-xs text-slate-500">Live Website Usage Traceability</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectWhereUsed(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                <img src={inspectWhereUsed.url} alt={inspectWhereUsed.itemName} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{inspectWhereUsed.itemName}</p>
                <p className="text-[11px] text-slate-500 truncate">{inspectWhereUsed.pageName} → {inspectWhereUsed.sectionName}</p>
                <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Used in {inspectWhereUsed.whereUsed.length} location(s)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Active Website Locations:
              </span>
              <div className="space-y-1.5">
                {inspectWhereUsed.whereUsed.map((loc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs">
                    <span className="font-semibold text-slate-800">{loc.label}</span>
                    <a
                      href={loc.pageRoute}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-600 hover:text-primary-800 font-bold inline-flex items-center gap-1 shrink-0 ml-2"
                    >
                      <span>Open Page</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setInspectWhereUsed(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: ENLARGE IMAGE PREVIEW
          ==================================================== */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div>
                <h4 className="text-sm font-bold">{previewImage.title}</h4>
                <p className="text-xs text-slate-400">{previewImage.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[75vh] overflow-hidden bg-slate-950">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[70vh] max-w-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
