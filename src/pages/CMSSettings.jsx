import { useState, useEffect, useRef, useCallback } from 'react';
import { Save, Loader2, Image, Type, Layout, Palette, RefreshCw, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { apiGet, apiPatch, apiUpload } from '../utils/api';

const defaultHeroContent = {
  headline: 'Tumbuh dan Berdampak Bagi Sesama Bersama GenBI Unsika',
  subheadline: 'Ayo, daftar Beasiswa GenBI Unsika sekarang dan raih kesempatan untuk mendukung perjalanan akademikmu.',
  ctaText: 'Daftar Sekarang',
  statsText: '500+ penerima manfaat',
  heroImage: '',
};

const defaultAboutContent = {
  title: 'Tentang Kami',
  description:
    'Generasi Baru Indonesia (GenBI) Universitas Singaperbangsa Karawang (UNSIKA) adalah komunitas mahasiswa penerima beasiswa Bank Indonesia yang berkomitmen untuk memberikan kontribusi positif kepada masyarakat. GenBI UNSIKA tidak hanya berfokus pada prestasi akademik, tetapi juga aktif dalam berbagai kegiatan sosial, lingkungan, dan ekonomi. Dengan semangat kolaborasi dan inovasi, kami berusaha menciptakan program-program yang bermanfaat bagi masyarakat luas. Melalui upaya ini, GenBI UNSIKA bertekad menjadi agen perubahan yang inspiratif, membantu membangun masa depan Indonesia yang lebih baik.',
  coverImage: '',
  videoUrl: '',
};

const defaultCtaContent = {
  text: 'Daftar Beasiswa Bank Indonesia Dan Bergabung Menjadi Anggota GenBI Unsika',
  buttonText: 'Daftar Sekarang',
};

const defaultBranding = {
  siteName: 'GenBI Unsika',
  logo: '',
  favicon: '',
};

export default function CMSSettings() {
  const [activeTab, setActiveTab] = useState('homepage');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Pending uploads: pick file -> preview locally -> upload only when "Simpan Semua"
  // Keys use the format: `${section}.${field}`
  const [pendingUploads, setPendingUploads] = useState({});
  const objectUrlsRef = useRef(new Set());

  // Content states
  const [heroContent, setHeroContent] = useState(defaultHeroContent);
  const [aboutContent, setAboutContent] = useState(defaultAboutContent);
  const [ctaContent, setCtaContent] = useState(defaultCtaContent);
  const [branding, setBranding] = useState(defaultBranding);

  // Load settings from API
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const clearAllPendingUploads = useCallback(() => {
    // Revoke every object URL we created, then clear pending map
    for (const url of objectUrlsRef.current) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    }
    objectUrlsRef.current.clear();
    setPendingUploads({});
  }, []);

  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      // Cleanup object URLs on unmount
      for (const url of urls) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      }
      urls.clear();
    };
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      // Reset any local previews when reloading from API
      clearAllPendingUploads();

      // Try to fetch each setting, use defaults if not found
      const [heroRes, aboutRes, ctaRes, brandingRes] = await Promise.allSettled([apiGet('/site-settings/cms_hero'), apiGet('/site-settings/cms_about'), apiGet('/site-settings/cms_cta'), apiGet('/site-settings/cms_branding')]);

      if (heroRes.status === 'fulfilled' && heroRes.value?.value) {
        setHeroContent({ ...defaultHeroContent, ...heroRes.value.value });
      }
      if (aboutRes.status === 'fulfilled' && aboutRes.value?.value) {
        setAboutContent({ ...defaultAboutContent, ...aboutRes.value.value });
      }
      if (ctaRes.status === 'fulfilled' && ctaRes.value?.value) {
        setCtaContent({ ...defaultCtaContent, ...ctaRes.value.value });
      }
      if (brandingRes.status === 'fulfilled' && brandingRes.value?.value) {
        setBranding({ ...defaultBranding, ...brandingRes.value.value });
      }
    } catch (err) {
      console.warn('Failed to load CMS settings, using defaults:', err);
    } finally {
      setLoading(false);
    }
  }, [clearAllPendingUploads]);

  const saveSettings = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      // Upload any pending local files first, then persist resulting URLs.
      let nextHeroContent = heroContent;
      let nextAboutContent = aboutContent;
      let nextBranding = branding;

      const uploadIfPending = async (section, field) => {
        const key = `${section}.${field}`;
        const pending = pendingUploads[key];
        if (!pending?.file) return null;

        const result = await apiUpload('/site-settings/upload', pending.file);
        const imageUrl = result?.url;
        if (!imageUrl) throw new Error('Upload succeeded but no url returned');
        return imageUrl;
      };

      const heroImageUrl = await uploadIfPending('hero', 'heroImage');
      if (heroImageUrl) nextHeroContent = { ...nextHeroContent, heroImage: heroImageUrl };

      const aboutCoverUrl = await uploadIfPending('about', 'coverImage');
      if (aboutCoverUrl) nextAboutContent = { ...nextAboutContent, coverImage: aboutCoverUrl };

      const logoUrl = await uploadIfPending('branding', 'logo');
      if (logoUrl) nextBranding = { ...nextBranding, logo: logoUrl };

      const faviconUrl = await uploadIfPending('branding', 'favicon');
      if (faviconUrl) nextBranding = { ...nextBranding, favicon: faviconUrl };

      await Promise.all([
        apiPatch('/site-settings/cms_hero', { value: nextHeroContent }),
        apiPatch('/site-settings/cms_about', { value: nextAboutContent }),
        apiPatch('/site-settings/cms_cta', { value: ctaContent }),
        apiPatch('/site-settings/cms_branding', { value: nextBranding }),
      ]);

      // Reflect uploaded URLs in UI state and clear pending previews
      setHeroContent(nextHeroContent);
      setAboutContent(nextAboutContent);
      setBranding(nextBranding);
      clearAllPendingUploads();

      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error('Failed to save CMS settings:', err);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e, section, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Defer upload until user clicks "Simpan Semua".
    const key = `${section}.${field}`;
    const objectUrl = URL.createObjectURL(file);
    objectUrlsRef.current.add(objectUrl);

    setPendingUploads((prev) => {
      const existing = prev[key];
      if (existing?.objectUrl) {
        try {
          URL.revokeObjectURL(existing.objectUrl);
        } catch {
          // ignore
        }
        objectUrlsRef.current.delete(existing.objectUrl);
      }

      return {
        ...prev,
        [key]: { file, objectUrl },
      };
    });

    if (section === 'hero') {
      setHeroContent((prev) => ({ ...prev, [field]: objectUrl }));
    } else if (section === 'about') {
      setAboutContent((prev) => ({ ...prev, [field]: objectUrl }));
    } else if (section === 'branding') {
      setBranding((prev) => ({ ...prev, [field]: objectUrl }));
    }
  };

  const tabs = [
    { id: 'homepage', label: 'Homepage', icon: Layout },
    { id: 'branding', label: 'Branding', icon: Palette },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-sm text-neutral-600">Memuat pengaturan CMS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 lg:px-10 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-neutral-900">Kelola Konten Website</h1>
          <p className="text-sm text-neutral-600 mt-1">Ubah konten yang tampil di website publik GenBI Unsika</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadSettings} disabled={loading} className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button onClick={saveSettings} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Menyimpan...' : 'Simpan Semua'}
          </button>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${saveStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {saveStatus === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">{saveStatus === 'success' ? 'Perubahan berhasil disimpan!' : 'Gagal menyimpan perubahan. Silakan coba lagi.'}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-neutral-200 mb-6">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-neutral-600 hover:text-neutral-900'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Homepage Tab */}
      {activeTab === 'homepage' && (
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Type className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Hero Section</h3>
                <p className="text-xs text-neutral-500">Bagian utama yang pertama dilihat pengunjung</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Headline</label>
                <input
                  type="text"
                  value={heroContent.headline}
                  onChange={(e) => setHeroContent({ ...heroContent, headline: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Judul utama hero section"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Subheadline</label>
                <textarea
                  value={heroContent.subheadline}
                  onChange={(e) => setHeroContent({ ...heroContent, subheadline: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Deskripsi singkat di bawah headline"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Teks Tombol CTA</label>
                  <input
                    type="text"
                    value={heroContent.ctaText}
                    onChange={(e) => setHeroContent({ ...heroContent, ctaText: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Daftar Sekarang"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Teks Statistik</label>
                  <input
                    type="text"
                    value={heroContent.statsText}
                    onChange={(e) => setHeroContent({ ...heroContent, statsText: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="500+ penerima manfaat"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Gambar Hero</label>
                <div className="flex items-start gap-4">
                  {heroContent.heroImage ? (
                    <img src={heroContent.heroImage} alt="Hero" className="w-32 h-20 object-cover rounded-lg border border-neutral-200" />
                  ) : (
                    <div className="w-32 h-20 bg-neutral-100 rounded-lg border border-dashed border-neutral-300 flex items-center justify-center">
                      <Image className="w-6 h-6 text-neutral-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'hero', 'heroImage')}
                      className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:font-medium file:cursor-pointer"
                    />
                    <p className="text-xs text-neutral-500 mt-1">Format: JPG, PNG, WebP. Maks 2MB.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <Type className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">About Section</h3>
                <p className="text-xs text-neutral-500">Bagian "Tentang Kami" di homepage</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Judul</label>
                <input
                  type="text"
                  value={aboutContent.title}
                  onChange={(e) => setAboutContent({ ...aboutContent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tentang Kami"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Deskripsi</label>
                <textarea
                  value={aboutContent.description}
                  onChange={(e) => setAboutContent({ ...aboutContent, description: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Deskripsi tentang GenBI Unsika..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Gambar Cover</label>
                  <div className="flex items-start gap-3">
                    {aboutContent.coverImage ? (
                      <img src={aboutContent.coverImage} alt="About" className="w-24 h-16 object-cover rounded-lg border border-neutral-200" />
                    ) : (
                      <div className="w-24 h-16 bg-neutral-100 rounded-lg border border-dashed border-neutral-300 flex items-center justify-center">
                        <Image className="w-5 h-5 text-neutral-400" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'about', 'coverImage')}
                      className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-primary-50 file:text-primary-700 file:font-medium file:cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">URL Video (Optional)</label>
                  <input
                    type="url"
                    value={aboutContent.videoUrl}
                    onChange={(e) => setAboutContent({ ...aboutContent, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://youtube.com/embed/..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <ExternalLink className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">CTA Section</h3>
                <p className="text-xs text-neutral-500">Bagian call-to-action sebelum footer</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Teks CTA</label>
                <input
                  type="text"
                  value={ctaContent.text}
                  onChange={(e) => setCtaContent({ ...ctaContent, text: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Daftar Beasiswa Bank Indonesia..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Label Tombol</label>
                <input
                  type="text"
                  value={ctaContent.buttonText}
                  onChange={(e) => setCtaContent({ ...ctaContent, buttonText: e.target.value })}
                  className="w-full max-w-xs px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Daftar Sekarang"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Palette className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Branding</h3>
                <p className="text-xs text-neutral-500">Logo, favicon, dan nama situs</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Nama Situs</label>
                <input
                  type="text"
                  value={branding.siteName}
                  onChange={(e) => setBranding({ ...branding, siteName: e.target.value })}
                  className="w-full max-w-md px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="GenBI Unsika"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Logo</label>
                  <div className="flex items-center gap-4">
                    {branding.logo ? (
                      <img src={branding.logo} alt="Logo" className="w-16 h-16 object-contain rounded-lg border border-neutral-200 bg-white p-1" />
                    ) : (
                      <div className="w-16 h-16 bg-neutral-100 rounded-lg border border-dashed border-neutral-300 flex items-center justify-center">
                        <Image className="w-6 h-6 text-neutral-400" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'branding', 'logo')}
                        className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:font-medium file:cursor-pointer"
                      />
                      <p className="text-xs text-neutral-500 mt-1">Rekomendasi: PNG transparan, 200x200px</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Favicon</label>
                  <div className="flex items-center gap-4">
                    {branding.favicon ? (
                      <img src={branding.favicon} alt="Favicon" className="w-12 h-12 object-contain rounded-lg border border-neutral-200 bg-white p-1" />
                    ) : (
                      <div className="w-12 h-12 bg-neutral-100 rounded-lg border border-dashed border-neutral-300 flex items-center justify-center">
                        <Image className="w-5 h-5 text-neutral-400" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'branding', 'favicon')}
                        className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:font-medium file:cursor-pointer"
                      />
                      <p className="text-xs text-neutral-500 mt-1">Rekomendasi: 32x32px atau 64x64px</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 text-sm">Catatan</h4>
                <p className="text-sm text-blue-700 mt-1">Perubahan pada logo dan favicon akan terlihat setelah halaman website di-refresh. Favicon mungkin memerlukan waktu lebih lama untuk update karena browser caching.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
