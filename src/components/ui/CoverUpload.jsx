import { useState, useRef, useCallback, useEffect } from 'react';
import { Loader2, Image as ImageIcon, X } from 'lucide-react';
import { apiUpload, apiUploadStaging, getTempPreviewUrl, normalizeFileUrl } from '../../utils/api';

export default function CoverUpload({ label = 'Cover', value, onChange, className = '', deferUpload = false, useStaging = false }) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);
    const objectUrlsRef = useRef(new Set());

    useEffect(() => {
        // Cabut object URL yang tidak digunakan (misal value diganti dengan url remote)
        const activeUrl = typeof value?.url === 'string' && value.url.startsWith('blob:') ? value.url : null;
        for (const url of Array.from(objectUrlsRef.current)) {
            if (!activeUrl || url !== activeUrl) {
                try {
                    URL.revokeObjectURL(url);
                } catch {
                    // ignore
                }
                objectUrlsRef.current.delete(url);
            }
        }
    }, [value]);

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
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            await uploadImage(file);
        }
    };

    const uploadImage = async (file) => {
        if (file.size > 5 * 1024 * 1024) {
            setError('Ukuran file maksimal 5MB');
            return;
        }

        // Tunda upload - simpan file secara lokal
        if (deferUpload) {
            setError('');
            // Cabut preview lokal sebelumnya jika ada
            if (value?.isLocal && typeof value?.url === 'string' && value.url.startsWith('blob:')) {
                try {
                    URL.revokeObjectURL(value.url);
                } catch {
                    // ignore
                }
                objectUrlsRef.current.delete(value.url);
            }

            const objectUrl = URL.createObjectURL(file);
            objectUrlsRef.current.add(objectUrl);
            onChange?.({ url: objectUrl, name: file.name, type: file.type, size: file.size, file, isLocal: true });
            return;
        }

        // Upload ke staging untuk preview
        if (useStaging) {
            setUploading(true);
            setError('');
            try {
                const result = await apiUploadStaging(file);
                onChange?.({
                    url: result.previewUrl || getTempPreviewUrl(result.tempId),
                    name: result.name || file.name,
                    type: result.mimeType || file.type,
                    size: result.size || file.size,
                    tempId: result.tempId,
                    isStaged: true,
                    expiresAt: result.expiresAt,
                });
            } catch (err) {
                setError(err.message || 'Gagal mengupload gambar');
            } finally {
                setUploading(false);
            }
            return;
        }

        // Upload langsung
        setUploading(true);
        setError('');
        try {
            const result = await apiUpload('/upload', file, { folder: 'covers' });
            onChange?.({ url: result?.url || result?.fileUrl || result, name: file.name });
        } catch {
            setError('Gagal mengupload gambar');
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (file) await uploadImage(file);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className={className}>
            {label && <label className="mb-2 block text-sm font-medium text-neutral-700">{label}</label>}

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !value && inputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-all ${value ? 'border-transparent' : isDragging ? 'border-primary-400 bg-primary-50' : 'border-neutral-300 hover:border-primary-300 cursor-pointer'
                    } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
            >
                <input ref={inputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

                {value?.url ? (
                    <div className="relative" style={{ aspectRatio: '5 / 1' }}>
                        <img src={normalizeFileUrl(value.url)} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all group">
                            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        inputRef.current?.click();
                                    }}
                                    className="px-3 py-2 bg-white rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                                >
                                    Ganti
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChange?.(null);
                                    }}
                                    className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-6" style={{ aspectRatio: '5 / 1' }}>
                        {uploading ? (
                            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                        ) : (
                            <>
                                <ImageIcon className={`w-10 h-10 mb-2 ${isDragging ? 'text-primary-500' : 'text-neutral-400'}`} />
                                <p className="text-sm text-neutral-600">Seret gambar atau klik untuk memilih</p>
                                <p className="text-xs text-neutral-400 mt-1">PNG, JPG, WEBP (Maks 5MB)</p>
                            </>
                        )}
                    </div>
                )}
            </div>

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
}
