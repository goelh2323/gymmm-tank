import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Truck, Dumbbell, Award, Landmark, Mail, Phone, ExternalLink } from 'lucide-react';

interface FooterModalsProps {
  activeModal: string | null;
  onClose: () => void;
}

export const FooterModals: React.FC<FooterModalsProps> = ({ activeModal, onClose }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyState, setVerifyState] = useState<'idle' | 'scanning' | 'success' | 'fail'>('idle');
  const [scanProgress, setScanProgress] = useState(0);

  const [orderId, setOrderId] = useState('');
  const [trackingState, setTrackingState] = useState<'idle' | 'tracking' | 'result'>('idle');

  const [dealerForm, setDealerForm] = useState({ name: '', gym: '', city: '', phone: '' });
  const [dealerState, setDealerState] = useState<'idle' | 'loading' | 'success'>('idle');

  // Reset states on modal change
  useEffect(() => {
    setVerificationCode('');
    setVerifyState('idle');
    setScanProgress(0);
    setOrderId('');
    setTrackingState('idle');
    setDealerForm({ name: '', gym: '', city: '', phone: '' });
    setDealerState('idle');
  }, [activeModal]);

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
          // 95% pass rate for simulator codes
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

  // Order tracking simulator
  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setTrackingState('tracking');
    setTimeout(() => {
      setTrackingState('result');
    }, 1200);
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

  if (!activeModal) return null;

  return (
    <div className="fm-overlay" onClick={onClose}>
      <div className="fm-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="fm-header">
          <h3>
            {activeModal === 'about' && 'ABOUT GYMMM TANK 🏋️‍♂️'}
            {activeModal === 'verify' && 'PRODUCT AUTHENTICATION 🛡️'}
            {activeModal === 'track' && 'LIVE TRACKING 📦'}
            {activeModal === 'dealer' && 'BECOME A DISTRIBUTOR 🤝'}
            {activeModal === 'contact' && 'CONTACT TANK CREW 📞'}
            {activeModal === 'policy' && 'RETURN & EXCHANGE POLICY 🔄'}
            {activeModal === 'terms' && 'TERMS OF SERVICE 📜'}
            {activeModal === 'privacy' && 'PRIVACY POLICY 🔒'}
            {activeModal === 'disclaimer' && 'MEDICAL DISCLAIMER ⚠️'}
          </h3>
          <button className="fm-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="fm-body scrollbar-styled">
          {/* ================= ABOUT US ================= */}
          {activeModal === 'about' && (
            <div className="fm-about-content">
              <p className="fm-lead">
                GYMMM TANK was born in the iron pits, engineered for those who demand maximum performance and refuse to settle for under-dosed sports nutrition.
              </p>
              <p>
                Our vision is raw and simple: **No proprietary secrets. No fillers. Just clinical, high-performance fuel.** We formulate every single product with absolute ingredient transparency so you know exactly what is fueling your gains.
              </p>

              <div className="fm-pillars-grid">
                <div className="fm-pillar-card">
                  <Award className="fm-pillar-icon" />
                  <h4>100% Purity</h4>
                  <p>Every batch is third-party lab-tested to verify ingredient concentration and guarantee zero heavy metals or contamination.</p>
                </div>
                <div className="fm-pillar-card">
                  <Dumbbell className="fm-pillar-icon" />
                  <h4>Clinical Doses</h4>
                  <p>We do not use placeholders or sprinkles. All key ingredients like L-Citrulline, Beta-Alanine, and Creatine are loaded to clinical-strength levels.</p>
                </div>
                <div className="fm-pillar-card">
                  <ShieldCheck className="fm-pillar-icon" />
                  <h4>Panned & Formulated</h4>
                  <p>Formulations backed by scientific research, crafted specifically to elevate endurance, mental drive, and muscular pump.</p>
                </div>
              </div>

              <div className="fm-quote-block">
                <blockquote>
                  "We don't build supplements for the average. We engineer them for the dedicated builders who live in the gym."
                </blockquote>
                <cite>— GYMMM TANK Team</cite>
              </div>
            </div>
          )}

          {/* ================= VERIFY PRODUCT ================= */}
          {activeModal === 'verify' && (
            <div className="fm-verify-content">
              {verifyState === 'idle' && (
                <form onSubmit={handleVerify} className="fm-form">
                  <p className="fm-instruction">
                    Locate the 12-digit scratch authentication code printed on your GYMMM TANK tub neck label or lid scan code. Enter it below to check authenticity.
                  </p>
                  <div className="fm-input-group">
                    <input
                      type="text"
                      placeholder="e.g. GT-8821-3942-X"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                      className="fm-input text-center"
                      required
                    />
                  </div>
                  <button type="submit" className="fm-btn fm-btn-gold">
                    Verify Authenticity
                  </button>
                </form>
              )}

              {verifyState === 'scanning' && (
                <div className="fm-scanner-wrap">
                  <div className="fm-laser-box">
                    <div className="fm-laser-line"></div>
                    <Dumbbell size={64} className="fm-laser-icon" />
                  </div>
                  <h4 className="fm-pulse-text">SCANNING BATCH DATA...</h4>
                  <div className="fm-progress-bar-wrap">
                    <div className="fm-progress-bar-fill" style={{ width: `${scanProgress}%` }}></div>
                  </div>
                  <p className="text-center text-gold">{scanProgress}% SECURED CHECK</p>
                </div>
              )}

              {verifyState === 'success' && (
                <div className="fm-result-wrap fm-result-success animate-scale-up">
                  <div className="fm-badge-gold-wrap">
                    <ShieldCheck className="fm-success-badge-icon" size={80} />
                    <div className="fm-confetti-burst"></div>
                  </div>
                  <h3>100% GENUINE TANK FUEL</h3>
                  <p className="fm-cert-status">VERIFIED SECURE BATCH</p>
                  <div className="fm-cert-details">
                    <div className="fm-cert-row"><span>Status:</span> <strong className="text-green">CERTIFIED GENUINE</strong></div>
                    <div className="fm-cert-row"><span>Batch code:</span> <strong>GT-882A-SUPP</strong></div>
                    <div className="fm-cert-row"><span>Lab Tested:</span> <strong className="text-gold">100% PASS</strong></div>
                    <div className="fm-cert-row"><span>Origin:</span> <strong>Premium Imported Raw Material</strong></div>
                  </div>
                  <button onClick={() => setVerifyState('idle')} className="fm-btn fm-btn-outline">
                    Verify Another Product
                  </button>
                </div>
              )}

              {verifyState === 'fail' && (
                <div className="fm-result-wrap fm-result-fail animate-scale-up">
                  <div className="fm-badge-fail-wrap">
                    <X className="fm-fail-badge-icon" size={80} />
                  </div>
                  <h3>VERIFICATION FAILED</h3>
                  <p className="fm-cert-status-fail">UNAUTHORIZED OR INVALID BATCH CODE</p>
                  <p className="fm-fail-info">
                    The code entered does not match any batch code in our secure database. If you suspect this is a counterfeit product, please contact support immediately at support@gymmmtank.com.
                  </p>
                  <button onClick={() => setVerifyState('idle')} className="fm-btn fm-btn-gold">
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= TRACK ORDER ================= */}
          {activeModal === 'track' && (
            <div className="fm-track-content">
              {trackingState === 'idle' && (
                <form onSubmit={handleTrack} className="fm-form">
                  <p className="fm-instruction">
                    Enter your 8-character Order ID to get real-time tracking updates of your supplement package.
                  </p>
                  <div className="fm-input-group">
                    <input
                      type="text"
                      placeholder="e.g. 2C4B2ECC"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                      className="fm-input text-center"
                      required
                    />
                  </div>
                  <button type="submit" className="fm-btn fm-btn-gold">
                    Track Shipment
                  </button>
                </form>
              )}

              {trackingState === 'tracking' && (
                <div className="fm-loading-wrap">
                  <div className="fm-loading-spinner"></div>
                  <p className="text-gold">RETRIEVING ORDER STATUS FROM TANK DISPATCH...</p>
                </div>
              )}

              {trackingState === 'result' && (
                <div className="fm-tracking-result animate-scale-up">
                  <div className="fm-track-header">
                    <h4>ORDER #{orderId.slice(0, 8)}</h4>
                    <span className="fm-badge-status-shipped">SHIPPED & TRANSIT</span>
                  </div>

                  <div className="fm-timeline-wrap">
                    <div className="fm-timeline-step completed">
                      <div className="fm-step-dot">✓</div>
                      <div className="fm-step-content">
                        <h5>Order Placed</h5>
                        <p>Payment authorized successfully</p>
                      </div>
                    </div>
                    <div className="fm-timeline-step completed">
                      <div className="fm-step-dot">✓</div>
                      <div className="fm-step-content">
                        <h5>Prepped & Packed</h5>
                        <p>Formulations secured & boxed with security seals</p>
                      </div>
                    </div>
                    <div className="fm-timeline-step active">
                      <div className="fm-step-dot pulsing">
                        <Truck size={14} className="fm-truck-icon-pulse" />
                      </div>
                      <div className="fm-step-content">
                        <h5>Dispatched & Shipped</h5>
                        <p>In transit via premium express partner. Expected delivery: 2-3 days.</p>
                      </div>
                    </div>
                    <div className="fm-timeline-step pending">
                      <div className="fm-step-dot">•</div>
                      <div className="fm-step-content">
                        <h5>Delivered</h5>
                        <p>Pending carrier completion</p>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => setTrackingState('idle')} className="fm-btn fm-btn-outline">
                    Track Another Order
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= BECOME A DEALER ================= */}
          {activeModal === 'dealer' && (
            <div className="fm-dealer-content">
              {dealerState === 'idle' && (
                <form onSubmit={handleDealerSubmit} className="fm-form">
                  <p className="fm-instruction text-gold-highlight">
                    💪 Partner with India\'s most authentic supplement brand. Expand your store margins with premium quality products.
                  </p>
                  
                  <div className="fm-form-grid">
                    <div className="fm-input-wrapper">
                      <label>Full Name</label>
                      <input
                        type="text"
                        required
                        value={dealerForm.name}
                        onChange={(e) => setDealerForm({ ...dealerForm, name: e.target.value })}
                        className="fm-input"
                      />
                    </div>
                    <div className="fm-input-wrapper">
                      <label>Gym / Store Name</label>
                      <input
                        type="text"
                        required
                        value={dealerForm.gym}
                        onChange={(e) => setDealerForm({ ...dealerForm, gym: e.target.value })}
                        className="fm-input"
                      />
                    </div>
                    <div className="fm-input-wrapper">
                      <label>City & State</label>
                      <input
                        type="text"
                        required
                        value={dealerForm.city}
                        onChange={(e) => setDealerForm({ ...dealerForm, city: e.target.value })}
                        className="fm-input"
                      />
                    </div>
                    <div className="fm-input-wrapper">
                      <label>Contact Phone (WhatsApp preferred)</label>
                      <input
                        type="tel"
                        required
                        value={dealerForm.phone}
                        onChange={(e) => setDealerForm({ ...dealerForm, phone: e.target.value })}
                        className="fm-input"
                      />
                    </div>
                  </div>

                  <button type="submit" className="fm-btn fm-btn-gold mt-4">
                    Submit Dealership Query
                  </button>
                </form>
              )}

              {dealerState === 'loading' && (
                <div className="fm-loading-wrap">
                  <div className="fm-loading-spinner"></div>
                  <p className="text-gold">REGISTERING DEALER QUERY IN TANK DIRECTORY...</p>
                </div>
              )}

              {dealerState === 'success' && (
                <div className="fm-result-wrap text-center animate-scale-up">
                  <Award size={64} className="text-gold mb-3" />
                  <h3>DEALER ENQUIRY LOCKED IN!</h3>
                  <p className="fm-success-text">
                    Hey {dealerForm.name}, your enquiry for **{dealerForm.gym}** has been received. Our dealership onboarding team will reach out directly on WhatsApp at **{dealerForm.phone}** within 24 hours.
                  </p>
                  <p className="text-muted text-sm">Let\'s dominate the market together. 💪</p>
                  <button onClick={onClose} className="fm-btn fm-btn-gold">
                    Close Window
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= CONTACT US ================= */}
          {activeModal === 'contact' && (
            <div className="fm-contact-content">
              <p className="fm-instruction">
                Have questions regarding stacks, active formulas, shipping logs, or reseller support? Connect directly with our team.
              </p>

              <div className="fm-contact-grid">
                <a href="https://wa.me/919350931316" target="_blank" rel="noopener noreferrer" className="fm-contact-card">
                  <div className="fm-cc-icon green-glow"><Phone size={24} /></div>
                  <h4>WhatsApp Chat Support</h4>
                  <p>+91 9350931316</p>
                  <span className="fm-cc-action">Click to Chat <ExternalLink size={12} /></span>
                </a>
                <a href="mailto:support@gymmmtank.com" className="fm-contact-card">
                  <div className="fm-cc-icon gold-glow"><Mail size={24} /></div>
                  <h4>Email Assistance</h4>
                  <p>support@gymmmtank.com</p>
                  <span className="fm-cc-action">Send Email <ExternalLink size={12} /></span>
                </a>
              </div>

              <div className="fm-office-card">
                <Landmark className="text-gold mr-3" size={24} style={{ flexShrink: 0 }} />
                <div>
                  <h5>GYMMM TANK Headquarters</h5>
                  <p className="text-sm text-secondary">#5052 Kasera Street, Ambala Cantt, Haryana, India - 133001</p>
                </div>
              </div>
            </div>
          )}

          {/* ================= POLICY ================= */}
          {activeModal === 'policy' && (
            <div className="fm-text-panel scrollable-y">
              <h4>🛡️ Return, Exchange & Guarantee Policy</h4>
              <p>At GYMMM TANK, our formulations are built with uncompromising quality. If your product is compromised, we stand by you.</p>
              
              <h5>1. Damaged or Tampered Shipments</h5>
              <p>If your seal is broken upon arrival, **do not consume**. Take clear photos and contact us at support@gymmmtank.com or WhatsApp within 48 hours. We will ship a replacement tub instantly with zero questions asked.</p>

              <h5>2. Unopened Returns</h5>
              <p>We accept unopened products back within 14 days of delivery. The security seal must be intact. Returns will be refunded in Tank Coins or to the original payment source after deduction of shipping logs.</p>

              <h5>3. Flavor / Performance Satisfaction</h5>
              <p>Due to the pure quality of active compounds (e.g., highly loaded beta-alanine causing normal tingling, or citrulline\'s natural sour flavor profiles), flavor profile returns are generally not accepted unless an actual formulation anomaly is confirmed by our QA lab.</p>
            </div>
          )}

          {/* ================= TERMS OF SERVICE ================= */}
          {activeModal === 'terms' && (
            <div className="fm-text-panel scrollable-y">
              <h4>📜 Terms of Service</h4>
              <p>Welcome to GYMMM TANK. By using this website, you agree to comply with our Terms of Service.</p>
              <h5>1. Authenticity Guard</h5>
              <p>All GYMMM TANK products feature secure batch verification codes. Attempting to copy, replicate, or counterfeit GYMMM TANK products or authentication codes will trigger immediate legal actions under commercial trademark laws.</p>
              <h5>2. Account Responsibility</h5>
              <p>Users are responsible for maintaining the privacy of their accounts, passwords, and Tank Coins wallet balances.</p>
              <h5>3. Formulation Changes</h5>
              <p>We constantly refine our products based on the latest clinical science. Product labels may change to match updated active levels without prior notice.</p>
            </div>
          )}

          {/* ================= PRIVACY POLICY ================= */}
          {activeModal === 'privacy' && (
            <div className="fm-text-panel scrollable-y">
              <h4>🔒 Privacy Policy</h4>
              <p>Your details are locked down under secure protocols. We never sell customer directories to third parties.</p>
              <h5>1. Data Collection</h5>
              <p>We collect essential order processing information: Name, Address, Phone (for order logs/WhatsApp updates), and Email.</p>
              <h5>2. Security</h5>
              <p>Our database uses end-to-end encrypted layers. Database access is restricted to verified administrators.</p>
              <h5>3. Communication</h5>
              <p>We trigger transactional WhatsApp and email alerts for checkout updates, status changes, and diagnostic triggers.</p>
            </div>
          )}

          {/* ================= DISCLAIMER ================= */}
          {activeModal === 'disclaimer' && (
            <div className="fm-text-panel scrollable-y">
              <h4>⚠️ Medical & Supplement Disclaimer</h4>
              <p>Please read this disclaimer carefully before training or taking any performance supplements.</p>
              <h5>1. Professional Consultation</h5>
              <p>Products sold on GYMMM TANK are high-potency formulations. Always consult a physician, sports nutritionist, or trainer before starting a supplement regimen, especially if you have pre-existing cardiovascular conditions.</p>
              <h5>2. Active Side Effects (Beta-Alanine Tingles)</h5>
              <p>High levels of beta-alanine trigger **paresthesia** (a completely harmless tingling sensation on the face and arms). This is a normal sign of activation and is not an allergic reaction.</p>
              <h5>3. Performance Goals</h5>
              <p>Supplements are tools designed to support rigorous training and nutrition. They do not replace a balanced athletic diet and consistent physical discipline.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
