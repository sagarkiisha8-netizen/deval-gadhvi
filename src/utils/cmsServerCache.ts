import { HomePageContent, AboutPageContent, Provider, ServiceItem, SiteMediaItem } from '../types';

export interface CmsServerCache {
  siteMedia?: Record<string, SiteMediaItem>;
  providers?: Provider[];
  services?: ServiceItem[];
  homeContent?: HomePageContent;
  aboutContent?: AboutPageContent;
}

export async function readCmsServerCache(): Promise<CmsServerCache | null> {
  try {
    const res = await fetch('/api/cms-cache', { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function writeCmsServerCacheSection<K extends keyof CmsServerCache>(
  section: K,
  data: CmsServerCache[K]
): Promise<void> {
  try {
    await fetch(`/api/cms-cache/${section}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });
  } catch (err) {
    console.warn('Shared CMS cache write skipped:', err);
  }
}
