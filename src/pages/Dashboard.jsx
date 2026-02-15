import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, LineChart, Line } from 'recharts';
import { GraduationCap, Users, CalendarDays, FileText, Download, Sparkles, Eye, Clock, TrendingUp, ChevronDown, Loader2, RefreshCw } from 'lucide-react';
import { apiGet } from '../utils/api';

const formatID = (n) => new Intl.NumberFormat('id-ID').format(n);


const TIME_RANGES = [
  { value: 7, label: '7 hari terakhir' },
  { value: 14, label: '14 hari terakhir' },
  { value: 30, label: '30 hari terakhir' },
  { value: 60, label: '60 hari terakhir' },
  { value: 90, label: '90 hari terakhir' },
  { value: 365, label: 'Tahun lalu' },
];


function Section({ title, right, children }) {
  return (
    <div className="mt-6 rounded-2xl border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
        <h3 className="text-base md:text-lg font-semibold text-neutral-900">{title}</h3>
        {right}
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </div>
  );
}

function ListItem({ rank, title, metaLeft, metaRight }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {typeof rank !== 'undefined' && <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-neutral-200 bg-neutral-50 text-sm font-semibold text-neutral-700">{rank}</div>}
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-neutral-900">{title}</div>
          <div className="mt-0.5 text-xs text-neutral-500">{metaLeft}</div>
        </div>
      </div>
      <div className="shrink-0 text-sm font-semibold text-neutral-800">{metaRight}</div>
    </div>
  );
}

function TimeRangeSelector({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = TIME_RANGES.find((r) => r.value === value)?.label || '7 hari terakhir';

  return (
    <div className="relative">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors text-sm font-medium text-neutral-700">
        <Clock className="w-4 h-4 text-neutral-500" />
        {selectedLabel}
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-neutral-200 shadow-lg py-1 z-20">
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                type="button"
                onClick={() => {
                  onChange(range.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${value === range.value ? 'bg-primary-50 text-primary-700 font-medium' : 'text-neutral-700 hover:bg-neutral-50'}`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EmptyChart({ message = 'Belum ada data' }) {
  return (
    <div className="h-[360px] w-full flex items-center justify-center">
      <div className="text-center text-neutral-500">
        <CalendarDays className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-primary-500 mr-2" />
      <span className="text-neutral-600">Memuat data...</span>
    </div>
  );
}


function ChartCard({ title, value, unit, series, colorVar = 'var(--primary-500)', loading }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4 md:p-5">
      <div>
        <div className="text-sm font-semibold text-neutral-800">{title}</div>
        <div className="mt-1 text-neutral-500">
          {loading ? (
            <div className="h-7 w-20 bg-neutral-100 animate-pulse rounded" />
          ) : (
            <>
              <span className="text-xl font-semibold text-neutral-900">{value}</span> {unit}
            </>
          )}
        </div>
      </div>

      <div className="h-16 w-40 md:w-44">
        {loading ? (
          <div className="w-full h-full bg-neutral-100 animate-pulse rounded" />
        ) : series && series.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 6, bottom: 0, left: 0, right: 0 }}>
              <Tooltip
                formatter={(v) => formatID(v)}
                labelFormatter={(l) => `Index ${l}`}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--neutral-200)',
                  boxShadow: 'none',
                }}
              />
              <Line type="monotone" dataKey="y" stroke={colorVar} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">No data</div>
        )}
      </div>
    </div>
  );
}


function TrafficTab({ summary, loading, error, onRetry, days, onDaysChange }) {
  const traffic = summary?.traffic?.series ?? [];
  const applicants = summary?.counts?.scholarshipApplications ?? 0;
  const prokerVisitors = summary?.byPrefix?.proker?.visitors ?? 0;
  const eventVisitors = summary?.byPrefix?.events?.visitors ?? 0;
  const articleVisitors = summary?.byPrefix?.articles?.visitors ?? 0;


  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const dateRange = `${startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;


  const handleExport = () => {
    if (!traffic.length) return;

    const headers = ['Tanggal', 'Views', 'Pengunjung'];
    const rows = traffic.map((d) => [d.day, d.views || 0, d.insights || 0]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `traffic-analytics-${days}days-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Header with filters */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Traffic Analytics</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Periode: <span className="font-medium text-neutral-700">{dateRange}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TimeRangeSelector value={days} onChange={onDaysChange} />
          <button onClick={onRetry} disabled={loading} className="p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-500 transition-colors disabled:opacity-50" title="Refresh data">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExport}
            disabled={!traffic.length}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}{' '}
          <button onClick={onRetry} className="ml-2 underline font-medium">
            Coba lagi
          </button>
        </div>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StatCard title="Jumlah Pendaftar Beasiswa" value={loading ? '...' : formatID(applicants)} unit="peserta" icon={<GraduationCap size={22} className="text-primary-500" />} to="/beasiswa" />
        <StatCard title="Jumlah Pengunjung Proker" value={loading ? '...' : formatID(prokerVisitors)} unit="pengunjung" icon={<Users size={22} className="text-primary-500" />} to="/aktivitas" />
        <StatCard title="Jumlah Pengunjung Event" value={loading ? '...' : formatID(eventVisitors)} unit="pengunjung" icon={<CalendarDays size={22} className="text-primary-500" />} to="/aktivitas" />
        <StatCard title="Jumlah Pengunjung Artikel" value={loading ? '...' : formatID(articleVisitors)} unit="pengunjung" icon={<FileText size={22} className="text-primary-500" />} to="/artikel" />
      </div>


      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base md:text-lg font-semibold text-neutral-900">Grafik Pengunjung Website</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 hidden sm:inline">{days} hari terakhir</span>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : traffic.length === 0 ? (
          <EmptyChart message="Belum ada data traffic untuk periode ini" />
        ) : (
          <>
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={traffic} barGap={8}>
                  <CartesianGrid stroke="var(--neutral-200)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: 'var(--neutral-600)', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'var(--neutral-200)' }} />
                  <YAxis tick={{ fill: 'var(--neutral-600)', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'var(--neutral-200)' }} width={40} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid var(--neutral-200)',
                      boxShadow: 'none',
                    }}
                    cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                    formatter={(value, name) => [formatID(value), name]}
                  />
                  <Bar dataKey="views" name="Views" fill="var(--secondary-400)" radius={[6, 6, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="insights" name="Pengunjung" fill="var(--primary-400)" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-neutral-700">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ background: 'var(--secondary-400)' }} />
                Views
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ background: 'var(--primary-400)' }} />
                Pengunjung
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}


function InsightTab({ summary, loading, error, onRetry, days, onDaysChange }) {
  const allTimeViews = summary?.allTime?.views ?? 0;
  const allTimeVisitors = summary?.allTime?.visitors ?? 0;
  const articlesCount = summary?.counts?.articles ?? 0;
  const activitiesCount = summary?.counts?.activities ?? 0;

  const latestArticles = summary?.latestArticles ?? [];
  const topArticles = summary?.topArticles ?? [];

  const currentYear = new Date().getFullYear();
  const articlesThisYear = latestArticles.filter((a) => new Date(a.publishedAt || a.createdAt).getFullYear() === currentYear).length;


  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const dateRange = `${startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;


  const handleExportInsight = () => {
    const data = [
      ['Metrik', 'Nilai'],
      ['Total Tampilan', allTimeViews],
      ['Total Pengunjung', allTimeVisitors],
      ['Total Artikel', articlesCount],
      ['Total Aktivitas', activitiesCount],
      ['Artikel Tahun Ini', articlesThisYear],
      ['', ''],
      ['Artikel Terbaru', ''],
      ...latestArticles.slice(0, 10).map((a) => [a.title, `${a.views || 0} views`]),
      ['', ''],
      ['Artikel Terpopuler', ''],
      ...topArticles.slice(0, 10).map((a) => [a.title, `${a.views || 0} views`]),
    ];

    const csv = data.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `insight-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}{' '}
          <button onClick={onRetry} className="ml-2 underline font-medium">
            Coba lagi
          </button>
        </div>
      )}

      {/* Header with filters */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Content Insights</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Periode: <span className="font-medium text-neutral-700">{dateRange}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TimeRangeSelector value={days} onChange={onDaysChange} />
          <button onClick={onRetry} disabled={loading} className="p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-500 transition-colors disabled:opacity-50" title="Refresh data">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportInsight}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>


      <div className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h4 className="text-base font-semibold text-neutral-900">Ringkasan Konten</h4>
            <p className="text-xs text-neutral-500 mt-1">{days} hari terakhir</p>
          </div>
          <TrendingUp size={18} className="text-neutral-500" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={18} className="text-primary-500" />
              <span className="text-xs font-medium text-neutral-600">Artikel</span>
            </div>
            <div className="text-2xl font-bold text-neutral-900">{loading ? '...' : formatID(articlesThisYear)}</div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={18} className="text-blue-500" />
              <span className="text-xs font-medium text-neutral-600">Views</span>
            </div>
            <div className="text-2xl font-bold text-neutral-900">{loading ? '...' : formatID(allTimeViews)}</div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} className="text-green-500" />
              <span className="text-xs font-medium text-neutral-600">Pengunjung</span>
            </div>
            <div className="text-2xl font-bold text-neutral-900">{loading ? '...' : formatID(allTimeVisitors)}</div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays size={18} className="text-amber-500" />
              <span className="text-xs font-medium text-neutral-600">Aktivitas</span>
            </div>
            <div className="text-2xl font-bold text-neutral-900">{loading ? '...' : formatID(activitiesCount)}</div>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <Section
          title="Artikel Terbaru"
          right={
            <div className="hidden md:flex items-center gap-2 text-sm text-neutral-500">
              <Clock size={16} /> Recent
            </div>
          }
        >
          {loading ? (
            <LoadingState />
          ) : latestArticles.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-sm">Belum ada artikel</div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {latestArticles.slice(0, 5).map((p) => (
                <ListItem
                  key={p.id}
                  title={p.title}
                  metaLeft={`${p.category || 'Artikel'} • ${new Date(p.publishedAt || p.createdAt).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}`}
                  metaRight={`${formatID(p.views || 0)} views`}
                />
              ))}
            </div>
          )}
        </Section>

        <Section
          title="Artikel Terpopuler"
          right={
            <div className="hidden md:flex items-center gap-2 text-sm text-neutral-500">
              <TrendingUp size={16} /> All Time
            </div>
          }
        >
          {loading ? (
            <LoadingState />
          ) : topArticles.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-sm">Belum ada data</div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {topArticles.slice(0, 5).map((p, i) => (
                <ListItem key={p.id} rank={i + 1} title={p.title} metaLeft={`${p.category || 'Artikel'} • ${new Date(p.publishedAt || p.createdAt).getFullYear()}`} metaRight={`${formatID(p.views || 0)} views`} />
              ))}
            </div>
          )}
        </Section>
      </div>
    </>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { tab: tabParam } = useParams();
  const allowed = ['traffic', 'insight'];
  const initial = allowed.includes(tabParam) ? tabParam : 'traffic';
  const [tab, setTab] = useState(initial);


  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGet(`/analytics/summary?days=${days}`);
      setSummary(response?.data || {});
    } catch (err) {
      // Error fetching dashboard summary
      setError(err.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);


  useEffect(() => {
    if (allowed.includes(tabParam) && tabParam !== tab) setTab(tabParam);
    if (!allowed.includes(tabParam)) navigate('/dashboard/traffic', { replace: true });
  }, [tabParam]); // eslint-disable-line

  const onSwitch = (key) => {
    if (key !== tab) {
      setTab(key);
      navigate(`/dashboard/${key}`); // push slug
    }
  };

  return (
    <div className="px-6 md:px-10 py-6">

      <div className="mb-5">
        <div role="tablist" aria-label="Dashboard tabs" className="w-full grid grid-cols-2 border-b border-neutral-200">
          {['traffic', 'insight'].map((key) => {
            const active = tab === key;
            const label = key === 'traffic' ? 'Traffic' : 'Insight';
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                onClick={() => onSwitch(key)}
                className={[
                  'w-full px-4 py-3 text-sm font-medium transition-colors -mb-[1px] border-b-2',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
                  active ? 'border-primary-500 text-neutral-900' : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:border-neutral-300',
                ].join(' ')}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'traffic' ? (
        <TrafficTab summary={summary} loading={loading} error={error} onRetry={fetchSummary} days={days} onDaysChange={setDays} />
      ) : (
        <InsightTab summary={summary} loading={loading} error={error} onRetry={fetchSummary} days={days} onDaysChange={setDays} />
      )}
    </div>
  );
}
