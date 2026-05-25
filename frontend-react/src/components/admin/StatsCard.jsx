export default function StatsCard({ icon, label, value, sub, color = 'green' }) {
  const colors = {
    green: 'bg-green-50 text-green-600 border-green-100',
    blue:  'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red:   'bg-red-50 text-red-600 border-red-100',
    purple:'bg-purple-50 text-purple-600 border-purple-100',
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color] || colors.green}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="font-display text-3xl font-bold text-gray-900 mb-1">{value ?? '—'}</div>
      <div className="font-semibold text-sm text-gray-700">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}
