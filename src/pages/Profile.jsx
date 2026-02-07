import { useEffect, useMemo, useState } from 'react';
import { Camera, Loader2, Save } from 'lucide-react';
import Avatar from '../components/Avatar';
import { apiPatch, apiUpload, authRefresh, fetchMe } from '../utils/api';
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

  const [form, setForm] = useState({
    name: '',
    npm: '',
    phone: '',
    motivasi: '',
    avatar: '',
  });

  const roleLabel = useMemo(() => {
    const r = String(me?.role || '')
      .replace(/_/g, ' ')
      .trim();
    return r ? r : '-';
  }, [me?.role]);

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
      setForm({
        name: next?.profile?.name || next?.name || '',
        npm: next?.profile?.npm || '',
        phone: next?.profile?.phone || '',
        motivasi: next?.profile?.motivasi || '',
        avatar: next?.profile?.avatar || next?.avatar || '',
      });
    } catch (e) {
      setError(e?.message || 'Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

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
      // Back-compat: admin-genbi uses /upload (server now aliases to /files)
      const uploaded = await apiUpload('/upload', file, { folder: 'avatars' });
      const url = uploaded?.url || uploaded?.data?.url || '';
      if (!url) throw new Error('Upload berhasil, tapi foto belum bisa dipakai. Coba ulangi sebentar lagi.');
      setForm((s) => ({ ...s, avatar: url }));
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
      description: 'Perubahan akan tersimpan ke akun Anda dan dipakai di aplikasi GenBI.',
      confirmText: 'Simpan',
      cancelText: 'Batal',
    });
    if (!ok) return;

    setSaving(true);
    setError(null);
    try {
      await apiPatch('/me/profile', {
        name: form.name?.trim() || null,
        npm: form.npm?.trim() || null,
        phone: form.phone?.trim() || null,
        motivasi: form.motivasi?.trim() || null,
        avatar: form.avatar?.trim() || null,
      });

      // refresh layout header/avatar in AdminLayout
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
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-2 text-neutral-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Memuat profil...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-neutral-900">Profil</h1>
        <p className="mt-1 text-sm text-neutral-500">Atur data diri dan foto profil Anda di sini.</p>
      </div>

      {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar name={form.name || me?.email || 'User'} src={form.avatar || ''} size={64} />
              <label
                className={`absolute -bottom-1 -right-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm cursor-pointer hover:bg-neutral-50 ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
                title="Ganti avatar"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin text-neutral-600" /> : <Camera className="h-4 w-4 text-neutral-700" />}
                <input type="file" accept="image/*" className="hidden" onChange={(ev) => onPickAvatar(ev.target.files?.[0])} />
              </label>
            </div>

            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-neutral-900">{form.name || 'Nama belum diisi'}</div>
              <div className="truncate text-sm text-neutral-500">{me?.email || '-'}</div>
              <div className="mt-1 inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700 capitalize">{roleLabel}</div>
            </div>
          </div>
        </div>

        <form onSubmit={onSave} className="mt-6 grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Nama Lengkap</label>
            <input
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
              placeholder="Nama lengkap"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-700">NPM</label>
              <input
                value={form.npm}
                onChange={(e) => setForm((s) => ({ ...s, npm: e.target.value }))}
                className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
                placeholder="(opsional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">No. HP</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
                placeholder="08xxxxxxxxxx (opsional)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">Motivasi / Kata-kata</label>
            <textarea
              value={form.motivasi}
              onChange={(e) => setForm((s) => ({ ...s, motivasi: e.target.value }))}
              rows={3}
              maxLength={200}
              className="mt-2 w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
              placeholder="(opsional)"
            />
            <div className="mt-1 text-xs text-neutral-500">{String(form.motivasi || '').length}/200</div>
          </div>

          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
