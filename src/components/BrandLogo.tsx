import React from 'react';
import { useCmsData } from '../context/CmsContext';

export interface BrandLogoProps {
  layout?: 'horizontal' | 'compact' | 'icon-only';
  colorScheme?: 'colored' | 'black' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'navbar';
  showTagline?: boolean;
  className?: string;
  imgClassName?: string;
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
  className = '',
  imgClassName = ''
}: BrandLogoProps) {
  const isWhite = colorScheme === 'white';

  let customLogo = '';
  try {
    const { getMediaUrl, siteSettings, headerContent } = useCmsData();
    customLogo =
      siteSettings?.logoUrl ||
      headerContent?.logoUrl ||
      getMediaUrl('branding', 'header', 'logo') ||
      getMediaUrl('global', 'branding', 'logo') ||
      '/newark-medical-associates-logo.png';
  } catch {
    customLogo = '/newark-medical-associates-logo.png';
  }

  // When white colorScheme is requested (e.g. inside dark navy footer),
  // preserve the white monogram & typography so dark backgrounds remain perfectly readable.
  if (isWhite) {
    const titleColor = 'text-[#FCFBF8]';
    const taglineColor = 'text-[#D9D0C5]';

    const sizeMap = {
      sm: { icon: 32, title: 'text-[17px] tracking-[-0.01em]', tagline: 'text-[10px] tracking-[0.14em]', gap: 'gap-2.5' },
      md: { icon: 42, title: 'text-[21px] sm:text-[23px] tracking-[-0.015em]', tagline: 'text-[11px] tracking-[0.16em]', gap: 'gap-3.5' },
      lg: { icon: 50, title: 'text-[26px] sm:text-[28px] tracking-[-0.02em]', tagline: 'text-[12.5px] tracking-[0.18em]', gap: 'gap-4' },
      xl: { icon: 64, title: 'text-[32px] sm:text-[36px] tracking-[-0.02em]', tagline: 'text-[14px] tracking-[0.2em]', gap: 'gap-5' },
      navbar: { icon: 42, title: 'text-[21px] sm:text-[23px] tracking-[-0.015em]', tagline: 'text-[11px] tracking-[0.16em]', gap: 'gap-3.5' }
    };
    const currentSize = sizeMap[size === 'navbar' ? 'md' : size];

    if (layout === 'icon-only') {
      return (
        <div className={`inline-flex items-center justify-center ${className}`}>
          <BrandIcon size={currentSize.icon} colorScheme="white" />
        </div>
      );
    }

    return (
      <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
        <BrandIcon size={currentSize.icon} colorScheme="white" />
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

  // When used in navbar or general colored layout, use the approved official brand logo image
  if (layout !== 'icon-only') {
    const navbarImgClasses =
      'w-auto h-auto object-contain max-h-[38px] xs:max-h-[42px] sm:max-h-[46px] md:max-h-[50px] lg:max-h-[54px] max-w-[155px] xs:max-w-[185px] sm:max-w-[215px] md:max-w-[245px] lg:max-w-[270px]';

    const defaultImgClasses =
      size === 'navbar'
        ? navbarImgClasses
        : size === 'sm'
        ? 'w-auto h-auto object-contain max-h-[36px] max-w-[160px]'
        : size === 'lg'
        ? 'w-auto h-auto object-contain max-h-[56px] max-w-[280px]'
        : size === 'xl'
        ? 'w-auto h-auto object-contain max-h-[70px] max-w-[340px]'
        : 'w-auto h-auto object-contain max-h-[46px] max-w-[220px]';

    return (
      <div className={`inline-flex items-center min-w-0 ${className}`}>
        <img
          src={customLogo}
          alt="Newark Medical Associates - Dr. Deval Gadhvi"
          className={imgClassName || defaultImgClasses}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <BrandIcon size={42} colorScheme={colorScheme} />
    </div>
  );
}
