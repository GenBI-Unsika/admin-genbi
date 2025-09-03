export default function Textarea({ label, id, value, onChange, rows = 6, placeholder, readOnly = false, disabled = false, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-200)] disabled:opacity-60 read-only:bg-neutral-50"
      />
    </div>
  );
}
