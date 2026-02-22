import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Input from '../components/ui/Input';
import RichTextEditor from '../components/ui/RichTextEditor';
import FileUpload, { LinkInput } from '../components/ui/FileUpload';
import CoverUpload from '../components/ui/CoverUpload';
import { Image, FileText, Link as LinkIcon, X, Plus, Loader2, ArrowLeft } from 'lucide-react';
import { apiPost, apiPatch, apiGet } from '../utils/api';
import { useFormDraft } from '../utils/useFormDraft';

export default function ArticleForm({ mode = 'create' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(mode === 'edit');
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const draftRestoredRef = useRef(false);

  const draftKey = mode === 'create' ? 'article-create' : null;
  const { restoreDraft, saveDraft, clearDraft, getDraftAge } = useFormDraft(draftKey || '__noop__');

  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    publishDate: '',
    description: '',
    cover: null,
    attachmentType: '',
    photos: [],
    documents: [],
    links: [],
  });

  useEffect(() => {
    if (mode === 'edit' && id) {
      setLoading(true);
      apiGet(`/articles/${id}`)
        .then((article) => {
          setForm({
            title: article.title || '',
            excerpt: article.excerpt || '',
            publishDate: article.publishedAt ? article.publishedAt.slice(0, 10) : '',
            description: article.content || '',
            cover: article.coverImage ? { url: article.coverImage, name: 'cover' } : null,
            attachmentType: '',
            photos: article.attachments?.photos || [],
            documents: article.attachments?.documents || [],
            links: article.attachments?.links || [],
          });
        })
        .catch((err) => {
          alert('Gagal memuat data artikel');
          navigate('/artikel');
        })
        .finally(() => setLoading(false));
    }
  }, [mode, id, navigate]);

  useEffect(() => {
    if (mode !== 'create' || draftRestoredRef.current) return;
    draftRestoredRef.current = true;
    const draft = restoreDraft();
    if (draft?.form) {
      setForm((prev) => ({ ...prev, ...draft.form }));
      setShowDraftBanner(true);
    }
  }, [mode, restoreDraft]);

  useEffect(() => {
    if (mode !== 'create' || saving) return;
    saveDraft({ form });
  }, [form, mode, saving, saveDraft]);

  const update = (k) => (eOrV) => setForm((s) => ({ ...s, [k]: eOrV?.target ? eOrV.target.value : eOrV }));

  const handleSubmit = async (e, forcedStatus) => {
    if (e) e.preventDefault();

    if (!form.title.trim()) {
      alert('Judul artikel wajib diisi');
      return;
    }
    setSaving(true);
    try {
      let status = 'DRAFT';
      if (forcedStatus) {
        status = forcedStatus;
      } else {
        status = form.publishDate ? 'PUBLISHED' : 'DRAFT';
      }

      const payload = {
        title: form.title,
        excerpt: form.excerpt,
        content: form.description,
        status: status,
      };

      if (status === 'PUBLISHED') {
        if (!form.publishDate) {
          payload.publishedAt = new Date().toISOString();
        }
      }

      if (form.cover?.tempId) {
        payload.coverImageTempId = form.cover.tempId;
      } else if (form.cover?.url && !form.cover?.isLocal) {
        payload.coverImage = form.cover.url;
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
        links: form.links,
      };

      if (mode === 'edit' && id) {
        await apiPatch(`/articles/${id}`, payload);
      } else {
        await apiPost('/articles', payload);
      }
      clearDraft();
      navigate('/artikel');
    } catch (err) {
      alert(err.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-6 md:px-10 py-6">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          <Link to="/artikel" className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-800 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Artikel
          </Link>
          <h2 className="text-xl md:text-2xl font-semibold">{mode === 'edit' ? 'Edit Artikel' : 'Tulis Artikel Baru'}</h2>

          {showDraftBanner && mode === 'create' && (
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
                    setForm({ title: '', excerpt: '', publishDate: '', description: '', cover: null, attachmentType: '', photos: [], documents: [], links: [] });
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

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 md:p-6">
              <Input label="Judul Artikel" value={form.title} onChange={update('title')} placeholder="Tuliskan judul artikel yang menarik" className="mb-4" />

              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Ringkasan (Excerpt)</label>
                <textarea
                  value={form.excerpt}
                  onChange={update('excerpt')}
                  rows={3}
                  className="w-full rounded-lg border border-neutral-200 p-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                  placeholder="Tulis ringkasan singkat artikel ini untuk ditampilkan di kartu..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CoverUpload label="Cover Artikel" value={form.cover} onChange={(cover) => setForm((s) => ({ ...s, cover }))} useStaging />

                <div className="space-y-4">
                  <Input label="Tanggal Publikasi" type="date" value={form.publishDate} onChange={update('publishDate')} />
                  <p className="text-xs text-neutral-500">Kosongkan untuk menyimpan sebagai draft. Isi tanggal untuk menjadwalkan publikasi.</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4 md:p-6">
              <RichTextEditor
                label="Konten Artikel"
                value={form.description}
                onChange={(html) => setForm((s) => ({ ...s, description: html }))}
                placeholder="Mulai menulis konten artikel Anda di sini. Gunakan toolbar untuk memformat teks dan menyisipkan gambar..."
              />
              <p className="mt-2 text-xs text-neutral-500">💡 Tips: Klik tombol gambar di toolbar untuk menyisipkan foto. File akan di-upload otomatis.</p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4 md:p-6">
              <h3 className="text-base font-semibold text-neutral-900 mb-4">Lampiran Tambahan</h3>

              <div className="flex flex-wrap gap-2 mb-4">
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
                <FileUpload
                  accept="image/*"
                  multiple
                  folder="articles/photos"
                  useStaging
                  value={form.photos}
                  onChange={(files) => setForm((s) => ({ ...s, photos: files }))}
                  placeholder="Seret foto ke sini atau klik untuk memilih"
                  maxSize={10 * 1024 * 1024}
                />
              )}

              {form.attachmentType === 'dokumen' && (
                <FileUpload
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  multiple
                  folder="articles/documents"
                  useStaging
                  value={form.documents}
                  onChange={(files) => setForm((s) => ({ ...s, documents: files }))}
                  placeholder="Seret dokumen ke sini atau klik untuk memilih"
                  maxSize={20 * 1024 * 1024}
                />
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
                              onClick={() => setForm((s) => ({ ...s, photos: s.photos.filter((_, idx) => idx !== i) }))}
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
                            <button type="button" onClick={() => setForm((s) => ({ ...s, documents: s.documents.filter((_, idx) => idx !== i) }))} className="p-1 hover:bg-red-50 text-red-500 rounded">
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
                <div className="text-center py-6 text-neutral-400">
                  <Plus className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm">Klik tombol di atas untuk menambahkan lampiran</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Link to="/artikel" className="btn-outline-primary px-4 py-2">
                Batal
              </Link>

              <button
                type="button"
                disabled={saving}
                onClick={(e) => {
                  setForm((s) => ({ ...s, publishDate: '' }));
                  handleSubmit(e, 'DRAFT');
                }}
                className="px-4 py-2 rounded-lg border border-neutral-200 text-neutral-600 font-medium hover:bg-neutral-50 transition-colors flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan Draft
              </button>

              <button type="button" disabled={saving} onClick={(e) => handleSubmit(e, 'PUBLISHED')} className="btn-primary flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === 'edit' && form.publishDate ? 'Simpan Perubahan' : 'Publikasikan Sekarang'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
