import { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { normalizeFileUrl } from '../../utils/api';

export default function ImageDropzone({
  value,
  onChange,
  onRemove,
  accept = 'image/*',
  maxSize = 2 * 1024 * 1024,
  placeholder = 'Drag & drop gambar atau klik untuk memilih',
  hint = 'Format: JPG, PNG, WebP. Maks 2MB.',
  previewClassName = 'w-full h-40',
  className = '',
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const validateFile = useCallback(
    (file) => {
      if (!file.type.startsWith('image/')) {
        return 'Hanya file gambar yang diperbolehkan';
      }
      if (file.size > maxSize) {
        return `Ukuran file maksimal ${Math.round(maxSize / 1024 / 1024)}MB`;
      }
      return null;
    },
    [maxSize],
  );

  const handleFile = useCallback(
    (file) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError('');
      onChange(file);
    },
    [onChange, validateFile],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = '';
    },
    [handleFile],
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setError('');
    onRemove?.();
  };

  return (
    <div className={className}>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200
          ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input ref={inputRef} type="file" accept={accept} onChange={handleInputChange} className="hidden" />

        {value ? (
          <div className={`relative overflow-hidden ${previewClassName}`}>
            <img src={normalizeFileUrl(value)} alt="Preview" className="w-full h-full object-cover" />
            <button type="button" onClick={handleRemove} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className={`flex flex-col items-center justify-center gap-3 p-6 ${previewClassName}`}>
            <div className={`p-3 rounded-full ${isDragging ? 'bg-primary-100' : 'bg-neutral-100'}`}>{isDragging ? <Upload className="w-6 h-6 text-primary-600" /> : <ImageIcon className="w-6 h-6 text-neutral-400" />}</div>
            <div className="text-center">
              <p className={`text-sm font-medium ${isDragging ? 'text-primary-600' : 'text-neutral-600'}`}>{isDragging ? 'Lepaskan untuk upload' : placeholder}</p>
              {hint && <p className="text-xs text-neutral-500 mt-1">{hint}</p>}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}
