import { useEffect, useState } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import FileUpload, { LinkInput } from '../components/ui/FileUpload';
import { ChevronRight, Image, FileText, Link as LinkIcon, X, Plus, Loader2 } from 'lucide-react';

export default function ActivityForm({ mode: modeProp }) {
  const params = useParams(); // /aktivitas/:id/edit
  const { state } = useLocation(); // ← data dari Link state (event/proker)
  const navigate = useNavigate();

  // Tentukan mode
  const mode = modeProp ?? (params.id ? 'edit' : 'create');
  const isEdit = mode === 'edit';

  const [form, setForm] = useState({
    category: '',
    title: '',
    theme: '',
    date: '',
    description: '',
    attachmentType: '', // 'foto', 'dokumen', 'tautan'
    photos: [],
    documents: [],
    links: [],
  });
  const [saving, setSaving] = useState(false);

  const update = (k) => (eOrV) => setForm((s) => ({ ...s, [k]: eOrV?.target ? eOrV.target.value : eOrV }));

  // PREFILL: ambil dari state.event / state.proker (atau state.activity jika ada)
  useEffect(() => {
    if (!isEdit) return;
    const payload = state?.activity || state?.event || state?.proker;
    if (payload) {
      setForm({
        category: payload.type || '', // 'event' | 'proker'
        title: payload.title || '',
        theme: payload.theme || '',
        date: payload.date || '', // format YYYY-MM-DD cocok utk <input type="date">
        description: payload.description || '',
        attachmentType: '',
        photos: payload.photos || [],
        documents: payload.documents || [],
        links: payload.links || [],
      });
    } else {
      // Jika user reload langsung halaman edit, state akan kosong (biarkan kosong).
      console.warn('Tidak ada data di location.state; form edit tidak diprefill.');
    }
  }, [isEdit, state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.category) {
      alert('Judul dan Kategori wajib diisi');
      return;
    }
    setSaving(true);
    try {
      // TODO: Call API to save
      console.log('Submitting:', form);
      await new Promise((r) => setTimeout(r, 1000)); // Simulated delay
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

          <Textarea label="Deskripsi" value={form.description} onChange={update('description')} placeholder="Tuliskan Deskripsi kegiatan" className="md:col-span-2" />
        </div>

        {/* Lampiran Section */}
        <div className="mt-6 border-t border-neutral-200 pt-6">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">Lampiran</h3>

          {/* Attachment Type Tabs */}
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

          {/* Attachment Content */}
          {form.attachmentType === 'foto' && (
            <div className="space-y-4">
              <FileUpload
                accept="image/*"
                multiple
                folder="activities/photos"
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
                value={form.documents}
                onChange={(files) => setForm((s) => ({ ...s, documents: files }))}
                placeholder="Seret dokumen ke sini atau klik untuk memilih"
                maxSize={20 * 1024 * 1024}
              />
            </div>
          )}

          {form.attachmentType === 'tautan' && <LinkInput value={form.links} onChange={(links) => setForm((s) => ({ ...s, links }))} />}

          {/* Preview of all attachments when none selected */}
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

          {/* Empty state */}
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
