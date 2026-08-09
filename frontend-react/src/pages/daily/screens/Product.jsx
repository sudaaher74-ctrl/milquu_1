import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Screen, ActionBar, Icon } from '../ui';
import { rupees } from '../catalogue';
import { useDaily } from '../DailyContext';

export default function Product() {
  // `key` is the real Product._id — the same id the orders API is given.
  const { key } = useParams();
  const navigate = useNavigate();
  const { addToCart, productOf } = useDaily();
  const p = productOf(key);

  // DailyApp holds this route behind its own loading screen until the
  // catalogue has arrived, so reaching here with no match means the id is
  // genuinely wrong — not that the catalogue hasn't loaded yet.
  if (!p) return <Navigate to="/app/shop" replace />;

  const stockLevel = parseInt(p.stock, 10);
  const isOutOfStock = Number.isNaN(stockLevel) ? true : stockLevel <= 0;

  return (
    <Screen>
      <div
        style={{
          position: 'relative',
          background: 'var(--mq-sage-200)',
          borderRadius: '0 0 44px 44px',
          padding: 'calc(34px + env(safe-area-inset-top)) 22px 26px',
        }}
      >
        <div className="mq-between">
          <button
            type="button"
            className="mq-back mq-back-solid"
            onClick={() => navigate('/app/shop')}
            aria-label="Back to shop"
          >
            <Icon name="back" size={15} color="#1f2937" />
          </button>
        </div>
        <img
          src={p.img}
          alt={p.name}
          style={{ width: 172, height: 236, objectFit: 'contain', margin: '6px auto 0' }}
        />
      </div>

      <div className="mq-body" style={{ paddingTop: 24, gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
          <div className="mq-col" style={{ gap: 3 }}>
            <h2>{p.name}</h2>
            <span className="mq-sub" style={{ fontSize: 14 }}>{p.sub}</span>
          </div>
          <div className="mq-col" style={{ alignItems: 'flex-end' }}>
            <span className="mq-num" style={{ fontSize: 24 }}>₹{rupees(p.plan ?? p.price)}</span>
            <span style={{ fontSize: 12, color: 'var(--mq-neutral-600)' }}>{p.plan ? 'on a plan' : p.unit}</span>
          </div>
        </div>

        <div className="mq-row mq-row-wrap" style={{ gap: 8 }}>
          {p.tags.map((tag) => <span key={tag} className="mq-pill">{tag}</span>)}
        </div>

        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--mq-neutral-800)' }}>{p.desc}</p>

        <div className="mq-card mq-card-pad mq-col" style={{ gap: 12 }}>
          <span className="mq-label">Typical composition</span>
          {p.spec.map(([label, value]) => (
            <div key={label} className="mq-line">
              <span style={{ color: 'var(--mq-neutral-700)' }}>{label}</span>
              <span className="mq-strong">{value}</span>
            </div>
          ))}
        </div>

      </div>

      <div className="mq-fill" />

      <ActionBar>
        {isOutOfStock ? (
          <button type="button" className="mq-btn-outline" style={{ flex: 1, padding: '15px 0' }} disabled>
            Out of stock
          </button>
        ) : (
          <>
            <button
              type="button"
              className="mq-btn-outline"
              style={{ flex: 1, padding: '15px 0' }}
              onClick={() => { addToCart(p.key); navigate('/app/cart'); }}
            >
              Add once · ₹{rupees(p.price)}
            </button>
            {p.plan && (
              <button
                type="button"
                className="mq-btn mq-btn-md"
                style={{ flex: 1.2, padding: '15px 0' }}
                onClick={() => navigate('/app/start/milk')}
              >
                Every day · ₹{rupees(p.plan)}
              </button>
            )}
          </>
        )}
      </ActionBar>
    </Screen>
  );
}
