import { useNavigate } from 'react-router-dom';
import { Screen, TabBar, MobileHeader, Icon } from '../ui';
import { rupees } from '../catalogue';
import { useDaily } from '../DailyContext';
import { useAuth } from '../../../context/AuthContext';

export default function Account() {
  const navigate = useNavigate();
  const { wallet, orders, planActive, address, areaName, flash } = useDaily();
  const { user, logout } = useAuth();

  // Profile data matching screenshot 5 or falling back to logged in user
  const displayName = user?.name || 'Sudarshan Aher';
  const displayEmail = user?.email || 'milquufresh@gmail.com';
  const displayPhone = user?.phone || '+91 98765 43210';
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const handleSignOut = () => {
    if (user) {
      logout();
      flash('Signed out successfully');
    } else {
      flash('Logged out');
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              cursor: 'pointer',
            }}
            onClick={() => flash('Account details')}
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
              {initials || 'SA'}
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
              <span style={{ display: 'block', fontSize: 12, color: '#64748b', marginTop: 1 }}>
                {displayPhone}
              </span>
            </div>

            <Icon name="next" size={18} color="#94a3b8" />
          </div>

          {/* 4 Stats Cards */}
          <div className="mq-stat-grid">
            <div className="mq-stat-box">
              <Icon name="cat-milk" size={18} color="#785a15" strokeWidth={1.8} />
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Active Plan</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>
                {planActive ? 'Active' : 'No plan'}
              </span>
            </div>

            <div className="mq-stat-box">
              <Icon name="calendar" size={18} color="#785a15" strokeWidth={1.8} />
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Total Orders</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>
                {orders.length || 0}
              </span>
            </div>

            <div className="mq-stat-box">
              <Icon name="heart" size={18} color="#785a15" strokeWidth={1.8} />
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Saved Items</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>0</span>
            </div>

            <div className="mq-stat-box">
              <Icon name="wallet" size={18} color="#785a15" strokeWidth={1.8} />
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Wallet Balance</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>
                ₹{rupees(wallet || 0)}
              </span>
            </div>
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
            onClick={() => navigate('/app/start/address')}
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
            onClick={() => navigate('/contact')}
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
            onClick={() => flash('Settings saved')}
          >
            <div className="mq-row-icon">
              <Icon name="gear" size={18} color="#785a15" strokeWidth={2} />
            </div>
            <div className="mq-row-text">
              <span className="mq-row-title">Settings</span>
              <span className="mq-row-subtitle">Notifications, privacy and preferences</span>
            </div>
            <Icon name="next" size={16} color="#94a3b8" />
          </button>

          <button
            type="button"
            className="mq-list-row"
            onClick={handleSignOut}
          >
            <div className="mq-row-icon mq-row-icon-danger">
              <Icon name="logout" size={18} color="#ef4444" strokeWidth={2} />
            </div>
            <div className="mq-row-text">
              <span className="mq-row-title" style={{ color: '#ef4444' }}>Sign out</span>
              <span className="mq-row-subtitle">Log out from your account</span>
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
              onClick={() => navigate('/contact')}
            >
              <span>Contact us</span>
              <span>→</span>
            </button>
          </div>
        </div>

      </div>

      <div style={{ height: 16 }} />
      <TabBar />
    </Screen>
  );
}
