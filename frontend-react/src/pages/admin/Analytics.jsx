import { useOutletContext } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

function PieChart({ data, labels, title }) {
  const ref = useRef();
  const chart = useRef();
  useEffect(() => {
    if (!ref.current) return;
    if (chart.current) chart.current.destroy();
    chart.current = new Chart(ref.current, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: ['#2f7a38','#4ade80','#86efac','#bbf7d0','#dcfce7'], borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }
    });
    return () => { if (chart.current) chart.current.destroy(); };
  }, [data]);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-bold text-sm text-gray-700 mb-4">{title}</h3>
      <div className="h-44"><canvas ref={ref} /></div>
    </div>
  );
}

export default function Analytics() {
  const { orders = [], subs = [] } = useOutletContext() || {};

  // Status distribution
  const statusCounts = ['pending','confirmed','delivered','cancelled','out_for_delivery'].map((s) => orders.filter((o) => o.status === s).length);
  const statusLabels = ['Pending','Confirmed','Delivered','Cancelled','Out for Delivery'];

  // Category revenue
  const catRevenue = {};
  orders.filter((o) => o.status !== 'cancelled').forEach((o) => {
    o.items?.forEach((i) => {
      const cat = i.productId?.category || 'other';
      catRevenue[cat] = (catRevenue[cat] || 0) + (i.price || 0) * (i.qty || 1);
    });
  });

  // Subscription schedule distribution
  const schedDist = ['daily','alternate','weekdays'].map((s) => subs.filter((sub) => sub.schedule === s).length);

  const totalRevenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
  const avgOrder = orders.length ? (totalRevenue / orders.length).toFixed(0) : 0;
  const deliveryRate = orders.length ? ((orders.filter((o) => o.status === 'delivered').length / orders.length) * 100).toFixed(1) : 0;

  return (
    <div className="p-6 space-y-5">
      <h1 className="font-display text-2xl font-bold text-gray-900">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ['💰', 'Total Revenue', `₹${totalRevenue.toFixed(0)}`],
          ['🛒', 'Total Orders', orders.length],
          ['📊', 'Avg. Order Value', `₹${avgOrder}`],
          ['✅', 'Delivery Rate', `${deliveryRate}%`],
        ].map(([icon, label, val]) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="font-display text-2xl font-bold text-gray-900">{val}</div>
            <div className="text-xs text-gray-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <PieChart data={statusCounts} labels={statusLabels} title="Order Status Distribution" />
        <PieChart data={Object.values(catRevenue)} labels={Object.keys(catRevenue)} title="Revenue by Category" />
        <PieChart data={schedDist} labels={['Daily','Alternate','Weekdays']} title="Subscription Schedules" />
      </div>
    </div>
  );
}
