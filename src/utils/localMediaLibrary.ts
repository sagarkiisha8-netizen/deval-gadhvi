import { MediaItem } from '../types';

const LOCAL_MEDIA_KEY = 'newark_cms_media_library';

export function getLocalMediaItems(): MediaItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_MEDIA_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setLocalMediaItems(items: MediaItem[]) {
  try {
    localStorage.setItem(LOCAL_MEDIA_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('newark_cms_update', {
      detail: { type: 'media_library', data: items }
    }));
  } catch {
    // Local media cache is a convenience fallback; ignore storage failures.
  }
}

export function saveLocalMediaItem(item: MediaItem): MediaItem {
  const existing = getLocalMediaItems();
  const next = [
    item,
    ...existing.filter((media) => media.id !== item.id && media.url !== item.url)
  ];
  setLocalMediaItems(next);
  return item;
}

export function removeLocalMediaItem(id: string) {
  setLocalMediaItems(getLocalMediaItems().filter((item) => item.id !== id));
}

export function mergeMediaItems(...groups: MediaItem[][]): MediaItem[] {
  const byKey = new Map<string, MediaItem>();

  for (const group of groups) {
    for (const item of group) {
      if (!item?.url) continue;
      byKey.set(item.id || item.url, item);
    }
  }

  return Array.from(byKey.values()).sort(
    (a, b) => getCreatedAtTime(b.createdAt) - getCreatedAtTime(a.createdAt)
  );
}

export function getCreatedAtTime(value: any): number {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Date.parse(value) || 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.seconds === 'number') return value.seconds * 1000;
  return 0;
}
