import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import FileUpload, { LinkInput } from '../components/ui/FileUpload';
import CoverUpload from '../components/ui/CoverUpload';
import { ChevronRight, Image, FileText, Link as LinkIcon, X, Plus, Loader2, AlertTriangle } from 'lucide-react';
import { apiFinalizeUpload, apiPost, apiPatch, apiGet } from '../utils/api';
import RichTextEditor from '../components/ui/RichTextEditor';
import { useFormDraft } from '../utils/useFormDraft';

export default function ActivityForm({ mode: modeProp }) {
  const params = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const mode = modeProp ?? (params.id ? 'edit' : 'create');
  const isEdit = mode === 'edit';

  const payloadFromState = useMemo(() => state?.activity || state?.event || state?.proker, [state]);

  const [divisions, setDivisions] = useState([]);
  const [form, setForm] = useState({
    category: '',
    title: '',
    divisionId: '', // Khusus Event aja
    theme: '', // Khusus Proker aja
    startDate: '', // Khusus Event aja
    endDate: '', // Khusus Event aja
    publicationDate: '', // Khusus Proker aja
    location: '', // Khusus Event aja
    description: '',
    benefits: [], // Khusus Event aja
    status: '', // Diset manual statusnya

    coverImage: null,

    photos: [],
    documents: [],
    links: [],
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newBenefit, setNewBenefit] = useState('');
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const draftRestoredRef = useRef(false);

  const draftKey = !isEdit ? 'activity-create' : null;
  const { restoreDraft, saveDraft, clearDraft, getDraftAge } = useFormDraft(draftKey || '__noop__');

  useEffect(() => {
    apiGet('/divisions')
      .then((res) => {
        const items = res.data || res || [];
        setDivisions(items.map((d) => ({ value: d.id, label: d.name })));
      })
      .catch((err) => { /* Error loading divisions */ });
  }, []);

  const update = (k) => (eOrV) => setForm((s) => ({ ...s, [k]: eOrV?.target ? eOrV.target.value : eOrV }));

  useEffect(() => {
    if (!isEdit) return;
    if (payloadFromState) {
      setForm({
        category: payloadFromState.type === 'proker' || payloadFromState.status === 'DRAFT' ? 'proker' : 'event',
        title: payloadFromState.title || '',
        divisionId: payloadFromState.divisionId || '',
        theme: payloadFromState.theme || '',
        startDate: payloadFromState.startDate ? payloadFromState.startDate.slice(0, 16) : '',
        endDate: payloadFromState.endDate ? payloadFromState.endDate.slice(0, 16) : '',
        publicationDate: payloadFromState.publicationDate ? payloadFromState.publicationDate.slice(0, 10) : '',
        location: payloadFromState.location || '',
        description: payloadFromState.description || '',
        benefits: payloadFromState.benefits ? (typeof payloadFromState.benefits === 'string' ? JSON.parse(payloadFromState.benefits) : payloadFromState.benefits) : [],
        status: payloadFromState.status || (payloadFromState.type === 'proker' ? 'DRAFT' : 'PLANNED'),
        coverImage: payloadFromState.coverImage ? { url: payloadFromState.coverImage, name: 'Cover' } : null,
        attachmentType: '',
        photos: payloadFromState.attachments?.photos || [],
        documents: payloadFromState.attachments?.documents || [],
        links: payloadFromState.attachments?.links || [],
      });
    } else if (params.id) {
      setLoading(true);
      apiGet(`/activities/${params.id}`)
        .then((data) => {
          setForm({
            category: data.status === 'DRAFT' ? 'proker' : 'event', // Nilai default jaga-jaga kalo tipenya kosong
            title: data.title || '',
            divisionId: data.divisionId || '',
            theme: data.theme || '',
            startDate: data.startDate ? data.startDate.slice(0, 16) : '',
            endDate: data.endDate ? data.endDate.slice(0, 16) : '',
            publicationDate: data.publicationDate ? data.publicationDate.slice(0, 10) : '',
            location: data.location || '',
            description: data.description || '',
            benefits: data.benefits ? (typeof data.benefits === 'string' ? JSON.parse(data.benefits) : data.benefits) : [],
            status: data.status,
            coverImage: data.coverImage ? { url: data.coverImage, name: 'Cover' } : null,
            attachmentType: '',
            photos: data.attachments?.photos || [],
            documents: data.attachments?.documents || [],
            links: data.attachments?.links || [],
          });
        })
        .catch((err) => {
          alert('Gagal memuat data aktivitas');
        })
        .finally(() => setLoading(false));
    }
  }, [isEdit, payloadFromState, params.id]);

  useEffect(() => {
    if (isEdit || draftRestoredRef.current) return;
    draftRestoredRef.current = true;
    const draft = restoreDraft();
    if (draft?.form) {
      setForm((prev) => ({ ...prev, ...draft.form }));
      setShowDraftBanner(true);
    }
  }, [isEdit, restoreDraft]);

  useEffect(() => {
    if (isEdit || saving) return;
    saveDraft({ form });
  }, [form, isEdit, saving, saveDraft]);

  useEffect(() => {
    if (isEdit) return;
    if (form.category === 'proker') {
      setForm((s) => ({ ...s, status: 'DRAFT' }));
    } else if (form.category === 'event') {
      setForm((s) => ({ ...s, status: 'PLANNED' }));
    }
  }, [form.category, isEdit]);

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
      const payload = {
        title: form.title,
        description: form.description,
        status: form.status, // Pake status yang emg kepilih
      };

      if (form.coverImage?.tempId) {
        payload.coverImageTempId = form.coverImage.tempId;
      } else if (form.coverImage?.url) {
        payload.coverImage = form.coverImage.url;
      }

      const photos = (form.photos || []).map((p) => ({
        name: p.name,
        url: p.url,
        ...(p.tempId ? { tempId: p.tempId } : {}),
        ...(p.fileId ? { fileId: p.fileId } : {}),
      }));

      const documents = (form.documents || []).map((d) => ({
        name: d.name,
        url: d.url,
        ...(d.tempId ? { tempId: d.tempId } : {}),
        ...(d.fileId ? { fileId: d.fileId } : {}),
      }));

      payload.attachments = {
        photos,
        documents,
        links: form.links || [],
      };

      payload.status = form.status;

      if (form.category === 'event') {
        payload.divisionId = form.divisionId ? parseInt(form.divisionId) : null;
        payload.startDate = form.startDate ? new Date(form.startDate).toISOString() : null;
        payload.endDate = form.endDate ? new Date(form.endDate).toISOString() : null;
        payload.location = form.location;
        payload.benefits = form.benefits;
      }

      if (form.category === 'proker') {
        payload.theme = form.theme;
        payload.publicationDate = form.publicationDate ? new Date(form.publicationDate).toISOString() : null;
      }

      if (isEdit && params.id) {
        await apiPatch(`/activities/${params.id}`, payload);
      } else {
        await apiPost('/activities', payload);
      }

      clearDraft();
      navigate('/aktivitas');
    } catch (err) {
      alert(err.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const addBenefit = () => {
    if (!newBenefit.trim()) return;
    setForm((s) => ({ ...s, benefits: [...s.benefits, newBenefit.trim()] }));
    setNewBenefit('');
  };

  const removeBenefit = (index) => {
    setForm((s) => ({ ...s, benefits: s.benefits.filter((_, i) => i !== index) }));
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

      {showDraftBanner && !isEdit && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
          <p className="text-sm text-amber-800">
            <span className="font-medium">Draft tersimpan</span>
            {getDraftAge() && <span className="ml-1 text-amber-600">({getDraftAge()})</span>}— konten sebelumnya dipulihkan.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                clearDraft();
                setShowDraftBanner(false);
                setForm({
                  category: '',
                  title: '',
                  divisionId: '',
                  theme: '',
                  startDate: '',
                  endDate: '',
                  publicationDate: '',
                  location: '',
                  description: '',
                  benefits: [],
                  status: '',
                  coverImage: null,
                  photos: [],
                  documents: [],
                  links: [],
                });
              }}
              className="rounded border border-amber-300 bg-white px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
            >
              Hapus Draft
            </button>
            <button type="button" onClick={() => setShowDraftBanner(false)} className="text-amber-400 hover:text-amber-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 md:p-6">
        {!form.category && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">Pilih kategori terlebih dahulu untuk melanjutkan</p>
          </div>
        )}

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

          <Select
            label="Status"
            value={form.status}
            onChange={update('status')}
            placeholder="Pilih status..."
            options={[
              { value: 'DRAFT', label: 'Draft' },
              { value: 'PLANNED', label: 'Direncanakan (Planned)' },
              { value: 'ONGOING', label: 'Sedang Berjalan (Ongoing)' },
              { value: 'COMPLETED', label: 'Selesai (Completed)' },
              { value: 'CANCELLED', label: 'Dibatalkan (Cancelled)' },
            ]}
          />

          {form.category === 'event' && <Select label="Divisi Penanggung Jawab" value={form.divisionId} onChange={update('divisionId')} placeholder="Pilih divisi..." options={divisions} />}

          {form.category === 'proker' && <Input label="Tema" value={form.theme} onChange={update('theme')} placeholder="Tema program kerja..." />}

          <div className="md:col-span-2">
            <CoverUpload label="Cover Image" value={form.coverImage} onChange={(v) => setForm((s) => ({ ...s, coverImage: v }))} useStaging />
            {!isEdit && !form.coverImage?.url && <p className="mt-2 text-xs text-neutral-500">Cover wajib diisi untuk aktivitas baru.</p>}
          </div>

          <Input label="Judul Kegiatan" value={form.title} onChange={update('title')} placeholder="Nama kegiatan..." className="md:col-span-2" disabled={!form.category} />

          {form.category === 'event' && (
            <>
              <Input label="Lokasi" value={form.location} onChange={update('location')} placeholder="Tempat pelaksanaan (misal: Aula Unsika / Zoom)" className="md:col-span-2" />

              <Input label="Waktu Mulai" type="datetime-local" value={form.startDate} onChange={update('startDate')} />
              <Input label="Waktu Selesai" type="datetime-local" value={form.endDate} onChange={update('endDate')} />
            </>
          )}

          {form.category === 'proker' && <Input label="Tanggal Publikasi" type="date" value={form.publicationDate} onChange={update('publicationDate')} className="md:col-span-2" />}

          {form.category === 'event' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Benefit Peserta</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                  placeholder="Tambah benefit (misal: E-Sertifikat, Snack)"
                  className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200"
                />
                <button type="button" onClick={addBenefit} className="px-3 py-2 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {form.benefits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                      <span>{b}</span>
                      <button type="button" onClick={() => removeBenefit(i)} className="hover:text-red-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="md:col-span-2">
            <RichTextEditor label="Deskripsi" value={form.description} onChange={(html) => setForm((s) => ({ ...s, description: html }))} placeholder="Tuliskan deskripsi kegiatan secara lengkap..." />
          </div>
        </div>

        <div className="mt-6 border-t border-neutral-200 pt-6">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">Lampiran</h3>

          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setForm((s) => ({ ...s, attachmentType: s.attachmentType === 'foto' ? '' : 'foto' }))}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${form.attachmentType === 'foto' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
            >
              <Image className="w-4 h-4" />
              Foto
              {form.photos.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-primary-500 text-white text-xs rounded-full">{form.photos.length}</span>}
            </button>
            <button
              type="button"
              onClick={() => setForm((s) => ({ ...s, attachmentType: s.attachmentType === 'dokumen' ? '' : 'dokumen' }))}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${form.attachmentType === 'dokumen' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
            >
              <FileText className="w-4 h-4" />
              Dokumen
              {form.documents.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-primary-500 text-white text-xs rounded-full">{form.documents.length}</span>}
            </button>
            <button
              type="button"
              onClick={() => setForm((s) => ({ ...s, attachmentType: s.attachmentType === 'tautan' ? '' : 'tautan' }))}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${form.attachmentType === 'tautan' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
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
                  <p className="text-sm font-medium text-neutral-700 mb-2">Dokumentasi Kegiatan ({form.photos.length})</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {form.photos.map((photo, i) => (
                      <div key={i} className="relative group aspect-square">
                        <img src={photo.url} alt={photo.name} className="w-full h-full object-cover rounded-lg border border-neutral-200" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="w-4 h-4" />
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
