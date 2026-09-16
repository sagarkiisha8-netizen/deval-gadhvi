import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  doc, onSnapshot, collection, getDocs, setDoc, deleteDoc,
  serverTimestamp, addDoc 
} from 'firebase/firestore';
import { getDb } from '../lib/firebase';
import { 
  HomePageContent, AboutPageContent, DiagnosticsPageContent, 
  ProcessPageContent, ContactPageContent, HeaderContent, 
  FooterContent, SiteSettings, Provider, ServiceItem, TestimonialItem,
  BlogPost, BlogCategory, BlogAuthor, BlogTag, PageSeoItem, SiteMediaItem 
} from '../types';
import { 
  DEFAULT_HOME_PAGE, DEFAULT_ABOUT_PAGE, DEFAULT_DIAGNOSTICS_PAGE, 
  DEFAULT_PROCESS_PAGE, DEFAULT_CONTACT_PAGE, DEFAULT_HEADER, 
  DEFAULT_FOOTER, DEFAULT_SITE_SETTINGS, DEFAULT_PROVIDERS, 
  DEFAULT_SERVICES, DEFAULT_TESTIMONIALS, DEFAULT_BLOGS,
  DEFAULT_BLOG_CATEGORIES, DEFAULT_BLOG_AUTHORS, DEFAULT_BLOG_TAGS, DEFAULT_PAGE_SEO 
} from '../data/defaultCmsData';
import { DEFAULT_SITE_MEDIA } from '../data/defaultSiteMedia';
import { getProviderImage, normalizeProviderKey } from '../utils/providerImages';

interface CmsContextType {
  homeContent: HomePageContent;
  aboutContent: AboutPageContent;
  diagnosticsContent: DiagnosticsPageContent;
  processContent: ProcessPageContent;
  contactContent: ContactPageContent;
  headerContent: HeaderContent;
  footerContent: FooterContent;
  siteSettings: SiteSettings;
  providers: Provider[];
  services: ServiceItem[];
  testimonials: TestimonialItem[];
  blogs: BlogPost[];
  blogCategories: BlogCategory[];
  blogAuthors: BlogAuthor[];
  blogTags: BlogTag[];
  pageSeoList: PageSeoItem[];
  siteMedia: Record<string, SiteMediaItem>;
  loading: boolean;
  getSiteMedia: (pageKey: string, sectionKey?: string, imageKey?: string) => SiteMediaItem | undefined;
  getMediaUrl: (pageKey: string, sectionKey?: string, imageKey?: string, fallbackUrl?: string) => string;
  updateSiteMediaItem: (id: string, updates: Partial<SiteMediaItem>) => Promise<void>;
  resetSiteMediaItem: (id: string) => Promise<void>;
  bulkUpdateSiteMedia: (items: Partial<SiteMediaItem>[]) => Promise<void>;
  updateService: (id: string, service: Partial<ServiceItem>) => Promise<void>;
  updateProvider: (id: string, provider: Partial<Provider>) => Promise<void>;
  updateHomePageContent: (data: Partial<HomePageContent>) => Promise<void>;
  updateAboutPageContent: (data: Partial<AboutPageContent>) => Promise<void>;
  updateDiagnosticsPageContent: (data: Partial<DiagnosticsPageContent>) => Promise<void>;
  updateProcessPageContent: (data: Partial<ProcessPageContent>) => Promise<void>;
  updateContactPageContent: (data: Partial<ContactPageContent>) => Promise<void>;
  updateHeaderContent: (data: Partial<HeaderContent>) => Promise<void>;
  updateFooterContent: (data: Partial<FooterContent>) => Promise<void>;
  updateSiteSettings: (data: Partial<SiteSettings>) => Promise<void>;
  // Blog CMS Operations
  createBlog: (blog: Partial<BlogPost>) => Promise<BlogPost>;
  updateBlog: (id: string, blog: Partial<BlogPost>) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  archiveBlog: (id: string) => Promise<void>;
  duplicateBlog: (id: string) => Promise<BlogPost>;
  checkSlugUnique: (slug: string, excludeBlogId?: string) => boolean;
  incrementBlogViews: (id: string) => Promise<void>;
  // Blog Categories Operations
  createCategory: (cat: Partial<BlogCategory>) => Promise<BlogCategory>;
  updateCategory: (id: string, cat: Partial<BlogCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (orderedIds: string[]) => Promise<void>;
  // Blog Authors Operations
  createAuthor: (author: Partial<BlogAuthor>) => Promise<BlogAuthor>;
  updateAuthor: (id: string, author: Partial<BlogAuthor>) => Promise<void>;
  deleteAuthor: (id: string) => Promise<void>;
  // Blog Tags Operations
  createTag: (tag: Partial<BlogTag>) => Promise<BlogTag>;
  updateTag: (id: string, tag: Partial<BlogTag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  // Page SEO Operations
  updatePageSeo: (pageKey: string, data: Partial<PageSeoItem>) => Promise<void>;
  refreshData: () => Promise<void>;
  trackPageView: (pagePath: string) => void;
}

const sanitizePhoneNumbersInObject = <T,>(obj: T): T => {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    let updated: string = obj;
    // Upgrade any old phone numbers like 973-483-xxxx or other legacy numbers to 973-412-9404
    updated = updated.replace(/\b\(?973\)?[-.\s]?483[-.\s]?\d{4}\b/g, '(973) 412-9404');
    updated = updated.replace(/\+1973483\d{4}\b/g, '+19734129404');
    return updated as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizePhoneNumbersInObject(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const res: any = {};
    for (const key of Object.keys(obj as any)) {
      const val = (obj as any)[key];
      if (key === 'phone' || key === 'directPhone' || key === 'topBarPhone' || key === 'phoneText' || key === 'whatsapp') {
        if (typeof val === 'string' && val.trim() !== '' && !val.includes('000-0000')) {
          if (key === 'whatsapp') {
            res[key] = '+1 (973) 412-9404';
          } else {
            res[key] = '(973) 412-9404';
          }
          continue;
        }
      }
      if (key === 'rawPhone') {
        res[key] = '+19734129404';
        continue;
      }
      res[key] = sanitizePhoneNumbersInObject(val);
    }
    return res as T;
  }
  return obj;
};

const getLocalItem = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      const sanitized = sanitizePhoneNumbersInObject(parsed);
      // Persist back sanitized version so localStorage stays clean
      localStorage.setItem(key, JSON.stringify(sanitized));
      return sanitized;
    }
  } catch (e) {
    // Ignore localStorage parse errors
  }
  return sanitizePhoneNumbersInObject(fallback);
};

const setLocalItem = (key: string, value: any) => {
  try {
    const sanitized = sanitizePhoneNumbersInObject(value);
    localStorage.setItem(key, JSON.stringify(sanitized));
  } catch (e) {
    // Ignore quota or private mode errors
  }
};

const sanitizeProvidersList = (raw: Provider[]): Provider[] => {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_PROVIDERS;
  return DEFAULT_PROVIDERS.map((def) => {
    // Match strictly by canonical id or slug — NEVER by index or name substring
    const defKey = normalizeProviderKey(def.id || def.slug);
    const match = raw.find((p) => normalizeProviderKey(p.id || p.slug) === defKey);
    if (!match) return def;

    // Image priority: 1. Admin/Database saved image -> 2. Provider-specific default -> 3. Generic placeholder
    const image = getProviderImage(match) || getProviderImage(def);
    return {
      ...def,
      ...match,
      id: def.id,
      slug: def.slug,
      name: match.name || def.name,
      image,
      imageUrl: image,
      photoUrl: image,
      phone: '(973) 412-9404'
    };
  });
};

const CmsContext = createContext<CmsContextType | undefined>(undefined);

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const [homeContent, setHomeContent] = useState<HomePageContent>(() => getLocalItem('newark_cms_home', DEFAULT_HOME_PAGE));
  const [aboutContent, setAboutContent] = useState<AboutPageContent>(() => getLocalItem('newark_cms_about', DEFAULT_ABOUT_PAGE));
  const [diagnosticsContent, setDiagnosticsContent] = useState<DiagnosticsPageContent>(() => getLocalItem('newark_cms_diagnostics', DEFAULT_DIAGNOSTICS_PAGE));
  const [processContent, setProcessContent] = useState<ProcessPageContent>(() => getLocalItem('newark_cms_process', DEFAULT_PROCESS_PAGE));
  const [contactContent, setContactContent] = useState<ContactPageContent>(() => getLocalItem('newark_cms_contact', DEFAULT_CONTACT_PAGE));
  const [headerContent, setHeaderContent] = useState<HeaderContent>(() => getLocalItem('newark_cms_header', DEFAULT_HEADER));
  const [footerContent, setFooterContent] = useState<FooterContent>(() => getLocalItem('newark_cms_footer', DEFAULT_FOOTER));
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => getLocalItem('newark_cms_settings', DEFAULT_SITE_SETTINGS));
  
  // Providers: read from versioned localStorage key (written by Firestore snapshot).
  // Falls back to DEFAULT_PROVIDERS on first load or after cache clear.
  // Firestore onSnapshot will overwrite this within ~500ms of mount.
  const [providers, setProviders] = useState<Provider[]>(() => {
    const cached = getLocalItem<Provider[] | null>('newark_cms_providers_v3', null);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return sanitizeProvidersList(cached);
    }
    // Clear old stale key if it exists
    try { localStorage.removeItem('newark_cms_providers'); } catch (_) {}
    return DEFAULT_PROVIDERS;
  });

  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(DEFAULT_TESTIMONIALS);
  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    const localBlogs = getLocalItem<BlogPost[]>('newark_cms_blogs', []);
    const merged = [...DEFAULT_BLOGS];
    localBlogs.forEach((localBlog) => {
      const existingIndex = merged.findIndex(
        (blog) => blog.id === localBlog.id || blog.slug === localBlog.slug
      );
      if (existingIndex >= 0) {
        merged[existingIndex] = { ...merged[existingIndex], ...localBlog };
      } else {
        merged.push(localBlog);
      }
    });
    return merged;
  });
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>(DEFAULT_BLOG_CATEGORIES);
  const [blogAuthors, setBlogAuthors] = useState<BlogAuthor[]>(DEFAULT_BLOG_AUTHORS);
  const [blogTags, setBlogTags] = useState<BlogTag[]>(DEFAULT_BLOG_TAGS);
  const [pageSeoList, setPageSeoList] = useState<PageSeoItem[]>(DEFAULT_PAGE_SEO);
  const [siteMedia, setSiteMedia] = useState<Record<string, SiteMediaItem>>(() => {
    const local = getLocalItem<Record<string, SiteMediaItem>>('newark_cms_site_media', {});
    return { ...DEFAULT_SITE_MEDIA, ...local };
  });
  const [loading, setLoading] = useState(true);

  // Firestore subscriptions & initial fetch
  useEffect(() => {
    let unsubscribeHome: (() => void) | undefined;
    let unsubscribeAbout: (() => void) | undefined;
    let unsubscribeDiagnostics: (() => void) | undefined;
    let unsubscribeProcess: (() => void) | undefined;
    let unsubscribeContact: (() => void) | undefined;
    let unsubscribeHeader: (() => void) | undefined;
    let unsubscribeFooter: (() => void) | undefined;
    let unsubscribeSettings: (() => void) | undefined;
    let unsubscribeProviders: (() => void) | undefined;
    let unsubscribeDoctorProfile: (() => void) | undefined;
    let unsubscribeServices: (() => void) | undefined;
    let unsubscribeTestimonials: (() => void) | undefined;
    let unsubscribeBlogs: (() => void) | undefined;
    let unsubscribeCategories: (() => void) | undefined;
    let unsubscribeAuthors: (() => void) | undefined;
    let unsubscribeTags: (() => void) | undefined;
    let unsubscribePageSeo: (() => void) | undefined;
    let unsubscribeSiteMedia: (() => void) | undefined;

    // Cross-tab and instantaneous in-memory synchronization listener
    const handleCmsUpdateEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent?.detail?.type === 'home' && customEvent.detail.data) {
        setHomeContent(customEvent.detail.data);
      }
      if (customEvent?.detail?.type === 'about' && customEvent.detail.data) {
        setAboutContent(customEvent.detail.data);
      }
      if (customEvent?.detail?.type === 'settings' && customEvent.detail.data) {
        setSiteSettings(customEvent.detail.data);
      }
      if (customEvent?.detail?.type === 'site_media' && customEvent.detail.data) {
        setSiteMedia(prev => ({ ...prev, ...customEvent.detail.data }));
      }
      if (customEvent?.detail?.type === 'blogs' && customEvent.detail.data) {
        setBlogs(customEvent.detail.data);
      }
    };

    window.addEventListener('newark_cms_update', handleCmsUpdateEvent);
    window.addEventListener('storage', () => {
      setHomeContent(getLocalItem('newark_cms_home', DEFAULT_HOME_PAGE));
      setAboutContent(getLocalItem('newark_cms_about', DEFAULT_ABOUT_PAGE));
      setSiteSettings(getLocalItem('newark_cms_settings', DEFAULT_SITE_SETTINGS));
      // Read from versioned key; use sanitizeProvidersList for proper merge
      const crossTabProviders = getLocalItem<Provider[] | null>('newark_cms_providers_v3', null);
      if (crossTabProviders && Array.isArray(crossTabProviders) && crossTabProviders.length > 0) {
        setProviders(sanitizeProvidersList(crossTabProviders));
      }
      const localMedia = getLocalItem<Record<string, SiteMediaItem>>('newark_cms_site_media', {});
      setSiteMedia({ ...DEFAULT_SITE_MEDIA, ...localMedia });
      const localBlogs = getLocalItem<BlogPost[]>('newark_cms_blogs', []);
      if (localBlogs.length > 0) {
        setBlogs(prev => {
          const merged = [...prev];
          localBlogs.forEach((localBlog) => {
            const index = merged.findIndex(
              (blog) => blog.id === localBlog.id || blog.slug === localBlog.slug
            );
            if (index >= 0) merged[index] = { ...merged[index], ...localBlog };
            else merged.push(localBlog);
          });
          return merged;
        });
      }
    });

    try {
      const db = getDb();

      // Home Page
      unsubscribeHome = onSnapshot(doc(db, 'pages', 'home'), (docSnap) => {
        if (docSnap.exists()) {
          const d = docSnap.data() as any;
          const activeHeroImg = d.hero?.heroImage || d.hero?.heroImageUrl || d.hero?.imageUrl || DEFAULT_HOME_PAGE.hero.heroImage;
          const newHome: HomePageContent = {
            hero: { 
              ...DEFAULT_HOME_PAGE.hero, 
              ...(d.hero || {}),
              heroImage: activeHeroImg,
              heroImageUrl: activeHeroImg,
              videoUrl: d.hero?.videoUrl !== undefined ? d.hero.videoUrl : (d.hero?.video || ''),
              videoTitle: d.hero?.videoTitle || 'Watch Clinic Tour & Doctor Introduction',
              videoBadge: d.hero?.videoBadge || 'Newark Clinic Video',
              videoMode: d.hero?.videoMode || 'modal',
            },
            stats: { ...DEFAULT_HOME_PAGE.stats, ...(d.stats || {}) },
            aboutPreview: { 
              ...DEFAULT_HOME_PAGE.aboutPreview, 
              ...(d.aboutPreview || {}),
              imageUrl: d.aboutPreview?.imageUrl || d.aboutPreview?.image || DEFAULT_HOME_PAGE.aboutPreview.imageUrl,
              videoUrl: d.aboutPreview?.videoUrl || ''
            },
            carePhilosophyImage: d.carePhilosophyImage || DEFAULT_HOME_PAGE.carePhilosophyImage,
            fullWidthImage: d.fullWidthImage || DEFAULT_HOME_PAGE.fullWidthImage,
            process: { ...DEFAULT_HOME_PAGE.process, ...(d.process || {}) },
            faq: { 
              ...DEFAULT_HOME_PAGE.faq, 
              ...(d.faq || {}),
              items: d.faq?.items || DEFAULT_HOME_PAGE.faq.items 
            },
            sectionVisibility: { ...DEFAULT_HOME_PAGE.sectionVisibility, ...(d.sectionVisibility || {}) }
          };
          setHomeContent(newHome);
          setLocalItem('newark_cms_home', newHome);
        }
      }, (err) => console.log('Home CMS sync skipped/offline fallback:', err));

      // About Page
      unsubscribeAbout = onSnapshot(doc(db, 'pages', 'about'), (docSnap) => {
        if (docSnap.exists()) {
          const d = docSnap.data() as any;
          const newAbout: AboutPageContent = { 
            ...DEFAULT_ABOUT_PAGE, 
            ...d,
            facilityImageUrl: d.facilityImageUrl || d.facilityImage || DEFAULT_ABOUT_PAGE.facilityImageUrl,
            heroImage: d.heroImage || DEFAULT_ABOUT_PAGE.heroImage,
            videoUrl: d.videoUrl || ''
          };
          setAboutContent(newAbout);
          setLocalItem('newark_cms_about', newAbout);
        }
      }, () => {});

      // Diagnostics Page
      unsubscribeDiagnostics = onSnapshot(doc(db, 'pages', 'diagnostics'), (docSnap) => {
        if (docSnap.exists()) {
          setDiagnosticsContent({ ...DEFAULT_DIAGNOSTICS_PAGE, ...(docSnap.data() as any) });
        }
      }, () => {});

      // Process Page
      unsubscribeProcess = onSnapshot(doc(db, 'pages', 'process'), (docSnap) => {
        if (docSnap.exists()) {
          setProcessContent({ ...DEFAULT_PROCESS_PAGE, ...(docSnap.data() as any) });
        }
      }, () => {});

      // Contact Page
      unsubscribeContact = onSnapshot(doc(db, 'pages', 'contact'), (docSnap) => {
        if (docSnap.exists()) {
          setContactContent({ ...DEFAULT_CONTACT_PAGE, ...(docSnap.data() as any) });
        }
      }, () => {});

      // Header Layout
      unsubscribeHeader = onSnapshot(doc(db, 'layout', 'header'), (docSnap) => {
        if (docSnap.exists()) {
          setHeaderContent({ ...DEFAULT_HEADER, ...(docSnap.data() as any) });
        }
      }, () => {});

      // Footer Layout
      unsubscribeFooter = onSnapshot(doc(db, 'layout', 'footer'), (docSnap) => {
        if (docSnap.exists()) {
          setFooterContent({ ...DEFAULT_FOOTER, ...(docSnap.data() as any) });
        }
      }, () => {});

      // Site Settings
      unsubscribeSettings = onSnapshot(doc(db, 'settings', 'site'), (docSnap) => {
        if (docSnap.exists()) {
          setSiteSettings({ ...DEFAULT_SITE_SETTINGS, ...(docSnap.data() as any) });
        }
      }, () => {});

      // Providers Collection
      unsubscribeProviders = onSnapshot(collection(db, 'providers'), (snapshot) => {
        if (!snapshot.empty) {
          const list: Provider[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...(d.data() as any) });
          });
          list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
          // Merge Firestore data onto DEFAULT_PROVIDERS so no fields go missing,
          // but let Firestore imageUrl always win over the static default.
          const merged = DEFAULT_PROVIDERS.map((def) => {
            const defKey = normalizeProviderKey(def.id || def.slug);
            const live = list.find((p) => normalizeProviderKey(p.id || p.slug) === defKey);
            if (!live) return def;
            const image = getProviderImage(live) || getProviderImage(def);
            return {
              ...def,
              ...live,
              id: def.id,
              slug: def.slug,
              image,
              imageUrl: image,
              photoUrl: image,
              phone: '(973) 412-9404',
            };
          });
          // Include any extra Firestore providers not in DEFAULT_PROVIDERS
          list.forEach((live) => {
            const liveKey = normalizeProviderKey(live.id || live.slug);
            if (!merged.find((m) => normalizeProviderKey(m.id || m.slug) === liveKey)) {
              const image = getProviderImage(live);
              merged.push({
                ...live,
                image,
                imageUrl: image,
                photoUrl: image
              });
            }
          });
          setProviders(merged);
          // Persist to localStorage with version stamp so next page load uses this data
          setLocalItem('newark_cms_providers_v3', merged);
          // Also clear the old unstamped key so stale data doesn't accumulate
          try { localStorage.removeItem('newark_cms_providers'); } catch (_) {}


        }
      }, () => {});


      // Services Collection
      unsubscribeServices = onSnapshot(collection(db, 'services'), (snapshot) => {
        if (!snapshot.empty) {
          const list: ServiceItem[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...(d.data() as any) });
          });
          list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
          setServices(list);
        }
      }, () => {});

      // Testimonials Collection
      unsubscribeTestimonials = onSnapshot(collection(db, 'testimonials'), (snapshot) => {
        if (!snapshot.empty) {
          const list: TestimonialItem[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...(d.data() as any) });
          });
          list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
          setTestimonials(list);
        }
      }, () => {});

      // Blogs Collection
      unsubscribeBlogs = onSnapshot(collection(db, 'blogs'), (snapshot) => {
        if (!snapshot.empty) {
          const firestoreList: BlogPost[] = [];
          snapshot.forEach((d) => {
            firestoreList.push({ id: d.id, ...(d.data() as any) });
          });
          // Merge: default blogs first, then override/add with any Firestore blogs
          // This ensures seeded default blogs always appear even when Firestore only has a subset
          const localBlogs = getLocalItem<BlogPost[]>('newark_cms_blogs', []);
          const merged = [...DEFAULT_BLOGS];
          [...firestoreList, ...localBlogs].forEach((fb) => {
            const existingIdx = merged.findIndex((b) => b.id === fb.id || b.slug === fb.slug);
            if (existingIdx >= 0) {
              merged[existingIdx] = { ...merged[existingIdx], ...fb };
            } else {
              merged.push(fb);
            }
          });
          merged.sort((a, b) => new Date(b.publishDate || (b as any).createdAt || 0).getTime() - new Date(a.publishDate || (a as any).createdAt || 0).getTime());
          setBlogs(merged);
        }
      }, () => {
        const localBlogs = getLocalItem<BlogPost[]>('newark_cms_blogs', []);
        if (localBlogs.length > 0) {
          setBlogs(prev => {
            const merged = [...prev];
            localBlogs.forEach((localBlog) => {
              const index = merged.findIndex(
                (blog) => blog.id === localBlog.id || blog.slug === localBlog.slug
              );
              if (index >= 0) merged[index] = { ...merged[index], ...localBlog };
              else merged.push(localBlog);
            });
            return merged;
          });
        }
      });

      // Blog Categories Collection
      unsubscribeCategories = onSnapshot(collection(db, 'blog_categories'), (snapshot) => {
        if (!snapshot.empty) {
          const list: BlogCategory[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...(d.data() as any) });
          });
          list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
          setBlogCategories(list);
        }
      }, () => {});

      // Blog Authors Collection
      unsubscribeAuthors = onSnapshot(collection(db, 'blog_authors'), (snapshot) => {
        if (!snapshot.empty) {
          const list: BlogAuthor[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...(d.data() as any) });
          });
          setBlogAuthors(list);
        }
      }, () => {});

      // Blog Tags Collection
      unsubscribeTags = onSnapshot(collection(db, 'blog_tags'), (snapshot) => {
        if (!snapshot.empty) {
          const list: BlogTag[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...(d.data() as any) });
          });
          list.sort((a, b) => a.name.localeCompare(b.name));
          setBlogTags(list);
        }
      }, () => {});

      // Page SEO Collection
      unsubscribePageSeo = onSnapshot(collection(db, 'page_seo'), (snapshot) => {
        if (!snapshot.empty) {
          const list: PageSeoItem[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...(d.data() as any) });
          });
          setPageSeoList(list);
        }
      }, () => {});

      // Centralized Site Media Collection
      unsubscribeSiteMedia = onSnapshot(collection(db, 'site_media'), (snapshot) => {
        if (!snapshot.empty) {
          const map: Record<string, SiteMediaItem> = {};
          snapshot.forEach((d) => {
            map[d.id] = { id: d.id, ...(d.data() as any) };
          });
          setSiteMedia(prev => {
            const merged = { ...prev, ...map };
            setLocalItem('newark_cms_site_media', merged);
            return merged;
          });
        }
      }, () => {});

    } catch (e) {
      console.warn('Firestore initial listener fallback active:', e);
    } finally {
      setLoading(false);
    }

    return () => {
      unsubscribeHome?.();
      unsubscribeAbout?.();
      unsubscribeDiagnostics?.();
      unsubscribeProcess?.();
      unsubscribeContact?.();
      unsubscribeHeader?.();
      unsubscribeFooter?.();
      unsubscribeSettings?.();
      unsubscribeProviders?.();
      unsubscribeDoctorProfile?.();
      unsubscribeServices?.();
      unsubscribeTestimonials?.();
      unsubscribeBlogs?.();
      unsubscribeCategories?.();
      unsubscribeAuthors?.();
      unsubscribeTags?.();
      unsubscribePageSeo?.();
      unsubscribeSiteMedia?.();
    };
  }, []);

  // Update handlers for Admin CMS
  const updateHomePageContent = async (data: Partial<HomePageContent>) => {
    const activeHeroImg = data.hero?.heroImage || data.hero?.heroImageUrl || homeContent.hero.heroImage;
    const heroMerged = data.hero ? {
      ...homeContent.hero,
      ...data.hero,
      heroImage: activeHeroImg,
      heroImageUrl: activeHeroImg,
      videoUrl: data.hero.videoUrl !== undefined ? data.hero.videoUrl : (homeContent.hero.videoUrl || ''),
      videoTitle: data.hero.videoTitle || homeContent.hero.videoTitle || 'Watch Clinic Tour & Doctor Introduction',
      videoMode: data.hero.videoMode || homeContent.hero.videoMode || 'modal',
    } : homeContent.hero;

    const updated: HomePageContent = {
      ...homeContent,
      ...data,
      hero: heroMerged,
      aboutPreview: data.aboutPreview ? {
        ...homeContent.aboutPreview,
        ...data.aboutPreview,
        imageUrl: data.aboutPreview.imageUrl || (data.aboutPreview as any).image || homeContent.aboutPreview.imageUrl,
      } : homeContent.aboutPreview,
      carePhilosophyImage: data.carePhilosophyImage || homeContent.carePhilosophyImage,
      fullWidthImage: data.fullWidthImage || homeContent.fullWidthImage,
    };

    setHomeContent(updated);
    setLocalItem('newark_cms_home', updated);
    window.dispatchEvent(new CustomEvent('newark_cms_update', { detail: { type: 'home', data: updated } }));

    try {
      const db = getDb();
      await setDoc(doc(db, 'pages', 'home'), { ...updated, updatedAt: serverTimestamp() }, { merge: true });
      await setDoc(doc(db, 'cms_content', 'home'), { ...updated, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {
      console.error('Failed to sync home content to Firestore:', e);
    }
  };

  const updateAboutPageContent = async (data: Partial<AboutPageContent>) => {
    const updated: AboutPageContent = {
      ...aboutContent,
      ...data,
      facilityImageUrl: data.facilityImageUrl || aboutContent.facilityImageUrl,
      heroImage: data.heroImage || aboutContent.heroImage,
      videoUrl: data.videoUrl !== undefined ? data.videoUrl : (aboutContent.videoUrl || ''),
    };
    setAboutContent(updated);
    setLocalItem('newark_cms_about', updated);
    window.dispatchEvent(new CustomEvent('newark_cms_update', { detail: { type: 'about', data: updated } }));

    try {
      const db = getDb();
      await setDoc(doc(db, 'pages', 'about'), { ...updated, updatedAt: serverTimestamp() }, { merge: true });
      await setDoc(doc(db, 'cms_content', 'about'), { ...updated, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {
      console.error('Failed to sync about content to Firestore:', e);
    }
  };

  const updateDiagnosticsPageContent = async (data: Partial<DiagnosticsPageContent>) => {
    const updated = { ...diagnosticsContent, ...data };
    setDiagnosticsContent(updated as DiagnosticsPageContent);
    setLocalItem('newark_cms_diagnostics', updated);
    try {
      const db = getDb();
      await setDoc(doc(db, 'pages', 'diagnostics'), { ...updated, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {}
  };

  const updateProcessPageContent = async (data: Partial<ProcessPageContent>) => {
    const updated = { ...processContent, ...data };
    setProcessContent(updated as ProcessPageContent);
    setLocalItem('newark_cms_process', updated);
    try {
      const db = getDb();
      await setDoc(doc(db, 'pages', 'process'), { ...updated, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {}
  };

  const updateContactPageContent = async (data: Partial<ContactPageContent>) => {
    const updated = { ...contactContent, ...data };
    setContactContent(updated as ContactPageContent);
    setLocalItem('newark_cms_contact', updated);
    try {
      const db = getDb();
      await setDoc(doc(db, 'pages', 'contact'), { ...updated, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {}
  };

  const updateHeaderContent = async (data: Partial<HeaderContent>) => {
    const updated = { ...headerContent, ...data };
    setHeaderContent(updated as HeaderContent);
    setLocalItem('newark_cms_header', updated);
    try {
      const db = getDb();
      await setDoc(doc(db, 'layout', 'header'), { ...updated, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {}
  };

  const updateFooterContent = async (data: Partial<FooterContent>) => {
    const updated = { ...footerContent, ...data };
    setFooterContent(updated as FooterContent);
    setLocalItem('newark_cms_footer', updated);
    try {
      const db = getDb();
      await setDoc(doc(db, 'layout', 'footer'), { ...updated, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {}
  };

  const updateSiteSettings = async (data: Partial<SiteSettings>) => {
    const updated = { ...siteSettings, ...data };
    setSiteSettings(updated as SiteSettings);
    setLocalItem('newark_cms_settings', updated);
    window.dispatchEvent(new CustomEvent('newark_cms_update', { detail: { type: 'settings', data: updated } }));
    try {
      const db = getDb();
      await setDoc(doc(db, 'settings', 'site'), { ...updated, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {}
  };

  // Blog CRUD Operations
  const createBlog = async (blogData: Partial<BlogPost>): Promise<BlogPost> => {
    const db = getDb();
    const id = blogData.id || `blog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newBlog: BlogPost = {
      id,
      title: blogData.title || 'Untitled Article',
      slug: blogData.slug || `article-${Date.now()}`,
      author: blogData.author || 'Dr. Prahlad Gadhvi',
      authorTitle: blogData.authorTitle || 'MD, FACP',
      authorAvatar: blogData.authorAvatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
      category: blogData.category || 'Preventive Care',
      categoryId: blogData.categoryId || 'cat-preventive-care',
      tags: blogData.tags || ['General Health'],
      excerpt: blogData.excerpt || '',
      featuredImage: blogData.featuredImage || blogData.coverImage || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200',
      featuredImageAlt: blogData.featuredImageAlt || blogData.coverImageAlt || blogData.title || 'Medical article banner',
      coverImage: blogData.coverImage || blogData.featuredImage,
      coverImageAlt: blogData.coverImageAlt || blogData.featuredImageAlt,
      coverImageCaption: blogData.coverImageCaption || '',
      coverImageCredit: blogData.coverImageCredit || '',
      content: blogData.content || '<p>Write your article content here...</p>',
      status: blogData.status || 'draft',
      publishDate: blogData.publishDate || new Date().toISOString().split('T')[0],
      scheduledDate: blogData.scheduledDate || '',
      modifiedDate: new Date().toISOString().split('T')[0],
      readTimeMinutes: blogData.readTimeMinutes || 4,
      medicallyReviewedBy: blogData.medicallyReviewedBy || blogData.reviewedByDoctor || '',
      reviewedByDoctor: blogData.reviewedByDoctor || blogData.medicallyReviewedBy || '',
      medicallyReviewedDate: blogData.medicallyReviewedDate || blogData.medicalReviewDate || '',
      medicalReviewDate: blogData.medicalReviewDate || blogData.medicallyReviewedDate || '',
      reviewerTitle: blogData.reviewerTitle || '',
      factCheckedBy: blogData.factCheckedBy || '',
      factCheckStatus: blogData.factCheckStatus || 'unverified',
      clinicalVerificationBoard: blogData.clinicalVerificationBoard || '',
      originalReporting: blogData.originalReporting !== undefined ? blogData.originalReporting : true,
      references: blogData.references || [],
      seoTitle: blogData.seoTitle || blogData.title || '',
      metaDescription: blogData.metaDescription || blogData.excerpt || '',
      canonicalUrl: blogData.canonicalUrl || `https://newarkmed.com/blog/${blogData.slug || id}`,
      indexRobots: blogData.indexRobots !== undefined ? blogData.indexRobots : true,
      noIndex: blogData.noIndex || false,
      schemaType: blogData.schemaType || 'MedicalScholarlyArticle',
      ogImage: blogData.ogImage || blogData.coverImage || blogData.featuredImage || '',
      isFeatured: blogData.isFeatured || false,
      ctaTitle: blogData.ctaTitle || 'Have questions about your health?',
      ctaDescription: blogData.ctaDescription || 'Our healthcare team is here to help you understand your symptoms, preventive care options, and next steps.',
      ctaButtonText: blogData.ctaButtonText || 'Book an Appointment',
      ctaButtonUrl: blogData.ctaButtonUrl || '/contact',
      ...blogData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    setBlogs((prev) => [newBlog, ...prev.filter((b) => b.id !== id)]);
    setLocalItem('newark_cms_blogs', [
      newBlog,
      ...getLocalItem<BlogPost[]>('newark_cms_blogs', []).filter((b) => b.id !== id)
    ]);
    window.dispatchEvent(new CustomEvent('newark_cms_update', {
      detail: { type: 'blogs', data: [newBlog, ...blogs.filter((b) => b.id !== id)] }
    }));
    try {
      await setDoc(doc(db, 'blogs', id), newBlog);
    } catch (e) {
      console.warn('Firestore blog write fallback active:', e);
    }
    return newBlog;
  };

  const updateBlog = async (id: string, blogData: Partial<BlogPost>) => {
    const db = getDb();
    const updated = {
      ...blogData,
      modifiedDate: new Date().toISOString().split('T')[0],
      updatedAt: serverTimestamp()
    };
    setBlogs((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
    const localBlogs = getLocalItem<BlogPost[]>('newark_cms_blogs', []);
    const currentBlog = blogs.find((b) => b.id === id);
    const localUpdatedBlog = { ...(currentBlog || { id }), ...updated } as BlogPost;
    setLocalItem('newark_cms_blogs', [
      localUpdatedBlog,
      ...localBlogs.filter((b) => b.id !== id)
    ]);
    window.dispatchEvent(new CustomEvent('newark_cms_update', {
      detail: {
        type: 'blogs',
        data: blogs.map((blog) => blog.id === id ? { ...blog, ...updated } : blog)
      }
    }));
    try {
      await setDoc(doc(db, 'blogs', id), updated, { merge: true });
    } catch (e) {
      console.warn('Firestore blog update error/fallback:', e);
    }
  };

  const deleteBlog = async (id: string) => {
    const db = getDb();
    setBlogs((prev) => prev.filter((b) => b.id !== id));
    setLocalItem(
      'newark_cms_blogs',
      getLocalItem<BlogPost[]>('newark_cms_blogs', []).filter((b) => b.id !== id)
    );
    window.dispatchEvent(new CustomEvent('newark_cms_update', {
      detail: { type: 'blogs', data: blogs.filter((b) => b.id !== id) }
    }));
    try {
      await deleteDoc(doc(db, 'blogs', id));
    } catch (e) {
      console.warn('Firestore blog delete fallback:', e);
    }
  };

  const archiveBlog = async (id: string) => {
    await updateBlog(id, { status: 'archived' });
  };

  const checkSlugUnique = (slug: string, excludeBlogId?: string): boolean => {
    const cleanSlug = slug.toLowerCase().trim();
    return !blogs.some((b) => b.slug.toLowerCase().trim() === cleanSlug && b.id !== excludeBlogId);
  };

  const incrementBlogViews = async (id: string) => {
    const target = blogs.find((b) => b.id === id);
    if (!target) return;
    const newViews = (target.views || 0) + 1;
    setBlogs((prev) => prev.map((b) => (b.id === id ? { ...b, views: newViews } : b)));
    try {
      const db = getDb();
      await setDoc(doc(db, 'blogs', id), { views: newViews }, { merge: true });
    } catch {
      // Non-blocking counter update
    }
  };

  const duplicateBlog = async (id: string): Promise<BlogPost> => {
    const target = blogs.find((b) => b.id === id);
    if (!target) throw new Error('Blog not found to duplicate');
    const newId = `blog-${Date.now()}`;
    const duplicated: Partial<BlogPost> = {
      ...target,
      id: newId,
      title: `${target.title} (Copy)`,
      slug: `${target.slug}-copy-${Date.now().toString().slice(-4)}`,
      status: 'draft',
      views: 0,
      publishDate: new Date().toISOString().split('T')[0]
    };
    return await createBlog(duplicated);
  };

  // Blog Category CRUD Operations
  const createCategory = async (catData: Partial<BlogCategory>): Promise<BlogCategory> => {
    const db = getDb();
    const id = catData.id || `cat-${Date.now()}`;
    const newCat: BlogCategory = {
      id,
      name: catData.name || 'New Category',
      slug: catData.slug || `cat-${Date.now()}`,
      description: catData.description || '',
      seoTitle: catData.seoTitle || '',
      metaDescription: catData.metaDescription || '',
      displayOrder: catData.displayOrder || (blogCategories.length + 1),
      articleCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    setBlogCategories((prev) => [...prev, newCat]);
    try {
      await setDoc(doc(db, 'blog_categories', id), newCat);
    } catch (e) {
      console.warn('Category write error/fallback:', e);
    }
    return newCat;
  };

  const updateCategory = async (id: string, catData: Partial<BlogCategory>) => {
    const db = getDb();
    const updated = { ...catData, updatedAt: serverTimestamp() };
    setBlogCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    try {
      await setDoc(doc(db, 'blog_categories', id), updated, { merge: true });
    } catch (e) {
      console.warn('Category update error/fallback:', e);
    }
  };

  const deleteCategory = async (id: string) => {
    const db = getDb();
    setBlogCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteDoc(doc(db, 'blog_categories', id));
    } catch (e) {
      console.warn('Category delete fallback:', e);
    }
  };

  const reorderCategories = async (orderedIds: string[]) => {
    const db = getDb();
    const updated = blogCategories.map((c) => {
      const idx = orderedIds.indexOf(c.id);
      return idx !== -1 ? { ...c, displayOrder: idx + 1 } : c;
    });
    setBlogCategories(updated.sort((a, b) => a.displayOrder - b.displayOrder));
    try {
      for (const cat of updated) {
        await setDoc(doc(db, 'blog_categories', cat.id), { displayOrder: cat.displayOrder }, { merge: true });
      }
    } catch (e) {
      console.warn('Reorder categories fallback:', e);
    }
  };

  // Blog Authors Operations
  const createAuthor = async (authorData: Partial<BlogAuthor>): Promise<BlogAuthor> => {
    const db = getDb();
    const id = authorData.id || `author-${Date.now()}`;
    const newAuthor: BlogAuthor = {
      id,
      name: authorData.name || 'New Author',
      profilePhoto: authorData.profilePhoto || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
      designation: authorData.designation || 'Medical Contributor',
      qualification: authorData.qualification || 'MD',
      bio: authorData.bio || '',
      profileUrl: authorData.profileUrl || '',
      authorType: authorData.authorType || 'Doctor',
      isActive: authorData.isActive !== undefined ? authorData.isActive : true,
      socialLinks: authorData.socialLinks || {},
      articleCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    setBlogAuthors((prev) => [...prev, newAuthor]);
    try {
      await setDoc(doc(db, 'blog_authors', id), newAuthor);
    } catch (e) {
      console.warn('Author write error/fallback:', e);
    }
    return newAuthor;
  };

  const updateAuthor = async (id: string, authorData: Partial<BlogAuthor>) => {
    const db = getDb();
    const updated = { ...authorData, updatedAt: serverTimestamp() };
    setBlogAuthors((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
    try {
      await setDoc(doc(db, 'blog_authors', id), updated, { merge: true });
    } catch (e) {
      console.warn('Author update error/fallback:', e);
    }
  };

  const deleteAuthor = async (id: string) => {
    const db = getDb();
    setBlogAuthors((prev) => prev.filter((a) => a.id !== id));
    try {
      await deleteDoc(doc(db, 'blog_authors', id));
    } catch (e) {
      console.warn('Author delete fallback:', e);
    }
  };

  // Blog Tags Operations
  const createTag = async (tagData: Partial<BlogTag>): Promise<BlogTag> => {
    const db = getDb();
    const id = tagData.id || `tag-${Date.now()}`;
    const newTag: BlogTag = {
      id,
      name: tagData.name || 'New Tag',
      slug: (tagData.slug || tagData.name || 'tag').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: tagData.description || '',
      articleCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    setBlogTags((prev) => [...prev, newTag]);
    try {
      await setDoc(doc(db, 'blog_tags', id), newTag);
    } catch (e) {
      console.warn('Tag write error/fallback:', e);
    }
    return newTag;
  };

  const updateTag = async (id: string, tagData: Partial<BlogTag>) => {
    const db = getDb();
    const updated = { ...tagData, updatedAt: serverTimestamp() };
    setBlogTags((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    try {
      await setDoc(doc(db, 'blog_tags', id), updated, { merge: true });
    } catch (e) {
      console.warn('Tag update error/fallback:', e);
    }
  };

  const deleteTag = async (id: string) => {
    const db = getDb();
    setBlogTags((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteDoc(doc(db, 'blog_tags', id));
    } catch (e) {
      console.warn('Tag delete fallback:', e);
    }
  };

  // Page SEO Operations
  const updatePageSeo = async (pageKey: string, data: Partial<PageSeoItem>) => {
    const db = getDb();
    const existing = pageSeoList.find((p) => p.pageKey === pageKey) || {
      id: `page-${pageKey}`,
      pageKey,
      pageName: pageKey,
      path: `/${pageKey === 'home' ? '' : pageKey}`,
      title: '',
      metaDescription: '',
      indexRobots: true
    };
    const updated: PageSeoItem = {
      ...existing,
      ...data,
      updatedAt: serverTimestamp()
    };
    setPageSeoList((prev) => {
      const filtered = prev.filter((p) => p.pageKey !== pageKey);
      return [...filtered, updated];
    });
    try {
      await setDoc(doc(db, 'page_seo', existing.id || `page-${pageKey}`), updated, { merge: true });
    } catch (e) {
      console.warn('Page SEO update fallback:', e);
    }
  };

  // Centralized Site Media Management
  const getSiteMedia = (pageKey: string, sectionKey?: string, imageKey?: string): SiteMediaItem | undefined => {
    if (!sectionKey && !imageKey) {
      return siteMedia[pageKey] || DEFAULT_SITE_MEDIA[pageKey];
    }
    const id = `${pageKey}-${sectionKey}-${imageKey}`;
    if (siteMedia[id]) return siteMedia[id];
    if (DEFAULT_SITE_MEDIA[id]) return DEFAULT_SITE_MEDIA[id];
    
    // Find by keys
    const found = (Object.values(siteMedia) as SiteMediaItem[]).find(m => 
      m.pageKey === pageKey && 
      (!sectionKey || m.sectionKey === sectionKey) && 
      (!imageKey || m.imageKey === imageKey || m.id === imageKey)
    );
    if (found) return found;

    return (Object.values(DEFAULT_SITE_MEDIA) as SiteMediaItem[]).find(m => 
      m.pageKey === pageKey && 
      (!sectionKey || m.sectionKey === sectionKey) && 
      (!imageKey || m.imageKey === imageKey || m.id === imageKey)
    );
  };

  const getMediaUrl = (pageKey: string, sectionKey?: string, imageKey?: string, fallbackUrl?: string): string => {
    const item = getSiteMedia(pageKey, sectionKey, imageKey);
    if (item && item.url && item.url.trim() !== '') {
      return item.url;
    }
    if (fallbackUrl && fallbackUrl.trim() !== '') {
      return fallbackUrl;
    }
    if (item && item.defaultUrl && item.defaultUrl.trim() !== '') {
      return item.defaultUrl;
    }
    return fallbackUrl || '';
  };

  const updateService = async (id: string, serviceData: Partial<ServiceItem>) => {
    const updated = { ...serviceData, updatedAt: serverTimestamp() };
    setServices(prev => prev.map(s => (s.id === id || s.slug === id ? { ...s, ...updated } : s)));
    try {
      const db = getDb();
      await setDoc(doc(db, 'services', id), updated, { merge: true });
    } catch (e) {
      console.warn('Service update error/fallback:', e);
    }
  };

  const updateProvider = async (id: string, providerData: Partial<Provider>) => {
    const rawImg = providerData.image || providerData.imageUrl || providerData.photoUrl;
    const normalizedData: Partial<Provider> = {
      ...providerData,
      ...(rawImg ? { image: rawImg, imageUrl: rawImg, photoUrl: rawImg } : {}),
      updatedAt: serverTimestamp()
    };
    const targetKey = normalizeProviderKey(id);

    setProviders(prev => {
      const newProviders = prev.map(p => (
        normalizeProviderKey(p.id || p.slug) === targetKey 
          ? { ...p, ...normalizedData } 
          : p
      ));
      // Write to versioned key so boot-time reader picks it up
      setLocalItem('newark_cms_providers_v3', newProviders);
      return newProviders;
    });

    try {
      const db = getDb();
      await setDoc(doc(db, 'providers', id), normalizedData, { merge: true });
    } catch (e) {
      console.warn('Provider update error/fallback:', e);
    }
  };


  const updateSiteMediaItem = async (id: string, updates: Partial<SiteMediaItem>) => {
    const existing = siteMedia[id] || DEFAULT_SITE_MEDIA[id] || {
      id,
      pageKey: 'homepage',
      sectionKey: 'media',
      imageKey: id,
      label: id,
      url: '',
      altText: '',
      defaultUrl: '',
      defaultAlt: ''
    };

    const updated: SiteMediaItem = {
      ...existing,
      ...updates,
      updatedAt: serverTimestamp()
    };

    try {
      const db = getDb();
      await setDoc(doc(db, 'site_media', id), updated, { merge: true });
    } catch (e) {
      console.warn('Site media Firestore write failed; using local CMS cache:', e);
    }

    // Keep legacy page/provider records in sync when Firestore is available.
    // Local state is still committed below so localhost remains usable when
    // the connected Firebase project has restrictive rules.
    if (updates.url) {
      try {
        const db = getDb();
        if (id === 'home-hero-main') {
          await setDoc(doc(db, 'pages', 'home'), { 
            hero: { heroImage: updates.url, heroImageUrl: updates.url, alt: updates.altText || '' } 
          }, { merge: true });
        } else if (id === 'home-about-preview') {
          await setDoc(doc(db, 'pages', 'home'), { 
            aboutPreview: { imageUrl: updates.url } 
          }, { merge: true });
        } else if (id === 'home-philosophy-portrait') {
          await setDoc(doc(db, 'pages', 'home'), { 
            carePhilosophyImage: updates.url 
          }, { merge: true });
        } else if (id === 'home-fullwidth-banner') {
          await setDoc(doc(db, 'pages', 'home'), { 
            fullWidthImage: updates.url 
          }, { merge: true });
        } else if (id === 'about-facility-main') {
          await setDoc(doc(db, 'pages', 'about'), { 
            facilityImageUrl: updates.url,
            heroImage: updates.url 
          }, { merge: true });
        } else if (id === 'contact-clinic-exterior') {
          await setDoc(doc(db, 'pages', 'contact'), {
            heroImage: updates.url
          }, { merge: true });
        } else if (id === 'providers-dr-prahlad') {
          await updateProvider('dr-prahlad-gadhvi', { image: updates.url, imageUrl: updates.url, photoUrl: updates.url });
        } else if (id === 'providers-dr-deval') {
          await updateProvider('dr-deval-gadhvi', { image: updates.url, imageUrl: updates.url, photoUrl: updates.url });
        } else if (id === 'providers-dr-sankalp') {
          await updateProvider('dr-sankalp-pathak', { image: updates.url, imageUrl: updates.url, photoUrl: updates.url });
        } else if (id.startsWith('services-')) {
          const slug = id.replace('services-', '');
          const matched = services.find(s => s.id === slug || s.slug === slug);
          if (matched) {
            await updateService(matched.id, { imageUrl: updates.url });
          }
        }
      } catch (e) {
        console.warn('Legacy site media sync failed; keeping the centralized local value:', e);
      }
    }

    const newMap = { ...siteMedia, [id]: updated };
    setSiteMedia(newMap);
    setLocalItem('newark_cms_site_media', newMap);

    // Cross-tab notification after the database write succeeds.
    window.dispatchEvent(new CustomEvent('newark_cms_update', { 
      detail: { type: 'site_media', data: { [id]: updated } } 
    }));
  };

  const resetSiteMediaItem = async (id: string) => {
    const defaultItem = DEFAULT_SITE_MEDIA[id];
    if (!defaultItem) return;
    await updateSiteMediaItem(id, {
      url: defaultItem.defaultUrl,
      altText: defaultItem.defaultAlt,
      objectFit: defaultItem.objectFit || 'cover',
      position: defaultItem.position || 'center'
    });
  };

  const bulkUpdateSiteMedia = async (items: Partial<SiteMediaItem>[]) => {
    for (const item of items) {
      if (item.id) {
        await updateSiteMediaItem(item.id, item);
      }
    }
  };

  const refreshData = async () => {
    try {
      const db = getDb();
      const pSnap = await getDocs(collection(db, 'providers'));
      if (!pSnap.empty) {
        const list: Provider[] = [];
        pSnap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
        list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
        setProviders(list);
      }
      const sSnap = await getDocs(collection(db, 'services'));
      if (!sSnap.empty) {
        const list: ServiceItem[] = [];
        sSnap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
        list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
        setServices(list);
      }
      const bSnap = await getDocs(collection(db, 'blogs'));
      if (!bSnap.empty) {
        const list: BlogPost[] = [];
        bSnap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
        list.sort((a, b) => new Date(b.publishDate || 0).getTime() - new Date(a.publishDate || 0).getTime());
        setBlogs(list);
      }
    } catch (e) {
      console.log('Manual refresh caught:', e);
    }
  };

  const trackPageView = async (pagePath: string) => {
    try {
      const db = getDb();
      await addDoc(collection(db, 'page_views'), {
        path: pagePath,
        userAgent: navigator.userAgent.slice(0, 200),
        timestamp: serverTimestamp(),
        dateStr: new Date().toISOString().split('T')[0]
      });
    } catch {
      // Analytics non-blocking fail-safe
    }
  };

  return (
    <CmsContext.Provider
      value={{
        homeContent,
        aboutContent,
        diagnosticsContent,
        processContent,
        contactContent,
        headerContent,
        footerContent,
        siteSettings,
        providers,
        services,
        testimonials,
        blogs,
        blogCategories,
        blogAuthors,
        blogTags,
        pageSeoList,
        siteMedia,
        loading,
        getSiteMedia,
        getMediaUrl,
        updateSiteMediaItem,
        resetSiteMediaItem,
        bulkUpdateSiteMedia,
        updateService,
        updateProvider,
        updateHomePageContent,
        updateAboutPageContent,
        updateDiagnosticsPageContent,
        updateProcessPageContent,
        updateContactPageContent,
        updateHeaderContent,
        updateFooterContent,
        updateSiteSettings,
        createBlog,
        updateBlog,
        deleteBlog,
        archiveBlog,
        duplicateBlog,
        checkSlugUnique,
        incrementBlogViews,
        createCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,
        createAuthor,
        updateAuthor,
        deleteAuthor,
        createTag,
        updateTag,
        deleteTag,
        updatePageSeo,
        refreshData,
        trackPageView
      }}
    >
      {children}
    </CmsContext.Provider>
  );
}

export function useCmsData() {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCmsData must be used within a CmsProvider');
  }
  return context;
}
