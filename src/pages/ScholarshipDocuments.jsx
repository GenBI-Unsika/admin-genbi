import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Trash2, GripVertical, ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { apiRequest } from '../utils/api';

const EMPTY_DOC = { key: '', title: '', desc: '', required: true, kind: 'file', downloadLink: '' };

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .substring(0, 30);
}

export default function ScholarshipDocuments() {
  const [docs, setDocs] = useState([]);
  const [original, setOriginal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await apiRequest('/scholarships/documents', { method: 'GET' });
      const fetched = payload?.data?.documents || [];
      setDocs(fetched.map((d) => ({ ...d })));
      setOriginal(fetched.map((d) => ({ ...d })));
    } catch (e) {
      toast.error(e?.message || 'Gagal memuat konfigurasi dokumen.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const hasChanges = JSON.stringify(docs) !== JSON.stringify(original);

  const updateDoc = (idx, field, value) => {
    setDocs((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      // Auto-generate key from title if key is empty
      if (field === 'title' && !next[idx].key) {
        next[idx].key = slugify(value);
      }
      return next;
    });
  };

  const addDoc = () => {
    setDocs((prev) => [...prev, { ...EMPTY_DOC }]);
  };

  const removeDoc = (idx) => {
    setDocs((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveDoc = (fromIdx, toIdx) => {
    if (fromIdx === toIdx) return;
    setDocs((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
  };

  const resetDocs = () => {
    setDocs(original.map((d) => ({ ...d })));
    toast.success('Perubahan dibatalkan.');
  };

  const saveDocs = async () => {
    // Validate
    for (let i = 0; i < docs.length; i++) {
      if (!docs[i].key?.trim()) {
        toast.error(`Dokumen #${i + 1}: Key wajib diisi.`);
        return;
      }
      if (!docs[i].title?.trim()) {
        toast.error(`Dokumen #${i + 1}: Judul wajib diisi.`);
        return;
      }
    }

    const keys = docs.map((d) => d.key.trim());
    const uniqueKeys = new Set(keys);
    if (uniqueKeys.size !== keys.length) {
      toast.error('Terdapat key dokumen yang duplikat.');
      return;
    }

    setSaving(true);
    try {
      const payload = await apiRequest('/scholarships/documents', {
        method: 'PUT',
        body: { documents: docs },
      });
      const saved = payload?.data?.documents || docs;
      setDocs(saved.map((d) => ({ ...d })));
      setOriginal(saved.map((d) => ({ ...d })));
      toast.success('Konfigurasi dokumen berhasil disimpan.');
    } catch (e) {
      toast.error(e?.message || 'Gagal menyimpan konfigurasi.');
    } finally {
      setSaving(false);
    }
  };

  // Drag handlers
  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };
  const handleDragEnd = () => {
    if (dragIdx !== null && dragOverIdx !== null && dragIdx !== dragOverIdx) {
      moveDoc(dragIdx, dragOverIdx);
    }
    setDragIdx(null);
    setDragOverIdx(null);
  };

  return (
    <div className="px-6 md:px-10 py-6 max-w-7xl">
      <Link to="/beasiswa" className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:underline mb-2">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Daftar Pendaftar
      </Link>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-neutral-900">Kelola Berkas Beasiswa</h1>
          <p className="text-sm text-neutral-500 mt-1">Atur dokumen yang harus diunggah oleh pendaftar beasiswa. Perubahan akan berlaku untuk pendaftaran berikutnya.</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 text-sm text-neutral-500">Memuat konfigurasi...</div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Left Column: Editor */}
          <div className="min-w-0">
            {/* Document list */}
            <div className="space-y-4">
              {docs.map((doc, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`rounded-xl border bg-white p-4 md:p-5 transition-all ${dragIdx === idx ? 'opacity-50 border-primary-300' : dragOverIdx === idx ? 'border-primary-400 shadow-md' : 'border-neutral-200'}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Drag handle */}
                    <div className="mt-2 cursor-grab text-neutral-400 hover:text-neutral-600" title="Seret untuk mengubah urutan">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    <div className="flex-1 space-y-3">
                      {/* Row 1: Title + Kind + Required */}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-neutral-500">Judul Dokumen</label>
                          <input
                            type="text"
                            value={doc.title}
                            onChange={(e) => updateDoc(idx, 'title', e.target.value)}
                            placeholder="Contoh: Scan KTP & KTM"
                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-neutral-500">Jenis</label>
                          <select
                            value={doc.kind || 'file'}
                            onChange={(e) => updateDoc(idx, 'kind', e.target.value)}
                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
                          >
                            <option value="file">File Upload</option>
                            <option value="url">Link / URL</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm cursor-pointer hover:bg-neutral-50">
                            <input type="checkbox" checked={doc.required} onChange={(e) => updateDoc(idx, 'required', e.target.checked)} />
                            <span className="whitespace-nowrap">Wajib</span>
                          </label>
                        </div>
                      </div>

                      {/* Row 2: Description */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-neutral-500">Deskripsi / Keterangan</label>
                        <input
                          type="text"
                          value={doc.desc}
                          onChange={(e) => updateDoc(idx, 'desc', e.target.value)}
                          placeholder="Format PDF (Maks 10 MB)"
                          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
                        />
                      </div>

                      {/* Row 3: Download Link (only for file kind) */}
                      {doc.kind === 'file' && (
                        <div>
                          <label className="mb-1 block text-xs font-medium text-neutral-500">Link Unduh Formulir (opsional)</label>
                          <input
                            type="text"
                            value={doc.downloadLink || ''}
                            onChange={(e) => updateDoc(idx, 'downloadLink', e.target.value)}
                            placeholder="unsika.link/form-a1 atau https://unsika.link/form-a1"
                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
                          />
                          <p className="mt-1 text-xs text-neutral-400">Link template formulir yang perlu diunduh. Bisa dengan atau tanpa https://</p>
                        </div>
                      )}
                    </div>

                    {/* Delete button */}
                    <button type="button" onClick={() => removeDoc(idx)} className="mt-2 rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Hapus dokumen">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add button */}
            <button
              type="button"
              onClick={addDoc}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 px-4 py-3 text-sm font-medium text-neutral-600 transition hover:border-neutral-400 hover:bg-neutral-50"
            >
              <Plus className="h-4 w-4" />
              Tambah Dokumen
            </button>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4">
              <div className="text-sm text-neutral-500">
                {docs.length} dokumen &middot; {docs.filter((d) => d.required).length} wajib
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetDocs}
                  disabled={!hasChanges || saving}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 transition"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={saveDocs}
                  disabled={!hasChanges || saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-700)] disabled:opacity-40 transition"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Preview (sticky) */}
          {docs.length > 0 && (
            <div className="lg:sticky lg:top-6 h-fit">
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">Preview Urutan Berkas</h3>
              <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100 max-h-[80vh] overflow-y-auto">
                {docs.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-100 text-xs font-semibold flex items-center justify-center text-neutral-600">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">
                        {doc.title || '(tanpa judul)'}
                        {doc.required && <span className="ml-1 text-red-500">*</span>}
                      </p>
                      {doc.desc && <p className="text-xs text-neutral-500 truncate">{doc.desc}</p>}
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className={`flex-shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium ${doc.kind === 'url' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-neutral-200 bg-neutral-50 text-neutral-600'}`}>
                        {doc.kind === 'url' ? 'Link' : 'File'}
                      </span>
                      {doc.downloadLink && <span className="flex-shrink-0 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">+ Unduh</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
