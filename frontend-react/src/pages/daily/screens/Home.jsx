import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Screen, TabBar, Icon, Stepper } from '../ui';
import { rupees } from '../catalogue';
import { fmtDay } from '../dates';
import { useDaily } from '../DailyContext';

export default function Home() {
  const navigate = useNavigate();
  const {
    crate, bumpCrate, tomorrow, tomorrowSkipped, toggleSkipTomorrow,
    tomorrowTotal, wallet, addToCart, rhythmDef, slotDef, planActive, areaName,
    itemRows, priceOf, suggested, runwayDays, planDaily,
  } = useDaily();

  // Nothing to come home to until a plan exists — browse the shop instead of
  // being funnelled through onboarding. Starting a plan is still one tap away
  // from any product, just never forced as the landing screen.
  if (!planActive) return <Navigate to="/app/shop" replace />;
  // A plan without a serviceable address can't be delivered.
  if (!areaName) return <Navigate to="/app/start/address" replace />;

  const rows = itemRows(crate);
  // What the nightly engine will actually see: it debits the wallet before
  // building tomorrow's order and auto-pauses rather than deliver on credit,
  // so a wallet short of the total means this crate will not arrive as shown.
  const atRisk = !tomorrowSkipped && tomorrowTotal > 0 && wallet < tomorrowTotal;

  return (
    <Screen>
      <div className="mq-between" style={{ padding: 'calc(38px + env(safe-area-inset-top)) 20px 0', alignItems: 'flex-start' }}>
        <div className="mq-col" style={{ gap: 2 }}>
          <span className="mq-kicker">Deliver to</span>
          <Link to="/app/account" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 16, fontWeight: 700 }}>
            {areaName || 'Set your address'}
            <Icon name="down" size={14} />
          </Link>
        </div>
        <button type="button" className="mq-pill" style={{ padding: '9px 15px', fontSize: 14, cursor: 'pointer' }} onClick={() => navigate('/app/wallet')}>
          <Icon name="wallet" size={15} />
          ₹{rupees(wallet)}
        </button>
      </div>

      {planDaily > 0 && runwayDays <= 3 && (
        <button
          type="button"
          className="mq-note"
          style={{ margin: '20px 20px 0', width: 'calc(100% - 40px)', textAlign: 'left', border: 0, cursor: 'pointer', font: 'inherit', color: 'inherit' }}
          onClick={() => navigate('/app/wallet')}
        >
          <Icon name="alert" color="#3d472b" />
          <span style={{ flex: 1, fontWeight: 700 }}>
            {runwayDays > 0
              ? `Only ${runwayDays} more ${runwayDays === 1 ? 'morning' : 'mornings'} left on your wallet — top up to keep the milk coming.`
              : 'Wallet balance too low for tomorrow’s crate — top up now or the plan pauses.'}
          </span>
          <Icon name="next" size={16} color="#3d472b" />
        </button>
      )}

      {tomorrowSkipped ? (
        <div className="mq-dark mq-col" style={{ margin: '20px 20px 0', gap: 11, padding: 20 }}>
          <span className="mq-label" style={{ color: 'var(--mq-sage-200)' }}>
            Tomorrow · {fmtDay(tomorrow)}
          </span>
          <span className="mq-num" style={{ fontSize: 24, lineHeight: 1.1, color: 'var(--mq-sage-100)' }}>
            Skipped. Nothing to pay.
          </span>
          <span style={{ fontSize: 14, color: 'var(--mq-sage-200)' }}>
            Your plan picks up again the next morning at {slotDef.label.split(' – ')[0]}.
          </span>
          <div className="mq-row" style={{ marginTop: 2 }}>
            <button type="button" className="mq-btn-cream" style={{ fontSize: 14, padding: '11px 18px' }} onClick={toggleSkipTomorrow}>
              Undo skip
            </button>
            <button type="button" className="mq-btn-cream-outline" style={{ fontSize: 14, padding: '11px 18px' }} onClick={() => navigate('/app/plan/pause')}>
              Skip more days
            </button>
          </div>
        </div>
      ) : (
        <div className="mq-card mq-card-md" style={{ margin: '20px 20px 0', overflow: 'hidden' }}>
          <div className="mq-between" style={{ padding: '18px 20px 0' }}>
            <span className="mq-label mq-kicker-sage">
              {atRisk ? 'At risk — not paid for yet' : 'Arriving tomorrow'}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mq-neutral-600)' }}>{fmtDay(tomorrow)}</span>
          </div>
          <div className="mq-num" style={{ padding: '6px 20px 0', fontSize: 26, lineHeight: 1.1 }}>
            {slotDef.label}
          </div>

          {rows.length === 0 ? (
            <div className="mq-col" style={{ gap: 10, padding: '14px 20px 18px', alignItems: 'flex-start' }}>
              <span className="mq-sub">Your crate is empty — nothing is scheduled for tomorrow.</span>
              <button type="button" className="mq-btn-soft" onClick={() => navigate('/app/shop')}>
                Add something
              </button>
            </div>
          ) : (
            <>
              <div className="mq-col" style={{ padding: '14px 20px 0' }}>
                {rows.map((row) => (
                  <div key={row.key} className="mq-item" style={{ padding: '10px 0' }}>
                    <img src={row.img} alt="" className="mq-item-thumb" />
                    <div className="mq-item-body">
                      <span className="mq-item-name">
                        {row.short} · {row.cat === 'milk' ? `${row.qty} L` : row.unit}
                      </span>
                      <span className="mq-item-meta">
                        {row.cat === 'milk' ? 'Glass bottle' : row.kicker} · {rhythmDef.long.toLowerCase()}
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

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px 18px' }}>
                {/* Two lines rather than one: at 375px the single line wraps mid-phrase. */}
                <span className="mq-col" style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: atRisk ? 'var(--mq-clay-700, #a4423a)' : undefined }}>
                    ₹{rupees(tomorrowTotal)}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--mq-neutral-600)' }}>
                    {atRisk ? `wallet only covers ₹${rupees(wallet)}` : 'from wallet'}
                  </span>
                </span>
                {atRisk ? (
                  <button type="button" className="mq-btn" style={{ fontSize: 14, padding: '11px 18px' }} onClick={() => navigate('/app/wallet')}>
                    Top up
                  </button>
                ) : (
                  <>
                    <button type="button" className="mq-btn-outline mq-btn-md" onClick={toggleSkipTomorrow}>
                      Skip
                    </button>
                    <button type="button" className="mq-btn" style={{ fontSize: 14, padding: '11px 18px' }} onClick={() => navigate('/app/plan')}>
                      Edit crate
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <div className="mq-between" style={{ padding: '24px 20px 0', alignItems: 'baseline' }}>
        <span className="mq-num" style={{ fontSize: 19 }}>Add to tomorrow</span>
        <Link to="/app/shop" className="mq-link">All products</Link>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div className="mq-rail-x">
          {suggested.map((p) => {
            const key = p.id;
            return (
              <div key={key} className="mq-tile mq-tile-sm">
                <Link to={`/app/product/${key}`}>
                  <img src={p.img} alt={p.name} />
                </Link>
                <span className="mq-tile-name">{p.name} {p.unit}</span>
                <span className="mq-tile-price">₹{rupees(priceOf(key, false))}</span>
                <button type="button" className="mq-btn-soft" style={{ marginTop: 2, padding: '8px 0' }} onClick={() => addToCart(key)}>
                  + Add
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mq-fill" style={{ minHeight: 28 }} />
      <TabBar />
    </Screen>
  );
}
