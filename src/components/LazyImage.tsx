import React, { useState, useEffect } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  spinnerSize?: 'sm' | 'md' | 'lg';
}

export default function LazyImage({ src, alt, className = '', spinnerSize = 'md', loading = 'lazy', onLoad, ...props }: LazyImageProps & { loading?: 'lazy' | 'eager' }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (src?.startsWith('data:')) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [src]);

  const spinnerDimensions = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-[2.5px]',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div className="relative inline-block max-w-full max-h-full rounded-[inherit] overflow-hidden">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] rounded-[inherit] z-10">
          <div className={`premium-spinner ${spinnerDimensions[spinnerSize]}`} />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        className={`${className} transition-all duration-300 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onLoad={(e) => {
          setLoaded(true);
          if (onLoad) onLoad(e);
        }}
        onError={(e) => {
          setLoaded(true);
          if (props.onError) props.onError(e);
        }}
        {...props}
      />
    </div>
  );
}
