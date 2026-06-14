import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Truck, Dumbbell, Award, Landmark, Mail, Phone, ExternalLink, ArrowLeft, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface DedicatedPagesProps {
  path: string;
  navigate: (path: string) => void;
}

export const DedicatedPages: React.FC<DedicatedPagesProps> = ({ path, navigate }) => {
  const { trackOrder } = useStore();

  const [verificationCode, setVerificationCode] = useState('');
  const [verifyState, setVerifyState] = useState<'idle' | 'scanning' | 'success' | 'fail'>('idle');
  const [scanProgress, setScanProgress] = useState(0);

  const [orderId, setOrderId] = useState('');
  const [trackingState, setTrackingState] = useState<'idle' | 'tracking' | 'result' | 'invalid'>('idle');
  const [trackedOrder, setTrackedOrder] = useState<any | null>(null);

  const [dealerForm, setDealerForm] = useState({ name: '', gym: '', city: '', phone: '' });
  const [dealerState, setDealerState] = useState<'idle' | 'loading' | 'success'>('idle');

  // Reset states on path change
  useEffect(() => {
    setVerificationCode('');
    setVerifyState('idle');
    setScanProgress(0);
    setOrderId('');
    setTrackingState('idle');
    setTrackedOrder(null);
    setDealerForm({ name: '', gym: '', city: '', phone: '' });
    setDealerState('idle');
    window.scrollTo(0, 0);
  }, [path]);

  // Product verification scanner simulator
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) return;

    setVerifyState('scanning');
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (verificationCode.toLowerCase().includes('fake') || verificationCode.length < 4) {
            setVerifyState('fail');
          } else {
            setVerifyState('success');
          }
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // Actual order tracking check
  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setTrackingState('tracking');
    
    // Artificial 1-second delay for premium weightlifting-load feel
    setTimeout(async () => {
      const order = await trackOrder(orderId.trim());
      if (order) {
        setTrackedOrder(order);
        setTrackingState('result');
      } else {
        setTrackedOrder(null);
        setTrackingState('invalid');
      }
    }, 1000);
  };

  // Dealer inquiry form simulator
  const handleDealerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerForm.name || !dealerForm.phone) return;

    setDealerState('loading');
    setTimeout(() => {
      setDealerState('success');
    }, 1500);
  };

  const getPageTitle = () => {
    switch (path) {
      case '/about': return 'ABOUT GYMMM TANK';
      case '/verify': return 'PRODUCT AUTHENTICATION';
      case '/track': return 'LIVE SHIPMENT TRACKING';
      case '/dealer': return 'BECOME A DISTRIBUTOR';
      case '/contact': return 'GET IN TOUCH';
      case '/returns': return 'RETURN & EXCHANGE POLICY';
      case '/terms': return 'TERMS OF SERVICE';
      case '/privacy': return 'PRIVACY POLICY';
      case '/disclaimer': return 'MEDICAL DISCLAIMER';
      default: return 'PAGE';
    }
  };

  return (
    <div className="dp-container">
      {/* Breadcrumbs / Back Header */}
      <div className="dp-header-nav">
        <button onClick={() => navigate('/')} className="dp-back-btn">
          <ArrowLeft size={16} /> BACK TO STORE
        </button>
        <div className="dp-breadcrumbs">
          <span>HOME</span> / <span className="active">{getPageTitle()}</span>
        </div>
      </div>

      <div className="dp-main-card">
        <div className="dp-card-title-bar">
          <h2>
            {path === '/about' && 'ABOUT GYMMM TANK 🏋️‍♂️'}
            {path === '/verify' && 'VERIFY GENUINE TANK PRODUCT 🛡️'}
            {path === '/track' && 'TRACK YOUR TANK ORDER 📦'}
            {path === '/dealer' && 'BECOME A GYMMM TANK DISTRIBUTOR 🤝'}
            {path === '/contact' && 'CONTACT THE TANK CREW 📞'}
            {path === '/returns' && 'RETURN & EXCHANGE POLICY 🔄'}
            {path === '/terms' && 'TERMS OF SERVICE 📜'}
            {path === '/privacy' && 'PRIVACY POLICY 🔒'}
            {path === '/disclaimer' && 'MEDICAL & SUPPLEMENT DISCLAIMER ⚠️'}
          </h2>
        </div>

        <div className="dp-card-body">
          {/* ================= ABOUT US ================= */}
          {path === '/about' && (
            <div className="dp-about-view">
              <p className="dp-lead-text">
                GYMMM TANK was born in the raw iron pits, engineered specifically for athletes who refuse to settle for under-dosed sports nutrition.
              </p>
              <div className="dp-article-text">
                <p>
                  Our vision is uncompromisingly simple: **No proprietary secrets. No cheap fillers. Just raw, clinical strength fuel.** We believe every dedicated builder has the right to know exactly what goes into their body. That's why we practice 100% label transparency across all formulations.
                </p>
                <p>
                  Whether you are training for competitive bodybuilding, strength athletics, or pushing your limits in a home gym, our products deliver clinical-grade raw ingredients to elevate your training potential.
                </p>
              </div>

              <div className="dp-pillars-row">
                <div className="dp-pillar-card">
                  <Award className="dp-pillar-icon" />
                  <h4>100% Certified Purity</h4>
                  <p>Every single batch is third-party lab-tested to verify active compound concentration and guarantee zero heavy metals or contamination.</p>
                </div>
                <div className="dp-pillar-card">
                  <Dumbbell className="dp-pillar-icon" />
                  <h4>Clinical Formulation</h4>
                  <p>No placeholder doses. Our active compounds—like L-Citrulline, Beta-Alanine, and Creatine—are loaded to levels scientifically proven to work.</p>
                </div>
                <div className="dp-pillar-card">
                  <ShieldCheck className="dp-pillar-icon" />
                  <h4>Built For Athletes</h4>
                  <p>Engineered with input from professional strength builders and athletes to support maximum endurance and accelerated recovery.</p>
                </div>
              </div>

              <div className="dp-quote-banner">
                <p className="quote-text">
                  "We don't formulate supplements for the average lifter. We build them for the dedicated builders who live in the iron game."
                </p>
                <span className="quote-author">— GYMMM TANK Team</span>
              </div>
            </div>
          )}

          {/* ================= VERIFY PRODUCT ================= */}
          {path === '/verify' && (
            <div className="dp-verify-view">
              {verifyState === 'idle' && (
                <form onSubmit={handleVerify} className="dp-form-center">
                  <p className="dp-instruction-text">
                    Locate the 12-digit scratch authentication code printed on your GYMMM TANK tub neck seal or lid. Enter it below to check authenticity.
                  </p>
                  <div className="dp-input-field-wrap">
                    <input
                      type="text"
                      placeholder="e.g. GT-8821-3942-X"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                      className="dp-code-input"
                      required
                    />
                  </div>
                  <button type="submit" className="dp-btn-gold-large">
                    VERIFY PRODUCT SECURELY
                  </button>
                </form>
              )}

              {verifyState === 'scanning' && (
                <div className="dp-scanner-container">
                  <div className="dp-laser-box">
                    <div className="dp-laser-scanner-line"></div>
                    <Dumbbell size={80} className="dp-laser-icon-anim" />
                  </div>
                  <h3 className="dp-scanning-status-text">SCANNING BATCH DATA IN REALTIME...</h3>
                  <div className="dp-progress-wrap">
                    <div className="dp-progress-fill" style={{ width: `${scanProgress}%` }}></div>
                  </div>
                  <span className="dp-progress-percent">{scanProgress}% SECURED VALIDATION</span>
                </div>
              )}

              {verifyState === 'success' && (
                <div className="dp-result-view dp-result-success animate-scale-up">
                  <div className="dp-success-badge-container">
                    <ShieldCheck className="dp-success-icon-large" size={96} />
                    <div className="dp-success-glow-ring"></div>
                  </div>
                  <h3>100% GENUINE TANK PRODUCT</h3>
                  <span className="dp-success-subtitle">VERIFIED BATCH LOGS FOUND</span>
                  
                  <div className="dp-receipt-box">
                    <div className="dp-receipt-row"><span>Status:</span> <strong className="text-green">CERTIFIED ORIGINAL</strong></div>
                    <div className="fm-cert-row dp-receipt-row"><span>Batch Registration:</span> <strong>GT-882A-SUPP</strong></div>
                    <div className="fm-cert-row dp-receipt-row"><span>Quality Check:</span> <strong className="text-gold">100% PASS</strong></div>
                    <div className="fm-cert-row dp-receipt-row"><span>Active Purity:</span> <strong>Verified Clinical Grade</strong></div>
                    <div className="fm-cert-row dp-receipt-row"><span>Origin:</span> <strong>Imported Raw Material Logs</strong></div>
                  </div>

                  <button onClick={() => setVerifyState('idle')} className="dp-btn-outline-large">
                    VERIFY ANOTHER PRODUCT
                  </button>
                </div>
              )}

              {verifyState === 'fail' && (
                <div className="dp-result-view dp-result-fail animate-scale-up">
                  <div className="dp-fail-badge-container">
                    <X className="dp-fail-icon-large" size={96} />
                  </div>
                  <h3>AUTHENTICATION FAILED</h3>
                  <span className="dp-fail-subtitle">INVALID OR UNREGISTERED BATCH CODE</span>
                  
                  <p className="dp-fail-description">
                    The code entered does not match any registered batch code in our secure database. If you purchased this tub from an unauthorized dealer, it may be a counterfeit product. Please contact support immediately at support@gymmmtank.com.
                  </p>

                  <button onClick={() => setVerifyState('idle')} className="dp-btn-gold-large">
                    TRY ANOTHER CODE
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= TRACK ORDER ================= */}
          {path === '/track' && (
            <div className="dp-track-view">
              {trackingState === 'idle' && (
                <form onSubmit={handleTrack} className="dp-form-center">
                  <p className="dp-instruction-text">
                    Enter your 8-character Order ID to get real-time tracking updates of your supplement package.
                  </p>
                  <div className="dp-input-field-wrap">
                    <input
                      type="text"
                      placeholder="e.g. 2C4B2ECC"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                      className="dp-code-input"
                      required
                    />
                  </div>
                  <button type="submit" className="dp-btn-gold-large">
                    TRACK SHIPMENT
                  </button>
                </form>
              )}

              {trackingState === 'tracking' && (
                <div className="dp-loading-container">
                  <div className="dp-custom-spinner"></div>
                  <p className="dp-loading-text">RETRIEVING ORDER STATUS FROM TANK DISPATCH SERVICES...</p>
                </div>
              )}

              {trackingState === 'result' && trackedOrder && (
                <div className="dp-tracking-dashboard animate-scale-up">
                  <div className="dp-tracking-meta-bar">
                    <h4>ORDER #{trackedOrder.id.substring(0, 8).toUpperCase()}</h4>
                    <span className="dp-status-badge">
                      {trackedOrder.fulfillment === 'DELIVERED' ? 'DELIVERED' : trackedOrder.fulfillment === 'SHIPPED' ? 'SHIPPED & IN TRANSIT' : 'PREPPING FOR DISPATCH'}
                    </span>
                  </div>

                  <div className="dp-receipt-box" style={{ marginBottom: '2.5rem', textAlign: 'left' }}>
                    <div className="dp-receipt-row"><span>Customer:</span> <strong>{trackedOrder.customerName}</strong></div>
                    <div className="dp-receipt-row"><span>Destination:</span> <strong>{trackedOrder.city}, {trackedOrder.state} ({trackedOrder.pincode})</strong></div>
                    <div className="dp-receipt-row"><span>Total Amount:</span> <strong className="text-gold">₹{Math.round(trackedOrder.total).toLocaleString('en-IN')}</strong></div>
                    <div className="dp-receipt-row"><span>Payment:</span> <strong style={{ color: trackedOrder.paymentStatus === 'PAID' ? '#4caf50' : '#ffc107' }}>{trackedOrder.paymentMethod} ({trackedOrder.paymentStatus})</strong></div>
                  </div>

                  <div className="dp-tracking-timeline">
                    <div className="dp-timeline-node completed">
                      <div className="dp-node-dot">✓</div>
                      <div className="dp-node-info">
                        <h5>Order Placed</h5>
                        <p>Payment authorized and registered successfully.</p>
                      </div>
                    </div>
                    <div className={`dp-timeline-node ${trackedOrder.fulfillment !== 'PENDING' ? 'completed' : 'active'}`}>
                      <div className="dp-node-dot">
                        {trackedOrder.fulfillment !== 'PENDING' ? '✓' : '•'}
                      </div>
                      <div className="dp-node-info">
                        <h5>Prepped & Sealed</h5>
                        <p>Formulations packed with heavy-duty security seals.</p>
                      </div>
                    </div>
                    <div className={`dp-timeline-node ${trackedOrder.fulfillment === 'DELIVERED' ? 'completed' : trackedOrder.fulfillment === 'SHIPPED' ? 'active' : 'pending'}`}>
                      <div className={trackedOrder.fulfillment === 'SHIPPED' ? 'dp-node-dot active-pulse' : 'dp-node-dot'}>
                        {trackedOrder.fulfillment === 'DELIVERED' ? '✓' : trackedOrder.fulfillment === 'SHIPPED' ? <Truck size={14} /> : '•'}
                      </div>
                      <div className="dp-node-info">
                        <h5>Dispatched & Shipped</h5>
                        <p>In transit via premium air shipping logs. Expected delivery: 2-3 days.</p>
                      </div>
                    </div>
                    <div className={`dp-timeline-node ${trackedOrder.fulfillment === 'DELIVERED' ? 'active' : 'pending'}`}>
                      <div className={trackedOrder.fulfillment === 'DELIVERED' ? 'dp-node-dot active-pulse' : 'dp-node-dot'}>
                        {trackedOrder.fulfillment === 'DELIVERED' ? <Check size={14} /> : '•'}
                      </div>
                      <div className="dp-node-info">
                        <h5>Delivered</h5>
                        <p>Package safely delivered to your destination.</p>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => { setTrackingState('idle'); setTrackedOrder(null); }} className="dp-btn-outline-large">
                    TRACK ANOTHER ORDER
                  </button>
                </div>
              )}

              {trackingState === 'invalid' && (
                <div className="dp-invalid-container">
                  <div className="dp-falling-weight-wrap">
                    <div className="dp-dust-cloud"></div>
                    <Dumbbell className="dp-falling-weight" size={90} />
                  </div>
                  
                  <div className="dp-crushed-box">
                    <h3>CRUSHED! INVALID ORDER CODE</h3>
                    <p>
                      No active logs found for order ID <strong>"{orderId}"</strong> in our secure database. 
                      Please verify your receipt logs or check for typos.
                    </p>
                  </div>

                  <button onClick={() => setTrackingState('idle')} className="dp-btn-gold-large">
                    TRY ANOTHER ORDER NUMBER
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= BECOME A DEALER ================= */}
          {path === '/dealer' && (
            <div className="dp-dealer-view">
              {dealerState === 'idle' && (
                <form onSubmit={handleDealerSubmit} className="dp-form-dealer">
                  <p className="dp-dealer-lead-note">
                    🏋️ Partner with India's most authentic supplement brand. Expand your store margins with clinical-strength products backed by raw transparency.
                  </p>
                  
                  <div className="dp-dealer-grid">
                    <div className="dp-form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        required
                        value={dealerForm.name}
                        onChange={(e) => setDealerForm({ ...dealerForm, name: e.target.value })}
                        className="dp-form-input"
                      />
                    </div>
                    <div className="dp-form-group">
                      <label>Gym / Store Name</label>
                      <input
                        type="text"
                        required
                        value={dealerForm.gym}
                        onChange={(e) => setDealerForm({ ...dealerForm, gym: e.target.value })}
                        className="dp-form-input"
                      />
                    </div>
                    <div className="dp-form-group">
                      <label>City & State</label>
                      <input
                        type="text"
                        required
                        value={dealerForm.city}
                        onChange={(e) => setDealerForm({ ...dealerForm, city: e.target.value })}
                        className="dp-form-input"
                      />
                    </div>
                    <div className="dp-form-group">
                      <label>Contact Phone (WhatsApp preferred)</label>
                      <input
                        type="tel"
                        required
                        value={dealerForm.phone}
                        onChange={(e) => setDealerForm({ ...dealerForm, phone: e.target.value })}
                        className="dp-form-input"
                      />
                    </div>
                  </div>

                  <button type="submit" className="dp-btn-gold-large mt-6">
                    SUBMIT DISTRIBUTOR QUERY
                  </button>
                </form>
              )}

              {dealerState === 'loading' && (
                <div className="dp-loading-container">
                  <div className="dp-custom-spinner"></div>
                  <p className="dp-loading-text">REGISTERING IN TANK PARTNER DIRECTORY...</p>
                </div>
              )}

              {dealerState === 'success' && (
                <div className="dp-result-view dp-dealer-success animate-scale-up">
                  <Award size={80} className="text-gold mb-4" />
                  <h3>DEALERSHIP INQUIRY RECORDED</h3>
                  <p className="dp-dealer-success-p">
                    Hey {dealerForm.name}, your request for **{dealerForm.gym}** has been registered. Our dealership onboarding team will reach out directly on WhatsApp at **{dealerForm.phone}** within 24 hours.
                  </p>
                  <p className="text-muted text-sm mt-2">Let's dominate the fitness market together. 💪</p>
                  <button onClick={() => navigate('/')} className="dp-btn-gold-large mt-6">
                    BACK TO STOREFRONT
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= CONTACT US ================= */}
          {path === '/contact' && (
            <div className="dp-contact-view">
              <p className="dp-instruction-text">
                Have questions regarding supplement stack formulations, active logs, shipments, or bulk orders? Connect directly with our crew.
              </p>

              <div className="dp-contact-grid-row">
                <a href="https://wa.me/919350931316" target="_blank" rel="noopener noreferrer" className="dp-contact-item-card">
                  <div className="dp-contact-icon-box green-glow-pulse"><Phone size={32} /></div>
                  <h4>WhatsApp Chat Support</h4>
                  <p className="dp-contact-val">+91 9350931316</p>
                  <span className="dp-contact-badge-btn">Click to Chat <ExternalLink size={12} /></span>
                </a>
                <a href="mailto:support@gymmmtank.com" className="dp-contact-item-card">
                  <div className="dp-contact-icon-box gold-glow-pulse"><Mail size={32} /></div>
                  <h4>Email Assistance</h4>
                  <p className="dp-contact-val">support@gymmmtank.com</p>
                  <span className="dp-contact-badge-btn">Send Email <ExternalLink size={12} /></span>
                </a>
              </div>

              <div className="dp-hq-card">
                <Landmark className="text-gold mr-4" size={36} style={{ flexShrink: 0 }} />
                <div>
                  <h5>GYMMM TANK Headquarters</h5>
                  <p className="text-secondary">#5052 Kasera Street, Ambala Cantt, Haryana, India - 133001</p>
                </div>
              </div>
            </div>
          )}

          {/* ================= POLICIES & LEGAL ================= */}
          {['/returns', '/terms', '/privacy', '/disclaimer'].includes(path) && (
            <div className="dp-legal-view">
              {path === '/returns' && (
                <>
                  <h3>🔄 Return, Exchange & Guarantee Policy</h3>
                  <p>At GYMMM TANK, our formulations are built with uncompromising quality. If your product is compromised, we stand by you.</p>
                  
                  <h5>1. Damaged or Tampered Shipments</h5>
                  <p>If your tub security seal is broken upon arrival, **do not consume**. Take clear photos and contact us at support@gymmmtank.com or WhatsApp within 48 hours. We will ship a replacement tub instantly with zero questions asked.</p>

                  <h5>2. Unopened Returns</h5>
                  <p>We accept unopened products back within 14 days of delivery. The security seal must be intact. Returns will be refunded in Tank Coins or to the original payment source after deduction of shipping logs.</p>

                  <h5>3. Flavor / Performance Satisfaction</h5>
                  <p>Due to the pure quality of active compounds (e.g., highly loaded beta-alanine causing normal tingling, or citrulline's natural sour flavor profiles), flavor profile returns are generally not accepted unless an actual formulation anomaly is confirmed by our QA lab.</p>
                </>
              )}

              {path === '/terms' && (
                <>
                  <h3>📜 Terms of Service</h3>
                  <p>Welcome to GYMMM TANK. By using this website, you agree to comply with our Terms of Service.</p>
                  <h5>1. Authenticity Guard</h5>
                  <p>All GYMMM TANK products feature secure batch verification codes. Attempting to copy, replicate, or counterfeit GYMMM TANK products or authentication codes will trigger immediate legal actions under commercial trademark laws.</p>
                  <h5>2. Account Responsibility</h5>
                  <p>Users are responsible for maintaining the privacy of their accounts, passwords, and Tank Coins wallet balances.</p>
                  <h5>3. Formulation Changes</h5>
                  <p>We constantly refine our products based on the latest clinical science. Product labels may change to match updated active levels without prior notice.</p>
                </>
              )}

              {path === '/privacy' && (
                <>
                  <h3>🔒 Privacy Policy</h3>
                  <p>Your details are locked down under secure protocols. We never sell customer directories to third parties.</p>
                  <h5>1. Data Collection</h5>
                  <p>We collect essential order processing information: Name, Address, Phone (for order logs/WhatsApp updates), and Email.</p>
                  <h5>2. Security</h5>
                  <p>Our database uses end-to-end encrypted layers. Database access is restricted to verified administrators.</p>
                  <h5>3. Communication</h5>
                  <p>We trigger transactional WhatsApp and email alerts for checkout updates, status changes, and diagnostic triggers.</p>
                </>
              )}

              {path === '/disclaimer' && (
                <>
                  <h3>⚠️ Medical & Supplement Disclaimer</h3>
                  <p>Please read this disclaimer carefully before training or taking any performance supplements.</p>
                  <h5>1. Professional Consultation</h5>
                  <p>Products sold on GYMMM TANK are high-potency formulations. Always consult a physician, sports nutritionist, or trainer before starting a supplement regimen, especially if you have pre-existing cardiovascular conditions.</p>
                  <h5>2. Active Side Effects (Beta-Alanine Tingles)</h5>
                  <p>High levels of beta-alanine trigger **paresthesia** (a completely harmless tingling sensation on the face and arms). This is a normal sign of activation and is not an allergic reaction.</p>
                  <h5>3. Performance Goals</h5>
                  <p>Supplements are tools designed to support rigorous training and nutrition. They do not replace a balanced athletic diet and consistent physical discipline.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
