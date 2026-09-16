/**
 * Centralized Provider Image & Identity Mapping Utility
 *
 * Rules:
 * 1. Admin Panel saved image ALWAYS takes precedence.
 * 2. Fallbacks are strictly keyed by provider ID / slug — NEVER by index or other provider.
 * 3. Cache-busting parameter (?v=timestamp) is appended if updatedAt exists.
 */

export const DEFAULT_PROVIDER_IMAGES: Record<string, string> = {
  'prahlad-gadhavi': 'https://framerusercontent.com/images/aU1QUlSKO9mpYg2rCyxW7d2q0.png?width=898&height=1194',
  'deval-gadhvi': '/newark_internal_medicine_4.webp',
  'sankalp-pathak': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800',
};

export const GENERIC_DOCTOR_PLACEHOLDER = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800';

/**
 * Normalizes any provider id, slug, or name to canonical provider keys:
 * - 'prahlad-gadhavi'
 * - 'deval-gadhvi'
 * - 'sankalp-pathak'
 */
export function normalizeProviderKey(idOrSlugOrName: string = ''): string {
  const clean = (idOrSlugOrName || '').toLowerCase().trim();
  if (clean.includes('prahlad')) return 'prahlad-gadhavi';
  if (clean.includes('deval')) return 'deval-gadhvi';
  if (clean.includes('sankalp')) return 'sankalp-pathak';
  return clean.replace(/^dr-/, '').replace(/^dr\.\s*/, '');
}

/**
 * Resolves the canonical image URL for a provider following strict priority:
 * 1. Admin Panel / Database saved image (provider.image, imageUrl, or photoUrl)
 * 2. Correct provider-specific default image (keyed strictly by slug / id)
 * 3. Generic neutral doctor placeholder
 */
export function getProviderImage(provider: any): string {
  if (!provider) return GENERIC_DOCTOR_PLACEHOLDER;

  // Direct string passed
  if (typeof provider === 'string' && provider.trim() !== '') {
    const trimmed = provider.trim();
    // If a name like "Dr. Deval Gadhvi" or "deval-gadhvi" is passed directly
    if (!trimmed.startsWith('http') && !trimmed.startsWith('/') && !trimmed.startsWith('data:')) {
      const key = normalizeProviderKey(trimmed);
      if (DEFAULT_PROVIDER_IMAGES[key]) {
        return DEFAULT_PROVIDER_IMAGES[key];
      }
    }
    // Check if it's an old generic unsplash placeholder for a known doctor
    const key = normalizeProviderKey(trimmed);
    if (DEFAULT_PROVIDER_IMAGES[key] && (trimmed.includes('photo-1622253692010') || trimmed.includes('photo-1594824813581') || trimmed.includes('photo-1594824813627'))) {
      return DEFAULT_PROVIDER_IMAGES[key];
    }
    return trimmed;
  }

  // 1. Admin Panel / database saved image
  const rawImage = provider.image || provider.imageUrl || provider.photoUrl || provider.photo || provider.avatar || provider.profilePhoto;
  if (rawImage && typeof rawImage === 'string' && rawImage.trim() !== '') {
    const rawTrimmed = rawImage.trim();
    // If it's an outdated generic unsplash placeholder for a known doctor, prioritize the real portrait
    const key = normalizeProviderKey(provider.id || provider.slug || provider.name || '');
    if (DEFAULT_PROVIDER_IMAGES[key] && (rawTrimmed.includes('photo-1622253692010') || rawTrimmed.includes('photo-1594824813581') || rawTrimmed.includes('photo-1594824813627'))) {
      return DEFAULT_PROVIDER_IMAGES[key];
    }
    return rawTrimmed;
  }

  // 2. Correct provider-specific default image
  const key = normalizeProviderKey(provider.id || provider.slug || provider.name || '');
  if (DEFAULT_PROVIDER_IMAGES[key]) {
    return DEFAULT_PROVIDER_IMAGES[key];
  }

  // 3. Generic neutral doctor placeholder
  return GENERIC_DOCTOR_PLACEHOLDER;
}

/**
 * Dynamically resolves the avatar photo for any blog author or medical reviewer.
 * Priority:
 * 1. Matching Provider in the database (if author is a clinic doctor like Dr. Deval Gadhvi, Dr. Prahlad Gadhavi, etc.)
 * 2. Saved custom author profile photo (if not an outdated generic placeholder)
 * 3. Canonical default clinic photo for the specific doctor
 * 4. Generic doctor placeholder
 */
export function getAuthorAvatar(author: any, providers?: any[], authors?: any[]): string {
  if (!author) return GENERIC_DOCTOR_PLACEHOLDER;

  const authorName = typeof author === 'string' ? author : (author.name || author.author || '');
  const rawAvatar = typeof author === 'object' && author !== null ? (author.authorAvatar || author.profilePhoto || author.avatar || author.image || author.photoUrl) : null;
  const canonicalKey = normalizeProviderKey(authorName || (typeof author === 'object' ? author.id || author.authorId : ''));

  // 1. Check if there is a matching author profile in authors list with a custom photo
  if (Array.isArray(authors) && authors.length > 0 && (authorName || (typeof author === 'object' && author.authorId))) {
    const authorId = typeof author === 'object' ? author.authorId || author.id : null;
    const matchedAuthor = authors.find(a => (authorId && a.id === authorId) || (authorName && a.name?.toLowerCase().trim() === authorName.toLowerCase().trim()));
    if (matchedAuthor && matchedAuthor.profilePhoto && typeof matchedAuthor.profilePhoto === 'string' && matchedAuthor.profilePhoto.trim() !== '') {
      const authImg = matchedAuthor.profilePhoto.trim();
      // If the author has a custom photo that isn't the generic placeholder, use it!
      if (!authImg.includes('photo-1622253692010') && !authImg.includes('photo-1594824813581') && !authImg.includes('photo-1594824813627')) {
        // Only return if it's not the default provider image either, OR if we want to allow it anyway
        return authImg;
      }
    }
  }

  // 2. Check if there is an active matching Provider in the CMS/Firestore providers list
  if (Array.isArray(providers) && providers.length > 0 && canonicalKey) {
    const matchedProvider = providers.find(p => {
      const pKey = normalizeProviderKey(p.id || p.slug || p.name || '');
      return pKey === canonicalKey;
    });
    if (matchedProvider) {
      const pImg = matchedProvider.image || matchedProvider.imageUrl || matchedProvider.photoUrl;
      if (pImg && typeof pImg === 'string' && pImg.trim() !== '') {
        const trimmed = pImg.trim();
        // If not an outdated generic unsplash placeholder
        if (!trimmed.includes('photo-1622253692010')) {
          return trimmed;
        }
      }
    }
  }

  // 3. If rawAvatar was provided and is a valid customized URL
  if (rawAvatar && typeof rawAvatar === 'string' && rawAvatar.trim() !== '') {
    const trimmed = rawAvatar.trim();
    if (!trimmed.includes('photo-1622253692010') && !trimmed.includes('photo-1594824813581') && !trimmed.includes('photo-1594824813627')) {
      return trimmed;
    }
  }

  // 4. Canonical provider default image strictly keyed by doctor name
  if (DEFAULT_PROVIDER_IMAGES[canonicalKey]) {
    return DEFAULT_PROVIDER_IMAGES[canonicalKey];
  }

  return GENERIC_DOCTOR_PLACEHOLDER;
}

/**
 * Resolves image source with cache busting token from updatedAt if available
 */
export function getProviderImageSrc(provider: any): string {
  const baseImage = getProviderImage(provider);
  if (!baseImage) return GENERIC_DOCTOR_PLACEHOLDER;
  
  // Data URIs do not need cache-busting
  if (baseImage.startsWith('data:')) return baseImage;

  const updatedAt = typeof provider === 'object' && provider !== null ? provider.updatedAt : null;
  if (!updatedAt) return baseImage;

  let timeVal: string | number | null = null;
  if (typeof updatedAt === 'number') {
    timeVal = updatedAt;
  } else if (typeof updatedAt === 'string') {
    const parsed = new Date(updatedAt).getTime();
    timeVal = isNaN(parsed) ? updatedAt : parsed;
  } else if (typeof updatedAt?.toMillis === 'function') {
    timeVal = updatedAt.toMillis();
  } else if (updatedAt?.seconds) {
    timeVal = updatedAt.seconds * 1000;
  }

  if (timeVal) {
    const separator = baseImage.includes('?') ? '&' : '?';
    return `${baseImage}${separator}v=${timeVal}`;
  }

  return baseImage;
}
