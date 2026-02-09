import { useRef, useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Search as SearchIcon, BookOpen, ListTree, Shield, Users, KeyRound, X, ExternalLink, Plus, Edit2, Trash2, Save, MoreVertical, ArrowUp, ArrowDown } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { apiGet, apiRequest } from '../utils/api';
import RichTextEditor from '../components/ui/RichTextEditor';
import { useConfirm } from '../contexts/ConfirmContext';

const pickIcon = (item) => {
  const tags = (item?.tags || []).map((t) => String(t).toLowerCase());
  if (tags.some((t) => ['role', 'akses', 'otoritas', 'permission'].includes(t))) return Shield;
  if (tags.some((t) => ['user', 'pengguna', 'komunitas'].includes(t))) return Users;
  if (tags.some((t) => ['panduan', 'guide', 'dokumen'].includes(t))) return BookOpen;
  return KeyRound;
};

export default function InfoCenter() {
  const nav = useNavigate();
  const { hash } = useLocation();
  const { confirm } = useConfirm();

  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [openSec, setOpenSec] = useState({});
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [activeItemId, setActiveItemId] = useState(null);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // { sectionId, itemId, ...data }
  const [saving, setSaving] = useState(false);



  const containerRef = useRef(null);
  const topbarRef = useRef(null);
  const contentRef = useRef(null);
  const [safeTop, setSafeTop] = useState(0);
  const [topbarHeight, setTopbarHeight] = useState(0);

  const recalcSticky = () => {
    const contTop = containerRef.current?.getBoundingClientRect().top ?? 0;
    const fallbackTop = Math.max(0, Math.round(contTop));
    setSafeTop(fallbackTop);
    const tbH = topbarRef.current?.offsetHeight ?? 0;
    setTopbarHeight(tbH);
  };

  useEffect(() => {
    // Inisialisasi + saat resize; hindari event scroll
    const onResize = () => recalcSticky();
    window.addEventListener('resize', onResize);
    // Jalankan ulang setelah render pertama
    requestAnimationFrame(recalcSticky);
    return () => window.removeEventListener('resize', onResize);
  }, []);


  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadError(null);
        const json = await apiGet('/info-center');
        if (!alive) return;
        const secs = Array.isArray(json?.sections) ? json.sections : [];
        setSections(secs);


        const defaults = Object.fromEntries(secs.map((s) => [s.id, false]));


        const firstSec = secs[0];
        const firstItem = firstSec?.items?.[0];
        let activeSecId = firstSec?.id || null;
        let activeItmId = firstItem?.id || null;

        const fromHashId = hash?.replace('#', '');
        if (fromHashId) {
          const foundSec = secs.find((s) => (s.items || []).some((it) => it.id === fromHashId));
          if (foundSec) {
            activeSecId = foundSec.id;
            activeItmId = fromHashId;

            defaults[foundSec.id] = true;
          }
        }

        // Terapkan semua state setelah logika selesai
        setOpenSec(defaults);
        setActiveSectionId(activeSecId);
        setActiveItemId(activeItmId);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setLoadError(e);
      } finally {
        if (alive) setLoading(false);
        requestAnimationFrame(recalcSticky);
      }
    })();
    return () => {
      alive = false;
    };
  }, [hash]);

  // Ratakan item untuk pencarian
  const flatItems = useMemo(() => sections.flatMap((sec) => (sec.items || []).map((it) => ({ ...it, __sectionId: sec.id, __sectionTitle: sec.title }))), [sections]);

  const activeItem = useMemo(() => {
    const sec = sections.find((s) => s.id === activeSectionId);
    return sec?.items?.find((it) => it.id === activeItemId) || null;
  }, [sections, activeSectionId, activeItemId]);

  // Hasil search
  const results = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    const asText = (arr) => (Array.isArray(arr) ? arr.join(' ') : '');
    return flatItems
      .filter((it) => {
        const hay = [it.title, it.summary, it.content, asText(it.tags), asText(it.permissions?.allowed), asText(it.permissions?.denied)].join(' ').toLowerCase() || '';
        return hay.includes(term);
      })
      .slice(0, 30);
  }, [flatItems, searchTerm]);

  // Shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((s) => !s);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Helper: scroll ke paling atas
  const scrollContentToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- CRUD Logic ---

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await apiRequest('/info-center', { method: 'PUT', body: { sections } });
      setIsEditing(false);
      setEditingItem(null);
      // alert('Perubahan disimpan!');
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    const title = prompt('Nama Section baru:');
    if (!title) return;
    const newSec = {
      id: 'sec-' + Date.now(),
      title,
      items: [],
    };
    setSections([...sections, newSec]);
  };

  const deleteSection = async (secId) => {
    const ok = await confirm({
      title: 'Hapus Section?',
      description: 'Semua artikel di dalamnya juga akan terhapus.',
      confirmText: 'Hapus',
      tone: 'danger',
    });
    if (!ok) return;
    setSections(sections.filter(s => s.id !== secId));
  };

  const moveSection = (idx, dir) => {
    const newSecs = [...sections];
    if (dir === 'up' && idx > 0) {
      [newSecs[idx], newSecs[idx - 1]] = [newSecs[idx - 1], newSecs[idx]];
    } else if (dir === 'down' && idx < newSecs.length - 1) {
      [newSecs[idx], newSecs[idx + 1]] = [newSecs[idx + 1], newSecs[idx]];
    }
    setSections(newSecs);
  };

  const addArticle = (secId) => {
    const title = prompt('Judul Artikel baru:');
    if (!title) return;

    setSections(sections.map(s => {
      if (s.id !== secId) return s;
      return {
        ...s,
        items: [...(s.items || []), {
          id: 'art-' + Date.now(),
          title,
          content: '',
          summary: '',
          tags: [],
        }]
      };
    }));

    // Auto expand section
    setOpenSec(prev => ({ ...prev, [secId]: true }));
  };

  // Function to edit article content (enter editor mode for specific item)
  const startEditArticle = (secId, item) => {
    setEditingItem({ ...item, sectionId: secId });
    // Also set active for preview
    setActiveSectionId(secId);
    setActiveItemId(item.id);
    scrollContentToTop();
  };

  // Save single article changes to local state (not yet persisted to server)
  const saveArticleChanges = (updatedItem) => {
    setSections(sections.map(s => {
      if (s.id !== updatedItem.sectionId) return s;
      return {
        ...s,
        items: s.items.map(it => it.id === updatedItem.id ? { ...updatedItem, sectionId: undefined } : it)
      };
    }));
    setEditingItem(null);
  };

  const deleteArticle = async (secId, itemId) => {
    if (!await confirm({ title: 'Hapus Artikel?', tone: 'danger' })) return;

    setSections(sections.map(s => {
      if (s.id !== secId) return s;
      return {
        ...s,
        items: s.items.filter(it => it.id !== itemId)
      };
    }));

    if (activeItemId === itemId) {
      setActiveItemId(null);
    }
  };

  // --- Render
  return (
    <div ref={containerRef} className="px-6 md:px-10 pb-0 pt-4 md:pt-6">
      {/* Sticky Topbar (breadcrumb + header aksi) */}
      <div ref={topbarRef} className="border-b border-neutral-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70" style={{ top: `var(--shell-offset, ${safeTop}px)` }}>
        {/* Breadcrumb */}
        <nav className="px-1 pt-2 md:pt-3 pb-2 flex items-center text-sm text-neutral-600">
          <Link to="/dashboard" className="hover:text-neutral-800 hover:underline">
            Dashboard
          </Link>
          <ChevronRight className="mx-2 h-4 w-4 text-neutral-400" />
          <span className="text-neutral-900 font-medium">Pusat Informasi</span>
        </nav>

        {/* Header aksi (STICKY) */}
        <div className="flex items-center justify-between gap-3 bg-transparent px-1 pb-3">
          <h1 className="text-xl md:text-2xl font-semibold text-neutral-900">Dokumentasi & Bantuan</h1>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="hidden md:inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Mode
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  title="Buka pencarian (⌘K)"
                >
                  <SearchIcon className="h-4 w-4 text-neutral-600" />
                  <span className="hidden sm:inline">Search...</span>
                  <span className="ml-1 hidden rounded border border-neutral-300 px-1.5 py-0.5 text-[10px] text-neutral-500 sm:inline">⌘K</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 transition disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setOpenSec((m) => Object.fromEntries(Object.keys(m).map((k) => [k, !m[k]])))}
              className="inline-flex items-center rounded-lg border border-neutral-200 bg-white px-2 py-2 text-neutral-700 hover:bg-neutral-50 md:hidden"
              title="Toggle semua section"
            >
              <ListTree className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Layout 2 kolom: Sidebar (collapsible) + Content */}
      <div className="flex items-start gap-x-6 mt-6">
        {/* Sidebar */}
        <aside
          className="hidden md:block sticky w-[280px] flex-shrink-0 overflow-auto border-r border-neutral-200 pr-4 bg-white"
          style={{
            top: `calc(var(--shell-offset, ${safeTop}px) + ${topbarHeight}px)`,
            height: `calc(100vh - (var(--shell-offset, ${safeTop}px) + ${topbarHeight}px))`,
          }}
        >
          {loading ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-6 w-11/12 rounded-md bg-neutral-100" />
              ))}
            </div>
          ) : loadError ? (
            <div className="py-6">
              <EmptyState icon="error" title="Gagal memuat dokumentasi" description={loadError?.message || 'Terjadi kesalahan.'} variant="warning" />
            </div>
          ) : sections.length === 0 && !isEditing ? (
            <div className="py-6">
              <EmptyState icon="inbox" title="Belum ada konten" description="Konten dokumentasi akan segera ditambahkan." />
            </div>
          ) : (
            <nav className="pb-8">
              {sections.map((sec, idx) => {
                const opened = !!openSec[sec.id];
                return (
                  <div key={sec.id} className="mb-3 group/sec">
                    {/* Section header: collapsible */}
                    <div className="flex items-center justify-between hover:bg-neutral-50 rounded-md pr-1">
                      <button
                        type="button"
                        onClick={() => setOpenSec((m) => ({ ...m, [sec.id]: !opened }))}
                        className="flex-1 flex items-center justify-between px-3 py-2 text-left text-sm font-semibold tracking-wide text-neutral-700"
                      >
                        <span>{sec.title}</span>
                        <ChevronDown className={`h-4 w-4 text-neutral-500 transition-transform ${opened ? 'rotate-0' : '-rotate-90'}`} />
                      </button>

                      {isEditing && (
                        <div className="flex items-center gap-1 opacity-0 group-hover/sec:opacity-100 transition-opacity">
                          <button onClick={() => moveSection(idx, 'up')} disabled={idx === 0} className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30">
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button onClick={() => moveSection(idx, 'down')} disabled={idx === sections.length - 1} className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30">
                            <ArrowDown className="h-3 w-3" />
                          </button>
                          <button onClick={() => deleteSection(sec.id)} className="p-1 text-red-400 hover:text-red-700">
                            <Trash2 className="h-3 w-3" />
                          </button>
                          <button onClick={() => addArticle(sec.id)} className="p-1 text-primary-600 hover:text-primary-800" title="Tambah Artikel">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    {opened && (
                      <ul className="animate-[fadeIn_120ms_ease-out]">
                        {(sec.items || []).map((it) => {
                          const active = it.id === activeItemId;
                          return (
                            <li key={it.id} className="group/item relative">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveSectionId(sec.id);
                                  setActiveItemId(it.id);
                                  nav(`#${it.id}`, { replace: true });
                                  scrollContentToTop();
                                }}
                                className={`
                                  mx-3 mb-1 w-[calc(100%-0.75rem)] rounded-md px-3 py-2 text-left text-sm transition
                                  ${active ? 'bg-primary-50 text-priority-700 font-medium border border-primary-200' : 'text-neutral-700 hover:bg-neutral-50 border border-transparent'}
                                `}
                              >
                                {it.title}
                              </button>

                              {isEditing && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/90 shadow-sm rounded-md px-1 py-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                  <button onClick={(e) => { e.stopPropagation(); startEditArticle(sec.id, it); }} className="p-1 text-neutral-500 hover:text-primary-600">
                                    <Edit2 className="h-3 w-3" />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); deleteArticle(sec.id, it.id); }} className="p-1 text-neutral-500 hover:text-red-600">
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </li>
                          );
                        })}
                        {isEditing && (sec.items || []).length === 0 && (
                          <li className="px-6 py-2 text-xs text-neutral-400 italic">
                            Belum ada artikel. Klik + di header section untuk menambah.
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                );
              })}

              {isEditing && (
                <button
                  onClick={addSection}
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-200 p-3 text-sm font-medium text-neutral-500 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 transition"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Section
                </button>
              )}
            </nav>
          )}
        </aside>

        {/* Content area */}
        <main ref={contentRef} className="w-full">
          {editingItem ? (
            <div className="mx-auto max-w-[900px]">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">Edit Artikel</h2>
                <button onClick={() => setEditingItem(null)} className="text-sm text-neutral-500 hover:text-neutral-700">Cancel</button>
              </div>

              <div className="space-y-4 bg-white p-6 rounded-xl border border-neutral-200">
                <div>
                  <label className="block text-sm font-medium mb-1">Judul</label>
                  <input
                    className="w-full border p-2 rounded-lg"
                    value={editingItem.title}
                    onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ringkasan (Summary)</label>
                  <textarea
                    className="w-full border p-2 rounded-lg"
                    rows={2}
                    value={editingItem.summary || ''}
                    onChange={e => setEditingItem({ ...editingItem, summary: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Konten Dokumentasi</label>
                  <RichTextEditor
                    value={editingItem.content}
                    onChange={val => setEditingItem({ ...editingItem, content: val })}
                    className="min-h-[400px]"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button onClick={() => setEditingItem(null)} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg">Batal</button>
                  <button onClick={() => saveArticleChanges(editingItem)} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg">Simpan ke Draft</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-[800px] px-0 md:px-6">
              {loading ? (
                <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-6">
                  <div className="h-6 w-1/2 rounded-md bg-neutral-100" />
                  <div className="h-4 w-3/4 rounded-md bg-neutral-100" />
                  <div className="h-4 w-2/3 rounded-md bg-neutral-100" />
                  <div className="h-40 w-full rounded-lg bg-neutral-50" />
                </div>
              ) : loadError ? (
                <EmptyState icon="error" title="Gagal memuat dokumentasi" description={loadError?.message || 'Terjadi kesalahan.'} variant="warning" />
              ) : sections.length === 0 ? (
                <EmptyState icon="inbox" title="Belum ada konten" description="Konten dokumentasi akan segera ditambahkan." />
              ) : !activeItem ? (
                <EmptyState icon="inbox" title="Tidak ada item" description="Pilih item dokumentasi dari sidebar." />
              ) : (
                <article className="rounded-2xl  bg-white p-5 md:p-7 transition ">
                  <header className="mb-4">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs text-primary-700">
                      <BookOpen className="h-3.5 w-3.5" />
                      {sections.find((s) => s.id === activeSectionId)?.title || 'Dokumentasi'}
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-neutral-900">{activeItem.title}</h2>
                    {activeItem.summary && <p className="mt-2 text-[15px] leading-7 text-neutral-700">{activeItem.summary}</p>}
                  </header>

                  {activeItem.content && (
                    <div className="prose prose-sm max-w-none text-neutral-700" dangerouslySetInnerHTML={{ __html: activeItem.content }} />
                  )}

                  {(activeItem?.permissions?.allowed?.length ?? 0) > 0 && (
                    <section>
                      <h3 className="mt-8 mb-3 border-t border-neutral-200 pt-4 text-lg font-semibold text-neutral-900">Diizinkan</h3>
                      <ul className="list-disc pl-6 text-neutral-700 space-y-1">
                        {activeItem.permissions.allowed.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {(activeItem?.permissions?.denied?.length ?? 0) > 0 && (
                    <section>
                      <h3 className="mt-8 mb-3 border-t border-neutral-200 pt-4 text-lg font-semibold text-neutral-900">Dilarang</h3>
                      <ul className="list-disc pl-6 text-neutral-700 space-y-1">
                        {activeItem.permissions.denied.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {activeItem.tags?.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-1.5">
                      {activeItem.tags.map((t) => (
                        <span key={t} className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] text-neutral-700">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              )}

              {/* Quick Start cards */}
              {!loading && !isEditing && (
                <section className="mt-8">
                  <h3 className="mb-3 text-lg font-semibold text-neutral-900">Quick Start</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {flatItems.slice(0, 3).map((it) => {
                      const Icon = pickIcon(it);
                      const active = it.id === activeItemId;
                      return (
                        <button
                          key={it.id}
                          type="button"
                          onClick={() => {
                            setActiveSectionId(it.__sectionId);
                            setActiveItemId(it.id);
                            nav(`#${it.id}`, { replace: true });
                            scrollContentToTop();
                          }}
                          className={`
                            group text-left rounded-xl border px-5 py-4 transition
                            hover:-translate-y-0.5 hover:shadow-xl hover:scale-[1.01]
                            ${active ? 'border-primary-300 bg-primary-50' : 'border-neutral-200 bg-white hover:border-primary-300'}
                          `}
                        >
                          <div className="mb-2 inline-grid size-10 place-items-center rounded-lg border border-primary-200 bg-primary-50">
                            <Icon className="h-5 w-5 text-primary-600" />
                          </div>
                          <p className="text-sm font-semibold text-neutral-900">{it.title}</p>
                          {it.summary && <p className="mt-1 text-sm text-neutral-600 line-clamp-3">{it.summary}</p>}
                          <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-600">
                            Buka <ExternalLink className="h-3.5 w-3.5" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSearchOpen(false)} />
          <div className="fixed left-1/2 top-24 z-50 w-[92%] max-w-[600px] -translate-x-1/2 rounded-xl border border-neutral-200 bg-white shadow-2xl">
            <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3">
              <SearchIcon className="h-4 w-4 text-neutral-500" />
              <input autoFocus value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search documentation..." className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-neutral-400" />
              <button type="button" onClick={() => setSearchOpen(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 hover:bg-neutral-50">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[300px] overflow-auto p-2">
              {searchTerm && results.length === 0 && <p className="px-3 py-2 text-sm text-neutral-600">Tidak ada hasil.</p>}
              {(!searchTerm ? flatItems.slice(0, 8) : results).map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => {
                    setActiveSectionId(it.__sectionId);
                    setActiveItemId(it.id);
                    nav(`#${it.id}`, { replace: true });
                    setSearchOpen(false);
                    setSearchTerm('');
                    scrollContentToTop();
                  }}
                  className="flex w-full flex-col rounded-md px-3 py-2 text-left text-sm hover:bg-neutral-50"
                >
                  <span className="font-medium text-neutral-900">{it.title}</span>
                  <span className="text-xs text-neutral-600">{it.__sectionTitle}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
