import { Link } from 'react-router-dom';
import {
  Truck, RefreshCw, AlertTriangle, AlertCircle, Info, Phone, Moon, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useToday } from '../../utils/useToday';
import { buildAlerts } from '../../utils/adminAlerts';
import { canAccess } from '../../utils/adminAccess';

const rupees = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;

const LEVEL = {
  critical: { icon: AlertCircle, box: 'border-red-200 bg-red-50/70', text: 'text-red-700', iconColor: 'text-red-600' },
  warning: { icon: AlertTriangle, box: 'border-amber-200 bg-amber-50/70', text: 'text-amber-800', iconColor: 'text-amber-600' },
  info: { icon: Info, box: 'border-blue-200 bg-blue-50/60', text: 'text-milquu-blue', iconColor: 'text-milquu-blue' }
};

/**
 * "What needs me this morning?" — the delivery round, tonight's run, and every
 * open action item, each linking to where it gets resolved.
 */
const TodayPanel = ({ role }) => {
  const { today, error, loading, reload } = useToday();

  if (!today) {
    return (
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {error ? (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={reload} className="text-sm font-medium text-milquu-blue hover:underline">Try again</button>
          </div>
        ) : (
          <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        )}
      </section>
    );
  }

  const { round } = today;
  const alerts = buildAlerts(today, role);
  const progress = round.total ? Math.round((round.delivered / round.total) * 100) : 0;
  const dateLabel = new Date(`${today.date}T00:00:00+05:30`).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata'
  });

  return (
    <section aria-labelledby="today-heading" className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="today-heading" className="text-xl font-bold text-milquu-dark">Today</h2>
          <p className="text-sm text-gray-500">{dateLabel}</p>
        </div>
        <button
          onClick={reload}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-milquu-blue px-3 py-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Delivery round */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-milquu-dark flex items-center gap-2"><Truck size={18} className="text-milquu-blue" /> Delivery round</h3>
            {canAccess('/admin/today-orders', role) && (
              <Link to="/admin/today-orders" className="text-sm font-medium text-milquu-blue hover:underline flex items-center">Open list <ChevronRight size={14} /></Link>
            )}
          </div>
          {round.total === 0 ? (
            <p className="text-sm text-gray-500">No deliveries are scheduled for today.</p>
          ) : (
            <>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-milquu-dark">{round.delivered}</span>
                <span className="text-gray-500">of {round.total} delivered</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <div className="bg-milquu-green h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <dl className="grid grid-cols-3 gap-3 text-sm">
                <div><dt className="text-gray-500">Still to go</dt><dd className="font-bold text-milquu-dark">{round.pending}</dd></div>
                <div><dt className="text-gray-500">Failed</dt><dd className={`font-bold ${round.failed ? 'text-red-600' : 'text-milquu-dark'}`}>{round.failed}</dd></div>
                <div><dt className="text-gray-500">Unassigned</dt><dd className={`font-bold ${round.unassigned ? 'text-red-600' : 'text-milquu-dark'}`}>{round.unassigned}</dd></div>
              </dl>
            </>
          )}
        </div>

        {/* Tonight's run */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-milquu-dark flex items-center gap-2 mb-3"><Moon size={18} className="text-indigo-600" /> Tomorrow&apos;s round</h3>
          {today.tomorrowRun.ran ? (
            <>
              <p className="text-sm text-gray-700 flex items-center gap-1.5"><CheckCircle2 size={16} className="text-green-600" /> Built and charged</p>
              <p className="text-sm text-gray-500 mt-2">{today.tomorrowRun.ordered} delivered orders, {today.tomorrowRun.refused} paused for low balance.</p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Builds automatically at 9:30 pm tonight, after the 9 pm change cut-off.</p>
          )}
        </div>
      </div>

      {/* Action items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-milquu-dark mb-3">Needs attention</h3>
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-500 flex items-center gap-1.5"><CheckCircle2 size={16} className="text-green-600" /> Nothing needs you right now.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.map((alert) => {
              const style = LEVEL[alert.level];
              const Icon = style.icon;
              return (
                <li key={alert.id}>
                  <Link to={alert.link} className={`flex items-start gap-3 p-3 rounded-xl border ${style.box} hover:shadow-sm transition-shadow`}>
                    <Icon size={18} className={`mt-0.5 shrink-0 ${style.iconColor}`} />
                    <div className="min-w-0">
                      <p className={`text-sm font-bold ${style.text}`}>{alert.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{alert.message}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Customers to call */}
      {today.autoPaused.items.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 pb-3">
            <h3 className="font-bold text-milquu-dark">Customers to call — plan paused, wallet short</h3>
            <p className="text-xs text-gray-500 mt-0.5">Their plan resumes on its own the night after they top up.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left font-semibold px-5 py-2">Customer</th>
                  <th className="text-right font-semibold px-5 py-2">Wallet</th>
                  <th className="text-right font-semibold px-5 py-2">Needs per delivery</th>
                  <th className="px-5 py-2"><span className="sr-only">Call</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {today.autoPaused.items.map((c) => (
                  <tr key={c._id}>
                    <td className="px-5 py-2.5 font-medium text-gray-800">{c.name || 'Customer'}</td>
                    <td className="px-5 py-2.5 text-right text-red-600 font-semibold">{c.walletBalance == null ? '—' : rupees(c.walletBalance)}</td>
                    <td className="px-5 py-2.5 text-right text-gray-700">{rupees(c.dailyTotal)}</td>
                    <td className="px-5 py-2.5 text-right">
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 text-milquu-blue font-medium hover:underline">
                          <Phone size={14} /> {c.phone}
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {today.autoPaused.count > today.autoPaused.items.length && (
            <p className="text-xs text-gray-500 px-5 py-3 border-t border-gray-50">Showing the {today.autoPaused.items.length} most recent of {today.autoPaused.count}.</p>
          )}
        </div>
      )}
    </section>
  );
};

export default TodayPanel;
