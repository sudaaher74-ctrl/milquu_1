import { useCallback, useEffect, useState } from 'react';
import {
  Store, Truck, Users, Moon, Save, Shield, Activity, Search, ShieldCheck, UserPlus, X, KeyRound, Power, Lock
} from 'lucide-react';
import api from '../../utils/api.js';
import toast from '../../utils/toast.js';
import { setBusinessSettings } from '../../utils/useBusinessSettings.js';
import {
  getAdminSession, isAdminRole, ROLE_LABELS, ROLE_DESCRIPTIONS
} from '../../utils/adminAccess.js';

const inputClass = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-milquu-blue transition-all text-sm disabled:text-gray-500 disabled:cursor-not-allowed';

const BUSINESS_FIELDS = [
  { key: 'businessName', label: 'Business name', type: 'text', required: true },
  { key: 'tagline', label: 'Tagline (printed under the name)', type: 'text' },
  { key: 'supportEmail', label: 'Support email', type: 'email' },
  { key: 'supportPhone', label: 'Support phone', type: 'text' },
  { key: 'gstin', label: 'GSTIN', type: 'text', placeholder: '15 characters, e.g. 27ABCDE1234F1Z5' },
  { key: 'fssaiLicense', label: 'FSSAI licence number', type: 'text', placeholder: '14 digits' },
  { key: 'address', label: 'Address', type: 'textarea', wide: true }
];

const RULE_LABELS = {
  planChangeCutoff: 'Plan changes close',
  nightlyRun: 'Nightly subscription run',
  websiteMorningSlot: 'Website morning slot',
  websiteEveningSlot: 'Website evening slot',
  deliveryCharge: 'Delivery charge',
  gst: 'GST'
};

// --- Business details -------------------------------------------------------

const BusinessTab = ({ canEdit }) => {
  const [form, setForm] = useState(null);
  const [rules, setRules] = useState({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.get('/api/admin/settings')
      .then(({ data }) => { setForm(data.business); setRules(data.systemRules || {}); })
      .catch((err) => toast.error(err.response?.data?.message || 'Could not load settings'));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const payload = Object.fromEntries(BUSINESS_FIELDS.map(({ key }) => [key, form[key] ?? '']));
      const { data } = await api.put('/api/admin/settings', payload);
      setForm(data.business);
      setBusinessSettings(data.business);
      toast.success('Business details saved. Receipts and vouchers now print them.');
    } catch (err) {
      const fieldErrors = Object.fromEntries((err.response?.data?.errors || []).map((x) => [x.path, x.message]));
      setErrors(fieldErrors);
      toast.error(err.response?.data?.message || 'Could not save settings');
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div className="h-64 bg-white rounded-2xl border border-gray-100 animate-pulse" />;

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-milquu-dark">Business details</h2>
            <p className="text-sm text-gray-500 mt-1">Printed on POS receipts, purchase vouchers and vendor statements.</p>
          </div>
          {canEdit ? (
            <button type="submit" disabled={saving} className="bg-milquu-blue text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 shadow-md flex items-center disabled:opacity-60">
              <Save size={18} className="mr-2" /> {saving ? 'Saving…' : 'Save details'}
            </button>
          ) : (
            <span className="text-xs text-gray-500 flex items-center gap-1"><Lock size={14} /> Only admins can change these</span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BUSINESS_FIELDS.map((field) => (
            <div key={field.key} className={field.wide ? 'md:col-span-2' : ''}>
              <label htmlFor={`biz-${field.key}`} className="block text-sm font-semibold text-gray-700 mb-2">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  id={`biz-${field.key}`}
                  rows="3"
                  disabled={!canEdit}
                  value={form[field.key] || ''}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className={`${inputClass} resize-none`}
                />
              ) : (
                <input
                  id={`biz-${field.key}`}
                  type={field.type}
                  required={field.required}
                  disabled={!canEdit}
                  placeholder={field.placeholder}
                  value={form[field.key] || ''}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  aria-invalid={Boolean(errors[field.key])}
                  className={inputClass}
                />
              )}
              {errors[field.key] && <p className="text-xs text-red-600 mt-1">{errors[field.key]}</p>}
            </div>
          ))}
        </div>
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-milquu-dark mb-1 flex items-center gap-2"><Truck size={20} /> Delivery &amp; tax rules</h2>
        <p className="text-sm text-gray-500 mb-5">How the system actually behaves. These are built into the app; a developer changes them.</p>
        <dl className="divide-y divide-gray-100">
          {Object.entries(rules).map(([key, value]) => (
            <div key={key} className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
              <dt className="text-sm font-semibold text-gray-700">{RULE_LABELS[key] || key}</dt>
              <dd className="text-sm text-gray-600 sm:col-span-2">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

// --- Employees --------------------------------------------------------------

const EMPTY_EMPLOYEE = { name: '', email: '', password: '', role: 'staff' };

const EmployeesTab = ({ me }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newEmployee, setNewEmployee] = useState(EMPTY_EMPLOYEE);
  const [resetFor, setResetFor] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api.get('/api/admin/employees')
    .then(({ data }) => setEmployees(data))
    .catch((err) => toast.error(err.response?.data?.message || 'Could not load employees'))
    .finally(() => setLoading(false)), []);

  useEffect(() => { load(); }, [load]);

  const assignableRoles = me.role === 'superadmin' ? ['staff', 'manager', 'admin', 'superadmin'] : ['staff', 'manager', 'admin'];

  const update = async (employee, changes, message) => {
    setBusy(true);
    try {
      await api.put(`/api/admin/employees/${employee._id}`, changes);
      toast.success(message);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update employee');
    } finally {
      setBusy(false);
    }
  };

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/api/admin/employees', newEmployee);
      toast.success(`${newEmployee.name} can now sign in at /admin/login.`);
      setNewEmployee(EMPTY_EMPLOYEE);
      setAdding(false);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add employee');
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    await update(resetFor, { password: newPassword }, `Password reset for ${resetFor.name}. Tell them the new one in person.`);
    setResetFor(null);
    setNewPassword('');
  };

  const toggleActive = (emp) => {
    const verb = emp.isActive ? 'Deactivate' : 'Reactivate';
    if (!window.confirm(`${verb} ${emp.name}?${emp.isActive ? ' They will be signed out immediately.' : ''}`)) return;
    update(emp, { isActive: !emp.isActive }, `${emp.name} ${emp.isActive ? 'deactivated' : 'reactivated'}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-milquu-dark">Employees &amp; roles</h2>
          <p className="text-sm text-gray-500 mt-1">Give everyone their own login. Deactivated accounts are signed out at once.</p>
        </div>
        <button onClick={() => setAdding(true)} className="bg-milquu-dark text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-2">
          <UserPlus size={16} /> Add employee
        </button>
      </div>

      <div className="px-6 sm:px-8 py-4 bg-gray-50/60 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3">
        {['staff', 'manager', 'admin'].map((r) => (
          <div key={r} className="text-xs text-gray-600"><span className="font-bold text-gray-800">{ROLE_LABELS[r]}:</span> {ROLE_DESCRIPTIONS[r]}</div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Employee</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">Loading…</td></tr>
            )}
            {employees.map((emp) => {
              const isMe = emp.email === me.email;
              const locked = emp.role === 'superadmin' && me.role !== 'superadmin';
              return (
                <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-milquu-dark">{emp.name}{isMe && <span className="ml-2 text-xs font-medium text-gray-400">(you)</span>}</p>
                    <p className="text-xs text-gray-500">{emp.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    {isMe || locked ? (
                      <span className="flex items-center text-sm font-medium text-gray-700">
                        {isAdminRole(emp.role) ? <ShieldCheck size={14} className="text-milquu-blue mr-1.5" /> : <Shield size={14} className="text-green-600 mr-1.5" />}
                        {ROLE_LABELS[emp.role] || emp.role}
                      </span>
                    ) : (
                      <select
                        aria-label={`Role for ${emp.name}`}
                        value={emp.role}
                        disabled={busy}
                        onChange={(e) => update(emp, { role: e.target.value }, `${emp.name} is now ${ROLE_LABELS[e.target.value]}`)}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                      >
                        {assignableRoles.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${emp.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {emp.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    {!locked && (
                      <button onClick={() => { setResetFor(emp); setNewPassword(''); }} disabled={busy} className="text-milquu-blue text-sm font-medium hover:underline inline-flex items-center gap-1 mr-4">
                        <KeyRound size={14} /> Reset password
                      </button>
                    )}
                    {!isMe && !locked && (
                      <button onClick={() => toggleActive(emp)} disabled={busy} className={`text-sm font-medium hover:underline inline-flex items-center gap-1 ${emp.isActive ? 'text-red-600' : 'text-green-700'}`}>
                        <Power size={14} /> {emp.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {adding && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="add-employee-title">
          <form onSubmit={create} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 id="add-employee-title" className="text-xl font-bold text-milquu-dark">Add employee</h2>
              <button type="button" onClick={() => setAdding(false)} className="text-gray-400 hover:text-gray-700" aria-label="Close"><X size={20} /></button>
            </div>
            <div>
              <label htmlFor="emp-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input id="emp-name" required minLength={2} value={newEmployee.name} onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label htmlFor="emp-email" className="block text-sm font-medium text-gray-700 mb-1">Email (their login)</label>
              <input id="emp-email" type="email" required value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label htmlFor="emp-password" className="block text-sm font-medium text-gray-700 mb-1">Starting password</label>
              <input id="emp-password" type="text" required minLength={8} autoComplete="new-password" value={newEmployee.password} onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })} className={inputClass} />
              <p className="text-xs text-gray-500 mt-1">At least 8 characters with a letter and a number.</p>
            </div>
            <div>
              <label htmlFor="emp-role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select id="emp-role" value={newEmployee.role} onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })} className={inputClass}>
                {assignableRoles.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
              {ROLE_DESCRIPTIONS[newEmployee.role] && <p className="text-xs text-gray-500 mt-1">{ROLE_DESCRIPTIONS[newEmployee.role]}</p>}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setAdding(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">Cancel</button>
              <button type="submit" disabled={busy} className="px-4 py-2 bg-milquu-dark text-white rounded-lg hover:bg-gray-800 text-sm font-medium disabled:opacity-60">{busy ? 'Adding…' : 'Add employee'}</button>
            </div>
          </form>
        </div>
      )}

      {resetFor && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="reset-title">
          <form onSubmit={resetPassword} className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 id="reset-title" className="text-lg font-bold text-milquu-dark">Reset password for {resetFor.name}</h2>
            <input type="text" required minLength={8} autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" aria-label="New password" className={inputClass} />
            <p className="text-xs text-gray-500">At least 8 characters with a letter and a number.</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setResetFor(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">Cancel</button>
              <button type="submit" disabled={busy} className="px-4 py-2 bg-milquu-dark text-white rounded-lg hover:bg-gray-800 text-sm font-medium disabled:opacity-60">Reset password</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// --- Audit log ----------------------------------------------------------------

const AuditTab = () => {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ logs: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page), limit: '30' });
    if (query) params.set('search', query);
    api.get(`/api/admin/audit-logs?${params}`)
      .then(({ data: res }) => { if (!cancelled) setData(res); })
      .catch((err) => toast.error(err.response?.data?.message || 'Could not load the audit log'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, query]);

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setPage(1);
    setQuery(search.trim());
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-gray-100">
        <h2 className="text-xl font-bold text-milquu-dark">Audit log</h2>
        <p className="text-sm text-gray-500 mt-1">Who changed money, prices, stock, staff or settings — and when.</p>
        <form onSubmit={submit} className="mt-4 flex items-center bg-gray-50 rounded-lg px-4 py-2 border border-gray-200" role="search">
          <Search size={16} className="text-gray-400 mr-2" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by person, customer, product or action…" aria-label="Search the audit log" className="bg-transparent border-none outline-none text-sm w-full" />
        </form>
      </div>

      <div className="p-6 sm:p-8">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : data.logs.length === 0 ? (
          <p className="text-sm text-gray-500">{query ? 'No entries match that search.' : 'No changes recorded yet.'}</p>
        ) : (
          <ol className="relative border-l-2 border-gray-100 ml-3 space-y-6">
            {data.logs.map((log) => (
              <li key={log._id} className="relative pl-6">
                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-milquu-blue" />
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                  <p className="text-sm font-bold text-gray-900">{log.summary}</p>
                  <time className="text-xs text-gray-400 whitespace-nowrap" dateTime={log.createdAt}>
                    {new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}
                  </time>
                </div>
                <p className="text-xs text-gray-500">
                  By <span className="font-semibold text-gray-700">{log.actorName || 'Unknown'}</span>
                  {log.actorRole && <> ({ROLE_LABELS[log.actorRole] || log.actorRole})</>}
                  <span className="ml-2 font-mono text-[11px] text-gray-400">{log.action}</span>
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>

      {data.pages > 1 && (
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-gray-100 text-sm">
          <span className="text-gray-500">{data.total} entries · page {page} of {data.pages}</span>
          <div className="flex gap-2">
            <button onClick={() => { setLoading(true); setPage((p) => p - 1); }} disabled={page <= 1} className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40">Previous</button>
            <button onClick={() => { setLoading(true); setPage((p) => p + 1); }} disabled={page >= data.pages} className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Preferences --------------------------------------------------------------

const PreferencesTab = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('enterpriseDarkMode') === 'true');

  const toggle = () => {
    const next = !darkMode;
    setDarkMode(next);
    try { localStorage.setItem('enterpriseDarkMode', String(next)); } catch { /* per-browser only */ }
    document.documentElement.classList.toggle('dark-dashboard', next);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-milquu-dark mb-6">Preferences</h2>
      <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
        <div>
          <h3 className="font-semibold text-sm text-milquu-dark">Dark mode</h3>
          <p className="text-xs text-gray-500 mt-0.5">Applies to this browser only.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={toggle} aria-label="Dark mode" />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-milquu-dark" />
        </label>
      </div>
    </div>
  );
};

// --- Page ---------------------------------------------------------------------

const Settings = () => {
  const me = getAdminSession() || { role: 'staff', email: '' };
  const admin = isAdminRole(me.role);

  const tabs = [
    { name: 'Business', icon: <Store size={18} /> },
    ...(admin ? [
      { name: 'Employees & roles', icon: <Users size={18} /> },
      { name: 'Audit log', icon: <Activity size={18} /> }
    ] : []),
    { name: 'Preferences', icon: <Moon size={18} /> }
  ];
  const [activeTab, setActiveTab] = useState('Business');

  return (
    <div className="max-w-7xl mx-auto pb-10 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Business details, team access and the record of changes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <nav className="lg:col-span-1 space-y-2" aria-label="Settings sections">
          {tabs.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              aria-current={activeTab === item.name ? 'page' : undefined}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                activeTab === item.name
                  ? 'bg-white shadow-sm text-milquu-blue font-bold border border-gray-100'
                  : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-milquu-dark'
              }`}
            >
              <span className={activeTab === item.name ? 'text-milquu-blue' : 'text-gray-400'}>{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="lg:col-span-3">
          {activeTab === 'Business' && <BusinessTab canEdit={admin} />}
          {activeTab === 'Employees & roles' && admin && <EmployeesTab me={me} />}
          {activeTab === 'Audit log' && admin && <AuditTab />}
          {activeTab === 'Preferences' && <PreferencesTab />}
        </div>
      </div>
    </div>
  );
};

export default Settings;
