'use client';

import { PageComponent } from '@/lib/types';
import { asString, asNumber, asGalleryImages } from '@/lib/propertyValue';
import React from 'react';

interface ComponentRendererProps {
  component: PageComponent;
  isSelected?: boolean;
  onClick?: () => void;
}

const FONT_SIZE_CLASS: Record<string, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const ALIGN_CLASS: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const BUTTON_COLOR_CLASS: Record<string, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700',
  secondary: 'bg-gray-600 hover:bg-gray-700',
  success: 'bg-green-600 hover:bg-green-700',
};

const BUTTON_SIZE_CLASS: Record<string, string> = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

// Tailwind only generates CSS for class names it can find as literal
// strings at build time — `grid-cols-${cols}` would never be recognized,
// so the grid would silently render with no column styling. This map keeps
// the literal class names visible to Tailwind's scanner.
const GALLERY_COLS_CLASS: Record<string, string> = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-2',
  '3': 'grid-cols-3',
};

export function ComponentRenderer({
  component,
  isSelected,
  onClick,
}: ComponentRendererProps) {
  const baseClass = isSelected
    ? 'ring-2 ring-blue-500 bg-blue-50'
    : 'hover:ring-1 hover:ring-gray-300';

  const containerClass = `${baseClass} p-4 cursor-pointer transition min-h-20 relative`;

  // Only stop propagation when there's actually an editor-selection handler
  // to run — PublicPageRenderer relies on this click bubbling up to its own
  // wrapper (for click-tracking) and never passes `onClick`.
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  switch (component.type) {
    case 'hero': {
      return (
        <div
          onClick={handleClick}
          className={`${containerClass} rounded-lg overflow-hidden`}
          style={{
            backgroundImage: `url(${asString(component.properties.backgroundImage)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '300px',
          }}
        >
          <div className="bg-black bg-opacity-40 h-full flex flex-col justify-center items-center text-white rounded">
            <h2 className="text-4xl font-bold mb-2">
              {asString(component.properties.title)}
            </h2>
            <p className="text-xl mb-4">
              {asString(component.properties.subtitle)}
            </p>
            <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              {asString(component.properties.ctaText)}
            </button>
          </div>
        </div>
      );
    }

    case 'text': {
      const fontSize = asString(component.properties.fontSize, 'base');
      const alignment = asString(component.properties.alignment, 'left');
      return (
        <div onClick={handleClick} className={`${containerClass} rounded-lg`}>
          <p
            className={`${FONT_SIZE_CLASS[fontSize] || 'text-base'} ${ALIGN_CLASS[alignment] || 'text-left'}`}
          >
            {asString(component.properties.content)}
          </p>
        </div>
      );
    }

    case 'image': {
      return (
        <div
          onClick={handleClick}
          className={`${containerClass} rounded-lg overflow-hidden`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asString(component.properties.src)}
            alt={asString(component.properties.alt)}
            width={asNumber(component.properties.width)}
            height={asNumber(component.properties.height)}
            className="w-full h-auto object-cover rounded"
          />
        </div>
      );
    }

    case 'button': {
      const color = asString(component.properties.color, 'primary');
      const size = asString(component.properties.size, 'md');
      return (
        <div
          onClick={handleClick}
          className={`${containerClass} rounded-lg flex justify-center`}
        >
          <button
            className={`${BUTTON_COLOR_CLASS[color] || 'bg-blue-600'} ${BUTTON_SIZE_CLASS[size] || 'px-4 py-2'} text-white rounded`}
          >
            {asString(component.properties.text)}
          </button>
        </div>
      );
    }

    case 'gallery': {
      const cols = String(asNumber(component.properties.columns, 2));
      const images = asGalleryImages(component.properties.images);
      return (
        <div onClick={handleClick} className={`${containerClass} rounded-lg`}>
          <div className={`grid ${GALLERY_COLS_CLASS[cols] || 'grid-cols-2'} gap-4`}>
            {images.map((img, idx) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={idx}
                src={img.url}
                alt={img.alt}
                className="w-full h-auto object-cover rounded"
              />
            ))}
          </div>
        </div>
      );
    }

    case 'cta': {
      return (
        <div
          onClick={handleClick}
          className={`${containerClass} rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-12`}
        >
          <h3 className="text-3xl font-bold mb-4">
            {asString(component.properties.heading)}
          </h3>
          <p className="text-lg mb-6">
            {asString(component.properties.description)}
          </p>
          <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded hover:bg-gray-100">
            {asString(component.properties.buttonText)}
          </button>
        </div>
      );
    }

    default:
      return (
        <div className={`${containerClass} rounded-lg bg-gray-100`}>
          <p className="text-gray-600">Unknown component type</p>
        </div>
      );
  }
}
