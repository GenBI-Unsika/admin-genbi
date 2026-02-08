import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import FileUpload, { CoverUpload, LinkInput } from '../components/ui/FileUpload';
import { ChevronRight, Image, FileText, Link as LinkIcon, X, Plus, Loader2 } from 'lucide-react';
import { apiFinalizeUpload, apiPost, apiPatch, apiGet } from '../utils/api';
import RichTextEditor from '../components/ui/RichTextEditor';

export default function ActivityForm({ mode: modeProp }) {
  const params = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const mode = modeProp ?? (params.id ? 'edit' : 'create');
  const isEdit = mode === 'edit';

  const payloadFromState = useMemo(() => state?.activity || state?.event || state?.proker, [state]);

  const [form, setForm] = useState({
    category: '',
    title: '',
    theme: '',
    date: '',
    description: '',

    coverImage: null,

    photos: [],
    documents: [],
    links: [],
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k) => (eOrV) => setForm((s) => ({ ...s, [k]: eOrV?.target ? eOrV.target.value : eOrV }));

  useEffect(() => {
    if (!isEdit) return;
    if (payloadFromState) {
      setForm({
        category: payloadFromState.type || '',
        title: payloadFromState.title || '',
        theme: payloadFromState.theme || '',
        date: payloadFromState.startDate ? payloadFromState.startDate.slice(0, 10) : payloadFromState.date || '',
        description: payloadFromState.description || '',
        coverImage: payloadFromState.coverImage ? { url: payloadFromState.coverImage, name: 'Cover' } : null,
        attachmentType: '',
        photos: payloadFromState.photos || [],
        documents: payloadFromState.documents || [],
        links: payloadFromState.links || [],
      });
    } else if (params.id) {
      setLoading(true);
      apiGet(`/activities/${params.id}`)
        .then((data) => {
          setForm({
            category: data.status === 'DRAFT' ? 'proker' : 'event',
            title: data.title || '',
            theme: data.theme || '',
            date: data.startDate ? data.startDate.slice(0, 10) : '',
            description: data.description || '',
            coverImage: data.coverImage ? { url: data.coverImage, name: 'Cover' } : null,
            attachmentType: '',
            photos: data.attachments?.photos || [],
            documents: data.attachments?.documents || [],
            links: data.attachments?.links || [],
          });
        })
        .catch((err) => {
          console.error('Failed to fetch activity:', err);
          alert('Gagal memuat data aktivitas');
        })
        .finally(() => setLoading(false));
    }
  }, [isEdit, payloadFromState, params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.category) {
      alert('Judul dan Kategori wajib diisi');
      return;
    }

    if (!isEdit && !form.coverImage?.url) {
      alert('Cover image wajib diupload');
      return;
    }

    setSaving(true);
    try {
      const finalizeStaged = async (fileObj, folder) => {
        if (!fileObj) return null;
        if (!fileObj?.tempId || !fileObj?.isStaged) return fileObj;

        const result = await apiFinalizeUpload(fileObj.tempId, folder);
        const url = result?.url || result?.fileUrl || result;
        if (!url) throw new Error('Upload berhasil tapi URL tidak tersedia');

        return {
          name: result?.name || fileObj.name,
          url,
          type: result?.mimeType || fileObj.type,
          size: result?.size || fileObj.size,
        };
      };

      const finalizeMany = async (items, folder) => {
        const list = Array.isArray(items) ? items : [];
        return Promise.all(list.map((it) => finalizeStaged(it, folder)));
      };

      const cover = await finalizeStaged(form.coverImage, 'activities/covers');
      const photos = await finalizeMany(form.photos, 'activities/photos');
      const documents = await finalizeMany(form.documents, 'activities/documents');

      const payload = {
        title: form.title,
        description: form.description,
        coverImage: cover?.url || null,
        startDate: form.date || null,
        status: form.category === 'proker' ? 'DRAFT' : 'PLANNED',
        attachments: { photos, documents, links: form.links || [] },
      };

      if (isEdit && params.id) {
        await apiPatch(`/activities/${params.id}`, payload);
      } else {
        await apiPost('/activities', payload);
      }

      // Update local state with finalized URLs so user doesn't see temp URLs after save
      setForm((s) => ({ ...s, coverImage: cover, photos, documents }));
      navigate('/aktivitas');
    } catch (err) {
      alert(err.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const removePhoto = (index) => {
    setForm((s) => ({ ...s, photos: s.photos.filter((_, i) => i !== index) }));
  };

  const removeDocument = (index) => {
    setForm((s) => ({ ...s, documents: s.documents.filter((_, i) => i !== index) }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-6">
      <nav className="mb-4 flex items-center text-sm text-neutral-600">
        <Link to="/dashboard" className="hover:text-neutral-800 hover:underline">
          Dashboard
        </Link>
        <ChevronRight className="mx-2 h-4 w-4 text-neutral-400" />
        <Link to="/aktivitas" className="hover:text-neutral-800 hover:underline">
          Aktivitas
        </Link>
        <ChevronRight className="mx-2 h-4 w-4 text-neutral-400" />
        <span className="font-medium text-neutral-800">{isEdit ? 'Edit Aktivitas' : 'Tambah Aktivitas'}</span>
      </nav>

      <h2 className="mt-2 text-xl md:text-2xl font-semibold">Event dan Proker</h2>

      <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Kategori"
            value={form.category}
            onChange={update('category')}
            placeholder="Pilih kategori Aktivitas"
            options={[
              { value: 'event', label: 'Event' },
              { value: 'proker', label: 'Proker' },
            ]}
          />

          <div />
          <Input label="Judul" value={form.title} onChange={update('title')} placeholder="Tuliskan Nama kegiatan" className="md:col-span-2" />

          <Input label="Tema" value={form.theme} onChange={update('theme')} placeholder="Tuliskan Tema kegiatan" />
          <Input label="Tanggal Publikasi" type="date" value={form.date} onChange={update('date')} placeholder="dd/mm/yyyy" />

          <div className="md:col-span-2">
            <RichTextEditor label="Deskripsi" value={form.description} onChange={(html) => setForm((s) => ({ ...s, description: html }))} placeholder="Tuliskan deskripsi kegiatan..." />
          </div>
        </div>

        <div className="mt-6">
          <CoverUpload label="Cover Image" value={form.coverImage} onChange={(v) => setForm((s) => ({ ...s, coverImage: v }))} className="" useStaging />
          {!isEdit && !form.coverImage?.url && <p className="mt-2 text-xs text-neutral-500">Cover wajib diisi untuk aktivitas baru.</p>}
        </div>

        <div className="mt-6 border-t border-neutral-200 pt-6">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">Lampiran</h3>

          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setForm((s) => ({ ...s, attachmentType: s.attachmentType === 'foto' ? '' : 'foto' }))}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                form.attachmentType === 'foto' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <Image className="w-4 h-4" />
              Foto
              {form.photos.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-primary-500 text-white text-xs rounded-full">{form.photos.length}</span>}
            </button>
            <button
              type="button"
              onClick={() => setForm((s) => ({ ...s, attachmentType: s.attachmentType === 'dokumen' ? '' : 'dokumen' }))}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                form.attachmentType === 'dokumen' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Dokumen
              {form.documents.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-primary-500 text-white text-xs rounded-full">{form.documents.length}</span>}
            </button>
            <button
              type="button"
              onClick={() => setForm((s) => ({ ...s, attachmentType: s.attachmentType === 'tautan' ? '' : 'tautan' }))}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                form.attachmentType === 'tautan' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              Tautan
              {form.links.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-primary-500 text-white text-xs rounded-full">{form.links.length}</span>}
            </button>
          </div>

          {form.attachmentType === 'foto' && (
            <div className="space-y-4">
              <FileUpload
                accept="image/*"
                multiple
                folder="activities/photos"
                useStaging
                value={form.photos}
                onChange={(files) => setForm((s) => ({ ...s, photos: files }))}
                placeholder="Seret foto kegiatan ke sini atau klik untuk memilih"
                maxSize={10 * 1024 * 1024}
              />
            </div>
          )}

          {form.attachmentType === 'dokumen' && (
            <div className="space-y-4">
              <FileUpload
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                multiple
                folder="activities/documents"
                useStaging
                value={form.documents}
                onChange={(files) => setForm((s) => ({ ...s, documents: files }))}
                placeholder="Seret dokumen ke sini atau klik untuk memilih"
                maxSize={20 * 1024 * 1024}
              />
            </div>
          )}

          {form.attachmentType === 'tautan' && <LinkInput value={form.links} onChange={(links) => setForm((s) => ({ ...s, links }))} />}

          {!form.attachmentType && (form.photos.length > 0 || form.documents.length > 0 || form.links.length > 0) && (
            <div className="space-y-4">
              {form.photos.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-neutral-700 mb-2">Foto ({form.photos.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {form.photos.map((photo, i) => (
                      <div key={i} className="relative group">
                        <img src={photo.url} alt={photo.name} className="w-20 h-20 object-cover rounded-lg border border-neutral-200" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {form.documents.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-neutral-700 mb-2">Dokumen ({form.documents.length})</p>
                  <div className="space-y-2">
                    {form.documents.map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-neutral-50 rounded-lg">
                        <FileText className="w-5 h-5 text-neutral-500" />
                        <span className="flex-1 text-sm truncate">{doc.name}</span>
                        <button type="button" onClick={() => removeDocument(i)} className="p-1 hover:bg-red-50 text-red-500 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {form.links.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-neutral-700 mb-2">Tautan ({form.links.length})</p>
                  <div className="space-y-2">
                    {form.links.map((link, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-neutral-50 rounded-lg">
                        <LinkIcon className="w-4 h-4 text-primary-500" />
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-primary-600 hover:underline truncate">
                          {link.url}
                        </a>
                        <button type="button" onClick={() => setForm((s) => ({ ...s, links: s.links.filter((_, idx) => idx !== i) }))} className="p-1 hover:bg-red-50 text-red-500 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!form.attachmentType && form.photos.length === 0 && form.documents.length === 0 && form.links.length === 0 && (
            <div className="text-center py-8 text-neutral-400">
              <Plus className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Klik tombol di atas untuk menambahkan lampiran</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Link to="/aktivitas" className="btn-outline-primary px-4 py-2">
            Batal
          </Link>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Simpan Perubahan' : 'Unggah Aktivitas'}
          </button>
        </div>
      </form>
    </div>
  );
}
