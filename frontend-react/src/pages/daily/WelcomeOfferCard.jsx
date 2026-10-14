import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './ui';
import { useDaily } from './DailyContext';

const DISMISS_KEY = 'milquu.app.welcomeOfferDismissed';

export default function WelcomeOfferCard({ compact = false }) {
  const navigate = useNavigate();
  const { planActive, flash } = useDaily();
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem(DISMISS_KEY) === '1'
  );

  const handleCopyCode = (e) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText('MILQUU100');
      }
      setCopied(true);
      flash('Promo code MILQUU100 copied! Auto-applied to your plan.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      flash('Use code MILQUU100 on checkout for ₹100 credit');
    }
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setDismissed(true);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DISMISS_KEY, '1');
    }
  };

  const handleRestore = (e) => {
    e.stopPropagation();
    setDismissed(false);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(DISMISS_KEY);
    }
  };

  // If user is already an active subscriber, show member VIP perks badge
  if (planActive) {
    return (
      <div
        style={{
          borderRadius: 20,
          background: 'linear-gradient(135deg, #f0f7ef 0%, #e5f2e3 100%)',
          border: '1px solid #cce4ca',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 2px 8px rgba(45, 74, 34, 0.05)',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            background: '#ffffff',
            border: '1px solid #b7dbb3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name="shield-check" size={20} color="#2d4a22" strokeWidth={2.2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: '#132819' }}>
              Active Member · 12% Savings
            </span>
          </div>
          <span style={{ display: 'block', fontSize: 11.5, color: '#475569', marginTop: 2 }}>
            Daily morning delivery active in returnable glass bottles
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/app/plan')}
          style={{
            background: '#2d4a22',
            color: '#ffffff',
            border: 0,
            borderRadius: 999,
            padding: '7px 12px',
            fontSize: 11.5,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          View Plan →
        </button>
      </div>
    );
  }

  // If dismissed, show subtle single-line ribbon that can be re-opened
  if (dismissed && !compact) {
    return (
      <div
        onClick={handleRestore}
        style={{
          borderRadius: 14,
          background: 'linear-gradient(135deg, #fffcf5 0%, #fef8eb 100%)',
          border: '1px dashed #dfc89d',
          padding: '9px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15 }}>🎉</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#785a15' }}>
            First Subscriber Offer: ₹100 Credit with code <strong>MILQUU100</strong>
          </span>
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 800, color: '#856214', textDecoration: 'underline' }}>
          Claim →
        </span>
      </div>
    );
  }

  // Full rich welcome credit promo card
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 22,
        overflow: 'hidden',
        background: 'linear-gradient(140deg, #fffdf8 0%, #fbf5e7 65%, #f7ecd5 100%)',
        border: '1px solid #ebd9b5',
        padding: '18px 16px 16px',
        boxShadow: '0 4px 18px rgba(133, 98, 20, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Decorative background glow orb */}
      <div
        style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 140,
          height: 140,
          borderRadius: 999,
          background: 'radial-gradient(circle, rgba(230, 192, 107, 0.25) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header Row with Pill and Dismiss Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 999,
              background: '#856214',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Icon name="gift" size={13} color="#ffffff" strokeWidth={2.2} />
          </div>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: '0.07em',
              color: '#856214',
              textTransform: 'uppercase',
            }}
          >
            FIRST SUBSCRIBER SPECIAL
          </span>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss welcome offer"
          style={{
            background: 'transparent',
            border: 0,
            color: '#94a3b8',
            fontSize: 14,
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>
      </div>

      {/* Main Pitch */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 20,
            fontWeight: 800,
            color: '#132819',
            lineHeight: 1.2,
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          Get ₹100 Welcome Credit on Your Milk Subscription
        </h3>
        <p
          style={{
            fontSize: 12,
            color: '#475569',
            lineHeight: 1.4,
            marginTop: 6,
            marginBottom: 0,
            fontWeight: 500,
          }}
        >
          Start your morning milk plan in sterilized glass bottles and enjoy ₹100 wallet credit automatically applied to your account.
        </p>
      </div>

      {/* Coupon Code Pill */}
      <div
        onClick={handleCopyCode}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          border: '1.5px dashed #cca859',
          borderRadius: 12,
          padding: '8px 12px',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>
            Promo Code:
          </span>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 14,
              fontWeight: 800,
              color: '#856214',
              letterSpacing: '0.05em',
            }}
          >
            MILQUU100
          </span>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: copied ? '#2d4a22' : '#856214',
            background: copied ? '#eef7ed' : '#faf5eb',
            padding: '3px 8px',
            borderRadius: 6,
          }}
        >
          {copied ? '✓ Copied' : 'Tap to Copy'}
        </span>
      </div>

      {/* 3 Core Value Props */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 6,
          position: 'relative',
          zIndex: 2,
          paddingTop: 2,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 3 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid #ebd9b5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="leaf" size={13} color="#2d4a22" strokeWidth={2.2} />
          </div>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: '#334155', lineHeight: 1.15 }}>
            Glass Bottle<br />Delivery
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 3 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid #ebd9b5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="cash" size={13} color="#2d4a22" strokeWidth={2.2} />
          </div>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: '#334155', lineHeight: 1.15 }}>
            Save 12%<br />Every Month
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 3 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid #ebd9b5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="pause" size={13} color="#2d4a22" strokeWidth={2.2} />
          </div>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: '#334155', lineHeight: 1.15 }}>
            Pause / Skip<br />Anytime
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4, position: 'relative', zIndex: 2 }}>
        <button
          type="button"
          className="mq-btn-gold"
          onClick={() => navigate('/app/plan')}
          style={{
            flex: 1,
            padding: '10px 14px',
            fontSize: 13,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <span>Claim ₹100 & Start</span>
          <span style={{ fontSize: 14 }}>→</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/app/start/sample')}
          style={{
            background: 'transparent',
            border: '1px solid #cca859',
            color: '#785a15',
            borderRadius: 999,
            padding: '10px 12px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Free 500ml Sample
        </button>
      </div>
    </div>
  );
}
