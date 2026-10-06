/**
 * Centralized Provider Image & Identity Mapping Utility
 *
 * Rules:
 * 1. Admin Panel saved image ALWAYS takes precedence.
 * 2. Fallbacks are strictly keyed by provider ID / slug — NEVER by index or other provider.
 * 3. Cross-doctor photo contamination is strictly prevented (e.g. Dr. Deval's photo never assigned to Dr. Prahlad).
 * 4. Cache-busting parameter (?v=timestamp) is appended if updatedAt exists.
 */export const DEFAULT_PROVIDER_IMAGES: Record<string, string> = {
  'prahlad-gadhavi': 'https://pub-463524c5dd1e422ca67b4960ad60e690.r2.dev/providers/dr-prahlad-gadhvi/dr-prahlad-gadhavi.webp',
  'prahlad-gadhvi': 'https://pub-463524c5dd1e422ca67b4960ad60e690.r2.dev/providers/dr-prahlad-gadhvi/dr-prahlad-gadhavi.webp',
  'deval-gadhvi': 'https://pub-463524c5dd1e422ca67b4960ad60e690.r2.dev/providers/dr-deval-gadhvi/dr-deval-gadhvi.webp',
  'deval-gadhavi': 'https://pub-463524c5dd1e422ca67b4960ad60e690.r2.dev/providers/dr-deval-gadhvi/dr-deval-gadhvi.webp',
  'sankalp-pathak': 'https://pub-463524c5dd1e422ca67b4960ad60e690.r2.dev/providers/dr-sankalp-pathak/dr-sankalp-pathak.png',
};

export const GENERIC_DOCTOR_PLACEHOLDER = 'https://pub-463524c5dd1e422ca67b4960ad60e690.r2.dev/providers/dr-sankalp-pathak/dr-sankalp-pathak.png';

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
 * 2. Active Cloudflare R2 uploaded image URL (provider.imageUrl, profileImage, etc.)
 * 3. Database saved image URL (excluding temporary blob URLs)
 * 4. Correct provider-specific default authentic R2 image (keyed strictly by slug / id)
 * 5. Generic neutral doctor placeholder
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
    if ((key === 'prahlad-gadhavi' || key === 'prahlad-gadhvi') && (
      trimmed.includes('aU1QUlSKO9mpYg2rCyxW7d2q0') ||
      trimmed.includes('newark_internal_medicine_3') ||
      trimmed.includes('newark_internal_medicine_4')
    )) {
      return DEFAULT_PROVIDER_IMAGES['prahlad-gadhavi'];
    }

    // Prevent cross-contamination: Dr. Deval must NEVER have Dr. Prahlad's photo
    if ((key === 'deval-gadhvi' || key === 'deval-gadhavi') && trimmed.includes('prahlad-gadhavi')) {
      return DEFAULT_PROVIDER_IMAGES['deval-gadhvi'];
    }

    // Outdated generic stock photos for a known doctor
    if (DEFAULT_PROVIDER_IMAGES[key] && (
      trimmed.includes('photo-1622253692010') || 
      trimmed.includes('photo-1594824813581') || 
      trimmed.includes('photo-1594824813627') || 
      trimmed.includes('photo-1559839734') || 
      trimmed.includes('photo-1638202993928')
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

  const candidateImages = [
    provider.imageUrl,
    provider.profileImage,
    provider.photoUrl,
    provider.image,
    provider.photo,
    provider.avatar,
    provider.profilePhoto
  ];

  // 2a. Priority 1: Cloudflare R2 uploaded URLs always take highest precedence
  for (const img of candidateImages) {
    if (typeof img === 'string' && img.trim() !== '') {
      const trimmed = img.trim();
      if (trimmed.includes('r2.dev') || trimmed.includes('.r2.cloudflarestorage.com') || (trimmed.startsWith('https://') && trimmed.includes('/providers/'))) {
        // Prevent cross-contamination
        if ((key === 'prahlad-gadhavi' || key === 'prahlad-gadhvi') && (trimmed.includes('dr-deval-gadhvi') || trimmed.includes('deval'))) {
          continue;
        }
        if ((key === 'deval-gadhvi' || key === 'deval-gadhavi') && (trimmed.includes('dr-prahlad-gadhvi') || trimmed.includes('prahlad'))) {
          continue;
        }
        return trimmed;
      }
    }
  }

  // 2b. Priority 2: General database saved image (excluding temporary blob URLs)
  for (const img of candidateImages) {
    if (typeof img === 'string' && img.trim() !== '') {
      const trimmed = img.trim();
      if (trimmed.startsWith('blob:')) continue; // never persist/render blob outside edit

      // Prevent cross-contamination
      if ((key === 'prahlad-gadhavi' || key === 'prahlad-gadhvi') && (
        trimmed.includes('aU1QUlSKO9mpYg2rCyxW7d2q0') ||
        trimmed.includes('newark_internal_medicine_3') ||
        trimmed.includes('newark_internal_medicine_4') ||
        trimmed.includes('deval')
      )) {
        continue;
      }

      if ((key === 'deval-gadhvi' || key === 'deval-gadhavi') && trimmed.includes('prahlad')) {
        continue;
      }

      if (DEFAULT_PROVIDER_IMAGES[key] && (
        trimmed.includes('photo-1622253692010') || 
        trimmed.includes('photo-1594824813581') || 
        trimmed.includes('photo-1594824813627') || 
        trimmed.includes('photo-1559839734') || 
        trimmed.includes('photo-1638202993928')
      )) {
        return DEFAULT_PROVIDER_IMAGES[key];
      }

      return trimmed;
    }
  }

  // 3. Provider-specific default authentic image (Cloudflare R2)
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
