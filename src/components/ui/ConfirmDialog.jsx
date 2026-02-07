import React, { useEffect } from 'react';

export default function ConfirmDialog({ isOpen, title, description, confirmText = 'Ya', cancelText = 'Tidak', tone = 'default', onConfirm, onCancel }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    window.addEventListener('keydown', onKey);
    document.body.classList.add('overflow-hidden');
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const confirmClass = tone === 'danger' ? 'bg-secondary-600 hover:bg-secondary-700 focus-visible:ring-secondary-200' : 'bg-primary-500 hover:bg-primary-600 focus-visible:ring-primary-200';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-neutral-900">{title || 'Konfirmasi'}</h3>
        {description ? <p className="mt-2 text-sm text-neutral-600">{description}</p> : null}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
          >
            {cancelText}
          </button>
          <button type="button" onClick={onConfirm} className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 ${confirmClass}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
