import { useState, useEffect, useRef, useCallback } from 'react';
import { Save, Loader2, Type, Layout, Palette, RefreshCw, ExternalLink, AlertCircle, CheckCircle, Eye, Target, HelpCircle, MessageSquare, Link2, GraduationCap, Users, Plus, Trash2, GripVertical, FileText } from 'lucide-react';
import { apiGet, apiPatch, apiUpload } from '../utils/api';
import ImageDropzone from '../components/ui/ImageDropzone';

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

const defaultHistoryContent = {
  title: 'Sejarah GenBI Unsika',
  subtitle: 'Ketahui bagaimana GenBI Unsika dapat terbentuk hingga sekarang',
  image: '',
  body: 'Genbi merupakan singkatan dari Generasi Baru Indonesia yaitu Komunitas Penerima Beasiswa Bank Indonesia. Genbi Unsika sendiri awal terbentuk pada Oktober 2018. Genbi Unsika sendiri masuk ke dalam Genbi Bandung Raya bersama dengan beberapa Universitas lainnya seperti UPI, ITB, Unpad, Ikopin, Uin Bandung, Unisba, Telkom-U, dan Unsika. Genbi Unsika terdiri dari 50 Anggota yang terbagi dalam 5 divisi yaitu pendidikan, kominfo, kewirausahaan, kesehatan masyarakat dan lingkungan hidup.\n\nGenbi\nEnergi Untuk Negeri!',
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

const defaultVisionMission = {
  vision: 'Bersinergi mewujudkan komunitas GenBI UNSIKA yang dapat membawa perubahan positif, berkarakter, berintegritas, dan menjadi inspirasi bagi sekitar.',
  image: '',
  missions: [
    {
      subtitle: 'Initiate',
      description: 'Menginisiasi beragam kegiatan yang memberdayakan masyarakat.',
      iconName: 'Brain',
      accentBg: 'bg-indigo-100',
      accentText: 'text-indigo-700',
    },
    {
      subtitle: 'Act',
      description: 'Membuat program kerja yang menunjukkan kepedulian melalui aksi konkret.',
      iconName: 'Zap',
      accentBg: 'bg-amber-100',
      accentText: 'text-amber-700',
    },
    {
      subtitle: 'Share',
      description: 'Mendorong eksplorasi dan pengembangan potensi kreatif dan inovatif.',
      iconName: 'Share2',
      accentBg: 'bg-emerald-100',
      accentText: 'text-emerald-700',
    },
    {
      subtitle: 'Inspire',
      description: 'Membagikan pengalaman inspirasi dan motivasi bagi lingkungan sekitar.',
      iconName: 'Sparkles',
      accentBg: 'bg-fuchsia-100',
      accentText: 'text-fuchsia-700',
    },
  ],
};

const defaultFaqs = {
  items: [
    { question: 'Apa itu GenBI?', answer: 'GenBI (Generasi Baru Indonesia) adalah komunitas penerima beasiswa Bank Indonesia.' },
    { question: 'Bagaimana cara mendaftar?', answer: 'Pendaftaran dilakukan melalui seleksi yang diadakan oleh universitas dan Bank Indonesia.' },
  ],
};

const defaultTestimonials = {
  items: [
    {
      name: 'Alumni GenBI',
      role: 'Ketua Umum 2023',
      quote: 'GenBI memberikan pengalaman organisasi yang luar biasa.',
      photo_profile: '',
    },
  ],
};

const defaultFooter = {
  description: 'Komunitas penerima beasiswa Bank Indonesia Komisariat Universitas Singaperbangsa Karawang',
  address: 'Universitas Singaperbangsa Karawang Jl. HS. Ronggo Waluyo, Telukjambe Timur, Karawang, Jawa Barat, Indonesia - 41361',
  socialLinks: [
    { type: 'email', label: 'genbiunsika.org@gmail.com', url: 'mailto:genbiunsika.org@gmail.com', icon: 'tabler:mail' },
    { type: 'instagram', label: 'genbi.unsika', url: 'https://instagram.com/genbi.unsika', icon: 'tabler:brand-instagram' },
    { type: 'tiktok', label: 'genbi.unsika', url: 'https://tiktok.com/@genbi.unsika', icon: 'tabler:brand-tiktok' },
    { type: 'youtube', label: 'GenBI Unsika', url: 'https://youtube.com/@GenBIUnsika', icon: 'tabler:brand-youtube' },
  ],
};

const defaultScholarship = {
  title: 'Beasiswa Bank Indonesia',
  description:
    'Beasiswa Bank Indonesia merupakan beasiswa yang diberikan oleh Bank Indonesia bagi para mahasiswa S1 di berbagai Perguruan Tinggi Negeri (PTN). Para penerima beasiswa juga akan tergabung dalam organisasi bernama Generasi Baru Indonesia (GenBI).',
  buttonText: 'Daftar Sekarang',
  buttonUrl: '/scholarship/register',
  image: '',
};

const defaultScholarshipPage = {
  title: 'Tertarik Untuk Daftar Beasiswa Bank Indonesia?',
  subtitle: 'Ketahui persyaratan dan dokumen yang dibutuhkan untuk mendaftar beasiswa Bank Indonesia',
  buttonText: 'Daftar Beasiswa',
  closedMessage: 'Pendaftaran sedang ditutup. Pantau informasi selanjutnya ya!',
  requirements: [
    'Mahasiswa aktif S1 Universitas Singaperbangsa Karawang (dibuktikan dengan KTM atau surat keterangan aktif).',
    'Sekurang-kurangnya telah menyelesaikan 40 sks atau berada di semester 4 atau 6.',
    'Memiliki Indeks Prestasi Kumulatif (IPK) minimal 3.00 (skala 4).',
  ],
  documents: ['Scan KTM & KTP yang berlaku.', 'Transkrip nilai.', 'Motivation letter (Bahasa Indonesia).'],
};

const defaultHeroAvatars = {
  avatars: [],
};

const missionIconOptions = [
  { value: 'Brain', label: 'Brain' },
  { value: 'Zap', label: 'Zap' },
  { value: 'Share2', label: 'Share' },
  { value: 'Sparkles', label: 'Sparkles' },
  { value: 'Heart', label: 'Heart' },
  { value: 'Star', label: 'Star' },
  { value: 'Target', label: 'Target' },
  { value: 'Users', label: 'Users' },
];

const colorOptions = [
  { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Indigo' },
  { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Amber' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Emerald' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', label: 'Fuchsia' },
  { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Blue' },
  { bg: 'bg-red-100', text: 'text-red-700', label: 'Red' },
  { bg: 'bg-green-100', text: 'text-green-700', label: 'Green' },
  { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Purple' },
];

const socialTypeOptions = [
  { value: 'email', label: 'Email', icon: 'tabler:mail' },
  { value: 'instagram', label: 'Instagram', icon: 'tabler:brand-instagram' },
  { value: 'youtube', label: 'YouTube', icon: 'tabler:brand-youtube' },
  { value: 'tiktok', label: 'TikTok', icon: 'tabler:brand-tiktok' },
  { value: 'spotify', label: 'Spotify', icon: 'tabler:brand-spotify' },
  { value: 'twitter', label: 'Twitter/X', icon: 'tabler:brand-twitter' },
  { value: 'linkedin', label: 'LinkedIn', icon: 'tabler:brand-linkedin' },
  { value: 'facebook', label: 'Facebook', icon: 'tabler:brand-facebook' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'tabler:brand-whatsapp' },
];

export default function CMSSettings() {
  const [activeTab, setActiveTab] = useState('homepage');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const [pendingUploads, setPendingUploads] = useState({});
  const objectUrlsRef = useRef(new Set());

  // Content states
  const [heroContent, setHeroContent] = useState(defaultHeroContent);
  const [aboutContent, setAboutContent] = useState(defaultAboutContent);
  const [historyContent, setHistoryContent] = useState(defaultHistoryContent);
  const [ctaContent, setCtaContent] = useState(defaultCtaContent);
  const [branding, setBranding] = useState(defaultBranding);
  const [visionMission, setVisionMission] = useState(defaultVisionMission);
  const [faqs, setFaqs] = useState(defaultFaqs);
  const [testimonials, setTestimonials] = useState(defaultTestimonials);
  const [footer, setFooter] = useState(defaultFooter);
  const [scholarship, setScholarship] = useState(defaultScholarship);
  const [scholarshipPage, setScholarshipPage] = useState(defaultScholarshipPage);
  const [heroAvatars, setHeroAvatars] = useState(defaultHeroAvatars);

  const clearAllPendingUploads = useCallback(() => {
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
      clearAllPendingUploads();

      const [heroRes, aboutRes, historyRes, ctaRes, brandingRes, visionRes, faqsRes, testimonialsRes, footerRes, scholarshipRes, avatarsRes, scholarshipPageRes] = await Promise.allSettled([
        apiGet('/site-settings/cms_hero'),
        apiGet('/site-settings/cms_about'),
        apiGet('/site-settings/cms_history'),
        apiGet('/site-settings/cms_cta'),
        apiGet('/site-settings/cms_branding'),
        apiGet('/site-settings/cms_vision_mission'),
        apiGet('/site-settings/cms_faqs'),
        apiGet('/site-settings/cms_testimonials'),
        apiGet('/site-settings/cms_footer'),
        apiGet('/site-settings/cms_scholarship'),
        apiGet('/site-settings/cms_hero_avatars'),
        apiGet('/site-settings/cms_scholarship_page'),
      ]);

      if (heroRes.status === 'fulfilled' && heroRes.value?.value) {
        setHeroContent({ ...defaultHeroContent, ...heroRes.value.value });
      }
      if (aboutRes.status === 'fulfilled' && aboutRes.value?.value) {
        setAboutContent({ ...defaultAboutContent, ...aboutRes.value.value });
      }
      if (historyRes.status === 'fulfilled' && historyRes.value?.value) {
        setHistoryContent({ ...defaultHistoryContent, ...historyRes.value.value });
      }
      if (ctaRes.status === 'fulfilled' && ctaRes.value?.value) {
        setCtaContent({ ...defaultCtaContent, ...ctaRes.value.value });
      }
      if (brandingRes.status === 'fulfilled' && brandingRes.value?.value) {
        setBranding({ ...defaultBranding, ...brandingRes.value.value });
      }
      if (visionRes.status === 'fulfilled' && visionRes.value?.value) {
        setVisionMission({ ...defaultVisionMission, ...visionRes.value.value });
      }
      if (faqsRes.status === 'fulfilled' && faqsRes.value?.value) {
        setFaqs({ ...defaultFaqs, ...faqsRes.value.value });
      }
      if (testimonialsRes.status === 'fulfilled' && testimonialsRes.value?.value) {
        setTestimonials({ ...defaultTestimonials, ...testimonialsRes.value.value });
      }
      if (footerRes.status === 'fulfilled' && footerRes.value?.value) {
        setFooter({ ...defaultFooter, ...footerRes.value.value });
      }
      if (scholarshipRes.status === 'fulfilled' && scholarshipRes.value?.value) {
        setScholarship({ ...defaultScholarship, ...scholarshipRes.value.value });
      }
      if (avatarsRes.status === 'fulfilled' && avatarsRes.value?.value) {
        setHeroAvatars({ ...defaultHeroAvatars, ...avatarsRes.value.value });
      }
      if (scholarshipPageRes.status === 'fulfilled' && scholarshipPageRes.value?.value) {
        const merged = { ...defaultScholarshipPage, ...scholarshipPageRes.value.value };
        // Status pendaftaran di-handle oleh halaman /beasiswa (bukan CMS)
        // Jangan tampilkan / simpan field ini dari CMS.
        const sanitized = { ...merged };
        delete sanitized.isOpen;
        setScholarshipPage(sanitized);
      }
    } catch (err) {
      console.warn('Failed to load CMS settings, using defaults:', err);
    } finally {
      setLoading(false);
    }
  }, [clearAllPendingUploads]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      let nextHeroContent = heroContent;
      let nextAboutContent = aboutContent;
      let nextHistoryContent = historyContent;
      let nextBranding = branding;
      let nextScholarship = scholarship;
      let nextVisionMission = visionMission;
      let nextHeroAvatars = { ...heroAvatars };

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

      const historyImageUrl = await uploadIfPending('history', 'image');
      if (historyImageUrl) nextHistoryContent = { ...nextHistoryContent, image: historyImageUrl };

      const logoUrl = await uploadIfPending('branding', 'logo');
      if (logoUrl) nextBranding = { ...nextBranding, logo: logoUrl };

      const faviconUrl = await uploadIfPending('branding', 'favicon');
      if (faviconUrl) nextBranding = { ...nextBranding, favicon: faviconUrl };

      const scholarshipImageUrl = await uploadIfPending('scholarship', 'image');
      if (scholarshipImageUrl) nextScholarship = { ...nextScholarship, image: scholarshipImageUrl };

      const visionMissionImageUrl = await uploadIfPending('visionMission', 'image');
      if (visionMissionImageUrl) nextVisionMission = { ...nextVisionMission, image: visionMissionImageUrl };

      // Upload testimonial images
      let nextTestimonials = { ...testimonials };
      const testimonialUploads = Object.keys(pendingUploads).filter((key) => key.startsWith('testimonial.'));
      for (const key of testimonialUploads) {
        const pending = pendingUploads[key];
        if (!pending?.file) continue;
        try {
          const result = await apiUpload('/site-settings/upload', pending.file);
          const imageUrl = result?.url;
          if (imageUrl) {
            // key format: testimonial.{index}.photo_profile
            const parts = key.split('.');
            const idx = parseInt(parts[1], 10);
            if (!isNaN(idx) && nextTestimonials.items[idx]) {
              nextTestimonials = {
                ...nextTestimonials,
                items: nextTestimonials.items.map((t, i) => (i === idx ? { ...t, photo_profile: imageUrl } : t)),
              };
            }
          }
        } catch (err) {
          console.error(`Failed to upload testimonial image for ${key}:`, err);
        }
      }

      // Upload hero avatars images (keep stored payload as array of URL strings)
      const heroAvatarUploads = Object.keys(pendingUploads).filter((key) => key.startsWith('heroAvatar.'));
      if (heroAvatarUploads.length > 0) {
        const nextAvatars = [...(nextHeroAvatars.avatars || [])];
        for (const key of heroAvatarUploads) {
          const pending = pendingUploads[key];
          if (!pending?.file) continue;
          try {
            const parts = key.split('.');
            const idx = parseInt(parts[1], 10);
            if (Number.isNaN(idx)) continue;

            const result = await apiUpload('/site-settings/upload', pending.file);
            const imageUrl = result?.url;
            if (imageUrl && idx >= 0 && idx < nextAvatars.length) {
              nextAvatars[idx] = imageUrl;
            }
          } catch (err) {
            console.error(`Failed to upload hero avatar for ${key}:`, err);
          }
        }
        nextHeroAvatars = { ...nextHeroAvatars, avatars: nextAvatars };
      }

      const scholarshipPagePayload = { ...scholarshipPage };
      delete scholarshipPagePayload.isOpen;

      await Promise.all([
        apiPatch('/site-settings/cms_hero', { value: nextHeroContent }),
        apiPatch('/site-settings/cms_about', { value: nextAboutContent }),
        apiPatch('/site-settings/cms_history', { value: nextHistoryContent }),
        apiPatch('/site-settings/cms_cta', { value: ctaContent }),
        apiPatch('/site-settings/cms_branding', { value: nextBranding }),
        apiPatch('/site-settings/cms_vision_mission', { value: nextVisionMission }),
        apiPatch('/site-settings/cms_faqs', { value: faqs }),
        apiPatch('/site-settings/cms_testimonials', { value: nextTestimonials }),
        apiPatch('/site-settings/cms_footer', { value: footer }),
        apiPatch('/site-settings/cms_scholarship', { value: nextScholarship }),
        apiPatch('/site-settings/cms_hero_avatars', { value: nextHeroAvatars }),
        apiPatch('/site-settings/cms_scholarship_page', { value: scholarshipPagePayload }),
      ]);

      setHeroContent(nextHeroContent);
      setAboutContent(nextAboutContent);
      setHistoryContent(nextHistoryContent);
      setBranding(nextBranding);
      setScholarship(nextScholarship);
      setVisionMission(nextVisionMission);
      setTestimonials(nextTestimonials);
      setHeroAvatars(nextHeroAvatars);
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

  const handleImageUpload = (file, section, field) => {
    if (!file) return;

    const key = `${section}.${field}`;
    const objectUrl = URL.createObjectURL(file);
    objectUrlsRef.current.add(objectUrl);

    setPendingUploads((prev) => {
      const existing = prev[key];
      if (existing?.objectUrl) {
        try {
          URL.revokeObjectURL(existing.objectUrl);
        } catch {
          // Ignore revoke errors
        }
        objectUrlsRef.current.delete(existing.objectUrl);
      }
      return { ...prev, [key]: { file, objectUrl } };
    });

    if (section === 'hero') setHeroContent((prev) => ({ ...prev, [field]: objectUrl }));
    else if (section === 'about') setAboutContent((prev) => ({ ...prev, [field]: objectUrl }));
    else if (section === 'history') setHistoryContent((prev) => ({ ...prev, [field]: objectUrl }));
    else if (section === 'branding') setBranding((prev) => ({ ...prev, [field]: objectUrl }));
    else if (section === 'scholarship') setScholarship((prev) => ({ ...prev, [field]: objectUrl }));
    else if (section === 'visionMission') setVisionMission((prev) => ({ ...prev, [field]: objectUrl }));
  };

  const handleImageRemove = (section, field) => {
    const key = `${section}.${field}`;
    setPendingUploads((prev) => {
      if (prev[key]?.objectUrl) {
        try {
          URL.revokeObjectURL(prev[key].objectUrl);
        } catch {
          // Ignore revoke errors
        }
        objectUrlsRef.current.delete(prev[key].objectUrl);
      }
      const { [key]: _, ...rest } = prev;
      return rest;
    });

    if (section === 'hero') setHeroContent((prev) => ({ ...prev, [field]: '' }));
    else if (section === 'about') setAboutContent((prev) => ({ ...prev, [field]: '' }));
    else if (section === 'history') setHistoryContent((prev) => ({ ...prev, [field]: '' }));
    else if (section === 'branding') setBranding((prev) => ({ ...prev, [field]: '' }));
    else if (section === 'scholarship') setScholarship((prev) => ({ ...prev, [field]: '' }));
    else if (section === 'visionMission') setVisionMission((prev) => ({ ...prev, [field]: '' }));
  };

  const addMission = () => {
    setVisionMission((prev) => ({
      ...prev,
      missions: [
        ...prev.missions,
        {
          subtitle: 'Misi Baru',
          description: 'Deskripsi misi baru',
          iconName: 'Star',
          accentBg: 'bg-blue-100',
          accentText: 'text-blue-700',
        },
      ],
    }));
  };

  const removeMission = (index) => {
    setVisionMission((prev) => ({
      ...prev,
      missions: prev.missions.filter((_, i) => i !== index),
    }));
  };

  const updateMission = (index, field, value) => {
    setVisionMission((prev) => ({
      ...prev,
      missions: prev.missions.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    }));
  };

  const addFaq = () => {
    setFaqs((prev) => ({
      ...prev,
      items: [...prev.items, { question: '', answer: '' }],
    }));
  };

  const removeFaq = (index) => {
    setFaqs((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateFaq = (index, field, value) => {
    setFaqs((prev) => ({
      ...prev,
      items: prev.items.map((f, i) => (i === index ? { ...f, [field]: value } : f)),
    }));
  };

  const addTestimonial = () => {
    setTestimonials((prev) => ({
      ...prev,
      items: [...prev.items, { name: '', role: '', quote: '', photo_profile: '' }],
    }));
  };

  const removeTestimonial = (index) => {
    // Clean up any pending upload for this testimonial
    const key = `testimonial.${index}.photo_profile`;
    if (pendingUploads[key]?.objectUrl) {
      try {
        URL.revokeObjectURL(pendingUploads[key].objectUrl);
      } catch {
        // Ignore revoke errors
      }
      objectUrlsRef.current.delete(pendingUploads[key].objectUrl);
    }
    setPendingUploads((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });

    setTestimonials((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateTestimonial = (index, field, value) => {
    setTestimonials((prev) => ({
      ...prev,
      items: prev.items.map((t, i) => (i === index ? { ...t, [field]: value } : t)),
    }));
  };

  const handleTestimonialImageUpload = (file, index) => {
    if (!file) return;

    const key = `testimonial.${index}.photo_profile`;
    const objectUrl = URL.createObjectURL(file);
    objectUrlsRef.current.add(objectUrl);

    setPendingUploads((prev) => {
      const existing = prev[key];
      if (existing?.objectUrl) {
        try {
          URL.revokeObjectURL(existing.objectUrl);
        } catch {
          // Ignore revoke errors
        }
        objectUrlsRef.current.delete(existing.objectUrl);
      }
      return { ...prev, [key]: { file, objectUrl } };
    });

    updateTestimonial(index, 'photo_profile', objectUrl);
  };

  const handleTestimonialImageRemove = (index) => {
    const key = `testimonial.${index}.photo_profile`;
    setPendingUploads((prev) => {
      if (prev[key]?.objectUrl) {
        try {
          URL.revokeObjectURL(prev[key].objectUrl);
        } catch {
          // Ignore revoke errors
        }
        objectUrlsRef.current.delete(prev[key].objectUrl);
      }
      const { [key]: _, ...rest } = prev;
      return rest;
    });

    updateTestimonial(index, 'photo_profile', '');
  };

  const addSocialLink = () => {
    setFooter((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { type: 'email', label: '', url: '', icon: 'tabler:mail' }],
    }));
  };

  const removeSocialLink = (index) => {
    setFooter((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const updateSocialLink = (index, field, value) => {
    setFooter((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((s, i) => {
        if (i === index) {
          if (field === 'type') {
            const option = socialTypeOptions.find((o) => o.value === value);
            return { ...s, type: value, icon: option?.icon || 'tabler:world' };
          }
          return { ...s, [field]: value };
        }
        return s;
      }),
    }));
  };

  const moveSocialLink = (fromIndex, toIndex) => {
    setFooter((prev) => {
      const newLinks = [...prev.socialLinks];
      const [movedItem] = newLinks.splice(fromIndex, 1);
      newLinks.splice(toIndex, 0, movedItem);
      return { ...prev, socialLinks: newLinks };
    });
  };

  const handleSocialDragStart = (e, index) => {
    e.dataTransfer.setData('socialLinkIndex', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSocialDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleSocialDrop = (e, toIndex) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('socialLinkIndex'), 10);
    if (fromIndex !== toIndex) {
      moveSocialLink(fromIndex, toIndex);
    }
  };

  const addHeroAvatar = () => {
    setHeroAvatars((prev) => ({
      ...prev,
      avatars: [...prev.avatars, ''],
    }));
  };

  const removeHeroAvatar = (index) => {
    // Clean up any pending upload for this avatar, and reindex remaining pending keys
    const baseKey = `heroAvatar.${index}`;
    if (pendingUploads[baseKey]?.objectUrl) {
      try {
        URL.revokeObjectURL(pendingUploads[baseKey].objectUrl);
      } catch {
        // ignore
      }
      objectUrlsRef.current.delete(pendingUploads[baseKey].objectUrl);
    }

    setPendingUploads((prev) => {
      const next = {};
      for (const [key, val] of Object.entries(prev)) {
        if (!key.startsWith('heroAvatar.')) {
          next[key] = val;
          continue;
        }
        const parts = key.split('.');
        const idx = parseInt(parts[1], 10);
        if (Number.isNaN(idx)) continue;
        if (idx === index) continue;
        if (idx > index) {
          next[`heroAvatar.${idx - 1}`] = val;
        } else {
          next[key] = val;
        }
      }
      return next;
    });

    setHeroAvatars((prev) => ({
      ...prev,
      avatars: prev.avatars.filter((_, i) => i !== index),
    }));
  };

  const updateHeroAvatar = (index, value) => {
    setHeroAvatars((prev) => ({
      ...prev,
      avatars: prev.avatars.map((a, i) => (i === index ? value : a)),
    }));
  };

  const handleHeroAvatarImageUpload = (file, index) => {
    if (!file) return;

    const key = `heroAvatar.${index}`;
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
      return { ...prev, [key]: { file, objectUrl } };
    });

    updateHeroAvatar(index, objectUrl);
  };

  const handleHeroAvatarImageRemove = (index) => {
    const key = `heroAvatar.${index}`;
    setPendingUploads((prev) => {
      if (prev[key]?.objectUrl) {
        try {
          URL.revokeObjectURL(prev[key].objectUrl);
        } catch {
          // ignore
        }
        objectUrlsRef.current.delete(prev[key].objectUrl);
      }
      const { [key]: _, ...rest } = prev;
      return rest;
    });

    updateHeroAvatar(index, '');
  };

  const tabs = [
    { id: 'homepage', label: 'Homepage', icon: Layout },
    { id: 'history', label: 'Sejarah', icon: FileText },
    { id: 'visi-misi', label: 'Visi Misi', icon: Target },
    { id: 'scholarship', label: 'Beasiswa', icon: GraduationCap },
    { id: 'scholarship-page', label: 'Halaman Beasiswa', icon: FileText },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'testimonials', label: 'Testimoni', icon: MessageSquare },
    { id: 'footer', label: 'Footer', icon: Link2 },
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
    <div className="px-4 md:px-6 lg:px-10 py-6">
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

      {saveStatus && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${saveStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {saveStatus === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">{saveStatus === 'success' ? 'Perubahan berhasil disimpan!' : 'Gagal menyimpan perubahan. Silakan coba lagi.'}</span>
        </div>
      )}

      <div className="border-b border-neutral-200 mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-neutral-600 hover:text-neutral-900'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'homepage' && (
        <div className="space-y-6">
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
                <label className="block text-sm font-medium text-neutral-700 mb-2">Gambar Hero</label>
                <ImageDropzone value={heroContent.heroImage} onChange={(file) => handleImageUpload(file, 'hero', 'heroImage')} onRemove={() => handleImageRemove('hero', 'heroImage')} previewClassName="h-48" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Hero Avatars</h3>
                  <p className="text-xs text-neutral-500">Avatar yang tampil di samping statistik hero</p>
                </div>
              </div>
              <button onClick={addHeroAvatar} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Tambah
              </button>
            </div>

            <div className="space-y-3">
              {heroAvatars.avatars.map((avatar, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <div className="w-16">
                    {avatar ? (
                      <img src={avatar} alt={`Avatar ${index + 1}`} className="w-10 h-10 rounded-full object-cover border border-neutral-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
                        <Users className="w-5 h-5 text-neutral-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <ImageDropzone
                      value={avatar}
                      onChange={(file) => handleHeroAvatarImageUpload(file, index)}
                      onRemove={() => handleHeroAvatarImageRemove(index)}
                      previewClassName="h-24"
                      placeholder="Upload avatar"
                      hint="JPG/PNG/WebP. Maks 2MB."
                    />
                  </div>
                  <button onClick={() => removeHeroAvatar(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {heroAvatars.avatars.length === 0 && <p className="text-sm text-neutral-500 text-center py-4">Belum ada avatar. Klik "Tambah" untuk menambahkan.</p>}
            </div>
          </div>

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
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Gambar Cover</label>
                  <ImageDropzone value={aboutContent.coverImage} onChange={(file) => handleImageUpload(file, 'about', 'coverImage')} onRemove={() => handleImageRemove('about', 'coverImage')} previewClassName="h-32" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">URL Video</label>
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

      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-neutral-700" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Halaman Sejarah</h3>
                <p className="text-xs text-neutral-500">Konten yang tampil di halaman Sejarah</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Judul</label>
                <input
                  type="text"
                  value={historyContent.title}
                  onChange={(e) => setHistoryContent((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Sejarah GenBI Unsika"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Subjudul</label>
                <input
                  type="text"
                  value={historyContent.subtitle}
                  onChange={(e) => setHistoryContent((prev) => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ketahui bagaimana GenBI Unsika dapat terbentuk hingga sekarang"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Gambar (Opsional)</label>
                <ImageDropzone value={historyContent.image} onChange={(file) => handleImageUpload(file, 'history', 'image')} onRemove={() => handleImageRemove('history', 'image')} previewClassName="h-48" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Isi</label>
                <textarea
                  value={historyContent.body}
                  onChange={(e) => setHistoryContent((prev) => ({ ...prev, body: e.target.value }))}
                  rows={10}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
                  placeholder="Tulis sejarah GenBI Unsika di sini. Pisahkan paragraf dengan baris kosong."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'visi-misi' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                <Layout className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Gambar Visi Misi</h3>
                <p className="text-xs text-neutral-500">Gambar ilustrasi untuk bagian Visi Misi</p>
              </div>
            </div>

            <ImageDropzone value={visionMission.image} onChange={(file) => handleImageUpload(file, 'visionMission', 'image')} onRemove={() => handleImageRemove('visionMission', 'image')} previewClassName="h-48" />
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Eye className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Visi</h3>
                <p className="text-xs text-neutral-500">Visi GenBI Unsika</p>
              </div>
            </div>

            <textarea
              value={visionMission.vision}
              onChange={(e) => setVisionMission({ ...visionMission, vision: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Visi GenBI Unsika..."
            />
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Target className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Misi</h3>
                  <p className="text-xs text-neutral-500">Daftar misi GenBI Unsika</p>
                </div>
              </div>
              <button onClick={addMission} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Tambah Misi
              </button>
            </div>

            <div className="space-y-4">
              {visionMission.missions.map((mission, index) => (
                <div key={index} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm font-medium text-neutral-700">Misi {index + 1}</span>
                    </div>
                    <button onClick={() => removeMission(index)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" disabled={visionMission.missions.length <= 1}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Subtitle</label>
                      <input
                        type="text"
                        value={mission.subtitle}
                        onChange={(e) => updateMission(index, 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Initiate, Act, Share, dll"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Icon</label>
                        <select
                          value={mission.iconName}
                          onChange={(e) => updateMission(index, 'iconName', e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {missionIconOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Warna</label>
                        <select
                          value={mission.accentBg}
                          onChange={(e) => {
                            const color = colorOptions.find((c) => c.bg === e.target.value);
                            if (color) {
                              updateMission(index, 'accentBg', color.bg);
                              updateMission(index, 'accentText', color.text);
                            }
                          }}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {colorOptions.map((opt) => (
                            <option key={opt.bg} value={opt.bg}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Deskripsi</label>
                    <textarea
                      value={mission.description}
                      onChange={(e) => updateMission(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      placeholder="Deskripsi misi..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scholarship' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Beasiswa Section</h3>
                <p className="text-xs text-neutral-500">Bagian informasi beasiswa di homepage</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Judul</label>
                <input
                  type="text"
                  value={scholarship.title}
                  onChange={(e) => setScholarship({ ...scholarship, title: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Beasiswa Bank Indonesia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Deskripsi</label>
                <textarea
                  value={scholarship.description}
                  onChange={(e) => setScholarship({ ...scholarship, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Deskripsi tentang beasiswa..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Teks Tombol</label>
                  <input
                    type="text"
                    value={scholarship.buttonText}
                    onChange={(e) => setScholarship({ ...scholarship, buttonText: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Daftar Sekarang"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">URL Tombol</label>
                  <input
                    type="text"
                    value={scholarship.buttonUrl}
                    onChange={(e) => setScholarship({ ...scholarship, buttonUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="/scholarship/register"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Gambar</label>
                <ImageDropzone value={scholarship.image} onChange={(file) => handleImageUpload(file, 'scholarship', 'image')} onRemove={() => handleImageRemove('scholarship', 'image')} previewClassName="h-48" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'faq' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">FAQ (Pertanyaan Umum)</h3>
                  <p className="text-xs text-neutral-500">Daftar pertanyaan yang sering diajukan</p>
                </div>
              </div>
              <button onClick={addFaq} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Tambah FAQ
              </button>
            </div>

            <div className="space-y-4">
              {faqs.items.map((faq, index) => (
                <div key={index} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-sm font-medium text-neutral-700">FAQ {index + 1}</span>
                    <button onClick={() => removeFaq(index)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Pertanyaan</label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFaq(index, 'question', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Apa itu GenBI?"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Jawaban</label>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        placeholder="Jawaban dari pertanyaan..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              {faqs.items.length === 0 && <p className="text-sm text-neutral-500 text-center py-8">Belum ada FAQ. Klik "Tambah FAQ" untuk menambahkan.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'testimonials' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Testimoni Alumni</h3>
                  <p className="text-xs text-neutral-500">Testimoni dari alumni GenBI</p>
                </div>
              </div>
              <button onClick={addTestimonial} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Tambah Testimoni
              </button>
            </div>

            <div className="space-y-4">
              {testimonials.items.map((testimonial, index) => (
                <div key={index} className="p-5 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <span className="text-sm font-medium text-neutral-700">Testimoni {index + 1}</span>
                    <button onClick={() => removeTestimonial(index)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row gap-5">
                    {/* Photo Profile Section */}
                    <div className="flex-shrink-0">
                      <label className="block text-xs font-medium text-neutral-600 mb-2">Foto Profil</label>
                      <ImageDropzone
                        value={testimonial.photo_profile}
                        onChange={(file) => handleTestimonialImageUpload(file, index)}
                        onRemove={() => handleTestimonialImageRemove(index)}
                        previewClassName="h-48 w-48 rounded-full"
                        hint="200x200px"
                      />
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-neutral-600 mb-1">Nama</label>
                          <input
                            type="text"
                            value={testimonial.name}
                            onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Nama alumni"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-neutral-600 mb-1">Jabatan/Posisi</label>
                          <input
                            type="text"
                            value={testimonial.role}
                            onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Ketua Umum 2023"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Testimoni</label>
                        <textarea
                          value={testimonial.quote}
                          onChange={(e) => updateTestimonial(index, 'quote', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                          placeholder="Testimoni dari alumni..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {testimonials.items.length === 0 && <p className="text-sm text-neutral-500 text-center py-8">Belum ada testimoni. Klik "Tambah Testimoni" untuk menambahkan.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'footer' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Link2 className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Informasi Footer</h3>
                <p className="text-xs text-neutral-500">Deskripsi dan alamat di footer</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Deskripsi</label>
                <textarea
                  value={footer.description}
                  onChange={(e) => setFooter({ ...footer, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Deskripsi singkat organisasi..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Alamat</label>
                <textarea
                  value={footer.address}
                  onChange={(e) => setFooter({ ...footer, address: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Alamat lengkap..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Link Sosial Media</h3>
                  <p className="text-xs text-neutral-500">Kontak dan sosial media di footer</p>
                </div>
              </div>
              <button onClick={addSocialLink} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Tambah Link
              </button>
            </div>

            <div className="space-y-3">
              {footer.socialLinks.map((link, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handleSocialDragStart(e, index)}
                  onDragOver={handleSocialDragOver}
                  onDrop={(e) => handleSocialDrop(e, index)}
                  className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg cursor-move hover:bg-neutral-100 transition-colors"
                >
                  <div className="p-1 text-neutral-400 hover:text-neutral-600 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <select value={link.type} onChange={(e) => updateSocialLink(index, 'type', e.target.value)} className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-32">
                    {socialTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateSocialLink(index, 'label', e.target.value)}
                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Label (contoh: genbi.unsika)"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="URL"
                  />
                  <button onClick={() => removeSocialLink(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {footer.socialLinks.length === 0 && <p className="text-sm text-neutral-500 text-center py-4">Belum ada link sosial media. Klik "Tambah Link" untuk menambahkan.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scholarship-page' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Halaman Beasiswa</h3>
                <p className="text-xs text-neutral-500">Konten halaman persyaratan beasiswa</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Judul Halaman</label>
                <input
                  type="text"
                  value={scholarshipPage.title}
                  onChange={(e) => setScholarshipPage({ ...scholarshipPage, title: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tertarik Untuk Daftar Beasiswa Bank Indonesia?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Subtitle</label>
                <input
                  type="text"
                  value={scholarshipPage.subtitle}
                  onChange={(e) => setScholarshipPage({ ...scholarshipPage, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ketahui persyaratan dan dokumen yang dibutuhkan..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Teks Tombol</label>
                <input
                  type="text"
                  value={scholarshipPage.buttonText}
                  onChange={(e) => setScholarshipPage({ ...scholarshipPage, buttonText: e.target.value })}
                  className="w-full max-w-xs px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Daftar Beasiswa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Pesan Saat Ditutup</label>
                <input
                  type="text"
                  value={scholarshipPage.closedMessage}
                  onChange={(e) => setScholarshipPage({ ...scholarshipPage, closedMessage: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Pendaftaran sedang ditutup. Pantau informasi selanjutnya ya!"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Persyaratan</h3>
                  <p className="text-xs text-neutral-500">Daftar persyaratan pendaftaran</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setScholarshipPage({ ...scholarshipPage, requirements: [...scholarshipPage.requirements, ''] })}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium hover:bg-primary-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah
              </button>
            </div>

            <div className="space-y-3">
              {scholarshipPage.requirements?.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-sm text-neutral-500 pt-2 w-6">{index + 1}.</span>
                  <textarea
                    value={item}
                    onChange={(e) => {
                      const newReqs = [...scholarshipPage.requirements];
                      newReqs[index] = e.target.value;
                      setScholarshipPage({ ...scholarshipPage, requirements: newReqs });
                    }}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Masukkan persyaratan..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newReqs = scholarshipPage.requirements.filter((_, i) => i !== index);
                      setScholarshipPage({ ...scholarshipPage, requirements: newReqs });
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!scholarshipPage.requirements || scholarshipPage.requirements.length === 0) && <p className="text-sm text-neutral-500 italic text-center py-4">Belum ada persyaratan. Klik "Tambah" untuk menambahkan.</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Dokumen Yang Dibutuhkan</h3>
                  <p className="text-xs text-neutral-500">Daftar dokumen yang harus disiapkan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setScholarshipPage({ ...scholarshipPage, documents: [...scholarshipPage.documents, ''] })}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium hover:bg-primary-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah
              </button>
            </div>

            <div className="space-y-3">
              {scholarshipPage.documents?.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-sm text-neutral-500 pt-2 w-6">{index + 1}.</span>
                  <textarea
                    value={item}
                    onChange={(e) => {
                      const newDocs = [...scholarshipPage.documents];
                      newDocs[index] = e.target.value;
                      setScholarshipPage({ ...scholarshipPage, documents: newDocs });
                    }}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Masukkan dokumen yang dibutuhkan..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newDocs = scholarshipPage.documents.filter((_, i) => i !== index);
                      setScholarshipPage({ ...scholarshipPage, documents: newDocs });
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!scholarshipPage.documents || scholarshipPage.documents.length === 0) && <p className="text-sm text-neutral-500 italic text-center py-4">Belum ada dokumen. Klik "Tambah" untuk menambahkan.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 text-sm">Catatan</h4>
                <p className="text-sm text-yellow-700 mt-1">Perubahan pada logo dan favicon akan terlihat setelah halaman website di-refresh. Favicon mungkin memerlukan waktu lebih lama untuk update karena browser caching.</p>
              </div>
            </div>
          </div>
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
                  <ImageDropzone value={branding.logo} onChange={(file) => handleImageUpload(file, 'branding', 'logo')} onRemove={() => handleImageRemove('branding', 'logo')} previewClassName="h-32" hint="PNG transparan, 200x200px" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Favicon</label>
                  <ImageDropzone value={branding.favicon} onChange={(file) => handleImageUpload(file, 'branding', 'favicon')} onRemove={() => handleImageRemove('branding', 'favicon')} previewClassName="h-32" hint="32x32px atau 64x64px" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
