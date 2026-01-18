import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, LineChart, Line } from 'recharts';
import { GraduationCap, Users, CalendarDays, FileText, Download, Sparkles, Eye, MessageCircle, Clock, CalendarRange, TrendingUp, Star } from 'lucide-react';

const formatID = (n) => new Intl.NumberFormat('id-ID').format(n);

/* ===================== DATA: TRAFFIC (contoh) ===================== */
const chartData = [
  { day: '21', views: 300, insights: 560 },
  { day: '22', views: 410, insights: 450 },
  { day: '23', views: 90, insights: 120 },
  { day: '24', views: 330, insights: 820 },
  { day: '25', views: 420, insights: 450 },
  { day: '26', views: 450, insights: 830 },
  { day: '27', views: 230, insights: 650 },
  { day: '28', views: 400, insights: 980 },
  { day: '29', views: 260, insights: 600 },
  { day: '30', views: 620, insights: 660 },
];

/* ===================== DATA: INSIGHT (stub — ganti dari API) ===================== */
const latestPosts = [
  { id: 'p1', title: 'Peluncuran Proker “GenBI Mengajar”', type: 'Proker', date: '2025-09-28', views: 450 },
  { id: 'p2', title: 'Liputan Event: Seminar Literasi Keuangan', type: 'Event', date: '2025-09-25', views: 389 },
  { id: 'p3', title: 'Artikel: Tips Lolos Beasiswa Bank Indonesia', type: 'Artikel', date: '2025-09-24', views: 512 },
  { id: 'p4', title: 'Artikel: Roadmap Karier Awardee', type: 'Artikel', date: '2025-09-22', views: 301 },
  { id: 'p5', title: 'Event: Tech for Social Good', type: 'Event', date: '2025-09-20', views: 267 },
];

const popularLastYear = [
  { id: 'y1', title: 'Artikel: Strategi Menulis Esai Beasiswa', type: 'Artikel', year: 2024, views: 12340 },
  { id: 'y2', title: 'Event: Kuliah Umum Ekonomi Syariah', type: 'Event', year: 2024, views: 10892 },
  { id: 'y3', title: 'Proker: Pengabdian Desa Binaan', type: 'Proker', year: 2024, views: 9721 },
  { id: 'y4', title: 'Artikel: Portfolio Awardee Terbaik', type: 'Artikel', year: 2024, views: 8610 },
  { id: 'y5', title: 'Event: Bootcamp Leadership', type: 'Event', year: 2024, views: 8427 },
];

const allTime = { views: 198765, visitors: 154321, posts: 276, comments: 4890 };

const dayOfWeekStats = [
  { day: 'Senin', views: 23560 },
  { day: 'Selasa', views: 24780 },
  { day: 'Rabu', views: 26110 },
  { day: 'Kamis', views: 27340 },
  { day: 'Jumat', views: 28950 },
  { day: 'Sabtu', views: 31520 },
  { day: 'Minggu', views: 30110 },
].sort((a, b) => b.views - a.views);

const bestTime = { bestDay: 'Sabtu', bestHour: '19:00 – 20:00' };

const review2025 = { posts: 74, words: 94213, likes: 3610, comments: 1298 };

/* Mini-series untuk kartu metrik Insight (contoh 12 titik) */
const insightSeries = {
  views: [
    { i: 1, y: 920 },
    { i: 2, y: 980 },
    { i: 3, y: 960 },
    { i: 4, y: 1010 },
    { i: 5, y: 995 },
    { i: 6, y: 1040 },
    { i: 7, y: 1020 },
    { i: 8, y: 1090 },
    { i: 9, y: 1110 },
    { i: 10, y: 1080 },
    { i: 11, y: 1130 },
    { i: 12, y: 1150 },
  ],
  visitors: [
    { i: 1, y: 720 },
    { i: 2, y: 740 },
    { i: 3, y: 735 },
    { i: 4, y: 760 },
    { i: 5, y: 780 },
    { i: 6, y: 800 },
    { i: 7, y: 795 },
    { i: 8, y: 820 },
    { i: 9, y: 815 },
    { i: 10, y: 840 },
    { i: 11, y: 860 },
    { i: 12, y: 875 },
  ],
  posts: [
    { i: 1, y: 14 },
    { i: 2, y: 17 },
    { i: 3, y: 16 },
    { i: 4, y: 18 },
    { i: 5, y: 19 },
    { i: 6, y: 18 },
    { i: 7, y: 20 },
    { i: 8, y: 22 },
    { i: 9, y: 21 },
    { i: 10, y: 23 },
    { i: 11, y: 24 },
    { i: 12, y: 24 },
  ],
  comments: [
    { i: 1, y: 120 },
    { i: 2, y: 130 },
    { i: 3, y: 128 },
    { i: 4, y: 140 },
    { i: 5, y: 150 },
    { i: 6, y: 160 },
    { i: 7, y: 158 },
    { i: 8, y: 170 },
    { i: 9, y: 180 },
    { i: 10, y: 176 },
    { i: 11, y: 185 },
    { i: 12, y: 190 },
  ],
};

/* ===================== HELPERS UI (Insight) ===================== */
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

/* Kartu metrik dengan mini grafik (sparkline) untuk Insight */
function ChartCard({ title, value, unit, series, colorVar = 'var(--primary-500)' }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4 md:p-5">
      <div>
        <div className="text-sm font-semibold text-neutral-800">{title}</div>
        <div className="mt-1 text-neutral-500">
          <span className="text-xl font-semibold text-neutral-900">{value}</span> {unit}
        </div>
      </div>

      <div className="h-16 w-40 md:w-44">
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
      </div>
    </div>
  );
}

/* ===================== TAB: TRAFFIC ===================== */
function TrafficTab() {
  return (
    <>
      {/* 4 kartu statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StatCard title="Jumlah Pendaftar Beasiswa" value={formatID(671)} unit="peserta" icon={<GraduationCap size={22} className="text-primary-500" />} to="/beasiswa" />
        <StatCard title="Jumlah Pengunjung Proker" value={formatID(1243)} unit="pengunjung" icon={<Users size={22} className="text-primary-500" />} to="/aktivitas" />
        <StatCard title="Jumlah Pengunjung Event" value={formatID(1159)} unit="pengunjung" icon={<CalendarDays size={22} className="text-primary-500" />} to="/aktivitas" />
        <StatCard title="Jumlah Pengunjung Artikel" value={formatID(987)} unit="peserta" icon={<FileText size={22} className="text-primary-500" />} to="/artikel" />
      </div>

      {/* Grafik Pengunjung Website */}
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base md:text-lg font-semibold text-neutral-900">Grafik Pengunjung Website</h3>
          <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500" aria-label="Unduh data" title="Unduh data">
            <Download size={18} />
          </button>
        </div>

        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8}>
              <CartesianGrid stroke="var(--neutral-200)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--neutral-600)', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'var(--neutral-200)' }} />
              <YAxis tick={{ fill: 'var(--neutral-600)', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'var(--neutral-200)' }} width={30} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--neutral-200)',
                  boxShadow: 'none',
                }}
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              />
              <Bar dataKey="views" name="Views" fill="var(--secondary-400)" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar dataKey="insights" name="Insights" fill="var(--primary-400)" radius={[6, 6, 0, 0]} maxBarSize={36} />
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
            Insights
          </div>
        </div>
      </div>
    </>
  );
}

/* ===================== TAB: INSIGHT ===================== */
function InsightTab() {
  return (
    <>
      {/* Sorotan Sepanjang Masa — versi grafik per metrik */}
      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <ChartCard title="Total Tampilan" value={formatID(allTime.views)} unit="tampilan" series={insightSeries.views} colorVar="var(--primary-500)" />
          <ChartCard title="Total Pengunjung" value={formatID(allTime.visitors)} unit="pengunjung" series={insightSeries.visitors} colorVar="var(--secondary-500)" />
          <ChartCard title="Total Postingan" value={formatID(allTime.posts)} unit="posting" series={insightSeries.posts} colorVar="var(--primary-500)" />
          <ChartCard title="Total Komentar" value={formatID(allTime.comments)} unit="komentar" series={insightSeries.comments} colorVar="var(--secondary-500)" />
        </div>

        {/* Tinjauan 2025 (YTD) — biarkan seperti semula */}
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-neutral-900">Tinjauan 2025</h4>
            <TrendingUp size={18} className="text-neutral-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <StatCard title="Postingan Baru" value={formatID(review2025.posts)} unit="posting" icon={<FileText size={22} className="text-primary-500" />} />
            <StatCard title="Total Kata" value={formatID(review2025.words)} unit="kata" icon={<Sparkles size={22} className="text-primary-500" />} />
            <StatCard title="Total Suka" value={formatID(review2025.likes)} unit="suka" icon={<Star size={22} className="text-primary-500" />} />
            <StatCard title="Total Komentar" value={formatID(review2025.comments)} unit="komentar" icon={<MessageCircle size={22} className="text-primary-500" />} />
          </div>

          <div className="mt-4 text-xs text-neutral-500">Periode: 1 Jan 2025 – 31 Des 2025 (year-to-date). Sesuaikan dengan filter kalender jika diperlukan.</div>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Waktu Terpopuler */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-neutral-900">Waktu Terpopuler</h4>
              <Clock size={18} className="text-neutral-500" />
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="text-xs text-neutral-500">Hari Terbaik</div>
                <div className="mt-1 text-base font-semibold text-neutral-900">{bestTime.bestDay}</div>
                <div className="mt-1 text-xs text-neutral-500">Rata-rata traffic tertinggi</div>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="text-xs text-neutral-500">Jam Terbaik</div>
                <div className="mt-1 text-base font-semibold text-neutral-900">{bestTime.bestHour}</div>
                <div className="mt-1 text-xs text-neutral-500">Rata-rata traffic tertinggi</div>
              </div>
            </div>
          </div>

          {/* Hari Terpopuler (Tabel) */}
          <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-neutral-900">Hari Terpopuler</h4>
              <CalendarRange size={18} className="text-neutral-500" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-500 border-b border-neutral-200">
                    <th className="py-2 pr-4 font-medium">Peringkat</th>
                    <th className="py-2 pr-4 font-medium">Hari</th>
                    <th className="py-2 pr-4 font-medium">Total Tampilan</th>
                  </tr>
                </thead>
                <tbody>
                  {dayOfWeekStats.map((d, i) => (
                    <tr key={d.day} className="border-b border-neutral-100">
                      <td className="py-2 pr-4">
                        <div className="inline-grid h-8 w-8 place-items-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-700 font-semibold">{i + 1}</div>
                      </td>
                      <td className="py-2 pr-4 text-neutral-900 font-medium">{d.day}</td>
                      <td className="py-2 pr-4 text-neutral-800">{formatID(d.views)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
              <Star size={14} /> Diurutkan berdasarkan total tampilan sepanjang masa.
            </div>
          </div>
        </div>

        {/* Analisis Konten */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Section
            title="Postingan Terbaru"
            right={
              <div className="hidden md:flex items-center gap-2 text-sm text-neutral-500">
                <Sparkles size={16} /> 5 terbaru
              </div>
            }
          >
            <div className="divide-y divide-neutral-200">
              {latestPosts.map((p) => (
                <ListItem
                  key={p.id}
                  title={p.title}
                  metaLeft={`${p.type} • ${new Date(p.date).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}`}
                  metaRight={`${formatID(p.views)} tampilan`}
                />
              ))}
            </div>
          </Section>

          <Section
            title="Postingan Terpopuler Tahun Lalu"
            right={
              <div className="hidden md:flex items-center gap-2 text-sm text-neutral-500">
                <TrendingUp size={16} /> Tahun {popularLastYear[0]?.year || 'Lalu'}
              </div>
            }
          >
            <div className="divide-y divide-neutral-200">
              {popularLastYear.slice(0, 10).map((p, i) => (
                <ListItem key={p.id} rank={i + 1} title={p.title} metaLeft={`${p.type} • ${p.year}`} metaRight={`${formatID(p.views)} tampilan`} />
              ))}
            </div>
          </Section>
        </div>
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

  // sinkron saat slug berubah (back/forward)
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
      {/* Tabs full-width + underline biru */}
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

      {tab === 'traffic' ? <TrafficTab /> : <InsightTab />}
    </div>
  );
}
