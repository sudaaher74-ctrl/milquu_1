import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Screen, TopBar, TabBar, Icon } from '../ui';
import { useDaily } from '../DailyContext';
import { useAuth } from '../../../context/AuthContext';
import { buildWhatsAppUrl, WHATSAPP_DISPLAY } from '../../../utils/whatsapp';
import { trackContact, trackGenerateLead } from '../../../utils/analytics';
import { PHONE, EMAIL } from '../../../data/schemas';

const FAQS = [
  {
    q: 'What time is milk delivered every morning?',
    a: 'Our delivery team delivers farm-fresh, chilled milk directly to your doorstep between 5:30 AM and 7:30 AM every morning. Your milk is fresh from the previous evening and kept strictly cold.',
  },
  {
    q: 'What is the cutoff time to pause, change or add items for tomorrow?',
    a: 'You can pause, resume, or modify your subscription anytime before 10:00 PM tonight. Any updates saved before 10:00 PM automatically apply to tomorrow morning’s delivery.',
  },
  {
    q: 'How does the pure glass bottle return/exchange work?',
    a: 'We deliver milk in sanitized, eco-friendly glass bottles to preserve pure taste and quality. Simply rinse your previous empty bottle and place it outside your door or in your delivery bag. Our delivery boy swaps it when dropping off your fresh bottle.',
  },
  {
    q: 'What if a bottle arrives damaged, unsealed, or sour?',
    a: 'We offer an unconditional 100% Quality & Freshness Guarantee. If you ever experience any problem, send us a photo on WhatsApp (+91 87670 67884). We will immediately issue a wallet refund or send a fresh replacement bottle.',
  },
  {
    q: 'How do wallet deductions and balances work?',
    a: 'Milquu operates on a prepaid wallet model. After your morning delivery is confirmed, the daily bottle charge is automatically deducted from your balance. You also save 12% on daily prices with an active subscription plan.',
  },
  {
    q: 'Can I pause my subscription when going on vacation?',
    a: 'Yes, easily! Go to the "Plan" tab in your bottom bar, tap "Pause plan", and select your vacation start and end dates. Zero milk will be delivered and zero money will be deducted during your pause.',
  },
  {
    q: 'Which areas do you deliver to in Navi Mumbai?',
    a: 'We currently serve New Panvel, Panvel, Khanda Colony, Kamothe, Kharghar, Belapur, Nerul, and nearby sectors. Enter your address in the delivery section to confirm your exact tower/street.',
  },
];

const ISSUE_CATEGORIES = [
  'Delivery Query',
  'Pause / Resume Subscription',
  'Bottle Quality / Replacement',
  'Wallet & Refund',
  'Address Change',
  'Other',
];

export default function HelpRefunds() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const activeTabParam = params.get('tab');
  const [activeTab, setActiveTab] = useState(
    activeTabParam === 'faqs' ? 'faqs' : activeTabParam === 'refunds' ? 'refunds' : 'support'
  );

  const { user } = useAuth();
  const { flash } = useDaily();

  // Accordion state for FAQs
  const [openFaq, setOpenFaq] = useState(0);

  // Form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [category, setCategory] = useState(ISSUE_CATEGORIES[0]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (activeTabParam && ['support', 'faqs', 'refunds'].includes(activeTabParam)) {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setParams({ tab });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      flash('Please enter a brief message for our team.');
      return;
    }

    const text = [
      `Hi MilQuuFresh Support team,`,
      name ? `Name: ${name}` : '',
      phone ? `Phone: ${phone}` : '',
      `Topic: ${category}`,
      `Message: ${message}`,
    ]
      .filter(Boolean)
      .join('\n');

    trackGenerateLead('app_help_whatsapp');
    trackContact('form', 'app_help_screen');

    window.open(buildWhatsAppUrl(text), '_blank', 'noopener,noreferrer');
    setMessage('');
    flash('Opening WhatsApp to send your message…');
  };

  const handleDirectWhatsApp = () => {
    trackContact('whatsapp', 'app_help_screen');
    window.open(buildWhatsAppUrl('Hi MilQuuFresh, I need help with my milk delivery / subscription.'), '_blank', 'noopener,noreferrer');
  };

  return (
    <Screen>
      <TopBar title="Help & refunds" to="/app/account" />

      <div style={{ padding: '14px 18px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* ── 1. Header Banner ────────────────────────────────────────── */}
        <div
          style={{
            position: 'relative',
            borderRadius: 22,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #fdfbf6 0%, #f7f1e6 100%)',
            border: '1px solid #ebd9c3',
            padding: '18px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#faf3e1',
                border: '1px solid #edd9af',
                color: '#785a15',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 999,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}
            >
              <Icon name="shield-check" size={13} color="#785a15" />
              Customer Care &amp; Support
            </span>
          </div>

          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 22,
              fontWeight: 800,
              color: '#1e293b',
              margin: '4px 0 0',
              lineHeight: 1.2,
            }}
          >
            How can we help you?
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.4 }}>
            Quick answers, live WhatsApp support, and transparent refund &amp; cancellation policies.
          </p>
        </div>

        {/* ── 2. Segmented Pill Tabs ──────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: 4,
            borderRadius: 16,
            gap: 4,
          }}
          role="tablist"
        >
          <button
            type="button"
            onClick={() => switchTab('support')}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: activeTab === 'support' ? 700 : 500,
              border: 0,
              background: activeTab === 'support' ? '#ffffff' : 'transparent',
              color: activeTab === 'support' ? '#1e293b' : '#64748b',
              boxShadow: activeTab === 'support' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Quick support
          </button>

          <button
            type="button"
            onClick={() => switchTab('faqs')}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: activeTab === 'faqs' ? 700 : 500,
              border: 0,
              background: activeTab === 'faqs' ? '#ffffff' : 'transparent',
              color: activeTab === 'faqs' ? '#1e293b' : '#64748b',
              boxShadow: activeTab === 'faqs' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            FAQs
          </button>

          <button
            type="button"
            onClick={() => switchTab('refunds')}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: activeTab === 'refunds' ? 700 : 500,
              border: 0,
              background: activeTab === 'refunds' ? '#ffffff' : 'transparent',
              color: activeTab === 'refunds' ? '#1e293b' : '#64748b',
              boxShadow: activeTab === 'refunds' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Refund policy
          </button>
        </div>

        {/* ── 3. Tab Contents ─────────────────────────────────────────── */}

        {/* TAB 1: QUICK SUPPORT */}
        {activeTab === 'support' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Live WhatsApp Action Card */}
            <div
              style={{
                borderRadius: 20,
                border: '1px solid #cce8d4',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #e6f7ec 100%)',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 999,
                      background: '#25D366',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                    }}
                  >
                    <Icon name="whatsapp" size={22} color="#ffffff" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#166534', margin: 0 }}>
                      WhatsApp Support
                    </h3>
                    <span style={{ fontSize: 12, color: '#15803d', fontWeight: 500 }}>
                      Fastest response • 6 AM to 10 PM
                    </span>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 11,
                    background: '#dcfce7',
                    color: '#15803d',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 999,
                    border: '1px solid #bbf7d0',
                  }}
                >
                  Online
                </span>
              </div>

              <p style={{ fontSize: 12.5, color: '#166534', margin: 0, lineHeight: 1.4 }}>
                Directly chat with our dairy team about daily deliveries, bottle replacements, or vacation pauses.
              </p>

              <button
                type="button"
                className="mq-btn"
                style={{
                  background: '#25D366',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 18px',
                  borderRadius: 999,
                  border: 0,
                  boxShadow: '0 3px 10px rgba(37,211,102,0.25)',
                }}
                onClick={handleDirectWhatsApp}
              >
                <Icon name="whatsapp" size={18} color="#ffffff" />
                <span>Chat on WhatsApp ({WHATSAPP_DISPLAY})</span>
              </button>
            </div>

            {/* Direct Phone & Email Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <a
                href={`tel:${PHONE}`}
                onClick={() => trackContact('phone', 'app_help_screen')}
                style={{
                  borderRadius: 18,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="phone" size={16} color="#785a15" />
                </div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Helpline</span>
                <span style={{ fontSize: 12.5, color: '#1e293b', fontWeight: 700, lineHeight: 1.2 }}>
                  +91 87670 67884
                </span>
              </a>

              <a
                href={`mailto:${EMAIL}`}
                onClick={() => trackContact('email', 'app_help_screen')}
                style={{
                  borderRadius: 18,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="headset" size={16} color="#785a15" />
                </div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Email support</span>
                <span style={{ fontSize: 11.5, color: '#1e293b', fontWeight: 700, lineHeight: 1.2 }}>
                  {EMAIL}
                </span>
              </a>
            </div>

            {/* Quick Contact Form */}
            <form
              onSubmit={handleSendMessage}
              style={{
                borderRadius: 22,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                padding: '18px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  Send us a quick message
                </h4>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                  Have a specific question or issue? Fill this out to start a ticket.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569' }}>
                  Issue Category
                </label>
                <div
                  style={{
                    display: 'flex',
                    gap: 6,
                    flexWrap: 'wrap',
                  }}
                >
                  {ISSUE_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 999,
                        fontSize: 11.5,
                        fontWeight: category === cat ? 700 : 500,
                        border: category === cat ? '1px solid #bba362' : '1px solid #e2e8f0',
                        background: category === cat ? '#faeed4' : '#f8fafc',
                        color: category === cat ? '#785a15' : '#475569',
                        cursor: 'pointer',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label htmlFor="help-name" style={{ fontSize: 11.5, fontWeight: 600, color: '#475569' }}>
                    Your Name
                  </label>
                  <input
                    id="help-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sudarshan"
                    className="mq-input"
                    style={{ fontSize: 13, padding: '10px 14px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label htmlFor="help-phone" style={{ fontSize: 11.5, fontWeight: 600, color: '#475569' }}>
                    Phone Number
                  </label>
                  <input
                    id="help-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91..."
                    className="mq-input"
                    style={{ fontSize: 13, padding: '10px 14px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label htmlFor="help-msg" style={{ fontSize: 11.5, fontWeight: 600, color: '#475569' }}>
                  Your Message
                </label>
                <textarea
                  id="help-msg"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help? (e.g. Please replace morning bottle, or pause delivery for Sunday)"
                  className="mq-input"
                  style={{ fontSize: 13, padding: '10px 14px', borderRadius: 16 }}
                />
              </div>

              <button
                type="submit"
                className="mq-btn-gold"
                style={{
                  padding: '12px 18px',
                  fontSize: 13.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <span>Send via WhatsApp</span>
                <span>→</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: FAQS */}
        {activeTab === 'faqs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  style={{
                    borderRadius: 18,
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      background: 'none',
                      border: 0,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b' }}>
                      {faq.q}
                    </span>
                    <Icon
                      name={isOpen ? 'up' : 'down'}
                      size={16}
                      color="#785a15"
                      strokeWidth={2.5}
                    />
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '0 16px 14px',
                        fontSize: 13,
                        color: '#64748b',
                        lineHeight: 1.5,
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: 10,
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}

            <div
              style={{
                marginTop: 8,
                padding: '14px 16px',
                borderRadius: 18,
                background: '#faf3e1',
                border: '1px solid #edd9af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#785a15' }}>
                  Still have questions?
                </span>
                <span style={{ fontSize: 11.5, color: '#926a19' }}>
                  Our team answers directly on WhatsApp.
                </span>
              </div>
              <button
                type="button"
                className="mq-btn-gold"
                style={{ fontSize: 12, padding: '7px 14px' }}
                onClick={handleDirectWhatsApp}
              >
                Chat now
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: REFUND & CANCELLATION POLICY */}
        {activeTab === 'refunds' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Highlights Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div
                style={{
                  borderRadius: 18,
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <Icon name="shield-check" size={20} color="#16a34a" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginTop: 4 }}>
                  100% Secure
                </span>
                <span style={{ fontSize: 11, color: '#15803d', lineHeight: 1.35 }}>
                  Any unused wallet balance is always yours to withdraw.
                </span>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  background: '#faf3e1',
                  border: '1px solid #edd9af',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <Icon name="clock" size={20} color="#785a15" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#785a15', marginTop: 4 }}>
                  24-Hour Review
                </span>
                <span style={{ fontSize: 11, color: '#926a19', lineHeight: 1.35 }}>
                  Withdrawals processed within 24 hours via UPI / IMPS.
                </span>
              </div>
            </div>

            {/* Wallet Balance & Withdrawals Section */}
            <div
              style={{
                borderRadius: 22,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                padding: '18px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="wallet" size={18} color="#785a15" />
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  Wallet Balance &amp; Withdrawals
                </h4>
              </div>

              <p style={{ fontSize: 12.5, color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                Milquu runs on a convenient prepaid wallet system. When you add funds, they are safely stored in your account:
              </p>

              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: '#475569', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>
                  <strong style={{ color: '#1e293b' }}>Withdrawable Balance:</strong> You can withdraw any unreserved funds directly back to your UPI ID or Bank Account at any time.
                </li>
                <li>
                  <strong style={{ color: '#1e293b' }}>No Minimum Amount:</strong> There is no minimum penalty or balance threshold for withdrawals.
                </li>
                <li>
                  <strong style={{ color: '#1e293b' }}>Instant UPI / IMPS:</strong> Approved refunds reflect in your bank account or UPI within 1–3 business days.
                </li>
              </ul>

              <button
                type="button"
                className="mq-btn-gold"
                style={{
                  marginTop: 6,
                  padding: '11px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onClick={() => navigate('/app/wallet')}
              >
                <span>Go to Wallet &amp; View Balance</span>
                <span>→</span>
              </button>
            </div>

            {/* Cancellation & Replacements */}
            <div
              style={{
                borderRadius: 22,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                padding: '18px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="leaf" size={18} color="#16a34a" />
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  Cancellation &amp; Quality Guarantee
                </h4>
              </div>

              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: '#475569', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>
                  <strong style={{ color: '#1e293b' }}>Free Cancellation before 10:00 PM:</strong> Pause or cancel your scheduled morning delivery before 10:00 PM tonight with 0 penalty or charge.
                </li>
                <li>
                  <strong style={{ color: '#1e293b' }}>Damaged / Sour Bottle Guarantee:</strong> Because milk is a fresh perishable product, delivered bottles cannot be physically returned. However, if any bottle arrives broken, leaked, or curdled, simply send a photo on WhatsApp. We will immediately issue a full wallet credit or send a replacement.
                </li>
              </ul>

              <button
                type="button"
                className="mq-btn-outline-gold"
                style={{
                  marginTop: 6,
                  padding: '10px 16px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onClick={() => {
                  trackContact('whatsapp', 'refund_policy_inquiry');
                  window.open(
                    buildWhatsAppUrl('Hi MilQuuFresh, I have a query about a refund / bottle replacement for my account.'),
                    '_blank',
                    'noopener,noreferrer'
                  );
                }}
              >
                <Icon name="whatsapp" size={16} color="#785a15" />
                <span>Request Refund / Replacement on WhatsApp</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ height: 20 }} />
      <TabBar />
    </Screen>
  );
}
