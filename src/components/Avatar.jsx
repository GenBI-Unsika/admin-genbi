export default function Avatar({ name = '', src, size = 32 }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  if (src) {
    return <img src={src} alt={name} className="rounded-full border border-neutral-200 object-cover" style={{ width: size, height: size }} />;
  }

  return (
    <div className="grid place-items-center rounded-full border border-neutral-200 bg-primary-50 text-primary-700" style={{ width: size, height: size, fontSize: 12, fontWeight: 600 }} aria-label={name} title={name}>
      {initials || '?'}
    </div>
  );
}
