/**
 * Centralized Provider Image & Identity Mapping Utility
 *
 * Rules:
 * 1. Admin Panel saved image ALWAYS takes precedence.
 * 2. Fallbacks are strictly keyed by provider ID / slug — NEVER by index or other provider.
 * 3. Cross-doctor photo contamination is strictly prevented (e.g. Dr. Deval's photo never assigned to Dr. Prahlad).
 * 4. Cache-busting parameter (?v=timestamp) is appended if updatedAt exists.
 */

export const DEFAULT_PROVIDER_IMAGES: Record<string, string> = {
  'prahlad-gadhavi': '/uploads/providers/prahlad-gadhavi-1789541233283.webp',
  'prahlad-gadhvi': '/uploads/providers/prahlad-gadhavi-1789541233283.webp',
  'deval-gadhvi': 'https://framerusercontent.com/images/aU1QUlSKO9mpYg2rCyxW7d2q0.png?width=898&height=1194',
  'deval-gadhavi': 'https://framerusercontent.com/images/aU1QUlSKO9mpYg2rCyxW7d2q0.png?width=898&height=1194',
  'sankalp-pathak': '/uploads/site-media/providers-dr-sankalp.png',
};

export const GENERIC_DOCTOR_PLACEHOLDER = '/uploads/site-media/providers-dr-sankalp.png';

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
 * 1. Homepage override if requesting for homepage (provider.homepageImageOverride)
 * 2. Admin Panel / Database saved image (provider.profileImage, imageUrl, photoUrl, etc.)
 * 3. Correct provider-specific default authentic image (keyed strictly by slug / id)
 * 4. Generic neutral doctor placeholder
 */
export function getProviderImage(provider: any, options?: { forHomepage?: boolean }): string {
  if (!provider) return GENERIC_DOCTOR_PLACEHOLDER;

  // Direct string passed
  if (typeof provider === 'string' && provider.trim() !== '') {
    const trimmed = provider.trim();
    const key = normalizeProviderKey(trimmed);

    // If a doctor name or slug was passed directly
    if (!trimmed.startsWith('http') && !trimmed.startsWith('/') && !trimmed.startsWith('data:')) {
      if (DEFAULT_PROVIDER_IMAGES[key]) {
        return DEFAULT_PROVIDER_IMAGES[key];
      }
    }

    // Check if it's the reversed female framer photo incorrectly passed for Dr. Prahlad
    if ((key === 'prahlad-gadhavi' || key === 'prahlad-gadhvi') && trimmed.includes('aU1QUlSKO9mpYg2rCyxW7d2q0')) {
      return DEFAULT_PROVIDER_IMAGES['prahlad-gadhavi'];
    }

    // Check if it's an outdated generic unsplash placeholder for a known doctor
    if (DEFAULT_PROVIDER_IMAGES[key] && (
      trimmed.includes('photo-1622253692010') || 
      trimmed.includes('photo-1594824813581') || 
      trimmed.includes('photo-1594824813627') ||
      trimmed.includes('photo-1559839734')
    )) {
      return DEFAULT_PROVIDER_IMAGES[key];
    }
    return trimmed;
  }

  const key = normalizeProviderKey(provider.id || provider.slug || provider.name || '');

  // 1. Homepage override if requested for homepage
  if (options?.forHomepage && provider.homepageImageOverride && typeof provider.homepageImageOverride === 'string' && provider.homepageImageOverride.trim() !== '') {
    return provider.homepageImageOverride.trim();
  }

  // 2. Admin Panel / database saved image (profileImage || imageUrl || photoUrl || image)
  const rawImage = provider.profileImage || provider.imageUrl || provider.photoUrl || provider.image || provider.photo || provider.avatar || provider.profilePhoto;
  
  if (rawImage && typeof rawImage === 'string' && rawImage.trim() !== '') {
    const rawTrimmed = rawImage.trim();

    // Prevent cross-contamination: Dr. Prahlad must NEVER have Dr. Deval's female Framer photo
    if ((key === 'prahlad-gadhavi' || key === 'prahlad-gadhvi') && rawTrimmed.includes('aU1QUlSKO9mpYg2rCyxW7d2q0')) {
      return DEFAULT_PROVIDER_IMAGES['prahlad-gadhavi'];
    }

    // Outdated stock photos for Dr. Deval or Dr. Prahlad replaced by their authentic portraits
    if (DEFAULT_PROVIDER_IMAGES[key] && (
      rawTrimmed.includes('photo-1622253692010') || 
      rawTrimmed.includes('photo-1594824813581') || 
      rawTrimmed.includes('photo-1594824813627') ||
      rawTrimmed.includes('photo-1559839734')
    )) {
      return DEFAULT_PROVIDER_IMAGES[key];
    }

    return rawTrimmed;
  }

  // 3. Correct provider-specific default authentic image
  if (DEFAULT_PROVIDER_IMAGES[key]) {
    return DEFAULT_PROVIDER_IMAGES[key];
  }

  // 4. Generic neutral doctor placeholder
  return GENERIC_DOCTOR_PLACEHOLDER;
}

/**
 * Dynamically resolves the avatar photo for any blog author or medical reviewer.
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
      if (!authImg.includes('photo-1622253692010') && !authImg.includes('photo-1594824813581') && !authImg.includes('photo-1594824813627') && !authImg.includes('photo-1559839734')) {
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
      const pImg = getProviderImage(matchedProvider);
      if (pImg) return pImg;
    }
  }

  // 3. If rawAvatar was provided and is a valid customized URL
  if (rawAvatar && typeof rawAvatar === 'string' && rawAvatar.trim() !== '') {
    const trimmed = rawAvatar.trim();
    if (!trimmed.includes('photo-1622253692010') && !trimmed.includes('photo-1594824813581') && !trimmed.includes('photo-1594824813627') && !trimmed.includes('photo-1559839734')) {
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
export function getProviderImageSrc(provider: any, options?: { forHomepage?: boolean }): string {
  const baseImage = getProviderImage(provider, options);
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
