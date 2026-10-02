import paymentQrImg from '../assets/payment-qr.png';

export const DAIRY_KHATA_BANK_DETAILS = {
  accountHolder: 'SUDARSHAN TUKARAM AHER',
  accountNumber: '0645818367',
  ifscCode: 'KKBK0001369',
  bankName: 'Kotak Mahindra Bank',
  upiId: 'hs71910whsvq9@ybl',
  qrCodeUrl: paymentQrImg || '/payment-qr.png'
};

export const getDateKey = (val) => {
  if (!val) return '';
  if (typeof val === 'string') {
    const match = val.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getOrderDateKey = (ord) => {
  if (!ord) return '';
  if (typeof ord === 'string') {
    return getDateKey(ord);
  }
  if (ord.notes && typeof ord.notes === 'string') {
    const match = ord.notes.match(/Date:\s*(\d{4}-\d{2}-\d{2})/i);
    if (match && match[1]) return match[1];
  }
  const raw = ord.scheduledDeliveryDate || ord.createdAt || ord.date || ord.startDate;
  return getDateKey(raw);
};

export const getDatesInRange = (startStr, endStr) => {
  if (!startStr || !endStr || startStr > endStr) return [];
  const dates = [];
  const [sY, sM, sD] = startStr.split('-').map(Number);
  const [eY, eM, eD] = endStr.split('-').map(Number);
  const cur = new Date(sY, sM - 1, sD, 12, 0, 0);
  const end = new Date(eY, eM - 1, eD, 12, 0, 0);
  while (cur <= end) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
};

export const formatKhataDate = (dateVal, options = {}) => {
  if (!dateVal) return '—';
  let dateKey = typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)
    ? dateVal
    : (typeof dateVal === 'object' ? getOrderDateKey(dateVal) : getDateKey(dateVal));

  if (!dateKey) return '—';
  const [y, m, d] = dateKey.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = monthNames[parseInt(m, 10) - 1] || '';
  
  if (options.includeYear) {
    return `${d} ${monthName} ${y}`;
  }
  return `${d} ${monthName}`;
};

export const buildCalendarGridCells = (year, month) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells = [];

  // 1. Leading days from previous month to complete the first week
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, dayNum, 12, 0, 0);
    const pY = prevDate.getFullYear();
    const pM = String(prevDate.getMonth() + 1).padStart(2, '0');
    const pD = String(dayNum).padStart(2, '0');
    cells.push({
      dateStr: `${pY}-${pM}-${pD}`,
      dayNum,
      monthName: monthNames[prevDate.getMonth()],
      isCurrentMonth: false,
      isPrevMonth: true,
      isNextMonth: false
    });
  }

  // 2. Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const curDate = new Date(year, month, d, 12, 0, 0);
    const cY = curDate.getFullYear();
    const cM = String(month + 1).padStart(2, '0');
    const cD = String(d).padStart(2, '0');
    cells.push({
      dateStr: `${cY}-${cM}-${cD}`,
      dayNum: d,
      monthName: monthNames[month],
      isCurrentMonth: true,
      isPrevMonth: false,
      isNextMonth: false
    });
  }

  // 3. Trailing days from next month to complete the last week (and reach full rows)
  const totalSlots = Math.ceil(cells.length / 7) * 7;
  const trailingNeeded = totalSlots - cells.length;
  for (let d = 1; d <= trailingNeeded; d++) {
    const nextDate = new Date(year, month + 1, d, 12, 0, 0);
    const nY = nextDate.getFullYear();
    const nM = String(nextDate.getMonth() + 1).padStart(2, '0');
    const nD = String(d).padStart(2, '0');
    cells.push({
      dateStr: `${nY}-${nM}-${nD}`,
      dayNum: d,
      monthName: monthNames[nextDate.getMonth()],
      isCurrentMonth: false,
      isPrevMonth: false,
      isNextMonth: true
    });
  }

  return cells;
};

export default DAIRY_KHATA_BANK_DETAILS;

