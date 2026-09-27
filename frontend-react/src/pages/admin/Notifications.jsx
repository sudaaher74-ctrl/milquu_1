import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, AlertCircle, AlertTriangle, Info, Check, RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react';
import { useToday } from '../../utils/useToday.js';
import { buildAlerts, getReadAlerts, markAlertsRead } from '../../utils/adminAlerts.js';
import { getAdminSession } from '../../utils/adminAccess.js';

const LEVEL = {
  critical: { icon: AlertCircle, bg: 'bg-red-50', color: 'text-red-600', border: 'border-red-100', label: 'Critical' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50', color: 'text-amber-600', border: 'border-amber-100', label: 'Needs action' },
  info: { icon: Info, bg: 'bg-blue-50', color: 'text-milquu-blue', border: 'border-blue-100', label: 'For your info' }
};

/**
 * Alerts built from live data (/api/admin/today). Each one disappears on its
 * own once the underlying issue is dealt with; "read" only dims it here.
 */
const Notifications = () => {
  const role = getAdminSession()?.role || 'staff';
  const { today, error, loading, reload } = useToday({ pollMs: 60 * 1000 });
  const [filter, setFilter] = useState('All');
  const [read, setRead] = useState(() => getReadAlerts());

  const alerts = buildAlerts(today, role);
  const categories = ['All', 'Unread', ...Array.from(new Set(alerts.map((a) => a.category)))];
  const visible = alerts.filter((a) => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !read.has(a.id);
    return a.category === filter;
  });
  const unread = alerts.filter((a) => !read.has(a.id)).length;
  const critical = alerts.filter((a) => a.level === 'critical').length;

  const markRead = (ids) => {
    markAlertsRead(ids);
    setRead(getReadAlerts());
  };

  return (
    <div className="max-w-5xl mx-auto pb-10 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-red-50 border border-red-100 text-red-600 rounded-lg shadow-sm">
              <Bell size={24} />
            </div>
            <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Alerts</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {today
              ? <>You have <strong className="text-red-600">{critical} critical</strong> and <strong className="text-milquu-blue">{unread} unread</strong> alert{unread === 1 ? '' : 's'}. Alerts clear themselves once dealt with.</>
              : 'Checking what needs attention…'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button onClick={reload} disabled={loading} className="text-sm font-medium text-gray-600 hover:text-milquu-dark flex items-center px-4 py-2 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 shadow-sm disabled:opacity-60">
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={() => markRead(alerts.map((a) => a.id))} disabled={!unread} className="text-sm font-medium text-gray-600 hover:text-milquu-dark flex items-center px-4 py-2 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 shadow-sm disabled:opacity-50">
            <Check size={16} className="mr-2" /> Mark all read
          </button>
        </div>
      </div>

      {error && !today && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl p-4 mb-6">{error}</div>
      )}

      <div className="flex space-x-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
        {categories.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
              filter === f ? 'bg-milquu-dark text-white border-milquu-dark shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {today && visible.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <CheckCircle2 size={32} className="mx-auto text-green-500 mb-2" />
            <p className="font-semibold text-milquu-dark">All clear</p>
            <p className="text-sm text-gray-500">{filter === 'All' ? 'Nothing needs attention right now.' : 'No alerts in this view.'}</p>
          </div>
        )}
        {visible.map((alert) => {
          const style = LEVEL[alert.level];
          const Icon = style.icon;
          const isRead = read.has(alert.id);
          return (
            <div key={alert.id} className={`bg-white rounded-2xl border ${isRead ? 'border-gray-100 opacity-70' : style.border} shadow-sm p-5 flex items-start gap-4`}>
              <div className={`p-2.5 rounded-xl ${style.bg} ${style.color} shrink-0`}><Icon size={20} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h2 className="font-bold text-milquu-dark">{alert.title}</h2>
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${style.bg} ${style.color}`}>{style.label}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{alert.category}</span>
                </div>
                <p className="text-sm text-gray-600">{alert.message}</p>
                <div className="flex items-center gap-4 mt-3">
                  <Link to={alert.link} className="text-sm font-medium text-milquu-blue hover:underline flex items-center">Resolve <ChevronRight size={14} /></Link>
                  {!isRead && (
                    <button onClick={() => markRead([alert.id])} className="text-sm text-gray-500 hover:text-milquu-dark">Mark read</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
