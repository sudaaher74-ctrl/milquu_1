const STATUS_STYLES = {
  confirmed:        'bg-green-100 text-green-800',
  pending:          'bg-amber-100 text-amber-800',
  assigned:         'bg-blue-100 text-blue-800',
  out_for_delivery: 'bg-blue-100 text-blue-800',
  delivered:        'bg-green-100 text-green-800',
  failed:           'bg-red-100 text-red-800',
  cancelled:        'bg-red-100 text-red-800',
  active:           'bg-green-100 text-green-800',
  paused:           'bg-amber-100 text-amber-800',
  unread:           'bg-amber-100 text-amber-800',
  read:             'bg-gray-100 text-gray-600',
  replied:          'bg-blue-100 text-blue-800',
  out_of_stock:     'bg-red-100 text-red-800',
};

export default function Badge({ status, children }) {
  const cls = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600';
  const label = children || (status || '').replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${cls}`}>
      {label}
    </span>
  );
}
