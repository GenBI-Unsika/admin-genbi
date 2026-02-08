/**
 * EmptyStateImage - Komponen reusable untuk menampilkan empty state dengan ilustrasi gambar
 *
 * @param {Object} props
 * @param {string} props.image - URL atau path gambar ilustrasi
 * @param {string} props.imageAlt - Alt text untuk gambar
 * @param {string} props.title - Judul utama
 * @param {string} props.description - Deskripsi detail
 * @param {React.ReactNode} props.action - Optional button atau action element
 * @param {string} props.variant - 'default' | 'primary' | 'secondary' | 'minimal'
 * @param {string} props.imageSize - 'sm' | 'md' | 'lg' | 'xl'
 */
import { useEffect, useMemo, useState } from 'react';

export default function EmptyStateImage({ image, imageAlt = 'Ilustrasi data kosong', title, description, action, variant = 'default', imageSize = 'md' }) {
  const variantStyles = {
    default: {
      container: 'bg-neutral-50 border border-neutral-200',
      titleColor: 'text-neutral-900',
      descColor: 'text-neutral-600',
    },
    primary: {
      container: 'bg-primary-50/50 border border-primary-100',
      titleColor: 'text-neutral-900',
      descColor: 'text-neutral-600',
    },
    secondary: {
      container: 'bg-blue-50/50 border border-blue-100',
      titleColor: 'text-neutral-900',
      descColor: 'text-neutral-600',
    },
    minimal: {
      container: 'bg-transparent border-0',
      titleColor: 'text-neutral-900',
      descColor: 'text-neutral-500',
    },
  };

  const imageSizes = {
    sm: 'h-32 w-32',
    md: 'h-48 w-48',
    lg: 'h-64 w-64',
    xl: 'h-80 w-80',
  };

  const style = variantStyles[variant] || variantStyles.default;
  const imgSize = imageSizes[imageSize] || imageSizes.md;

  const fallbackSrc = useMemo(() => {
    const base = import.meta?.env?.BASE_URL ?? '/';
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;
    return `${normalizedBase}favicon-genbi.webp`;
  }, []);

  const initialSrc = useMemo(() => {
    if (!image) return '';
    if (typeof image !== 'string') return image;
    if (image.startsWith('data:')) return image;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    if (image.startsWith('/')) return image;

    const base = import.meta?.env?.BASE_URL ?? '/';
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;
    return `${normalizedBase}${image}`;
  }, [image]);

  const isRemoteImage = useMemo(() => {
    return typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'));
  }, [image]);

  const [src, setSrc] = useState(initialSrc);

  useEffect(() => {
    setSrc(initialSrc);
  }, [initialSrc]);

  const handleImgError = () => {
    if (isRemoteImage) {
      setSrc('');
      return;
    }

    if (src && src !== fallbackSrc) {
      setSrc(fallbackSrc);
      return;
    }

    setSrc('');
  };

  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl ${style.container} px-6 py-16 text-center`}>
      {src ? (
        <div className={`mb-6 ${imgSize}`}>
          <img src={src} alt={imageAlt} className="h-full w-full object-contain" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={handleImgError} />
        </div>
      ) : null}

      {title && <h3 className={`mb-2 text-lg font-semibold ${style.titleColor}`}>{title}</h3>}

      {description && <p className={`mb-6 max-w-md text-sm ${style.descColor}`}>{description}</p>}

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
