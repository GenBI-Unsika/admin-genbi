import { useState, useCallback, useRef, useEffect } from 'react';
import { apiUploadStaging, apiFinalizeUpload, apiFinalizeBulkUpload, apiDeleteStaging, getTempPreviewUrl } from './api';

// Hook buat ngatur upload file sementara (buat diliat dulu sblm disave permanen ke GDrive pas submit)
export function useStagingUpload() {
  const [stagedFiles, setStagedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Upload satu file ke tempat sementara
  const uploadToStaging = useCallback(async (file, options = {}) => {
    setUploading(true);
    setError(null);
    try {
      const result = await apiUploadStaging(file);
      const stagedFile = {
        tempId: result.tempId,
        name: result.name || file.name,
        url: result.previewUrl || getTempPreviewUrl(result.tempId),
        type: result.mimeType || file.type,
        size: result.size || file.size,
        expiresAt: result.expiresAt,
        isStaged: true,
        folder: options.folder || 'uploads',
      };

      if (mountedRef.current) {
        setStagedFiles((prev) => [...prev, stagedFile]);
      }

      return stagedFile;
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || 'Gagal upload file');
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setUploading(false);
      }
    }
  }, []);

  // Upload banyak file sekaligus ke tempat sementara
  const uploadMultipleToStaging = useCallback(async (files, options = {}) => {
    setUploading(true);
    setError(null);
    const results = [];
    const errors = [];

    try {
      for (const file of files) {
        try {
          const result = await apiUploadStaging(file);
          const stagedFile = {
            tempId: result.tempId,
            name: result.name || file.name,
            url: result.previewUrl || getTempPreviewUrl(result.tempId),
            type: result.mimeType || file.type,
            size: result.size || file.size,
            expiresAt: result.expiresAt,
            isStaged: true,
            folder: options.folder || 'uploads',
          };
          results.push(stagedFile);
        } catch (err) {
          errors.push({ file: file.name, error: err.message });
        }
      }

      if (mountedRef.current) {
        setStagedFiles((prev) => [...prev, ...results]);
        if (errors.length > 0) {
          setError(`${errors.length} file gagal diupload`);
        }
      }

      return { uploaded: results, errors };
    } finally {
      if (mountedRef.current) {
        setUploading(false);
      }
    }
  }, []);

  // Hapus file dari tempat sementara
  const removeStagedFile = useCallback(async (tempId) => {
    try {
      await apiDeleteStaging(tempId);
    } catch {
      // Sengaja dicuekin errornya, aman kok
    }
    if (mountedRef.current) {
      setStagedFiles((prev) => prev.filter((f) => f.tempId !== tempId));
    }
  }, []);

  // Simpan permanen satu file dari tempat sementara ke Google Drive
  const finalizeSingle = useCallback(async (tempId, folder) => {
    setFinalizing(true);
    setError(null);
    try {
      const result = await apiFinalizeUpload(tempId, folder);
      if (mountedRef.current) {
        setStagedFiles((prev) => prev.filter((f) => f.tempId !== tempId));
      }
      return {
        id: result.id,
        name: result.name,
        url: result.url,
        previewUrl: result.previewUrl,
        downloadUrl: result.downloadUrl,
      };
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || 'Gagal finalize file');
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setFinalizing(false);
      }
    }
  }, []);

  // Simpan permanen SEMUA file dari tempat sementara ke Google Drive
  const finalizeAll = useCallback(async () => {
    if (stagedFiles.length === 0) return { uploaded: [], errors: [] };

    setFinalizing(true);
    setError(null);
    try {
      const filesToFinalize = stagedFiles.map((f) => ({
        tempId: f.tempId,
        folder: f.folder,
      }));

      const result = await apiFinalizeBulkUpload(filesToFinalize);

      if (mountedRef.current) {

        const finalizedIds = new Set(result.uploaded.map((u) => u.tempId));
        setStagedFiles((prev) => prev.filter((f) => !finalizedIds.has(f.tempId)));

        if (result.errors.length > 0) {
          setError(`${result.errors.length} file gagal difinalize`);
        }
      }

      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || 'Gagal finalize files');
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setFinalizing(false);
      }
    }
  }, [stagedFiles]);

  // Bersihin semua file yang ada di tempat sementara (tanpa dikirim ke GDrive)
  const clearAll = useCallback(async () => {

    await Promise.all(stagedFiles.map((f) => apiDeleteStaging(f.tempId).catch(() => { })));
    if (mountedRef.current) {
      setStagedFiles([]);
    }
  }, [stagedFiles]);

  // Pilih dan simpan permanen beberapa file spesifik aja ke Google Drive
  const finalizeFiles = useCallback(
    async (tempIds, folder) => {
      const files = tempIds.map((tempId) => ({
        tempId,
        folder: folder || stagedFiles.find((f) => f.tempId === tempId)?.folder,
      }));

      setFinalizing(true);
      setError(null);
      try {
        const result = await apiFinalizeBulkUpload(files);

        if (mountedRef.current) {
          const finalizedIds = new Set(result.uploaded.map((u) => u.tempId));
          setStagedFiles((prev) => prev.filter((f) => !finalizedIds.has(f.tempId)));
        }

        return result;
      } catch (err) {
        if (mountedRef.current) {
          setError(err.message || 'Gagal finalize files');
        }
        throw err;
      } finally {
        if (mountedRef.current) {
          setFinalizing(false);
        }
      }
    },
    [stagedFiles],
  );

  return {
    stagedFiles,
    setStagedFiles,
    uploading,
    finalizing,
    error,
    uploadToStaging,
    uploadMultipleToStaging,
    removeStagedFile,
    finalizeSingle,
    finalizeAll,
    finalizeFiles,
    clearAll,
    getTempPreviewUrl,
  };
}

export default useStagingUpload;
