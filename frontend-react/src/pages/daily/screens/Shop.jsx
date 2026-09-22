import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Screen, TabBar, MobileHeader, Icon } from '../ui';
import { CATEGORIES, DEFAULT_POPULAR_PRODUCTS, rupees } from '../catalogue';
import { useDaily } from '../DailyContext';

export default function Shop() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialCat = params.get('cat') || 'all';

  const { addToCart, cartCount, flash, productList } = useDaily();
  const [cat, setCat] = useState(initialCat);
  const [query, setQuery] = useState('');
  const [wishlist, setWishlist] = useState({});

  const toggleWishlist = (id, e) => {
    e.stopPropagation();
    setWishlist((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    flash(!wishlist[id] ? 'Saved to your favourites' : 'Removed from favourites');
  };

  const sourceProducts = (productList && productList.length > 0) ? productList : DEFAULT_POPULAR_PRODUCTS;

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sourceProducts.filter((p) => {
      if (cat !== 'all' && p.cat !== cat) return false;
      if (!q) return true;
      return `${p.name} ${p.unit || ''}`.toLowerCase().includes(q);
    });
  }, [sourceProducts, cat, query]);

  return (
    <Screen>
      {/* Top Header with Cart icon and count */}
      <MobileHeader rightIcon="cart" cartCount={cartCount > 0 ? cartCount : 1} />

      {/* Main Content */}
      <div style={{ padding: '14px 18px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* ── Search Input ──────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 999,
            padding: '10px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <Icon name="search" size={17} color="#94a3b8" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search milk, ghee, curd, paneer..."
            aria-label="Search products"
            style={{
              flex: 1,
              minWidth: 0,
              border: 0,
              outline: 'none',
              background: 'transparent',
              fontFamily: 'inherit',
              fontSize: 13.5,
              color: '#1e293b',
            }}
          />
        </div>

        {/* ── Category Chips Filter ──────────────────────────────────── */}
        <div className="mq-cat-scroll">
          {CATEGORIES.map(([key, label]) => {
            const isActive = cat === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setCat(key)}
                className={`mq-cat-item ${isActive ? 'mq-cat-item-active' : ''}`}
              >
                <Icon
                  name={`cat-${key}`}
                  size={24}
                  color={isActive ? '#785a15' : '#475569'}
                  strokeWidth={1.8}
                />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Shop Hero Banner ──────────────────────────────────────── */}
        <div
          style={{
            position: 'relative',
            borderRadius: 22,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #fbf7ee 0%, #eef5e9 100%)',
            border: '1px solid #ede8df',
            padding: '18px 16px',
            minHeight: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
          }}
        >
          {/* Right Background Image Blend */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '55%',
              backgroundImage: 'url(/img/custom/hero_milk_bottle.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center right',
              pointerEvents: 'none',
              maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
            }}
          />

          {/* Left Text & CTA */}
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '60%' }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 21,
                fontWeight: 800,
                color: '#132819',
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Freshness<br />delivered daily
            </h2>
            <p style={{ fontSize: 12, color: '#475569', marginTop: 4, marginBottom: 12 }}>
              Pure dairy. Better living.
            </p>
            <button
              type="button"
              className="mq-btn-gold"
              style={{ padding: '8px 16px', fontSize: 12.5 }}
              onClick={() => {
                const el = document.getElementById('popular-products');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>Explore products</span>
              <span>→</span>
            </button>
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
            <span className="mq-script-text" style={{ fontSize: 16, color: '#27382b' }}>
              Straight<br />from trusted<br />sources ♡
            </span>
          </div>
        </div>

        {/* ── Popular Products Grid ─────────────────────────────────── */}
        <div id="popular-products">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 20,
                fontWeight: 800,
                color: '#132819',
                margin: 0,
              }}
            >
              Popular Products
            </h3>
            <button
              type="button"
              onClick={() => setCat('all')}
              style={{
                background: 'transparent',
                border: 0,
                color: '#856214',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>See all</span>
              <span>→</span>
            </button>
          </div>

          <div className="mq-product-grid">
            {filteredProducts.map((p) => {
              const isFav = wishlist[p.id];
              const stockLevel = parseInt(p.stock, 10);
              const isOutOfStock = Boolean(p.isOutOfStock) || Number.isNaN(stockLevel) || stockLevel <= 0;
              return (
                <div key={p.id} className="mq-product-card">
                  {/* Favorite Heart Button */}
                  <button
                    type="button"
                    className="mq-product-fav"
                    onClick={(e) => toggleWishlist(p.id, e)}
                    aria-label="Add to favourites"
                  >
                    <Icon
                      name="heart"
                      size={17}
                      color={isFav ? '#ef4444' : '#64748b'}
                      fill={isFav ? '#ef4444' : 'none'}
                      strokeWidth={1.8}
                    />
                  </button>

                  {/* Product Image */}
                  <div
                    style={{
                      width: '100%',
                      height: 110,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <img
                      src={p.img}
                      alt={p.name}
                      style={{
                        maxHeight: 105,
                        maxWidth: '90%',
                        objectFit: 'contain',
                        opacity: isOutOfStock ? 0.75 : 1,
                      }}
                    />
                  </div>

                  {/* Title */}
                  <h4
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: '#1e293b',
                      lineHeight: 1.25,
                      minHeight: 34,
                      margin: 0,
                    }}
                  >
                    {p.name} {p.unit && !p.name.toLowerCase().includes(p.unit.toLowerCase()) ? p.unit : ''}
                  </h4>

                  {/* Price */}
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#1e293b',
                      marginTop: 4,
                      marginBottom: 6,
                    }}
                  >
                    ₹{rupees(p.price)}
                  </span>

                  {/* Action / Stock state */}
                  {isOutOfStock ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto' }}>
                      <span className="mq-stock-pill">OUT OF STOCK</span>
                      <button type="button" disabled className="mq-btn-soldout" style={{ width: '100%' }}>
                        Sold out
                      </button>
                    </div>
                  ) : (
                    <div style={{ marginTop: 'auto' }}>
                      <button
                        type="button"
                        className="mq-btn-add-gold"
                        style={{ width: '100%' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p.id);
                        }}
                      >
                        <Icon name="cart" size={14} color="#856214" strokeWidth={2} />
                        <span>Add</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Bottom Promo Banner (Vegetables) ──────────────────────── */}
        <div
          style={{
            position: 'relative',
            borderRadius: 22,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #f7f9f4 0%, #ecf4e8 100%)',
            border: '1px solid #dce8d6',
            display: 'flex',
            alignItems: 'center',
            minHeight: 125,
          }}
        >
          {/* Left Vegetables Image */}
          <div
            style={{
              width: '38%',
              height: '100%',
              minHeight: 125,
              backgroundImage: 'url(/img/custom/veggies_crate.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              flexShrink: 0,
            }}
          />

          {/* Right Text & CTA */}
          <div style={{ flex: 1, padding: '14px 14px 14px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h4
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 15.5,
                fontWeight: 800,
                color: '#132819',
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Farm fresh vegetables too, at your doorstep.
            </h4>
            <p style={{ fontSize: 11.5, color: '#475569', margin: 0 }}>
              Fresh. Local. Healthy.
            </p>
            <div style={{ marginTop: 4 }}>
              <button
                type="button"
                className="mq-btn-outline-gold"
                style={{ padding: '6px 14px', fontSize: 12 }}
                onClick={() => setCat('vegetables')}
              >
                <span>Explore vegetables</span>
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
