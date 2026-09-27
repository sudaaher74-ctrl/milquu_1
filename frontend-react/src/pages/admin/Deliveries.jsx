import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../utils/api.js';
import toast from '../../utils/toast.js';
import { refreshToday } from '../../utils/useToday.js';
import { getAdminSession, isManagerRole } from '../../utils/adminAccess.js';
import { io } from 'socket.io-client';
import { Truck, MapPin, CheckCircle2, Clock, Phone, RefreshCw, XCircle, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import ExportButton from '../../components/admin/ExportButton';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues with bundlers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
L.Marker.prototype.options.icon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41] });

// Navi Mumbai — Panvel to Nerul
const MAP_CENTER = [19.03, 73.08];
// A position older than this is shown as "last seen", not live
const LIVE_WINDOW_MS = 10 * 60 * 1000;

const minutesAgo = (date) => Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 60000));
const lastSeen = (location) => {
  if (!location?.lastUpdated) return 'No location shared yet';
  const mins = minutesAgo(location.lastUpdated);
  if (mins < 1) return 'Live now';
  if (mins < 60) return `Seen ${mins} min ago`;
  return `Last seen ${new Date(location.lastUpdated).toLocaleString('en-IN', { timeStyle: 'short', dateStyle: 'short', timeZone: 'Asia/Kolkata' })}`;
};
const isLive = (location) => location?.lastUpdated && Date.now() - new Date(location.lastUpdated).getTime() < LIVE_WINDOW_MS;

/**
 * Where the delivery team is and how today's round is going. Everything here
 * is real: positions come from the delivery app, progress from today's orders.
 */
const Deliveries = () => {
  const session = getAdminSession();
  const canAssign = isManagerRole(session?.role);
  const [activeTab, setActiveTab] = useState('Map');
  const [data, setData] = useState(null);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignForm, setAssignForm] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const socketRef = useRef(null);

  const load = useCallback(() => api.get('/api/erp/delivery-staff/live')
    .then(({ data: res }) => setData(res))
    .catch((err) => toast.error(err.response?.data?.message || 'Could not load live tracking'))
    .finally(() => setLoading(false)), []);

  useEffect(() => {
    load();
    api.get('/api/service-areas').then(({ data: res }) => setAreas(Array.isArray(res) ? res : [])).catch(() => setAreas([]));
    const timer = setInterval(load, 60 * 1000);
    return () => clearInterval(timer);
  }, [load]);

  // Live positions pushed by the delivery app
  const staffIds = (data?.staff || []).map((s) => s._id).join(',');
  useEffect(() => {
    if (!staffIds || !session?.token) return undefined;
    const socket = io(api.defaults.baseURL, { auth: { token: session.token } });
    socketRef.current = socket;
    staffIds.split(',').forEach((id) => socket.emit('join_tracking', { deliveryBoyId: id }));
    socket.on('location_updated', (update) => {
      setData((prev) => prev && {
        ...prev,
        staff: prev.staff.map((s) => (String(s._id) === String(update.deliveryBoyId)
          ? { ...s, location: { lat: update.latitude, lng: update.longitude, lastUpdated: update.timestamp } }
          : s))
      });
    });
    return () => socket.disconnect();
  }, [staffIds, session?.token]);

  const assignArea = async (e) => {
    e.preventDefault();
    setAssigning(true);
    try {
      const { data: res } = await api.post(`/api/erp/delivery-staff/${assignForm.staffId}/assign-area`, {
        area: assignForm.area,
        includeAssigned: assignForm.includeAssigned
      });
      toast.success(`${res.message}. ${res.plansAssigned} plan(s) and ${res.ordersAssigned} upcoming order(s) assigned.`);
      setAssignForm(null);
      load();
      refreshToday();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not assign the area');
    } finally {
      setAssigning(false);
    }
  };

  const staff = data?.staff || [];
  const active = staff.filter((s) => s.status === 'Active');
  const liveCount = active.filter((s) => isLive(s.location)).length;
  const exportRows = active.map((s) => ({
    Name: s.name,
    Area: s.area,
    Phone: s.phone,
    Assigned: s.today.assigned,
    Delivered: s.today.delivered,
    Failed: s.today.failed,
    'Last seen': lastSeen(s.location)
  }));

  return (
    <div className="max-w-7xl mx-auto pb-10 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Live Tracking</h1>
          <p className="text-gray-500 text-sm mt-1">Today&apos;s round by delivery person, and where they were last seen.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => { setLoading(true); load(); }} className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center">
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <ExportButton data={exportRows} filename="Delivery_Round" title="Today's Delivery Round" />
          {canAssign && (
            <button
              onClick={() => setAssignForm({ staffId: active[0]?._id || '', area: areas[0]?.slug || '', includeAssigned: false })}
              disabled={!active.length}
              className="bg-milquu-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 shadow-md flex items-center disabled:opacity-50"
            >
              <Truck size={18} className="mr-2" /> Assign to area
            </button>
          )}
        </div>
      </div>

      <div className="flex space-x-4 mb-6 border-b border-gray-200" role="tablist">
        {['Map', 'Performance'].map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === tab ? 'border-milquu-blue text-milquu-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab === 'Map' ? 'Map & round' : 'Last 30 days'}
          </button>
        ))}
      </div>

      {activeTab === 'Map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 relative h-[600px] overflow-hidden">
            <MapContainer center={MAP_CENTER} zoom={12} style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              {active.filter((s) => s.location).map((s) => (
                <Marker key={s._id} position={[s.location.lat, s.location.lng]}>
                  <Popup>
                    <strong>{s.name}</strong><br />
                    {s.area}<br />
                    {s.today.delivered}/{s.today.assigned} delivered today<br />
                    <span className="text-xs text-gray-500">{lastSeen(s.location)}</span>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg text-white text-xs font-medium flex items-center z-[1000]">
              <span className={`w-2 h-2 rounded-full mr-2 ${liveCount ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              {liveCount ? `${liveCount} delivery ${liveCount === 1 ? 'person' : 'people'} sharing location now` : 'Nobody is sharing their location right now'}
            </div>
          </div>

          <div className="space-y-4 h-[600px] overflow-y-auto hide-scrollbar pr-2">
            <h2 className="text-lg font-bold text-milquu-dark mb-2">Delivery team today</h2>
            {!loading && active.length === 0 && (
              <p className="text-sm text-gray-500 bg-white p-5 rounded-2xl border border-gray-100">No active delivery staff. Add them under Delivery Staff.</p>
            )}
            {active.map((s) => {
              const { assigned, delivered, failed } = s.today;
              const progress = assigned ? Math.round((delivered / assigned) * 100) : 0;
              return (
                <div key={s._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-milquu-dark">{s.name}</h3>
                      <p className="text-xs text-gray-500 flex items-center mt-1"><MapPin size={12} className="mr-1" /> {s.area || 'No area'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${isLive(s.location) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {isLive(s.location) ? 'Live' : 'Offline'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                    <span className="flex items-center"><Navigation size={12} className="mr-1" /> {lastSeen(s.location)}</span>
                    {s.phone && <a href={`tel:${s.phone}`} className="flex items-center text-milquu-blue font-medium hover:underline"><Phone size={12} className="mr-1" /> Call</a>}
                  </div>
                  {assigned === 0 ? (
                    <p className="text-xs text-gray-500">No deliveries assigned today.</p>
                  ) : (
                    <>
                      <div className="flex justify-between text-xs text-gray-500 font-medium mb-1.5">
                        <span>{delivered}/{assigned} delivered{failed ? ` · ${failed} failed` : ''}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all ${progress === 100 ? 'bg-green-500' : 'bg-milquu-blue'}`} style={{ width: `${progress}%` }} />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <CheckCircle2 size={32} className="text-green-500 mb-3 mx-auto" />
            <h3 className="text-gray-500 text-sm font-medium">Delivered</h3>
            <p className="text-3xl font-bold text-milquu-dark mt-1">{data?.last30Days.delivered ?? '—'}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <Clock size={32} className="text-blue-500 mb-3 mx-auto" />
            <h3 className="text-gray-500 text-sm font-medium">On the scheduled day</h3>
            <p className="text-3xl font-bold text-milquu-dark mt-1">{data?.last30Days.onTimeRate == null ? '—' : `${data.last30Days.onTimeRate}%`}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <XCircle size={32} className="text-red-500 mb-3 mx-auto" />
            <h3 className="text-gray-500 text-sm font-medium">Failed deliveries</h3>
            <p className="text-3xl font-bold text-milquu-dark mt-1">{data?.last30Days.failed ?? '—'}</p>
          </div>
        </div>
      )}

      {assignForm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="assign-title">
          <form onSubmit={assignArea} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 id="assign-title" className="text-xl font-bold text-milquu-dark">Assign a delivery person to an area</h2>
            <p className="text-sm text-gray-500">Their area is updated, and every plan in it without a delivery person — with its upcoming orders — is given to them.</p>
            <div>
              <label htmlFor="assign-staff" className="block text-sm font-medium text-gray-700 mb-1">Delivery person</label>
              <select id="assign-staff" required value={assignForm.staffId} onChange={(e) => setAssignForm({ ...assignForm, staffId: e.target.value })} className="w-full border border-gray-200 rounded-lg p-2 bg-white">
                {active.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.area || 'no area'})</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="assign-area" className="block text-sm font-medium text-gray-700 mb-1">Area</label>
              <select id="assign-area" required value={assignForm.area} onChange={(e) => setAssignForm({ ...assignForm, area: e.target.value })} className="w-full border border-gray-200 rounded-lg p-2 bg-white">
                {areas.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
              </select>
            </div>
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={assignForm.includeAssigned} onChange={(e) => setAssignForm({ ...assignForm, includeAssigned: e.target.checked })} className="mt-0.5" />
              <span>Also move plans in this area that already have someone else</span>
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setAssignForm(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">Cancel</button>
              <button type="submit" disabled={assigning || !assignForm.staffId || !assignForm.area} className="px-4 py-2 bg-milquu-dark text-white rounded-lg hover:bg-gray-800 text-sm font-medium disabled:opacity-60">
                {assigning ? 'Assigning…' : 'Assign'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Deliveries;
