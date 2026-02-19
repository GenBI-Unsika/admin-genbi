import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import { apiUpload, apiUploadStaging, getTempPreviewUrl, normalizeFileUrl } from '../../utils/api';
import { FileIcon } from '../icons/CustomIcons.jsx';

export default function FileUpload({
  label,
  accept = '*/*',
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  folder = 'uploads',
  value = [],
  onChange,
  placeholder = 'Seret file ke sini atau klik untuk memilih',
  className = '',
  showPreview = true,
  uploadEndpoint = '/upload',
  deferUpload = false,
  useStaging = false, // BARU: Upload ke staging untuk preview, finalize saat submit
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const objectUrlsRef = useRef(new Set());

  const files = useMemo(() => (Array.isArray(value) ? value : value ? [value] : []), [value]);

  useEffect(() => {
    // Cabut object URL yang tidak lagi direferensikan oleh `files`
    const activeUrls = new Set(files.map((f) => f?.url).filter((u) => typeof u === 'string' && u.startsWith('blob:')));

    for (const url of Array.from(objectUrlsRef.current)) {
      if (!activeUrls.has(url)) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
        objectUrlsRef.current.delete(url);
      }
    }
  }, [files]);

  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      for (const url of urls) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      }
      urls.clear();
    };
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = (file) => {
    if (file.size > maxSize) {
      return `File "${file.name}" terlalu besar. Maksimal ${Math.round(maxSize / 1024 / 1024)}MB`;
    }
    return null;
  };

  const uploadFile = async (file) => {
    try {
      const result = await apiUpload(uploadEndpoint, file, { folder });
      return {
        name: file.name,
        url: result?.url || result?.fileUrl || result,
        type: file.type,
        size: file.size,
      };
    } catch (err) {
      throw new Error(`Gagal mengupload "${file.name}": ${err.message}`);
    }
  };

  // BARU: Upload ke staging untuk preview
  const uploadToStaging = async (file) => {
    try {
      const result = await apiUploadStaging(file);
      return {
        name: result.name || file.name,
        url: result.previewUrl || getTempPreviewUrl(result.tempId),
        type: result.mimeType || file.type,
        size: result.size || file.size,
        tempId: result.tempId,
        isStaged: true,
        expiresAt: result.expiresAt,
      };
    } catch (err) {
      throw new Error(`Gagal mengupload "${file.name}": ${err.message}`);
    }
  };

  const toLocalFileObject = (file) => {
    const isImage = Boolean(file.type?.startsWith('image/'));
    const url = showPreview && isImage ? URL.createObjectURL(file) : undefined;
    if (url) objectUrlsRef.current.add(url);

    return {
      name: file.name,
      url,
      type: file.type,
      size: file.size,
      file,
      isLocal: true,
    };
  };

  const processFiles = async (fileList) => {
    setError('');
    const newFiles = Array.from(fileList);

    // Validate all files first
    for (const file of newFiles) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // Tunda upload - simpan file secara lokal, upload nanti
    if (deferUpload) {
      const localFiles = newFiles.map(toLocalFileObject);
      const result = multiple ? [...files, ...localFiles] : localFiles;
      onChange?.(result);
      return;
    }

    // Upload ke staging untuk preview (finalize saat submit form)
    if (useStaging) {
      setUploading(true);
      try {
        const stagedFiles = await Promise.all(newFiles.map(uploadToStaging));
        const result = multiple ? [...files, ...stagedFiles] : stagedFiles;
        onChange?.(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setUploading(false);
      }
      return;
    }

    // Upload langsung ke penyimpanan akhir
    setUploading(true);
    try {
      const uploadedFiles = await Promise.all(newFiles.map(uploadFile));
      const result = multiple ? [...files, ...uploadedFiles] : uploadedFiles;
      onChange?.(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input so same file can be selected again
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = (index) => {
    const fileToRemove = files[index];
    if (fileToRemove?.isLocal && typeof fileToRemove.url === 'string' && fileToRemove.url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(fileToRemove.url);
      } catch {
        // ignore
      }
      objectUrlsRef.current.delete(fileToRemove.url);
    }

    const newFiles = files.filter((_, i) => i !== index);
    onChange?.(multiple ? newFiles : null);
  };

  const getFileIcon = (file) => {
    if (file.type?.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-primary-500" />;
    if (file.type?.includes('pdf')) return <FileIcon className="w-5 h-5 text-red-500" />;
    return <FileIcon className="w-5 h-5 text-neutral-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className={className}>
      {label && <label className="mb-2 block text-sm font-medium text-neutral-700">{label}</label>}

      {/* Zona Drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragging ? 'border-primary-400 bg-primary-50' : 'border-neutral-300 hover:border-primary-300 hover:bg-neutral-50'
          } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
      >
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={handleFileSelect} className="hidden" />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            <span className="text-sm text-neutral-600">Mengupload...</span>
          </div>
        ) : (
          <>
            <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-primary-500' : 'text-neutral-400'}`} />
            <p className="text-sm text-neutral-600">{placeholder}</p>
            <p className="text-xs text-neutral-400 mt-1">Maksimal {Math.round(maxSize / 1024 / 1024)}MB per file</p>
          </>
        )}
      </div>

      {/* Pesan Error */}
      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <X className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* List File / Preview */}
      {showPreview && files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              {file.type?.startsWith('image/') && file.url ? (
                <img src={normalizeFileUrl(file.url)} alt={file.name} className="w-12 h-12 object-cover rounded-lg" />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg border border-neutral-200">{getFileIcon(file)}</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">{file.name}</p>
                {file.size && <p className="text-xs text-neutral-500">{formatFileSize(file.size)}</p>}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



// Komponen input link untuk lampiran URL
export function LinkInput({ value = [], onChange, label, className = '' }) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const addLink = () => {
    if (!inputValue.trim()) return;

    // Validasi URL dasar
    try {
      new URL(inputValue);
    } catch {
      setError('URL tidak valid');
      return;
    }

    setError('');
    onChange?.([...value, { url: inputValue, type: 'link' }]);
    setInputValue('');
  };

  const removeLink = (index) => {
    onChange?.(value.filter((_, i) => i !== index));
  };

  return (
    <div className={className}>
      {label && <label className="mb-2 block text-sm font-medium text-neutral-700">{label}</label>}

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="url"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
            placeholder="https://example.com"
            className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>
        <button type="button" onClick={addLink} className="px-4 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors">
          Tambah
        </button>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {value.length > 0 && (
        <div className="mt-3 space-y-2">
          {value.map((link, index) => (
            <div key={index} className="flex items-center gap-3 p-2 bg-neutral-50 rounded-lg border border-neutral-200">
              <LinkIcon className="w-4 h-4 text-primary-500 shrink-0" />
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-primary-600 hover:underline truncate">
                {link.url}
              </a>
              <button type="button" onClick={() => removeLink(index)} className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
