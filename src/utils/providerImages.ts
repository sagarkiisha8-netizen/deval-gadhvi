/**
 * Centralized Provider Image & Identity Mapping Utility
 *
 * Rules:
 * 1. provider.imageUrl saved in persistent provider data ALWAYS takes highest precedence.
 * 2. Fallbacks are strictly keyed by provider slug/id — NEVER by index or other provider.
 * 3. Cross-doctor photo contamination is strictly prevented.
 * 4. Cache-busting parameter (?v=timestamp) is appended if updatedAt exists.
 */

export const DEFAULT_PROVIDER_IMAGES: Record<string, string> = {
  'dr-prahlad-gadhvi': 'https://pub-463524c5dd1e422ca67b4960ad60e690.r2.dev/providers/dr-prahlad-gadhavi/1791280065505-dr-prahlad-gadhavi.png',
  'dr-deval-gadhvi': 'https://pub-463524c5dd1e422ca67b4960ad60e690.r2.dev/providers/dr-deval-gadhvi/dr-deval-gadhvi.webp',
  'dr-sankalp-pathak': 'https://pub-463524c5dd1e422ca67b4960ad60e690.r2.dev/providers/dr-sankalp-pathak/dr-sankalp-pathak.png',
};

export const GENERIC_DOCTOR_PLACEHOLDER = 'https://pub-463524c5dd1e422ca67b4960ad60e690.r2.dev/providers/dr-sankalp-pathak/dr-sankalp-pathak.png';

/**
 * Normalizes any provider id, slug, or name to canonical provider slugs:
 * - 'dr-prahlad-gadhvi'
 * - 'dr-deval-gadhvi'
 * - 'dr-sankalp-pathak'
 */
export function normalizeProviderKey(idOrSlugOrName: string = ''): string {
  const clean = (idOrSlugOrName || '').toLowerCase().trim();
  if (clean.includes('prahlad')) return 'dr-prahlad-gadhvi';
  if (clean.includes('deval')) return 'dr-deval-gadhvi';
  if (clean.includes('sankalp')) return 'dr-sankalp-pathak';
  return clean.startsWith('dr-') ? clean : `dr-${clean}`;
}

/**
 * Resolves the canonical image URL for a provider following strict priority:
 * 1. Homepage override ONLY if explicitly requesting for homepage (provider.homepageImageOverride)
 * 2. Persistent provider.imageUrl / profileImage / photoUrl / image (CANONICAL FIELD: provider.imageUrl)
 * 3. Provider-specific authentic default R2 image (strictly keyed by doctor slug)
 * 4. Generic neutral doctor placeholder
 */
export function getProviderImage(provider: any, options?: { forHomepage?: boolean }): string {
  if (!provider) return GENERIC_DOCTOR_PLACEHOLDER;

  // Direct string passed (e.g. image URL or slug)
  if (typeof provider === 'string' && provider.trim() !== '') {
    const trimmed = provider.trim();
    const key = normalizeProviderKey(trimmed);

    // If just a slug or doctor name was passed
    if (!trimmed.startsWith('http') && !trimmed.startsWith('/') && !trimmed.startsWith('data:')) {
      if (DEFAULT_PROVIDER_IMAGES[key]) {
        return DEFAULT_PROVIDER_IMAGES[key];
      }
    }

    // Reject legacy swapped / static / wrong paths for Dr. Prahlad
    if (key === 'dr-prahlad-gadhvi' && (
      trimmed.includes('aU1QUlSKO9mpYg2rCyxW7d2q0') ||
      trimmed.includes('newark_internal_medicine_3') ||
      trimmed.includes('newark_internal_medicine_4') ||
      trimmed.includes('uploads/providers') ||
      trimmed.includes('deval')
    )) {
      return DEFAULT_PROVIDER_IMAGES['dr-prahlad-gadhvi'];
    }

    // Reject Dr. Prahlad photo for Dr. Deval
    if (key === 'dr-deval-gadhvi' && trimmed.includes('prahlad')) {
      return DEFAULT_PROVIDER_IMAGES['dr-deval-gadhvi'];
    }

    return trimmed;
  }

  const key = normalizeProviderKey(provider.id || provider.slug || provider.name || '');

  // 1. Homepage override ONLY if requested for homepage
  if (options?.forHomepage && provider.homepageImageOverride && typeof provider.homepageImageOverride === 'string' && provider.homepageImageOverride.trim() !== '') {
    return provider.homepageImageOverride.trim();
  }

  // 2. CANONICAL FIELD: provider.imageUrl (Priority 1)
  const candidate = (provider.imageUrl || provider.profileImage || provider.photoUrl || provider.image || '').trim();

  if (candidate && !candidate.startsWith('blob:')) {
    // Sanitize against legacy swapped image / static uploads
    const isPrahladSwapped = (key === 'dr-prahlad-gadhvi') && (
      candidate.includes('aU1QUlSKO9mpYg2rCyxW7d2q0') ||
      candidate.includes('newark_internal_medicine_3') ||
      candidate.includes('newark_internal_medicine_4') ||
      candidate.includes('uploads/providers') ||
      candidate.includes('dr-deval-gadhvi') ||
      candidate.includes('deval')
    );

    const isDevalSwapped = (key === 'dr-deval-gadhvi') && (
      candidate.includes('prahlad')
    );

    if (!isPrahladSwapped && !isDevalSwapped) {
      return candidate;
    }
  }

  // 3. Fallback to DEFAULT_PROVIDER_IMAGES strictly if imageUrl is empty or was swapped
  if (DEFAULT_PROVIDER_IMAGES[key]) {
    return DEFAULT_PROVIDER_IMAGES[key];
  }

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

  // 2. Check if author matches one of our primary doctors
  if (Array.isArray(providers) && providers.length > 0 && canonicalKey) {
    const matchedDoctor = providers.find(p => normalizeProviderKey(p.id || p.slug || p.name) === canonicalKey);
    if (matchedDoctor) {
      const pImg = getProviderImage(matchedDoctor);
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
