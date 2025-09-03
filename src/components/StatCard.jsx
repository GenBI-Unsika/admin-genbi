export default function StatCard({ icon, title, value, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className={`i-tabler-${icon} text-2xl text-gray-500`} />
          <div>
            <p className="text-sm font-semibold text-gray-700">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        <span className="i-tabler-chevron-right text-gray-400" />
      </div>
    </button>
  );
}
