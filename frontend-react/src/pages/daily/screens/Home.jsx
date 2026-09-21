import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, TabBar, MobileHeader, Icon } from '../ui';
import { HOME_CATEGORIES } from '../catalogue';

export default function Home() {
  const navigate = useNavigate();
  const [selectedCat, setSelectedCat] = useState('milk');

  return (
    <Screen>
      {/* Top Header */}
      <MobileHeader rightIcon="bell" />

      {/* Main Content Area */}
      <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* ── 1. Hero Banner ────────────────────────────────────────── */}
        <div
          className="mq-home-hero"
          style={{
            position: 'relative',
            borderRadius: 24,
            overflow: 'hidden',
            padding: '22px 18px 20px',
            minHeight: 330,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Background Nature Image Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '62%',
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
            <span className="mq-pill-tag">PURE MILK &nbsp;HAPPIER TOMORROWS</span>
          </div>

          {/* Left Text Content */}
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '58%', marginTop: 8 }}>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 27,
                fontWeight: 800,
                color: '#132819',
                lineHeight: 1.12,
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Good Milk<br />Brighter Days
            </h1>
            <p
              style={{
                fontSize: 12.5,
                color: '#475569',
                lineHeight: 1.35,
                marginTop: 8,
                fontWeight: 500,
              }}
            >
              Farm goodness, delivered to your home every morning.
            </p>

            {/* 3 Circle Feature Badges */}
            <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: 44 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    background: 'rgba(255, 255, 255, 0.85)',
                    border: '1px solid #dcd6c8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="leaf" size={16} color="#2d4a22" strokeWidth={2} />
                </div>
                <span style={{ fontSize: 9.5, fontWeight: 600, color: '#334155', marginTop: 4, lineHeight: 1.15 }}>
                  Fresh<br />delivery
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: 44 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    background: 'rgba(255, 255, 255, 0.85)',
                    border: '1px solid #dcd6c8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="shield-check" size={16} color="#2d4a22" strokeWidth={2} />
                </div>
                <span style={{ fontSize: 9.5, fontWeight: 600, color: '#334155', marginTop: 4, lineHeight: 1.15 }}>
                  Trusted<br />sources
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: 44 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    background: 'rgba(255, 255, 255, 0.85)',
                    border: '1px solid #dcd6c8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="heart" size={16} color="#2d4a22" strokeWidth={2} />
                </div>
                <span style={{ fontSize: 9.5, fontWeight: 600, color: '#334155', marginTop: 4, lineHeight: 1.15 }}>
                  Healthy<br />lifestyle
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div style={{ marginTop: 16 }}>
              <button
                type="button"
                className="mq-btn-gold"
                onClick={() => navigate('/app/plan')}
              >
                <span>Start a plan</span>
                <span style={{ fontSize: 16 }}>→</span>
              </button>
            </div>
          </div>

          {/* Right Decorative Elements */}
          <div
            style={{
              position: 'absolute',
              top: 18,
              right: 14,
              zIndex: 3,
              textAlign: 'right',
              pointerEvents: 'none',
            }}
          >
            <span className="mq-script-text" style={{ fontSize: 21, color: '#27382b' }}>
              A Healthier<br />You ♡
            </span>
          </div>

          {/* Circular Stamp Badge on the bottom right */}
          <div
            className="mq-stamp-badge"
            style={{
              position: 'absolute',
              bottom: 16,
              right: 14,
              width: 76,
              height: 76,
              zIndex: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, fontStyle: 'italic', transform: 'rotate(-4deg)' }}>
              Freshness
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, fontStyle: 'italic', transform: 'rotate(-2deg)' }}>
              Delivered
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, fontStyle: 'italic', transform: 'rotate(2deg)' }}>
              Daily
            </span>
          </div>
        </div>

        {/* ── 2. Category Horizontal Scroll ─────────────────────────── */}
        <div>
          <div className="mq-cat-scroll">
            {HOME_CATEGORIES.map(([key, label]) => {
              const isActive = selectedCat === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedCat(key);
                    navigate(`/app/shop?cat=${key}`);
                  }}
                  className={`mq-cat-item ${isActive ? 'mq-cat-item-active' : ''}`}
                >
                  <Icon
                    name={`cat-${key}`}
                    size={26}
                    color={isActive ? '#785a15' : '#475569'}
                    strokeWidth={1.8}
                  />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. Promo Card ("More than just milk") ─────────────────── */}
        <div
          className="mq-promo-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            minHeight: 145,
            padding: 0,
            overflow: 'hidden',
          }}
        >
          {/* Left Crate Image */}
          <div
            style={{
              width: '45%',
              height: '100%',
              minHeight: 145,
              backgroundImage: 'url(/img/custom/veggies_crate.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              flexShrink: 0,
            }}
          />

          {/* Right Text & CTA */}
          <div style={{ flex: 1, padding: '16px 14px 16px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 18,
                fontWeight: 800,
                color: '#132819',
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              More than just milk
            </h3>
            <p style={{ fontSize: 11.5, color: '#4b5563', lineHeight: 1.35, margin: 0 }}>
              Fresh vegetables, fruits and dairy essentials – all in one place.
            </p>
            <div style={{ marginTop: 4 }}>
              <button
                type="button"
                className="mq-btn-outline-gold"
                style={{ padding: '6px 14px', fontSize: 12.5 }}
                onClick={() => navigate('/app/shop')}
              >
                <span>Browse the shop</span>
                <span style={{ fontSize: 13 }}>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 4. Section: Why choose MilQuu? ────────────────────────── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 21,
                fontWeight: 800,
                color: '#132819',
                margin: 0,
              }}
            >
              Why choose MilQuu?
            </h2>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
              Pure choices. Better living.
            </span>
          </div>

          <div className="mq-why-grid">
            <div className="mq-why-card">
              <div className="mq-why-circle">
                <Icon name="leaf" size={20} color="#785a15" strokeWidth={2} />
              </div>
              <span className="mq-why-text">Daily<br />fresh delivery</span>
            </div>

            <div className="mq-why-card">
              <div className="mq-why-circle">
                <Icon name="shield-check" size={20} color="#785a15" strokeWidth={2} />
              </div>
              <span className="mq-why-text">High<br />quality milk</span>
            </div>

            <div className="mq-why-card">
              <div className="mq-why-circle">
                <Icon name="truck" size={20} color="#785a15" strokeWidth={2} />
              </div>
              <span className="mq-why-text">On-time<br />delivery</span>
            </div>

            <div className="mq-why-card">
              <div className="mq-why-circle">
                <Icon name="heart" size={20} color="#785a15" strokeWidth={2} />
              </div>
              <span className="mq-why-text">Healthy<br />for your family</span>
            </div>
          </div>
        </div>

        {/* ── 5. Promo Banner ("GOODNESS IN EVERY GLASS") ────────────── */}
        <div
          style={{
            position: 'relative',
            borderRadius: 22,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #f7efe4 0%, #f4e8d8 100%)',
            border: '1px solid #ebd9c3',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            minHeight: 125,
          }}
        >
          {/* Left Milk Splash Image */}
          <div
            style={{
              width: '38%',
              height: '100%',
              minHeight: 125,
              backgroundImage: 'url(/img/custom/milk_splash.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              flexShrink: 0,
            }}
          />

          {/* Right Text & CTA */}
          <div style={{ flex: 1, padding: '14px 14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#856214',
                textTransform: 'uppercase',
              }}
            >
              GOODNESS IN EVERY GLASS
            </span>
            <h4
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 16,
                fontWeight: 800,
                color: '#132819',
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Pure. Natural. Nutritious.
            </h4>
            <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.3, margin: 0 }}>
              Subscribe today and give your family the best.
            </p>
            <div style={{ marginTop: 4 }}>
              <button
                type="button"
                className="mq-btn-gold"
                style={{ padding: '6px 14px', fontSize: 12 }}
                onClick={() => navigate('/app/plan')}
              >
                <span>Start now</span>
                <span style={{ fontSize: 13 }}>→</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      <div style={{ height: 16 }} />
      <TabBar />
    </Screen>
  );
}
