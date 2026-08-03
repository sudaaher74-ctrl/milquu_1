import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, TabBar, Icon } from '../ui';
import { PRODUCT_LIST, CATEGORIES, rupees } from '../catalogue';
import { useDaily } from '../DailyContext';

export default function Shop() {
  const navigate = useNavigate();
  const { addToCart, cartCount } = useDaily();
  const [cat, setCat] = useState('all');
  const [query, setQuery] = useState('');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCT_LIST.filter((p) => {
      if (cat !== 'all' && p.cat !== cat) return false;
      if (!q) return true;
      return `${p.name} ${p.kicker} ${p.meta}`.toLowerCase().includes(q);
    });
  }, [cat, query]);

  return (
    <Screen>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 'calc(38px + env(safe-area-inset-top)) 20px 0' }}>
        <div
          className="mq-card"
          style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, borderRadius: 999, padding: '12px 16px' }}
        >
          <Icon name="search" size={17} color="#82796a" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search milk, ghee, curd"
            aria-label="Search products"
            style={{
              flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent',
              font: 'inherit', fontSize: 15, color: 'var(--mq-text)',
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => navigate('/app/cart')}
          aria-label={`Cart, ${cartCount} items`}
          style={{
            position: 'relative', width: 46, height: 46, flex: 'none', border: 0, borderRadius: 999,
            background: 'var(--mq-sage-700)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', boxShadow: 'var(--mq-shadow-sm)', cursor: 'pointer',
          }}
        >
          <Icon name="bag" size={20} color="#ffffff" />
          {cartCount > 0 && (
            <span
              style={{
                position: 'absolute', top: -2, right: -2, minWidth: 20, height: 20, borderRadius: 999,
                background: 'var(--mq-sage-100)', color: 'var(--mq-sage-900)', fontSize: 11,
                fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 5px',
              }}
            >
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div className="mq-rail-x" style={{ gap: 9, paddingTop: 18 }}>
          {CATEGORIES.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`mq-chip${cat === key ? ' mq-chip-on' : ''}`}
              onClick={() => setCat(key)}
              aria-pressed={cat === key}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mq-grid" style={{ padding: '18px 20px 0' }}>
        {shown.map((p) => (
          <div key={p.key} className="mq-tile">
            <button
              type="button"
              onClick={() => navigate(`/app/product/${p.key}`)}
              style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer', textAlign: 'left' }}
            >
              <img src={p.img} alt={p.name} />
              <span className="mq-label mq-kicker-sage" style={{ display: 'block', marginTop: 6 }}>{p.kicker}</span>
              <span className="mq-tile-name" style={{ display: 'block', marginTop: 6 }}>{p.name} {p.unit}</span>
            </button>
            <span className="mq-tile-price">
              ₹{rupees(p.price)}
              {p.plan && <span className="mq-tile-plan"> · ₹{rupees(p.plan)} on plan</span>}
            </span>
            <div className="mq-row" style={{ gap: 8, marginTop: 2 }}>
              <button type="button" className="mq-btn-outline mq-btn-sm" style={{ flex: 1, padding: '9px 0' }} onClick={() => addToCart(p.key)}>
                Add
              </button>
              {p.plan && (
                <button type="button" className="mq-btn mq-btn-sm" style={{ flex: 1, padding: '9px 0' }} onClick={() => navigate('/app/start/milk')}>
                  Plan
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {shown.length === 0 && (
        <p className="mq-sub" style={{ padding: '28px 20px', textAlign: 'center' }}>
          Nothing matches “{query}”. Try milk, ghee or curd.
        </p>
      )}

      <div className="mq-fill" style={{ minHeight: 24 }} />
      <TabBar />
    </Screen>
  );
}
