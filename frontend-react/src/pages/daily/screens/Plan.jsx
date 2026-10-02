import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, TabBar, MobileHeader, Icon, Stepper } from '../ui';
import { DEFAULT_MILK_PLANS, rupees } from '../catalogue';
import { addDays, dayKey, fmtShort, fromKey } from '../dates';
import { useDaily } from '../DailyContext';

const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function Plan() {
  const navigate = useNavigate();
  const {
    flash, patch, bumpCrate, milks, crate,
    planActive, plan, planStartedOn, isSkipped, toggleSkip, inRhythm,
    today, rhythmDef, slotDef, itemRows,
  } = useDaily();
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [planQuantities, setPlanQuantities] = useState({});

  const plans = useMemo(() => {
    if (!milks || milks.length === 0) return DEFAULT_MILK_PLANS;
    return milks.map((m, idx) => {
      const matched = DEFAULT_MILK_PLANS.find(
        (dp) => dp.productId === m.id || dp.name.toLowerCase() === `${m.name.toLowerCase()} plan` || dp.name.toLowerCase() === m.name.toLowerCase()
      );
      return {
        id: m.id,
        productId: m.id,
        name: matched?.name || `${m.short || m.name} Plan`,
        subtitle: matched?.subtitle || m.kicker || 'Fresh & nutritious',
        price: m.plan || m.price,
        unit: m.unit || 'Litre',
        popular: matched ? matched.popular : idx === 0,
        features: matched?.features || [
          'Daily delivery',
          'Choose quantity',
          'Pause anytime',
          'No delivery charges',
        ],
      };
    });
  }, [milks]);

  const week = useMemo(() => {
    if (!planActive) return [];
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(today, i + 1);
      const key = dayKey(date);
      const scheduled = inRhythm(date);
      return { date, key, on: scheduled && !isSkipped(key), inRhythm: scheduled };
    });
  }, [today, inRhythm, isSkipped, planActive]);

  const offCount = week.filter((d) => !d.on).length;

  const handleSelectPlan = (planItem) => {
    try {
      setSelectedPlanId(planItem.id);
      const targetProductId = planItem.productId || planItem.id;
      const targetQty = planQuantities[planItem.id] || 1;

      // Save milk & quantity directly into the draft crate
      patch({
        crate: { [targetProductId]: targetQty },
        selectedPlan: planItem.id,
      });

      flash(`Selected ${planItem.name} (${targetQty} L/day)`);
    } catch (err) {
      console.warn('Draft patch warning:', err);
    }
    navigate('/app/start/rhythm');
  };

  return (
    <Screen>
      {/* Top Header */}
      <MobileHeader rightIcon="bell" />

      {/* Main Content */}
      <div style={{ padding: '14px 18px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* ── 1. Active Plan Card (When subscribed) OR Hero Banner (When onboarding) ── */}
        {planActive ? (
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #856214',
              borderRadius: 24,
              padding: '20px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: '0 4px 14px rgba(133, 98, 20, 0.08)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: '#856214', textTransform: 'uppercase' }}>
                  {planStartedOn ? `Active since ${fmtShort(fromKey(planStartedOn))}` : 'Your Subscription'}
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#132819', margin: '2px 0 0', fontFamily: "'Playfair Display', Georgia, serif" }}>
                  My Active Plan
                </h3>
              </div>
              <span
                style={{
                  background: plan?.status === 'Paused' ? '#fef3c7' : '#dcfce7',
                  color: plan?.status === 'Paused' ? '#b45309' : '#15803d',
                  fontSize: 11.5,
                  fontWeight: 700,
                  padding: '5px 12px',
                  borderRadius: 999,
                }}
              >
                {plan?.status || 'Active'}
              </span>
            </div>

            {/* Active Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {itemRows(crate).map((row) => (
                <div
                  key={row.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: '#f8fafc',
                    padding: '10px 12px',
                    borderRadius: 16,
                  }}
                >
                  <img src={row.img} alt="" style={{ width: 34, height: 48, objectFit: 'contain' }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
                      {row.name} ({row.qty} L)
                    </span>
                    <span style={{ fontSize: 11.5, color: '#64748b' }}>
                      {rhythmDef.long} · {slotDef.label}
                    </span>
                  </div>
                  <Stepper
                    value={row.qty}
                    min={1}
                    onDec={() => bumpCrate(row.key, -1)}
                    onInc={() => bumpCrate(row.key, 1)}
                    label={row.name}
                  />
                </div>
              ))}
            </div>

            {/* Next 7 Days Skip Strip */}
            <div>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                Next 7 days delivery schedule
              </span>
              <div className="mq-week">
                {week.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    className={d.on ? undefined : 'mq-week-off'}
                    onClick={() => d.inRhythm && toggleSkip(d.key)}
                    disabled={!d.inRhythm}
                    aria-pressed={d.on}
                    aria-label={`${DOW[d.date.getDay()]} ${d.date.getDate()} — ${d.on ? 'delivering' : 'no delivery'}`}
                  >
                    <span className="mq-week-dow">{DOW[d.date.getDay()]}</span>
                    <span className="mq-week-date">{d.date.getDate()}</span>
                    <span className="mq-week-mark" />
                  </button>
                ))}
              </div>
              <span className="mq-sub" style={{ display: 'block', marginTop: 6, fontSize: 11 }}>
                {offCount === 0
                  ? 'Tap a day to skip delivery.'
                  : `${offCount} day${offCount > 1 ? 's' : ''} skipped. Tap to restore.`}
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                className="mq-btn-outline-gold"
                style={{ flex: 1, padding: '7px 0', fontSize: 12.5 }}
                onClick={() => navigate('/app/plan/pause')}
              >
                Pause plan
              </button>
              <button
                type="button"
                className="mq-btn-outline-gold"
                style={{ flex: 1, padding: '7px 0', fontSize: 12.5 }}
                onClick={() => navigate('/app/start/rhythm')}
              >
                Change slot
              </button>
              <button
                type="button"
                className="mq-btn-outline-gold"
                style={{ flex: 1, padding: '7px 0', fontSize: 12.5, color: '#ef4444', borderColor: '#fca5a5' }}
                onClick={() => navigate('/app/plan/cancel')}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            className="mq-home-hero"
            style={{
              position: 'relative',
              borderRadius: 24,
              overflow: 'hidden',
              padding: '20px 18px 18px',
              minHeight: 280,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Background Image Blend */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: '58%',
                backgroundImage: 'url(/img/custom/hero_milk_bottle.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center right',
                pointerEvents: 'none',
                maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
                WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
              }}
            />

            {/* Top Pill Tag */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <span className="mq-pill-tag">DAILY MILK SUBSCRIPTION</span>
            </div>

            {/* Left Text */}
            <div style={{ position: 'relative', zIndex: 2, maxWidth: '62%', marginTop: 8 }}>
              <h1
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 26,
                  fontWeight: 800,
                  color: '#132819',
                  lineHeight: 1.15,
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Pure Milk.<br />A Healthier You.
              </h1>
              <p
                style={{
                  fontSize: 12,
                  color: '#475569',
                  lineHeight: 1.35,
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                Fresh, safe and high-quality milk delivered to your doorstep every day.
              </p>

              {/* 3 Badges */}
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.85)', padding: '4px 8px', borderRadius: 999, border: '1px solid #e2ded5' }}>
                  <Icon name="leaf" size={13} color="#2d4a22" strokeWidth={2.2} />
                  <span style={{ fontSize: 9.5, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>
                    Farm fresh quality
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.85)', padding: '4px 8px', borderRadius: 999, border: '1px solid #e2ded5' }}>
                  <Icon name="shield-check" size={13} color="#2d4a22" strokeWidth={2.2} />
                  <span style={{ fontSize: 9.5, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>
                    No adulteration
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.85)', padding: '4px 8px', borderRadius: 999, border: '1px solid #e2ded5' }}>
                  <Icon name="truck" size={13} color="#2d4a22" strokeWidth={2.2} />
                  <span style={{ fontSize: 9.5, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>
                    Daily delivery
                  </span>
                </div>
              </div>
            </div>

            {/* Right Script Annotation */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                zIndex: 3,
                textAlign: 'right',
                pointerEvents: 'none',
              }}
            >
              <span className="mq-script-text" style={{ fontSize: 18, color: '#27382b' }}>
                Good Milk<br />Brighter<br />Days ♡
              </span>
            </div>
          </div>
        )}

        {/* ── 2. Choose Your Milk Plan Section ───────────────────────── */}
        <div>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 21,
              fontWeight: 800,
              color: '#132819',
              margin: 0,
            }}
          >
            {planActive ? 'Switch or customize milk plan' : 'Choose your milk plan'}
          </h2>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 4, marginBottom: 14 }}>
            {planActive
              ? 'Select another fresh milk plan anytime. You can pause, reschedule or cancel anytime.'
              : 'Select a plan that fits your daily needs. You can pause, reschedule or cancel anytime.'}
          </p>

          <div className="mq-plan-scroll">
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const isPopular = plan.popular;

              return (
                <div
                  key={plan.id}
                  className={`mq-plan-card ${isPopular ? 'mq-plan-card-popular' : ''} ${isSelected ? 'mq-plan-card-selected' : ''}`}
                  onClick={() => handleSelectPlan(plan)}
                  style={{
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {/* Most Popular Crown Badge */}
                  {isPopular && (
                    <div className="mq-popular-badge">
                      <Icon name="crown" size={12} color="#ffffff" strokeWidth={2} />
                      <span>Most Popular</span>
                    </div>
                  )}

                  {/* Milk Splash Graphic in container */}
                  <div
                    style={{
                      width: '100%',
                      height: 85,
                      borderRadius: 14,
                      marginTop: isPopular ? 14 : 0,
                      marginBottom: 10,
                      backgroundImage: 'url(/img/custom/milk_splash.jpg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />

                  {/* Plan Name & Subtitle */}
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 16.5,
                      fontWeight: 700,
                      color: '#1e293b',
                      margin: 0,
                    }}
                  >
                    {plan.name}
                  </h3>
                  <span style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    {plan.subtitle}
                  </span>

                  {/* Price */}
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#856214', margin: '8px 0 12px' }}>
                    ₹{rupees(plan.price)}<span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>/{plan.unit}</span>
                  </div>

                  {/* Checkmarks Checklist */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                    {plan.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#334155' }}>
                        <div
                          style={{
                            width: 15,
                            height: 15,
                            borderRadius: 999,
                            background: '#dcfce7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Icon name="check" size={10} color="#15803d" strokeWidth={3} />
                        </div>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* Daily Quantity Selector */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#f8fafc',
                      padding: '7px 12px',
                      borderRadius: 14,
                      marginBottom: 14,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>Daily Qty</span>
                      <span style={{ fontSize: 10, color: '#64748b' }}>₹{rupees(plan.price * (planQuantities[plan.id] || 1))}/day</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlanQuantities(prev => ({ ...prev, [plan.id]: Math.max(1, (prev[plan.id] || 1) - 1) }));
                        }}
                        disabled={(planQuantities[plan.id] || 1) <= 1}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 999,
                          border: '1px solid #cbd5e1',
                          background: '#fff',
                          fontWeight: 'bold',
                          fontSize: 15,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: (planQuantities[plan.id] || 1) <= 1 ? 'not-allowed' : 'pointer',
                          opacity: (planQuantities[plan.id] || 1) <= 1 ? 0.4 : 1,
                        }}
                      >
                        −
                      </button>
                      <span style={{ fontSize: 14, fontWeight: 800, minWidth: 26, textAlign: 'center', color: '#1e293b' }}>
                        {planQuantities[plan.id] || 1} L
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlanQuantities(prev => ({ ...prev, [plan.id]: Math.min(10, (prev[plan.id] || 1) + 1) }));
                        }}
                        disabled={(planQuantities[plan.id] || 1) >= 10}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 999,
                          border: '1px solid #cbd5e1',
                          background: '#fff',
                          fontWeight: 'bold',
                          fontSize: 15,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: (planQuantities[plan.id] || 1) >= 10 ? 'not-allowed' : 'pointer',
                          opacity: (planQuantities[plan.id] || 1) >= 10 ? 0.4 : 1,
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div style={{ marginTop: 'auto' }}>
                    <button
                      type="button"
                      className={isPopular ? 'mq-btn-gold' : 'mq-btn-outline-gold'}
                      style={{
                        width: '100%',
                        padding: isPopular ? '10px 0' : '9px 0',
                        fontSize: 13.5,
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'transparent',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPlan(plan);
                      }}
                    >
                      <span style={{ pointerEvents: 'none' }}>Select plan ({planQuantities[plan.id] || 1} L)</span>
                      <span style={{ pointerEvents: 'none' }}>→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 3. Save More with Subscription Card ────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #edf7eb 0%, #e5f4e3 100%)',
            border: '1px solid #d4ebd1',
            borderRadius: 20,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                background: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name="gift" size={19} color="#15803d" strokeWidth={2} />
            </div>
            <div>
              <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#143a17', margin: 0 }}>
                Save more with a subscription
              </h4>
              <p style={{ fontSize: 11.5, color: '#335338', margin: '2px 0 0' }}>
                Consistent quality, better pricing and a healthier tomorrow.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="mq-btn-outline-gold"
            style={{
              padding: '6px 14px',
              fontSize: 12,
              background: '#ffffff',
              flexShrink: 0,
            }}
            onClick={() => {
              const el = document.querySelector('.mq-plan-scroll');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span>Learn more</span>
            <span>→</span>
          </button>
        </div>

        {/* ── 4. Delivery Timing Section ─────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 19,
                fontWeight: 800,
                color: '#132819',
                margin: 0,
              }}
            >
              Delivery timing
            </h3>
            <button
              type="button"
              style={{
                background: 'transparent',
                border: 0,
                color: '#856214',
                fontSize: 12.5,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
              }}
              onClick={() => flash('Deliveries are made every morning or evening directly to your door')}
            >
              <Icon name="help" size={14} color="#856214" strokeWidth={2} />
              <span>How it works?</span>
            </button>
          </div>

          <div className="mq-delivery-grid">
            {/* Morning Card */}
            <div className="mq-delivery-card">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  background: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <Icon name="sun" size={20} color="#b45309" strokeWidth={2} />
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>
                Morning Delivery
              </span>
              <span style={{ fontSize: 14.5, fontWeight: 800, color: '#132819', marginTop: 2 }}>
                4:00 AM – 7:00 AM
              </span>
              <span style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                Orders close at 11:00 PM (previous day)
              </span>
            </div>

            {/* Evening Card */}
            <div className="mq-delivery-card">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  background: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <Icon name="moon" size={19} color="#b45309" strokeWidth={2} />
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>
                Evening Delivery
              </span>
              <span style={{ fontSize: 14.5, fontWeight: 800, color: '#132819', marginTop: 2 }}>
                5:00 PM – 7:00 PM
              </span>
              <span style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                Orders close at 4:00 PM (same day)
              </span>
            </div>
          </div>
        </div>

        {/* ── 5. Trust Badges Row ────────────────────────────────────── */}
        <div className="mq-trust-row">
          <div className="mq-trust-chip">
            <Icon name="leaf" size={14} color="#15803d" strokeWidth={2} />
            <span>100% Pure Milk</span>
          </div>
          <div className="mq-trust-chip">
            <Icon name="shield-check" size={14} color="#15803d" strokeWidth={2} />
            <span>Lab Tested</span>
          </div>
          <div className="mq-trust-chip">
            <Icon name="truck" size={14} color="#15803d" strokeWidth={2} />
            <span>On-time Delivery</span>
          </div>
          <div className="mq-trust-chip">
            <Icon name="heart" size={14} color="#15803d" strokeWidth={2} />
            <span>Better Health</span>
          </div>
        </div>

      </div>

      <div style={{ height: 16 }} />
      <TabBar />
    </Screen>
  );
}
