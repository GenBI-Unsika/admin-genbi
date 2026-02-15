import { useEffect, useMemo, useState } from 'react';
import { Camera, Loader2, Save, ChevronDown } from 'lucide-react';
import Avatar from '../components/Avatar';
import { apiPatch, apiUploadStaging, getTempPreviewUrl, authRefresh, fetchMe, apiGet } from '../utils/api';
import { fetchMeViaTrpc } from '../utils/me';
import { useConfirm } from '../contexts/ConfirmContext.jsx';

function normalizeMe(raw) {
  const base = raw?.data ?? raw;
  const maybeUser = base?.user ?? base;
  const profile = maybeUser?.profile ?? base?.profile ?? null;

  const name = maybeUser?.name || profile?.name || maybeUser?.email?.split?.('@')?.[0] || '';
  const avatar = maybeUser?.avatar || maybeUser?.photo || maybeUser?.picture || maybeUser?.image || profile?.avatar || '';
  const role = maybeUser?.role || '';
  const email = maybeUser?.email || '';

  return { ...maybeUser, profile, name, avatar, role, email };
}

export default function Profile() {
  const { confirm } = useConfirm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const [me, setMe] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [studyPrograms, setStudyPrograms] = useState([]);
  const [divisions, setDivisions] = useState([]);

  const [form, setForm] = useState({
    name: '',
    npm: '',
    phone: '',
    gender: '',
    birthDate: '',
    facultyId: '',
    studyProgramId: '',
    semester: '',
    jabatan: '',
    divisionId: '',
    instagram: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
    avatar: '',
    avatarTempId: '',
  });

  const roleLabel = useMemo(() => {
    const r = String(me?.role || '')
      .replace(/_/g, ' ')
      .trim();
    return r ? r : '-';
  }, [me?.role]);

  // Fetch functions
  const fetchMasterData = async () => {
    try {
      const [facultiesRes, divisionsRes] = await Promise.all([
        apiGet('/master-data/faculties'),
        apiGet('/divisions/admin/all')
      ]);
      setFaculties(facultiesRes.data || facultiesRes || []);
      setDivisions(divisionsRes.data || divisionsRes || []);
    } catch (err) {
      // Error fetching master data
    }
  };

  const loadMe = async () => {
    setLoading(true);
    setError(null);
    try {
      let raw;
      try {
        raw = await fetchMeViaTrpc();
      } catch {
        try {
          await authRefresh();
          raw = await fetchMeViaTrpc();
        } catch {
          raw = await fetchMe();
        }
      }

      const next = normalizeMe(raw);
      setMe(next);

      const p = next?.profile || {};
      const socials = p.socials || {};

      setForm({
        name: p.name || next?.name || '',
        npm: p.npm || '',
        phone: p.phone || '',
        gender: p.gender || '',
        birthDate: p.birthDate ? new Date(p.birthDate).toISOString().split('T')[0] : '',
        facultyId: p.facultyId || '',
        studyProgramId: p.studyProgramId || '',
        semester: p.semester || '',
        jabatan: p.jabatan || '',
        divisionId: p.divisionId || '',
        instagram: socials.instagram || '',
        bankName: p.bankName || '',
        bankAccountNumber: p.bankAccountNumber || '',
        bankAccountName: p.bankAccountName || '',
        avatar: p.avatar || next?.avatar || '',
        avatarTempId: '',
      });

    } catch (e) {
      setError(e?.message || 'Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterData().then(loadMe);
  }, []);

  // Update study programs when faculty changes or initially loaded
  useEffect(() => {
    if (form.facultyId && faculties.length > 0) {
      const faculty = faculties.find((f) => f.id === parseInt(form.facultyId));
      setStudyPrograms(faculty?.studyPrograms || []);
    } else {
      setStudyPrograms([]);
    }
  }, [form.facultyId, faculties]);


  const onPickAvatar = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('File avatar harus berupa gambar.');
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError('Ukuran avatar maksimal 2MB.');
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const result = await apiUploadStaging(file);
      const previewUrl = result?.previewUrl || getTempPreviewUrl(result?.tempId);
      const tempId = result?.tempId;

      if (!tempId) throw new Error('Upload berhasil, tapi foto belum bisa dipakai. Coba ulangi sebentar lagi.');

      setForm((s) => ({
        ...s,
        avatar: previewUrl,
        avatarTempId: tempId,
      }));
    } catch (e) {
      setError(e?.message || 'Gagal upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();

    const ok = await confirm({
      title: 'Simpan perubahan profil?',
      description: 'Perubahan akan tersimpan ke akun Anda.',
      confirmText: 'Simpan',
      cancelText: 'Batal',
    });
    if (!ok) return;

    setSaving(true);
    setError(null);
    try {
      const socials = {
        instagram: form.instagram,
      };

      const payload = {
        name: form.name?.trim() || null,
        npm: form.npm?.trim() || null,
        phone: form.phone?.trim() || null,
        gender: form.gender || null,
        birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : null,
        facultyId: form.facultyId ? parseInt(form.facultyId) : null,
        studyProgramId: form.studyProgramId ? parseInt(form.studyProgramId) : null,
        semester: form.semester ? parseInt(form.semester) : null,
        jabatan: form.jabatan?.trim() || null,
        divisionId: form.divisionId ? parseInt(form.divisionId) : null,
        socials,
        bankName: form.bankName?.trim() || null,
        bankAccountNumber: form.bankAccountNumber?.trim() || null,
        bankAccountName: form.bankAccountName?.trim() || null,
      };

      if (form.avatarTempId) {
        payload.avatarTempId = form.avatarTempId;
      } else {
        payload.avatar = form.avatar?.trim() || null;
      }

      await apiPatch('/me/profile', payload);

      window.dispatchEvent(new CustomEvent('me:updated'));
      await loadMe();
    } catch (e2) {
      setError(e2?.message || 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-100 bg-white p-6">
        <div className="flex items-center gap-2 text-neutral-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Memuat profil...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Profil Saya</h1>
        <p className="mt-1 text-sm text-neutral-500">Atur data diri dan foto profil Anda di sini.</p>
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="rounded-2xl border border-neutral-100 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar name={form.name || me?.email || 'User'} src={form.avatar || ''} size={80} />
              <label
                className={`absolute -bottom-1 -right-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-100 bg-white shadow-sm cursor-pointer hover:bg-neutral-50 ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
                title="Ganti avatar"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin text-neutral-600" /> : <Camera className="h-4 w-4 text-neutral-700" />}
                <input type="file" accept="image/*" className="hidden" onChange={(ev) => onPickAvatar(ev.target.files?.[0])} />
              </label>
            </div>

            <div className="min-w-0">
              <div className="truncate text-lg font-semibold text-neutral-900">{form.name || 'Nama belum diisi'}</div>
              <div className="truncate text-sm text-neutral-500">{me?.email || '-'}</div>
              <div className="mt-1 inline-flex items-center rounded-full border border-neutral-100 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700 capitalize">{roleLabel}</div>
            </div>
          </div>
        </div>

        <form onSubmit={onSave} className="space-y-8">

          {/* Informasi Dasar */}
          <div>
            <h3 className="text-base font-medium text-neutral-900 mb-4">Informasi Dasar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Nama Lengkap</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
                  placeholder="Nama lengkap"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">No. HP</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Jenis Kelamin</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-neutral-200/60 bg-white px-3 py-2 pr-9 text-sm outline-none focus:border-primary-500"
                    value={form.gender}
                    onChange={(e) => setForm((s) => ({ ...s, gender: e.target.value }))}
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tanggal Lahir</label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => setForm((s) => ({ ...s, birthDate: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Data Akademik */}
          <div>
            <h3 className="text-base font-medium text-neutral-900 mb-4">Data Akademik</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">NPM</label>
                <input
                  value={form.npm}
                  onChange={(e) => setForm((s) => ({ ...s, npm: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200/60 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
                  placeholder="NPM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Semester</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-neutral-200/60 bg-white px-3 py-2 pr-9 text-sm outline-none focus:border-primary-500"
                    value={form.semester}
                    onChange={(e) => setForm((s) => ({ ...s, semester: e.target.value }))}
                  >
                    <option value="">Pilih Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((v) => (
                      <option key={v} value={v}>Semester {v}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Fakultas</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-neutral-200/60 bg-white px-3 py-2 pr-9 text-sm outline-none focus:border-primary-500"
                    value={form.facultyId}
                    onChange={(e) => setForm((s) => ({ ...s, facultyId: e.target.value, studyProgramId: '' }))}
                  >
                    <option value="">Pilih Fakultas</option>
                    {faculties.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Program Studi</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-neutral-200/60 bg-white px-3 py-2 pr-9 text-sm outline-none focus:border-primary-500 disabled:bg-neutral-100"
                    value={form.studyProgramId}
                    onChange={(e) => setForm((s) => ({ ...s, studyProgramId: e.target.value }))}
                    disabled={!form.facultyId}
                  >
                    <option value="">Pilih Program Studi</option>
                    {studyPrograms.map(sp => (
                      <option key={sp.id} value={sp.id}>{sp.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Keorganisasian & Bio */}
          <div>
            <h3 className="text-base font-medium text-neutral-900 mb-4">Keorganisasian & Bio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Jabatan</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-neutral-200/60 bg-white px-3 py-2 pr-9 text-sm outline-none focus:border-primary-500"
                    value={form.jabatan}
                    onChange={(e) => setForm((s) => ({ ...s, jabatan: e.target.value }))}
                  >
                    <option value="">Pilih Jabatan</option>
                    {[
                      'Ketua Umum',
                      'Sekretaris Umum 1',
                      'Sekretaris Umum 2',
                      'Bendahara Umum 1',
                      'Bendahara Umum 2',
                      'Koordinator',
                      'Sekretaris',
                      'Bendahara',
                      'Staff'
                    ].map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Divisi</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-9 text-sm outline-none focus:border-primary-500"
                    value={form.divisionId}
                    onChange={(e) => setForm((s) => ({ ...s, divisionId: e.target.value }))}
                  >
                    <option value="">Pilih Divisi</option>
                    {divisions.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>
            </div>

          </div>

          {/* Media Sosial */}
          <div>
            <h3 className="text-base font-medium text-neutral-900 mb-4">Media Sosial</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Instagram</label>
                <input
                  value={form.instagram}
                  onChange={(e) => setForm((s) => ({ ...s, instagram: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
                  placeholder="@username"
                />
              </div>
            </div>
          </div>

          {/* Data Bank */}
          <div>
            <h3 className="text-base font-medium text-neutral-900 mb-4">Data Rekening Bank</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Nama Bank</label>
                <input
                  value={form.bankName}
                  onChange={(e) => setForm((s) => ({ ...s, bankName: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
                  placeholder="Contoh: BRI, BNI"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">No. Rekening</label>
                <input
                  value={form.bankAccountNumber}
                  onChange={(e) => setForm((s) => ({ ...s, bankAccountNumber: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
                  placeholder="Nomor rekening"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Atas Nama</label>
                <input
                  value={form.bankAccountName}
                  onChange={(e) => setForm((s) => ({ ...s, bankAccountName: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
                  placeholder="Nama pemilik rekening"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 border-t border-neutral-100 pt-6">
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
