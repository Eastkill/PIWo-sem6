'use client';
import { useState } from 'react';

export default function ImagePlaceholder({ src, alt, className, style }) {
  const [error, setError] = useState(!src);

  if (error || !src) {
    return (
      <div className={className || 'product-image-placeholder'} style={style}>
        🎲
        <span>Brak zdjęcia</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || ''}
      className={className}
      style={style}
      onError={() => setError(true)}
    />
  );
}
