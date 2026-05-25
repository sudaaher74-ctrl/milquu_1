import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function RevenueChart({ orders = [] }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Build last 7 days revenue
    const days = [];
    const revenue = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      days.push(label);
      const dayTotal = orders
        .filter((o) => {
          const od = new Date(o.createdAt);
          return od.toDateString() === d.toDateString() && o.status !== 'cancelled';
        })
        .reduce((sum, o) => sum + (o.total || 0), 0);
      revenue.push(dayTotal);
    }

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [{
          label: 'Revenue (₹)',
          data: revenue,
          backgroundColor: 'rgba(47, 122, 56, 0.15)',
          borderColor: 'rgba(47, 122, 56, 0.9)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 11 }, callback: (v) => `₹${v}` } },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [orders]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-bold text-sm text-gray-700 mb-4">Revenue — Last 7 Days</h3>
      <div className="h-52">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
