import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import { ChevronRight } from 'lucide-react';

export default function ActivityForm({ mode: modeProp }) {
  const params = useParams(); // /aktivitas/:id/edit
  const { state } = useLocation(); // ← data dari Link state (event/proker)

  // Tentukan mode
  const mode = modeProp ?? (params.id ? 'edit' : 'create');
  const isEdit = mode === 'edit';

  const [form, setForm] = useState({
    category: '',
    title: '',
    theme: '',
    date: '',
    description: '',
    attachments: '',
  });

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
        attachments: '',
      });
    } else {
      // Jika user reload langsung halaman edit, state akan kosong (biarkan kosong).
      console.warn('Tidak ada data di location.state; form edit tidak diprefill.');
    }
  }, [isEdit, state]);

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

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 md:p-6">
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

          <Select
            label="Lampiran"
            value={form.attachments}
            onChange={update('attachments')}
            placeholder="Tambahkan Lampiran"
            options={[
              { value: 'foto', label: 'Foto' },
              { value: 'dokumen', label: 'Dokumen' },
              { value: 'tautan', label: 'Tautan' },
            ]}
            className="md:col-span-2"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Link to="/aktivitas" className="btn-outline-primary px-4 py-2">
            Batal
          </Link>
          <button className="btn-primary">{isEdit ? 'Simpan Perubahan' : 'Unggah Aktivitas'}</button>
        </div>
      </div>
    </div>
  );
}
