import { useState } from 'react';
import { DELIVERY_ZONES } from '../../services/api';

export default function PincodeChecker() {
  const [pin, setPin] = useState('');
  const [result, setResult] = useState(null);

  function check() {
    const trimmed = pin.trim();
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      setResult({ ok: false, msg: 'Please enter a valid 6-digit pincode.' });
      return;
    }
    const zone = DELIVERY_ZONES[trimmed];
    if (zone) {
      setResult({ ok: true, msg: `🎉 Delivery available in ${zone}! Order now.` });
    } else {
      setResult({ ok: false, msg: `😔 Sorry, we don't deliver to ${trimmed} yet. Coming soon!` });
    }
  }

  return (
    <div className="mt-6 bg-white/90 backdrop-blur rounded-2xl p-4 shadow-sm max-w-md">
      <div className="text-xs font-semibold text-gray-500 mb-2">Check delivery in your area</div>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter 6-digit pincode"
          value={pin}
          onChange={(e) => { setPin(e.target.value); setResult(null); }}
          onKeyDown={(e) => e.key === 'Enter' && check()}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button onClick={check} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
          Check
        </button>
      </div>
      {result && (
        <p className={`mt-2.5 text-xs font-medium ${result.ok ? 'text-green-700' : 'text-red-600'}`}>
          {result.msg}
        </p>
      )}
    </div>
  );
}
