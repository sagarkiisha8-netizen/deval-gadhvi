export type AppointmentStatus = 
  | 'New' 
  | 'Pending' 
  | 'Confirmed' 
  | 'Rescheduled' 
  | 'Completed' 
  | 'Cancelled' 
  | 'No Show' 
  | 'new' 
  | 'confirmed' 
  | 'completed' 
  | 'cancelled' 
  | 'rescheduled'
  | 'pending';

export interface NotificationLog {
  id: string;
  type: 'email' | 'sms';
  recipient: string;
  subject?: string;
  template: string;
  status: 'sent' | 'simulated' | 'failed';
  sentAt: any;
}

export interface Appointment {
  id: string;
  patientName: string;
  age?: string | number;
  patientAge?: string | number;
  email?: string;
  phone?: string;
  patientEmail?: string;
  patientPhone?: string;
  patientType?: 'new_patient' | 'existing_patient' | 'New Patient' | 'Existing Patient';
  doctorId?: string;
  doctorName?: string;
  providerId?: string;
  providerName?: string;
  serviceId?: string;
  serviceName?: string;
  preferredDate: string;
  preferredTime?: string;
  appointmentType?: string;
  visitType?: 'in_person' | 'telehealth';
  reasonForVisit?: string;
  message?: string;
  notes?: string;
  consentGiven?: boolean;
  bookingSource?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  status: AppointmentStatus;
  internalNotes?: string;
  notificationLogs?: NotificationLog[];
  createdAt?: any;
  updatedAt?: any;
}

export type LeadStatus = 
  | 'New' 
  | 'Contacted' 
  | 'Converted' 
  | 'Resolved' 
  | 'Archived' 
  | 'Spam'
  | 'new' 
  | 'contacted' 
  | 'converted' 
  | 'archived'
  | 'spam';

export interface Lead {
  id: string;
  name: string;
  age?: string | number;
  email: string;
  phone?: string;
  service?: string;
  subject?: string;
  message: string;
  source?: string;
  sourcePage?: string;
  status: LeadStatus;
  internalNotes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export type LeadItem = Lead;

export interface AnalyticsEvent {
  id?: string;
  eventName: string;
  category?: string;
  label?: string;
  metadata?: Record<string, any>;
  timestamp?: any;
}

export interface ProviderAvailability {
  workingDays: string[]; // e.g. ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  startTime: string; // e.g. '08:00 AM'
  endTime: string; // e.g. '05:00 PM'
  appointmentDuration: number; // in minutes (e.g. 30)
  breakStartTime?: string; // e.g. '12:00 PM'
  breakEndTime?: string; // e.g. '01:00 PM'
  blockedDates?: string[]; // e.g. ['2026-12-25', '2026-01-01']
}

export interface Provider {
  id: string;
  name: string;
  credentials: string; // e.g. "MD, FACP"
  title: string; // e.g. "Chief of Internal Medicine"
  specialty: string; // e.g. "Internal Medicine & Preventive Cardiology"
  bio: string;
  fullBio?: string;
  imageUrl: string;
  photoUrl?: string;
  experienceYears?: number;
  education?: string[];
  certifications?: string[];
  languages?: string[];
  insuranceAccepted?: string[];
  rating?: number;
  reviewsCount?: number;
  isAcceptingPatients: boolean;
  phone?: string;
  email?: string;
  appointmentDays?: string[];
  availability?: ProviderAvailability;
  displayOrder: number;
  isActive: boolean;
  slug: string;
  seoTitle?: string;
  metaDescription?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  category: 'Primary Care' | 'Preventive Medicine' | 'Diagnostic Solutions' | 'Chronic Care' | 'Specialized Services';
  shortDescription: string;
  description: string;
  iconName: string;
  imageUrl: string;
  keyFeatures?: string[];
  preparationTips?: string;
  displayOrder: number;
  isActive: boolean;
  seoTitle?: string;
  metaDescription?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface TestimonialItem {
  id: string;
  patientName: string;
  location?: string;
  role?: string; // e.g. "Patient of 6 Years"
  rating: number;
  quote: string;
  date?: string;
  serviceTag?: string;
  avatarUrl?: string;
  isFeatured: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  path?: string;
  size: number;
  type: string;
  dimensions?: string;
  altText?: string;
  uploadedBy?: string;
  createdAt: any;
}

export interface SiteMediaItem {
  id: string; // unique key e.g. "home-hero-main", "services-primary-care"
  pageKey: string; // e.g. 'home' | 'about' | 'services' | 'providers' | 'blogs' | 'resources' | 'contact' | 'banners' | 'backgrounds' | 'gallery' | 'branding' | 'seo'
  sectionKey: string; // e.g. 'hero' | 'services' | 'facility' | 'doctor' | 'cta'
  imageKey: string; // e.g. 'main' | 'background' | 'primary-care' | 'logo'
  label: string; // Human-friendly title e.g. "Homepage Main Hero Banner"
  description?: string; // Where this image is displayed on the live site
  url: string; // Active desktop/primary image URL
  mobileUrl?: string; // Optional mobile image URL
  altText: string;
  title?: string;
  caption?: string;
  recommendedDimensions?: string; // e.g. "1920x1080", "800x800"
  aspectRatio?: string; // e.g. "16:9", "1:1", "4:3"
  objectFit?: 'cover' | 'contain' | 'fill';
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | string;
  focalPointX?: number; // 0-100%
  focalPointY?: number; // 0-100%
  defaultUrl: string; // Factory default fallback URL
  defaultAlt: string;
  pageRoute?: string; // Route link to view on live site e.g. "/", "/about", "/services"
  updatedAt?: any;
}

export type SiteMediaCategory = 
  | 'all'
  | 'homepage'
  | 'about'
  | 'services'
  | 'providers'
  | 'blogs'
  | 'resources'
  | 'contact'
  | 'banners'
  | 'backgrounds'
  | 'gallery'
  | 'branding'
  | 'seo';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  displayOrder: number;
}

export interface HomePageContent {
  hero: {
    badgeText: string;
    headline: string;
    highlightedHeadline: string;
    subtitle: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
    heroImageUrl: string;
    heroImage?: string;
    heroImageAlt?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    heroDescription?: string;
    showInlineAppointmentForm?: boolean;
    statNumber: string;
    statLabel: string;
    ratingScore: string;
    trustTags: string[];
    videoUrl?: string;
    videoTitle?: string;
    videoBadge?: string;
    showVideoModal?: boolean;
    videoMode?: 'modal' | 'embed';
  };
  stats: {
    stat1: { number: string; label: string; desc: string };
    stat2: { number: string; label: string; desc: string };
    stat3: { number: string; label: string; desc: string };
    stat4: { number: string; label: string; desc: string };
  };
  aboutPreview: {
    tag: string;
    title: string;
    description: string;
    bulletPoints: string[];
    experienceYears: string;
    imageUrl?: string;
    videoUrl?: string;
  };
  carePhilosophyImage?: string;
  fullWidthImage?: string;
  whyChooseUs: {
    tag: string;
    title: string;
    subtitle: string;
  };
  process: {
    tag: string;
    title: string;
    subtitle: string;
  };
  testimonials: {
    tag: string;
    title: string;
    subtitle: string;
  };
  faq: {
    tag: string;
    title: string;
    subtitle: string;
    items: FaqItem[];
  };
  ctaBanner: {
    headline: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    phoneText: string;
  };
  sectionVisibility: {
    hero: boolean;
    stats: boolean;
    services: boolean;
    about: boolean;
    whyChooseUs: boolean;
    process: boolean;
    providers: boolean;
    testimonials: boolean;
    faq: boolean;
    contact: boolean;
    floatingDock: boolean;
  };
}

export interface AboutPageContent {
  tag: string;
  title: string;
  subtitle: string;
  storyTitle: string;
  storyParagraph1: string;
  storyParagraph2: string;
  missionTitle: string;
  missionText: string;
  visionTitle: string;
  visionText: string;
  values: { title: string; desc: string }[];
  facilityImageUrl: string;
  heroImage?: string;
  videoUrl?: string;
  experienceYearsBadge: string;
}

export interface DiagnosticsPageContent {
  tag: string;
  title: string;
  subtitle: string;
  intro: string;
  equipmentHighlights: { title: string; desc: string; icon: string }[];
}

export interface ProcessPageContent {
  tag: string;
  title: string;
  subtitle: string;
  steps: { stepNumber: string; title: string; description: string; detail: string }[];
  checklistItems: string[];
}

export interface ContactPageContent {
  tag: string;
  title: string;
  subtitle: string;
  directPhone: string;
  email: string;
  emergencyPhone: string;
  address: string;
  hoursMondayFriday: string;
  hoursSaturday: string;
  hoursSunday: string;
  mapEmbedUrl: string;
}

export interface HeaderContent {
  topBarAnnouncement: string;
  topBarPhone: string;
  topBarAddress: string;
  logoText: string;
  logoSubtext: string;
  logoUrl?: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  navLinks: { name: string; href: string; isActive: boolean }[];
}

export interface FooterContent {
  logoText: string;
  logoSubtext: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  hoursMonFri: string;
  hoursSat: string;
  hoursSun: string;
  copyrightText: string;
  quickLinks: { name: string; href: string }[];
  serviceLinks: { name: string; href: string }[];
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export interface BlogReference {
  id?: string;
  title: string;
  url?: string;
  source?: string;
  journalOrSource?: string;
  year?: string;
}

export type BlogStatus = 'draft' | 'needs_review' | 'approved' | 'scheduled' | 'published' | 'archived';

export interface BlogAuthor {
  id: string;
  name: string;
  profilePhoto: string;
  designation: string; // e.g. "Board-Certified Internist"
  qualification: string; // e.g. "MBBS, MD, FACP"
  bio: string;
  profileUrl?: string; // e.g. "/providers/dr-prahlad-gadhvi"
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  authorType: 'Doctor' | 'Medical Reviewer' | 'Editorial Team';
  articleCount?: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  articleCount?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorTitle?: string;
  authorAvatar?: string;
  authorId?: string;
  authorType?: 'Doctor' | 'Medical Reviewer' | 'Editorial Team';
  category: string;
  categoryId?: string;
  tags: string[];
  excerpt: string;
  featuredImage: string;
  featuredImageAlt: string;
  featuredImageCaption?: string;
  featuredImageCredit?: string;
  coverImage?: string;
  coverImageAlt?: string;
  coverImageCaption?: string;
  coverImageCredit?: string;
  content: string; // sanitized HTML / rich text
  status: BlogStatus;
  published?: boolean;
  publishDate: string; // ISO or YYYY-MM-DD
  publishTime?: string; // e.g. "09:00"
  scheduledDate?: string;
  scheduledAt?: string;
  modifiedDate?: string;
  readTimeMinutes?: number;
  readingTime?: number;
  views?: number;
  isFeatured?: boolean;
  isEditorsPick?: boolean;
  isPopular?: boolean;
  // Editorial Trust & Medical Review (YMYL Healthcare compliance)
  medicallyReviewed?: boolean;
  medicallyReviewedBy?: string;
  medicallyReviewedDate?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerTitle?: string;
  reviewedByDoctor?: string;
  medicalReviewerId?: string;
  medicalReviewDate?: string;
  factCheckedBy?: string;
  factCheckStatus?: 'verified' | 'pending' | 'unverified';
  clinicalVerificationBoard?: string;
  originalReporting?: boolean;
  originalReportingScore?: number;
  references?: BlogReference[];
  // SEO & Google News
  seoTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  canonicalUrl?: string;
  indexRobots?: boolean; // true = index, false = noindex
  robotsIndex?: boolean;
  noIndex?: boolean;
  noFollow?: boolean;
  schemaType?: 'BlogPosting' | 'MedicalScholarlyArticle' | 'NewsArticle' | 'Article';
  googleNewsEligible?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  // CTAs & Interlinking
  ctaHeading?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
  ctaButtonUrl?: string;
  relatedArticleIds?: string[];
  previousSlugs?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  metaDescription?: string;
  displayOrder: number;
  articleCount?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface PageSeoItem {
  id: string;
  pageKey: string; // e.g. 'home', 'about', 'services', 'providers', 'contact', 'blog'
  pageName: string;
  path: string;
  title: string;
  metaDescription: string;
  canonicalUrl?: string;
  indexRobots: boolean; // default true
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  schemaType?: string;
  schemaJson?: string;
  updatedAt?: any;
}

export interface SiteSettings {
  practiceName: string;
  tagline: string;
  siteUrl?: string; // production domain e.g. https://newarkmed.com
  npiNumber?: string;
  licenseNumber?: string;
  phone: string;
  emergencyPhone: string;
  fax?: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  hours: {
    monFri: string;
    sat: string;
    sun: string;
  };
  googleMapsLink?: string;
  social: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
    youtube?: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    ogImage: string;
    keywords: string;
    canonicalDomain?: string;
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    searchConsoleVerification?: string;
    googlePublisherId?: string;
    googleNewsPublicationName?: string;
    robotsTxtContent?: string;
  };
}

export interface AdminUser {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'admin' | 'doctor' | 'staff';
  photoUrl?: string;
  phone?: string;
  isActive: boolean;
  createdAt: any;
}

export interface DoctorProfile {
  id: string;
  name: string;
  qualification: string;
  designation: string;
  speciality: string;
  subSpeciality: string;
  experienceYears: number;
  clinicName: string;
  biography: string;
  introduction: string;
  photoUrl: string;
  expertise: string[];
  awards: string[];
  memberships: string[];
  certifications: string[];
  medicalRegistration: {
    npi: string;
    licenseNumber: string;
    state: string;
  };
  consultationTimings: string;
  consultationFee: string;
  phone: string;
  whatsapp: string;
  email: string;
  clinicAddress: string;
  googleMapsUrl: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  updatedAt?: any;
}

export interface ConditionItem {
  id: string;
  name: string;
  slug: string;
  featuredImage: string;
  overview: string;
  symptoms: string[];
  causes: string[];
  riskFactors: string[];
  diagnosis: string[];
  treatmentOptions: string[];
  prevention: string[];
  faqs: { question: string; answer: string }[];
  relatedServices: string[];
  ctaText?: string;
  ctaLink?: string;
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface ClinicLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  mapsLink: string;
  timings: string;
  appointmentLink: string;
  imageUrl: string;
  isActive: boolean;
  displayOrder: number;
  updatedAt?: any;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'clinic' | 'doctor' | 'awards' | 'events' | 'certificates' | 'media';
  imageUrl: string;
  caption: string;
  altText: string;
  displayOrder: number;
  createdAt: any;
}

export interface PopupAnnouncement {
  id: string;
  heading: string;
  description: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  startDate?: string;
  endDate?: string;
  isEnabled: boolean;
  updatedAt?: any;
}

export interface ActivityLog {
  id: string;
  user: string;
  userEmail: string;
  action: string;
  details?: string;
  category: 'auth' | 'blog' | 'service' | 'homepage' | 'doctor' | 'appointment' | 'settings' | 'general';
  timestamp: any;
}

