import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Users, Calendar, Newspaper, Layers, X, Loader2, ArrowRight } from 'lucide-react';

// Sample search categories for filtering
const SEARCH_CATEGORIES = [
  { key: 'all', label: 'Semua', icon: Search },
  { key: 'artikel', label: 'Artikel', icon: Newspaper },
  { key: 'aktivitas', label: 'Aktivitas', icon: Calendar },
  { key: 'anggota', label: 'Anggota', icon: Users },
  { key: 'divisi', label: 'Divisi', icon: Layers },
];

export default function GlobalSearch({ className = '' }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [category, setCategory] = useState('all');
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query, category);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, category]);

  const performSearch = async (searchQuery, searchCategory) => {
    setLoading(true);
    try {
      // Mock search results - in production, call actual API
      // const response = await apiGet(`/search?q=${encodeURIComponent(searchQuery)}&category=${searchCategory}`);

      // Mock data for demonstration
      await new Promise((resolve) => setTimeout(resolve, 300));

      const mockResults = [
        { id: 1, type: 'artikel', title: 'Artikel tentang ' + searchQuery, subtitle: 'Draft • 2 hari lalu', path: '/artikel' },
        { id: 2, type: 'aktivitas', title: 'Event ' + searchQuery, subtitle: 'Proker • 5 Jan 2026', path: '/aktivitas' },
        { id: 3, type: 'anggota', title: 'Anggota dengan keyword ' + searchQuery, subtitle: 'Divisi Humas', path: '/anggota' },
        { id: 4, type: 'divisi', title: 'Divisi ' + searchQuery, subtitle: '12 anggota', path: '/divisi' },
      ].filter((r) => searchCategory === 'all' || r.type === searchCategory);

      setResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'artikel':
        return <Newspaper className="w-4 h-4" />;
      case 'aktivitas':
        return <Calendar className="w-4 h-4" />;
      case 'anggota':
        return <Users className="w-4 h-4" />;
      case 'divisi':
        return <Layers className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleResultClick = (result) => {
    setIsOpen(false);
    setQuery('');
    navigate(result.path);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-20 text-sm outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all"
          placeholder="Telusuri..."
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button type="button" onClick={handleClear} className="p-1 hover:bg-neutral-100 rounded transition-colors">
              <X className="w-4 h-4 text-neutral-400" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-xs text-neutral-400 bg-neutral-100 rounded border border-neutral-200">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden z-50">
          {/* Category Filter */}
          <div className="flex items-center gap-1 p-2 border-b border-neutral-100 overflow-x-auto">
            {SEARCH_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategory(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${category === cat.key ? 'bg-primary-100 text-primary-700' : 'text-neutral-600 hover:bg-neutral-100'}`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                <span className="ml-2 text-sm text-neutral-500">Mencari...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <button key={result.id} type="button" onClick={() => handleResultClick(result)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left group">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">{getResultIcon(result.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">{result.title}</p>
                      <p className="text-xs text-neutral-500">{result.subtitle}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            ) : query ? (
              <div className="py-8 text-center">
                <Search className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">Tidak ada hasil untuk "{query}"</p>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Search className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">Ketik untuk mencari...</p>
                <p className="text-xs text-neutral-400 mt-1">Cari artikel, aktivitas, anggota, dan divisi</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {!query && (
            <div className="border-t border-neutral-100 p-3">
              <p className="text-xs text-neutral-400 mb-2">Pintasan Cepat</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/artikel/new');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-medium text-neutral-700 transition-colors"
                >
                  <Newspaper className="w-3.5 h-3.5" />
                  Tulis Artikel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/aktivitas/new');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-medium text-neutral-700 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Tambah Aktivitas
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
