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
      <path
        d="M16 32V16H18.5L29.5 28.5V16H32V32H29.5L18.5 19.5V32H16Z"
        fill={strokeColor}
      />
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

  // Force official logo with cache-busting timestamp to prevent browser caching of old logo
  const customLogo = '/newark-medical-associates-logo.png?v=20261015';

  // When white colorScheme is requested (e.g. inside dark navy footer),
  // render the official brand logo inside a clean white container for maximum clarity and contrast.
  if (isWhite) {
    if (layout === 'icon-only') {
      return (
        <div className={`inline-flex items-center justify-center ${className}`}>
          <BrandIcon size={42} colorScheme="white" />
        </div>
      );
    }

    const defaultImgClasses =
      size === 'sm'
        ? 'h-[32px] w-auto object-contain'
        : size === 'lg'
        ? 'h-[50px] sm:h-[58px] w-auto object-contain'
        : 'h-[42px] w-auto object-contain';

    return (
      <div className={`inline-flex items-center bg-white px-3 py-2 rounded-sm shadow-md ${className}`}>
        <img
          src={customLogo}
          alt="Newark Medical Associates - Dr. Deval Gadhvi"
          className={imgClassName || defaultImgClasses}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // When used in navbar or general colored layout, use the approved official brand logo image
  if (layout !== 'icon-only') {
    const navbarImgClasses =
      'w-auto h-auto object-contain max-h-[52px] xs:max-h-[56px] sm:max-h-[60px] md:max-h-[64px] lg:max-h-[68px] max-w-[200px] xs:max-w-[230px] sm:max-w-[260px] md:max-w-[290px] lg:max-w-[320px]';

    const defaultImgClasses =
      size === 'navbar'
        ? navbarImgClasses
        : size === 'sm'
        ? 'w-auto h-auto object-contain max-h-[46px] max-w-[200px]'
        : size === 'lg'
        ? 'w-auto h-auto object-contain max-h-[70px] max-w-[320px]'
        : size === 'xl'
        ? 'w-auto h-auto object-contain max-h-[84px] max-w-[380px]'
        : 'w-auto h-auto object-contain max-h-[60px] max-w-[260px]';

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
