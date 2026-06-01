import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Calculates the IST time and determines slot availability.
 * Morning slot cutoff: 11:00 PM IST the previous night
 * Evening slot cutoff: 4:00 PM IST the same day
 */
const getSlotInfo = () => {
  // Get current IST time using toLocaleString for accurate timezone conversion
  const now = new Date();
  const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const istNow = new Date(istString);

  const hours = istNow.getHours();
  const minutes = istNow.getMinutes();
  const currentMinutes = hours * 60 + minutes; // minutes since midnight

  const MORNING_CUTOFF = 23 * 60; // 11:00 PM = 1380 minutes
  const EVENING_CUTOFF = 15 * 60; // 3:00 PM = 900 minutes

  // --- Morning Slot ---
  // Delivery: next day 4-7 AM if ordered before 11 PM tonight
  const morningAvailable = currentMinutes < MORNING_CUTOFF;
  const tomorrowDate = new Date(istNow);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const morningDeliveryDate = tomorrowDate;

  // Countdown to 11 PM
  let morningCountdown = null;
  if (morningAvailable) {
    const cutoffMins = MORNING_CUTOFF - currentMinutes;
    const h = Math.floor(cutoffMins / 60);
    const m = cutoffMins % 60;
    morningCountdown = `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m left`;
  }

  // --- Evening Slot ---
  // Delivery: today 5-7 PM if ordered before 3 PM; else tomorrow 5-7 PM
  const eveningAvailableToday = currentMinutes < EVENING_CUTOFF;
  let eveningDeliveryDate;
  let eveningLabel;
  if (eveningAvailableToday) {
    eveningDeliveryDate = new Date(istNow);
    eveningLabel = 'Today';
  } else {
    eveningDeliveryDate = new Date(istNow);
    eveningDeliveryDate.setDate(eveningDeliveryDate.getDate() + 1);
    eveningLabel = 'Tomorrow';
  }

  // Countdown to 3 PM (only if today's slot is open)
  let eveningCountdown = null;
  if (eveningAvailableToday) {
    const cutoffMins = EVENING_CUTOFF - currentMinutes;
    const h = Math.floor(cutoffMins / 60);
    const m = cutoffMins % 60;
    eveningCountdown = `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m left`;
  }

  return {
    morning: {
      available: morningAvailable,
      deliveryDate: morningDeliveryDate,
      dateLabel: 'Tomorrow',
      window: '4:00 AM – 7:00 AM',
      countdown: morningCountdown,
    },
    evening: {
      available: true, // always available (today or tomorrow)
      deliveryDate: eveningDeliveryDate,
      dateLabel: eveningLabel,
      window: '5:00 PM – 7:00 PM',
      countdown: eveningCountdown,
    },
  };
};

const formatDate = (date) => {
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
};

const DeliverySlotSelector = ({ value, onChange }) => {
  const [slotInfo, setSlotInfo] = useState(getSlotInfo());

  // Update countdown every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setSlotInfo(getSlotInfo());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const slots = [
    {
      id: 'Morning',
      icon: '🌅',
      title: 'Morning Delivery',
      time: '4:00 AM – 7:00 AM',
      cutoffText: 'Order before 11:00 PM tonight',
      available: slotInfo.morning.available,
      dateLabel: slotInfo.morning.dateLabel,
      deliveryDate: slotInfo.morning.deliveryDate,
      countdown: slotInfo.morning.countdown,
      unavailableText: 'Window closed. Order before 11 PM tomorrow.',
    },
    {
      id: 'Evening',
      icon: '🌇',
      title: 'Evening Delivery',
      time: '5:00 PM – 7:00 PM',
      cutoffText: slotInfo.evening.dateLabel === 'Today' ? 'Order before 3:00 PM today' : 'Order placed for tomorrow',
      available: slotInfo.evening.available,
      dateLabel: slotInfo.evening.dateLabel,
      deliveryDate: slotInfo.evening.deliveryDate,
      countdown: slotInfo.evening.countdown,
      unavailableText: '',
    },
  ];

  return (
    <div className="space-y-3">
      <h4 className="font-serif font-bold text-milquu-dark text-sm mb-1 flex items-center gap-2">
        🚚 Choose Delivery Slot
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {slots.map((slot) => {
          const isSelected = value === slot.id;
          return (
            <motion.button
              key={slot.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => slot.available && onChange(slot.id, slot.deliveryDate, slot.time)}
              className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                !slot.available
                  ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50'
                  : isSelected
                  ? 'border-milquu-green bg-milquu-green/5 shadow-md shadow-milquu-green/10'
                  : 'border-gray-200 bg-gray-50/50 hover:border-milquu-gold/50 hover:bg-milquu-gold/5 cursor-pointer'
              }`}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 w-5 h-5 bg-milquu-green rounded-full flex items-center justify-center text-white text-xs">✓</span>
              )}
              <div className="text-2xl mb-2">{slot.icon}</div>
              <p className="font-bold text-sm text-milquu-dark">{slot.title}</p>
              <p className="text-xs font-semibold text-milquu-green mt-1">{slot.time}</p>

              {slot.available ? (
                <>
                  <p className="text-[11px] text-gray-500 mt-2">
                    📅 <span className="font-bold text-milquu-dark">{slot.dateLabel}:</span> {formatDate(slot.deliveryDate)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">{slot.cutoffText}</p>
                  {slot.countdown && (
                    <div className="mt-2 inline-block bg-orange-50 border border-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ⏰ {slot.countdown}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[10px] text-red-500 mt-2 font-semibold">{slot.unavailableText}</p>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default DeliverySlotSelector;
