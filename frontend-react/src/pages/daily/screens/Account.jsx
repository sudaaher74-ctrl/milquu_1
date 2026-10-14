import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, TabBar, MobileHeader, Icon } from '../ui';
import { rupees } from '../catalogue';
import { useDaily } from '../DailyContext';
import { useAuth } from '../../../context/AuthContext';

export default function Account() {
  const navigate = useNavigate();
  const { wallet, orders, planActive, areaName, savedCount, flash } = useDaily();
  const { user, logout } = useAuth();

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [slotPref, setSlotPref] = useState('early');
  const [doorbellPref, setDoorbellPref] = useState('ring');
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);

  // Profile data falling back when signed out
  const displayName = user?.name || 'Guest Visitor';
  const displayEmail = user?.email || 'Tap to sign in or create an account';
  const displayPhone = user?.phone || '';
  const initials = (user?.name || 'MQ')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const handleProfileClick = () => {
    if (!user) {
      navigate('/app/login', { state: { from: '/app/account' } });
    } else {
      setShowProfileModal(true);
    }
  };

  const handleSignOut = () => {
    if (user) {
      logout();
      flash('Signed out successfully');
      navigate('/app/login');
    } else {
      navigate('/app/login', { state: { from: '/app/account' } });
    }
  };

  return (
    <Screen>
      {/* Top Header */}
      <MobileHeader rightIcon="bell" />

      {/* Main Content */}
      <div style={{ padding: '14px 18px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* ── 1. User Profile Card ──────────────────────────────────── */}
        <div className="mq-profile-card">
          {/* User Info Row */}
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              cursor: 'pointer',
              width: '100%',
              border: 0,
              background: 'transparent',
              padding: 0,
              textAlign: 'left',
            }}
            onClick={handleProfileClick}
          >
            {/* Avatar */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 999,
                background: '#faeed4',
                color: '#785a15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 20,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initials || 'MQ'}
            </div>

            {/* Name, Email, Phone */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 18,
                  fontWeight: 800,
                  color: '#1e293b',
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                {displayName}
              </h2>
              <span style={{ display: 'block', fontSize: 12, color: '#64748b', marginTop: 2 }}>
                {displayEmail}
              </span>
              {displayPhone && (
                <span style={{ display: 'block', fontSize: 12, color: '#64748b', marginTop: 1 }}>
                  {displayPhone}
                </span>
              )}
            </div>

            <Icon name="next" size={18} color="#94a3b8" />
          </button>

          {/* 4 Stats Cards */}
          <div className="mq-stat-grid">
            <button
              type="button"
              className="mq-stat-box"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/app/plan')}
            >
              <Icon name="cat-milk" size={18} color="#785a15" strokeWidth={1.8} />
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Active Plan</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>
                {planActive ? 'Active' : 'No plan'}
              </span>
            </button>

            <button
              type="button"
              className="mq-stat-box"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/app/track')}
            >
              <Icon name="calendar" size={18} color="#785a15" strokeWidth={1.8} />
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Total Orders</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>
                {orders.length || 0}
              </span>
            </button>

            <button
              type="button"
              className="mq-stat-box"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(savedCount > 0 ? '/app/shop?saved=1' : '/app/shop')}
            >
              <Icon name="heart" size={18} color="#785a15" strokeWidth={1.8} />
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Saved Items</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>{savedCount || 0}</span>
            </button>

            <button
              type="button"
              className="mq-stat-box"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/app/wallet')}
            >
              <Icon name="wallet" size={18} color="#785a15" strokeWidth={1.8} />
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Wallet Balance</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>
                ₹{rupees(wallet || 0)}
              </span>
            </button>
          </div>
        </div>

        {/* ── 2. Promo Banner ("Start your daily milk plan") ──────────── */}
        <div
          style={{
            position: 'relative',
            borderRadius: 22,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #f2f7ef 0%, #eaf4e6 100%)',
            border: '1px solid #dce8d6',
            padding: '16px',
            minHeight: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Right Background Image Blend */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '45%',
              backgroundImage: 'url(/img/custom/hero_milk_bottle.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center right',
              pointerEvents: 'none',
              maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
            }}
          />

          {/* Left Text & CTA */}
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '62%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  background: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="leaf" size={13} color="#15803d" strokeWidth={2.2} />
              </div>
              <h3
                style={{
                  fontSize: 14.5,
                  fontWeight: 800,
                  color: '#132819',
                  margin: 0,
                }}
              >
                Start your daily milk plan
              </h3>
            </div>
            <p style={{ fontSize: 11.5, color: '#475569', margin: '2px 0 10px', lineHeight: 1.3 }}>
              Fresh milk delivered to your doorstep, every morning.
            </p>
            <button
              type="button"
              className="mq-btn-gold"
              style={{ padding: '7px 16px', fontSize: 12 }}
              onClick={() => navigate('/app/plan')}
            >
              <span>Explore Plans</span>
              <span>→</span>
            </button>
          </div>

          {/* Right Script text */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 3,
              textAlign: 'right',
              pointerEvents: 'none',
            }}
          >
            <span className="mq-script-text" style={{ fontSize: 15, color: '#27382b' }}>
              Good Milk<br />Better Days ♡
            </span>
          </div>
        </div>

        {/* ── 3. Menu Items Group 1 ──────────────────────────────────── */}
        <div className="mq-list-card">
          <button
            type="button"
            className="mq-list-row"
            onClick={() => navigate('/app/start/address', { state: { from: '/app/account' } })}
          >
            <div className="mq-row-icon">
              <Icon name="pin" size={18} color="#785a15" strokeWidth={2} />
            </div>
            <div className="mq-row-text">
              <span className="mq-row-title">Delivery address</span>
              <span className="mq-row-subtitle">Add or manage your delivery address</span>
            </div>
            <span className="mq-row-value">{areaName || 'Not set'}</span>
            <Icon name="next" size={16} color="#94a3b8" />
          </button>

          <button
            type="button"
            className="mq-list-row"
            onClick={() => navigate('/app/track')}
          >
            <div className="mq-row-icon">
              <Icon name="package" size={18} color="#785a15" strokeWidth={2} />
            </div>
            <div className="mq-row-text">
              <span className="mq-row-title">My orders</span>
              <span className="mq-row-subtitle">View your past and upcoming orders</span>
            </div>
            <Icon name="next" size={16} color="#94a3b8" />
          </button>

          <button
            type="button"
            className="mq-list-row"
            onClick={() => navigate('/app/plan')}
          >
            <div className="mq-row-icon">
              <Icon name="calendar" size={18} color="#785a15" strokeWidth={2} />
            </div>
            <div className="mq-row-text">
              <span className="mq-row-title">My plan</span>
              <span className="mq-row-subtitle">Manage your milk subscription</span>
            </div>
            <Icon name="next" size={16} color="#94a3b8" />
          </button>

          <button
            type="button"
            className="mq-list-row"
            onClick={() => navigate('/app/wallet')}
          >
            <div className="mq-row-icon">
              <Icon name="wallet" size={18} color="#785a15" strokeWidth={2} />
            </div>
            <div className="mq-row-text">
              <span className="mq-row-title">Wallet &amp; payments</span>
              <span className="mq-row-subtitle">Manage balance, auto-pay and payment methods</span>
            </div>
            <Icon name="next" size={16} color="#94a3b8" />
          </button>
        </div>

        {/* ── 4. Menu Items Group 2 ──────────────────────────────────── */}
        <div className="mq-list-card">
          <button
            type="button"
            className="mq-list-row"
            onClick={() => navigate('/app/help')}
          >
            <div className="mq-row-icon">
              <Icon name="help" size={18} color="#785a15" strokeWidth={2} />
            </div>
            <div className="mq-row-text">
              <span className="mq-row-title">Help and refunds</span>
              <span className="mq-row-subtitle">FAQs, support and refund policy</span>
            </div>
            <Icon name="next" size={16} color="#94a3b8" />
          </button>

          <button
            type="button"
            className="mq-list-row"
            onClick={() => {
              if (!user) {
                navigate('/app/login', { state: { from: '/app/account' } });
              } else {
                setShowSettingsModal(true);
              }
            }}
          >
            <div className="mq-row-icon">
              <Icon name="gear" size={18} color="#785a15" strokeWidth={2} />
            </div>
            <div className="mq-row-text">
              <span className="mq-row-title">Settings &amp; preferences</span>
              <span className="mq-row-subtitle">Delivery timings, doorbell &amp; alert preferences</span>
            </div>
            <Icon name="next" size={16} color="#94a3b8" />
          </button>

          <button
            type="button"
            className="mq-list-row"
            onClick={handleSignOut}
          >
            <div className={user ? 'mq-row-icon mq-row-icon-danger' : 'mq-row-icon'}>
              <Icon name={user ? 'logout' : 'user'} size={18} color={user ? '#ef4444' : '#785a15'} strokeWidth={2} />
            </div>
            <div className="mq-row-text">
              <span className="mq-row-title" style={{ color: user ? '#ef4444' : '#1e293b' }}>
                {user ? 'Sign out' : 'Sign in / Create account'}
              </span>
              <span className="mq-row-subtitle">
                {user ? 'Log out from your account' : 'Access your subscription, orders and wallet'}
              </span>
            </div>
            <Icon name="next" size={16} color="#94a3b8" />
          </button>
        </div>

        {/* ── 5. Need Help Support Banner ────────────────────────────── */}
        <div
          style={{
            position: 'relative',
            borderRadius: 22,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #fdfbf6 0%, #f7f1e6 100%)',
            border: '1px solid #ebd9c3',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 90,
          }}
        >
          {/* Right Farm Pasture Image */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '40%',
              backgroundImage: 'url(/img/custom/hero_milk_bottle.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'bottom right',
              pointerEvents: 'none',
              maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 2, maxWidth: '65%' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                background: '#faf3e1',
                border: '1px solid #edd9af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name="headset" size={19} color="#856214" strokeWidth={2} />
            </div>
            <div>
              <h4 style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Need help?
              </h4>
              <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0', lineHeight: 1.25 }}>
                We're here for you. Contact our support team anytime.
              </p>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <button
              type="button"
              className="mq-btn-outline-gold"
              style={{
                padding: '6px 14px',
                fontSize: 12,
                background: '#ffffff',
                whiteSpace: 'nowrap',
              }}
              onClick={() => navigate('/app/help')}
            >
              <span>Contact us</span>
              <span>→</span>
            </button>
          </div>
        </div>

      </div>

      {/* ── Settings & Preferences Modal ────────────────────────────── */}
      {showSettingsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setShowSettingsModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 460,
              background: '#ffffff',
              borderRadius: '28px 28px 0 0',
              padding: '24px 20px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    background: '#faeed4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="gear" size={18} color="#785a15" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  Delivery Preferences
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: 0,
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Preferred Slot */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                Preferred Morning Delivery Window
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setSlotPref('early')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 14,
                    border: slotPref === 'early' ? '2px solid #bba362' : '1px solid #e2e8f0',
                    background: slotPref === 'early' ? '#faf3e1' : '#f8fafc',
                    color: slotPref === 'early' ? '#785a15' : '#475569',
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ display: 'block', fontWeight: 700 }}>5:30 AM – 7:30 AM</span>
                  <span style={{ fontSize: 10.5, color: '#64748b' }}>Early Round (Default)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSlotPref('standard')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 14,
                    border: slotPref === 'standard' ? '2px solid #bba362' : '1px solid #e2e8f0',
                    background: slotPref === 'standard' ? '#faf3e1' : '#f8fafc',
                    color: slotPref === 'standard' ? '#785a15' : '#475569',
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ display: 'block', fontWeight: 700 }}>7:00 AM – 8:30 AM</span>
                  <span style={{ fontSize: 10.5, color: '#64748b' }}>Standard Morning</span>
                </button>
              </div>
            </div>

            {/* Doorbell Preference */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                Doorbell &amp; Drop Instructions
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setDoorbellPref('ring')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 14,
                    border: doorbellPref === 'ring' ? '2px solid #bba362' : '1px solid #e2e8f0',
                    background: doorbellPref === 'ring' ? '#faf3e1' : '#f8fafc',
                    color: doorbellPref === 'ring' ? '#785a15' : '#475569',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🔔 Ring Bell
                </button>

                <button
                  type="button"
                  onClick={() => setDoorbellPref('silent')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 14,
                    border: doorbellPref === 'silent' ? '2px solid #bba362' : '1px solid #e2e8f0',
                    background: doorbellPref === 'silent' ? '#faf3e1' : '#f8fafc',
                    color: doorbellPref === 'silent' ? '#785a15' : '#475569',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🤫 Leave Silently
                </button>
              </div>
            </div>

            {/* WhatsApp Notifications Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 14,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <div>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                  WhatsApp Delivery Alerts
                </span>
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  Get notified when milk is dropped at your door
                </span>
              </div>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                style={{ width: 20, height: 20, accentColor: '#785a15', cursor: 'pointer' }}
              />
            </div>

            <button
              type="button"
              className="mq-btn-gold"
              style={{
                padding: '13px',
                fontSize: 14,
                fontWeight: 700,
                marginTop: 6,
              }}
              onClick={() => {
                flash('Preferences saved successfully');
                setShowSettingsModal(false);
              }}
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* ── Profile Information Modal ───────────────────────────────── */}
      {showProfileModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setShowProfileModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 460,
              background: '#ffffff',
              borderRadius: '28px 28px 0 0',
              padding: '24px 20px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Profile Information
              </h3>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: 0,
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 999,
                  background: '#faeed4',
                  color: '#785a15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 20,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {initials || 'SA'}
              </div>
              <div>
                <h4 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  {displayName}
                </h4>
                <span
                  style={{
                    display: 'inline-block',
                    background: '#dcfce7',
                    color: '#15803d',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    marginTop: 3,
                  }}
                >
                  Verified Customer
                </span>
              </div>
            </div>

            <div
              style={{
                borderRadius: 18,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Email Address</span>
                <span style={{ display: 'block', fontSize: 13.5, color: '#1e293b', fontWeight: 600 }}>
                  {displayEmail}
                </span>
              </div>
              <div style={{ height: 1, background: '#e2e8f0' }} />
              <div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Phone Number</span>
                <span style={{ display: 'block', fontSize: 13.5, color: '#1e293b', fontWeight: 600 }}>
                  {displayPhone || 'Not set'}
                </span>
              </div>
              <div style={{ height: 1, background: '#e2e8f0' }} />
              <div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Delivery Location</span>
                <span style={{ display: 'block', fontSize: 13.5, color: '#1e293b', fontWeight: 600 }}>
                  {areaName || 'Kharghar, Navi Mumbai'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="mq-btn-outline-gold"
                style={{ flex: 1, padding: '12px 14px', fontSize: 13 }}
                onClick={() => {
                  setShowProfileModal(false);
                  navigate('/app/start/address');
                }}
              >
                Change Address
              </button>
              <button
                type="button"
                className="mq-btn-gold"
                style={{ flex: 1, padding: '12px 14px', fontSize: 13 }}
                onClick={() => setShowProfileModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 16 }} />
      <TabBar />
    </Screen>
  );
}
