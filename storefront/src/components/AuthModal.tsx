import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import type { Order } from '../context/StoreContext';
import { X, Mail, Lock, User, Coins, RefreshCw, ShoppingBag } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: 'store' | 'admin';
  setView: (view: 'store' | 'admin') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, currentView, setView }) => {
  const {
    customerUser,
    customerRegister,
    customerLogin,
    customerLogout,
    customerUpdateProfile,
    fetchCustomerOrders,
    token, // Admin token
  } = useStore();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Profile sub-tabs for logged-in view
  const [profileTab, setProfileTab] = useState<'profile' | 'orders'>('profile');
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  
  // Profile Update fields
  const [profName, setProfName] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profPassword, setProfPassword] = useState('');
  const [profConfirmPassword, setProfConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize profile fields when customer logs in
  useEffect(() => {
    if (customerUser) {
      setProfName(customerUser.name);
      setProfEmail(customerUser.email);
      setProfPassword('');
      setProfConfirmPassword('');
    }
  }, [customerUser, isOpen]);

  // Load customer orders history
  const loadCustomerOrders = async () => {
    if (!customerUser) return;
    setOrdersLoading(true);
    const data = await fetchCustomerOrders();
    setCustomerOrders(data);
    setOrdersLoading(false);
  };

  useEffect(() => {
    if (customerUser && isOpen) {
      loadCustomerOrders();
    }
  }, [customerUser, isOpen, profileTab]);

  // Reset alerts when opening/closing or tab switching
  useEffect(() => {
    setSuccessMsg(null);
    setErrorMsg(null);
  }, [activeTab, profileTab, isOpen]);

  // Lock body scroll when overlay modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginEmail || !loginPassword) {
      setErrorMsg('All fields are required');
      setLoading(false);
      return;
    }

    const success = await customerLogin(loginEmail, loginPassword);
    setLoading(false);
    if (success) {
      setSuccessMsg('Logged in successfully!');
      setLoginEmail('');
      setLoginPassword('');
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setErrorMsg('Invalid email or password');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
      setErrorMsg('All fields are required');
      setLoading(false);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match');
      setLoading(false);
      return;
    }

    const success = await customerRegister(regName, regEmail, regPassword);
    setLoading(false);
    if (success) {
      setSuccessMsg('Account created successfully!');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setErrorMsg('Registration failed. Email might already exist.');
    }
  };

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!profName || !profEmail) {
      setErrorMsg('Name and Email are required');
      setLoading(false);
      return;
    }

    if (profPassword && profPassword !== profConfirmPassword) {
      setErrorMsg('New passwords do not match');
      setLoading(false);
      return;
    }

    const success = await customerUpdateProfile(
      profName,
      profEmail,
      profPassword || undefined
    );
    setLoading(false);
    if (success) {
      setSuccessMsg('Profile updated successfully!');
      setProfPassword('');
      setProfConfirmPassword('');
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    } else {
      setErrorMsg('Update failed. Email might be in use.');
    }
  };

  const handleLogoutClick = () => {
    customerLogout();
    setProfileTab('profile');
    onClose();
  };

  const formatPrice = (num: number) => {
    return '₹' + Math.round(num).toLocaleString('en-IN');
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content auth-modal-v2-styled" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {customerUser ? (
          /* Profile Details and Update Form */
          <div className="auth-profile-view">
            
            {/* Coins Balance Card */}
            <div className="loyalty-coins-balance-card animate-float">
              <Coins size={22} className="text-gold" />
              <div className="coins-card-text">
                <span className="balance-label">LOYALTY COINS BALANCE</span>
                <span className="balance-value text-gold">{customerUser.coins} COINS</span>
              </div>
            </div>

            {/* Profile Subtabs */}
            <div className="admin-tabs-row profile-tabs-row">
              <button 
                className={`admin-tab-btn ${profileTab === 'profile' ? 'active' : ''}`}
                onClick={() => setProfileTab('profile')}
              >
                👤 Profile Settings
              </button>
              <button 
                className={`admin-tab-btn ${profileTab === 'orders' ? 'active' : ''}`}
                onClick={() => setProfileTab('orders')}
              >
                📦 Order History ({customerOrders.length})
              </button>
            </div>

            {successMsg && <div className="auth-alert alert-success">{successMsg}</div>}
            {errorMsg && <div className="auth-alert alert-error">{errorMsg}</div>}

            {profileTab === 'profile' ? (
              <form onSubmit={handleUpdateProfileSubmit} className="auth-form animate-fade-in">
                <div className="auth-input-group">
                  <label>FULL NAME</label>
                  <div className="auth-input-wrapper">
                    <User size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>EMAIL ADDRESS</label>
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="auth-input-icon" />
                    <input
                      type="email"
                      value={profEmail}
                      onChange={(e) => setProfEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>NEW PASSWORD (LEAVE BLANK TO KEEP CURRENT)</label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      type="password"
                      value={profPassword}
                      onChange={(e) => setProfPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                </div>

                {profPassword && (
                  <div className="auth-input-group">
                    <label>CONFIRM NEW PASSWORD</label>
                    <div className="auth-input-wrapper">
                      <Lock size={16} className="auth-input-icon" />
                      <input
                        type="password"
                        value={profConfirmPassword}
                        onChange={(e) => setProfConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                  </div>
                )}

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
                </button>
              </form>
            ) : (
              // Orders History Tab list
              <div className="customer-orders-history-list animate-fade-in">
                {ordersLoading ? (
                  <div className="orders-loading-wrap">
                    <RefreshCw size={24} style={{ animation: 'spin 2s linear infinite' }} />
                    <span>Loading Orders...</span>
                  </div>
                ) : customerOrders.length === 0 ? (
                  <div className="no-orders-wrap">
                    <ShoppingBag size={40} className="text-muted" />
                    <h4>No Orders Yet</h4>
                    <p>When you place an order, it will appear here.</p>
                  </div>
                ) : (
                  <div className="orders-scroll-container">
                    {customerOrders.map((order) => (
                      <div className="customer-order-card" key={order.id}>
                        <div className="order-card-header">
                          <span className="order-id">#{order.id.substring(0, 8).toUpperCase()}</span>
                          <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="order-card-items-wrap">
                          {order.items.map((item, idx) => (
                            <div className="order-card-item-row" key={idx}>
                              <span>• {item.productName} <strong className="text-gold">(x{item.quantity})</strong></span>
                              <span className="item-meta">{item.flavor} | {item.size}</span>
                            </div>
                          ))}
                        </div>

                        <div className="order-card-footer">
                          <div className="order-status-row">
                            <span className="status-label">
                              🚚 Shipment: <strong style={{ color: order.fulfillment === 'DELIVERED' ? '#10b981' : 'var(--gold-primary)' }}>
                                {order.fulfillment}
                              </strong>
                            </span>
                            <span className="status-label">
                              💰 Payment: <strong style={{ color: order.paymentStatus === 'PAID' ? '#10b981' : 'var(--gold-primary)' }}>
                                {order.paymentStatus}
                              </strong>
                            </span>
                          </div>
                          <div className="order-card-total">
                            <span>Total Charged:</span>
                            <span className="total-num text-gold">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="profile-actions-divider"></div>

            <div className="profile-footer-actions">
              {(customerUser.role === 'ADMIN' || token) && (
                currentView === 'store' ? (
                  <button 
                    className="admin-dashboard-shortcut-btn"
                    onClick={() => {
                      setView('admin');
                      onClose();
                    }}
                  >
                    ACCESS ADMIN DASHBOARD
                  </button>
                ) : (
                  <button 
                    className="admin-dashboard-shortcut-btn"
                    onClick={() => {
                      setView('store');
                      onClose();
                    }}
                  >
                    RETURN TO STOREFRONT
                  </button>
                )
              )}

              <button className="auth-logout-btn" onClick={handleLogoutClick}>
                LOG OUT
              </button>
            </div>
          </div>
        ) : (
          /* Login and Register Tabs */
          <div className="auth-tabs-view">
            <div className="auth-tabs-header">
              <button 
                className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                LOGIN
              </button>
              <button 
                className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => setActiveTab('register')}
              >
                REGISTER
              </button>
            </div>

            {successMsg && <div className="auth-alert alert-success">{successMsg}</div>}
            {errorMsg && <div className="auth-alert alert-error">{errorMsg}</div>}

            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="auth-form">
                <div className="auth-input-group">
                  <label>EMAIL ADDRESS</label>
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="auth-input-icon" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>PASSWORD</label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'LOGGING IN...' : 'LOGIN'}
                </button>

                <div className="admin-portal-link-wrap">
                  <span className="info-text">Are you an administrator?</span>
                  <button
                    type="button"
                    className="admin-link-btn"
                    onClick={() => {
                      setView('admin');
                      onClose();
                    }}
                  >
                    Admin Login
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="auth-form">
                <div className="auth-input-group">
                  <label>FULL NAME</label>
                  <div className="auth-input-wrapper">
                    <User size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>EMAIL ADDRESS</label>
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="auth-input-icon" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>PASSWORD</label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>CONFIRM PASSWORD</label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'REGISTERING...' : 'REGISTER'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
