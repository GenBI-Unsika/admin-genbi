import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import RichTextEditor from '../components/ui/RichTextEditor';
import FileUpload, { CoverUpload, LinkInput } from '../components/ui/FileUpload';
import { Image, FileText, Link as LinkIcon, X, Plus, Loader2, ArrowLeft } from 'lucide-react';
import { apiUpload } from '../utils/api';

export default function ArticleForm({ mode = 'create' }) {
  void mode;
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    publishDate: '',
    description: '',
    cover: null,
    attachmentType: '',
    photos: [],
    documents: [],
    links: [],
  });

  const update = (k) => (eOrV) => setForm((s) => ({ ...s, [k]: eOrV?.target ? eOrV.target.value : eOrV }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Judul artikel wajib diisi');
      return;
    }
    setSaving(true);
    try {
      const uploadLocal = async (fileObj, folder) => {
        if (!fileObj?.isLocal) return fileObj;
        const file = fileObj?.file;
        if (!(file instanceof File)) return fileObj;

        const result = await apiUpload('/upload', file, { folder });
        const url = result?.url || result?.fileUrl || result;
        if (!url) throw new Error('Upload berhasil tapi URL tidak tersedia');

        return {
          name: file.name,
          url,
          type: file.type,
          size: file.size,
        };
      };

      const cover = await uploadLocal(form.cover, 'covers');
      const photos = await Promise.all((form.photos || []).map((p) => uploadLocal(p, 'articles/photos')));
      const documents = await Promise.all((form.documents || []).map((d) => uploadLocal(d, 'articles/documents')));

      const submittedForm = {
        ...form,
        cover,
        photos,
        documents,
      };

      setForm(submittedForm);

      // TODO: Call API to save
      console.log('Submitting:', submittedForm);
      await new Promise((r) => setTimeout(r, 1000));
      navigate('/artikel');
    } catch (err) {
      alert(err.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-6 md:px-10 py-6">
      <Link to="/artikel" className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-800 mb-4">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Artikel
      </Link>
      <h2 className="text-xl md:text-2xl font-semibold">{mode === 'edit' ? 'Edit Artikel' : 'Tulis Artikel Baru'}</h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Basic Info Card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 md:p-6">
          <Input label="Judul Artikel" value={form.title} onChange={update('title')} placeholder="Tuliskan judul artikel yang menarik" className="mb-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cover Upload with Drag & Drop */}
            <CoverUpload label="Cover Artikel" value={form.cover} onChange={(cover) => setForm((s) => ({ ...s, cover }))} deferUpload />

            <div className="space-y-4">
              <Input label="Tanggal Publikasi" type="date" value={form.publishDate} onChange={update('publishDate')} />
              <p className="text-xs text-neutral-500">Kosongkan untuk menyimpan sebagai draft. Isi tanggal untuk menjadwalkan publikasi.</p>
            </div>
          </div>
        </div>

        {/* Content Editor Card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 md:p-6">
          <RichTextEditor
            label="Konten Artikel"
            value={form.description}
            onChange={(html) => setForm((s) => ({ ...s, description: html }))}
            placeholder="Mulai menulis konten artikel Anda di sini. Gunakan toolbar untuk memformat teks dan menyisipkan gambar..."
          />
          <p className="mt-2 text-xs text-neutral-500">💡 Tips: Klik tombol gambar di toolbar untuk menyisipkan foto. File akan di-upload otomatis.</p>
        </div>

        {/* Attachments Card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 md:p-6">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">Lampiran Tambahan</h3>

          {/* Attachment Type Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
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
            <FileUpload
              accept="image/*"
              multiple
              folder="articles/photos"
              deferUpload
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
              deferUpload
              value={form.documents}
              onChange={(files) => setForm((s) => ({ ...s, documents: files }))}
              placeholder="Seret dokumen ke sini atau klik untuk memilih"
              maxSize={20 * 1024 * 1024}
            />
          )}

          {form.attachmentType === 'tautan' && <LinkInput value={form.links} onChange={(links) => setForm((s) => ({ ...s, links }))} />}

          {/* Preview of attachments */}
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

          {/* Empty state */}
          {!form.attachmentType && form.photos.length === 0 && form.documents.length === 0 && form.links.length === 0 && (
            <div className="text-center py-6 text-neutral-400">
              <Plus className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm">Klik tombol di atas untuk menambahkan lampiran</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link to="/artikel" className="btn-outline-primary px-4 py-2">
            Batal
          </Link>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'edit' ? 'Simpan Perubahan' : 'Publikasikan Artikel'}
          </button>
        </div>
      </form>
    </div>
  );
}
