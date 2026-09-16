import React from 'react';
import { useCmsData } from '../context/CmsContext';

export interface BrandLogoProps {
  layout?: 'horizontal' | 'compact' | 'icon-only';
  colorScheme?: 'colored' | 'black' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export interface BrandIconProps {
  size?: number | string;
  colorScheme?: 'colored' | 'black' | 'white';
  className?: string;
}

/**
 * Newark Medical Associates - Editorial Monogram & Emblem
 * Luxury Private Practice Emblem in Muted Gold & Midnight Navy
 */
export function BrandIcon({
  size = 40,
  colorScheme = 'colored',
  className = ''
}: BrandIconProps) {
  const isWhite = colorScheme === 'white';
  const strokeColor = isWhite ? '#FCFBF8' : '#0B1F2A';
  const accentColor = isWhite ? '#B39A68' : '#B39A68';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Newark Medical Associates Monogram"
    >
      {/* Outer Editorial Octagon / Crest Frame */}
      <rect
        x="2.5"
        y="2.5"
        width="43"
        height="43"
        rx="6"
        stroke={accentColor}
        strokeWidth="1.2"
        fill={isWhite ? 'rgba(255,255,255,0.05)' : '#F4EFE6'}
      />
      {/* Inner fine border */}
      <rect
        x="6"
        y="6"
        width="36"
        height="36"
        rx="3"
        stroke={strokeColor}
        strokeWidth="0.8"
        strokeOpacity={isWhite ? 0.4 : 0.25}
      />
      {/* Editorial Serif Letter "N" with delicate medical cross accent */}
      <path
        d="M16 32V16H18.5L29.5 28.5V16H32V32H29.5L18.5 19.5V32H16Z"
        fill={strokeColor}
      />
      {/* Refined Gold Star / Cross Accent */}
      <circle cx="24" cy="11.5" r="1.5" fill={accentColor} />
    </svg>
  );
}

export default function BrandLogo({
  layout = 'horizontal',
  colorScheme = 'colored',
  size = 'md',
  showTagline = true,
  className = ''
}: BrandLogoProps) {
  const isWhite = colorScheme === 'white';

  let customLogo = '';
  try {
    const { getMediaUrl } = useCmsData();
    customLogo = getMediaUrl('global', 'branding', 'logo') || '';
  } catch {
    // Graceful fallback if rendered outside CmsProvider
  }

  const titleColor = isWhite ? 'text-[#FCFBF8]' : 'text-[#0B1F2A]';
  const taglineColor = isWhite ? 'text-[#D9D0C5]' : 'text-[#B39A68]';

  const sizeMap = {
    sm: {
      icon: 32,
      title: 'text-[17px] tracking-[-0.01em]',
      tagline: 'text-[10px] tracking-[0.14em]',
      gap: 'gap-2.5'
    },
    md: {
      icon: 42,
      title: 'text-[21px] sm:text-[23px] tracking-[-0.015em]',
      tagline: 'text-[11px] tracking-[0.16em]',
      gap: 'gap-3.5'
    },
    lg: {
      icon: 50,
      title: 'text-[26px] sm:text-[28px] tracking-[-0.02em]',
      tagline: 'text-[12.5px] tracking-[0.18em]',
      gap: 'gap-4'
    },
    xl: {
      icon: 64,
      title: 'text-[32px] sm:text-[36px] tracking-[-0.02em]',
      tagline: 'text-[14px] tracking-[0.2em]',
      gap: 'gap-5'
    }
  };

  const currentSize = sizeMap[size];

  if (customLogo) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <img
          src={customLogo}
          alt="Newark Medical Associates"
          className="object-contain max-h-12 w-auto"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  if (layout === 'icon-only') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <BrandIcon size={currentSize.icon} colorScheme={colorScheme} />
      </div>
    );
  }

  if (layout === 'compact') {
    return (
      <div className={`flex flex-col items-center text-center ${currentSize.gap} ${className}`}>
        <BrandIcon size={currentSize.icon} colorScheme={colorScheme} />
        <div className="flex flex-col items-center">
          <span className={`font-serif ${currentSize.title} ${titleColor} leading-tight`}>
            Newark Medical Associates
          </span>
          {showTagline && (
            <span className={`font-sans uppercase font-medium ${currentSize.tagline} ${taglineColor} mt-1`}>
              Primary & Preventive Care
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
      <BrandIcon size={currentSize.icon} colorScheme={colorScheme} />
      <div className="flex flex-col justify-center">
        <span className={`font-serif ${currentSize.title} ${titleColor} leading-none`}>
          Newark Medical Associates
        </span>
        {showTagline && (
          <span className={`font-sans uppercase font-semibold ${currentSize.tagline} ${taglineColor} mt-1`}>
            Primary & Preventive Care
          </span>
        )}
      </div>
    </div>
  );
}
