import { useMemo, useState } from 'react';

export default function Avatar({ name = '', src, size = 32 }) {
  const [failed, setFailed] = useState(false);

  const normalizedSrc = useMemo(() => {
    if (typeof src !== 'string') return '';
    const trimmed = src.trim();
    if (!trimmed) return '';
    if (trimmed === 'null' || trimmed === 'undefined') return '';
    return trimmed;
  }, [src]);

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  if (normalizedSrc && !failed) {
    return (
      <img src={normalizedSrc} alt={name} className="rounded-full border border-neutral-200 object-cover" style={{ width: size, height: size }} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
    );
  }

  return (
    <div className="grid place-items-center rounded-full border border-neutral-200 bg-primary-50 text-primary-700" style={{ width: size, height: size, fontSize: 12, fontWeight: 600 }} aria-label={name} title={name}>
      {initials || '?'}
    </div>
  );
}
