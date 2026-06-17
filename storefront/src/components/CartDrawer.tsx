import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Truck,
  CreditCard,
  Gift,
  Coins,
  ChevronRight,
  ChevronLeft,
  Dumbbell
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cartItems,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeFromCart,
    totalPrice,
    totalRegularPrice,
    totalSavings,
    clearCart,
  } = useCart();

  const { customerUser, placeOrder, verifyCashfreePayment, setCompletedOrder } = useStore();
  const [simulatedPaymentOrder, setSimulatedPaymentOrder] = useState<any | null>(null);

  const formatPrice = (num: number) => {
    return '₹' + Math.round(num).toLocaleString('en-IN');
  };

  // Checkout Steps State: 1 = Review, 2 = Shipping, 3 = Payment
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Promo Code States
  const [promoInput, setPromoInput] = useState('');
  const [activePromo, setActivePromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  // Coins Redemption State
  const [redeemCoins, setRedeemCoins] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Shipping Address Fields
  const [shipName, setShipName] = useState('');
  const [shipEmail, setShipEmail] = useState('');
  const [shipPhone, setShipPhone] = useState('');
  const [shipAddress, setShipAddress] = useState('');
  const [shipCity, setShipCity] = useState('');
  const [shipState, setShipState] = useState('');
  const [shipPincode, setShipPincode] = useState('');

  // Payment Selection Fields
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');

  // Lock body scroll when drawer is open
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

  // Reset steps & inputs when drawer transitions to open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);


  // Prefill shipping details if customer is logged in
  useEffect(() => {
    if (customerUser) {
      setShipName(customerUser.name || '');
      setShipEmail(customerUser.email || '');
    }
  }, [customerUser]);

  // Load Cashfree SDK dynamically
  useEffect(() => {
    const existingScript = document.getElementById('cashfree-sdk-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'cashfree-sdk-script';
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!isOpen) return null;

  // Pricing calculations
  const subtotal = totalPrice;
  const freeShakerEligible = subtotal >= 3000;
  const amountToFreeShaker = Math.max(0, 3000 - subtotal);
  const freeShakerPercent = Math.min((subtotal / 3000) * 100, 100);

  // Promo discounts
  let promoDiscount = 0;
  if (activePromo === 'UNLOCK200') {
    promoDiscount = 200;
  } else if (activePromo === 'TANK15') {
    promoDiscount = subtotal * 0.15;
  }

  // Coins discounts
  const coinsBalance = customerUser?.coins || 0;
  const totalAfterPromo = Math.max(0, subtotal - promoDiscount);
  const coinsRedeemed = redeemCoins ? Math.min(coinsBalance, totalAfterPromo) : 0;
  const finalTotal = Math.max(0, totalAfterPromo - coinsRedeemed);
  const coinsEarned = Math.round(finalTotal * 0.1);

  // Apply promo validation
  const handleApplyPromo = () => {
    setPromoError(null);
    setPromoSuccess(null);
    const code = promoInput.toUpperCase().trim();
    if (!code) return;

    if (code === 'UNLOCK200') {
      if (subtotal < 1000) {
        setPromoError('UNLOCK200 requires a minimum purchase of ₹1,000.');
      } else {
        setActivePromo('UNLOCK200');
        setPromoSuccess('Promo Code UNLOCK200 Applied! Saved ₹200.');
      }
    } else if (code === 'TANK15') {
      setActivePromo('TANK15');
      setPromoSuccess('Promo Code TANK15 Applied! 15% discount applied.');
    } else {
      setPromoError('Invalid coupon code. Try UNLOCK200 or TANK15.');
    }
    setPromoInput('');
  };

  const handleRemovePromo = () => {
    setActivePromo(null);
    setPromoSuccess(null);
    setPromoError(null);
  };

  // Advance checkout steps
  const goToShipping = () => {
    if (cartItems.length === 0) return;
    setStep(2);
  };

  const goToPayment = () => {
    if (!shipName.trim() || !shipEmail.trim() || !shipPhone.trim() || !shipAddress.trim() || !shipCity.trim() || !shipState.trim() || !shipPincode.trim()) {
      return alert('Please fill in all shipping details to continue.');
    }
    if (shipPhone.trim().length < 10) {
      return alert('Please enter a valid 10-digit phone number.');
    }
    if (shipPincode.trim().length < 6) {
      return alert('Please enter a valid 6-digit pincode.');
    }
    setStep(3);
  };

  const handlePlaceOrderSubmit = async () => {
    if (placingOrder) return;

    const itemsPayload = cartItems.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      flavor: item.selectedFlavor,
      size: item.selectedSize,
      quantity: item.quantity,
      price: item.product.salePrice ?? item.product.price
    }));

    // Add free shaker bottle item if eligible
    if (freeShakerEligible) {
      itemsPayload.push({
        productId: 'free-shaker-bottle',
        productName: 'POWER TANK SHAKER BOTTLE',
        flavor: 'Classic Smoke',
        size: '700ml',
        quantity: 1,
        price: 0
      });
    }

    const orderPayload = {
      customerName: shipName.trim(),
      customerEmail: shipEmail.trim(),
      customerPhone: shipPhone.trim(),
      address: shipAddress.trim(),
      city: shipCity.trim(),
      state: shipState.trim(),
      pincode: shipPincode.trim(),
      paymentMethod,
      paymentStatus: 'PENDING',
      returnUrl: `${window.location.origin}/track?orderId={order_id}`,
      subtotal: totalRegularPrice,
      savings: Math.round(totalSavings + promoDiscount + coinsRedeemed),
      total: Math.round(finalTotal),
      promoCode: activePromo,
      coinsRedeemed: Math.round(coinsRedeemed),
      coinsEarned: Math.round(coinsEarned),
      items: itemsPayload
    };

    setPlacingOrder(true);
    try {
      const orderResult = await placeOrder(orderPayload);
      if (orderResult) {
        if (paymentMethod === 'COD') {
          setCompletedOrder(orderResult.order);
          clearCart();
          handleCloseCheckout();
        } else if (orderResult.isSimulation) {
          setSimulatedPaymentOrder(orderResult);
        } else {
          const CashfreeSDK = (window as any).Cashfree;
          if (!CashfreeSDK) {
            throw new Error('Cashfree SDK failed to load. Please check your internet connection.');
          }
          const cashfree = CashfreeSDK({ mode: import.meta.env.VITE_CASHFREE_ENV || 'sandbox' });
          await cashfree.checkout({
            paymentSessionId: orderResult.paymentSessionId,
            redirectTarget: '_modal'
          });
        }
      }
    } catch (err: any) {
      console.error('Error placing order:', err);
      alert(err.message || 'Checkout failed');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleCloseCheckout = () => {
    setIsOpen(false);
    setStep(1);
    setActivePromo(null);
    setPromoSuccess(null);
    setRedeemCoins(false);
  };

  return (
    <>
      {/* Checkout Drawer Overlay */}
      {isOpen && (
        <div className="cart-drawer-overlay" onClick={handleCloseCheckout}>
          <div className="cart-drawer checkout-drawer-v2" onClick={(e) => e.stopPropagation()}>
            
            {/* Drawer Header */}
            <div className="cart-header">
              <h2>
                <ShoppingBag size={20} className="text-gold" />
                {step === 1 && 'YOUR TANK BAG'}
                {step === 2 && 'SHIPPING ADDRESS'}
                {step === 3 && 'SECURE CHECKOUT'}
              </h2>
              <button className="cart-close-btn" onClick={handleCloseCheckout}>
                <X size={20} />
              </button>
            </div>

            {/* Step indicators */}
            <div className="checkout-progress-bar-container">
              <div className={`checkout-progress-step ${step >= 1 ? 'active' : ''}`}>
                <span className="step-num">1</span>
                <span className="step-label">Bag</span>
              </div>
              <div className="checkout-progress-line">
                <div className={`checkout-progress-line-fill ${step >= 2 ? 'filled' : ''}`}></div>
              </div>
              <div className={`checkout-progress-step ${step >= 2 ? 'active' : ''}`}>
                <span className="step-num">2</span>
                <span className="step-label">Shipping</span>
              </div>
              <div className="checkout-progress-line">
                <div className={`checkout-progress-line-fill ${step >= 3 ? 'filled' : ''}`}></div>
              </div>
              <div className={`checkout-progress-step ${step >= 3 ? 'active' : ''}`}>
                <span className="step-num">3</span>
                <span className="step-label">Payment</span>
              </div>
            </div>

            {/* STEP 1: CART REVIEW */}
            {step === 1 && (
              <div className="checkout-step-content review-step">
                {/* Free Shaker Gift Tracker */}
                <div className="freebie-tracker-banner">
                  <div className="freebie-header">
                    <span className="freebie-icon-title">
                      <Gift size={16} className="text-gold animate-pulse" />
                      {freeShakerEligible ? 'FREE SHAKER BOTTLE UNLOCKED!' : 'FREE GIFT PROGRESSION'}
                    </span>
                    <span className="freebie-target-label">
                      {freeShakerEligible ? 'Unlocked' : `Add ${formatPrice(amountToFreeShaker)} more`}
                    </span>
                  </div>
                  <div className="freebie-progress-track">
                    <div className="freebie-progress-fill" style={{ width: `${freeShakerPercent}%` }}></div>
                  </div>
                  <p className="freebie-instructions">
                    {freeShakerEligible 
                      ? 'Congratulations! A custom Power Tank Shaker Cup will be automatically packed with your shipment.' 
                      : `Unlock a premium Gym Shaker Bottle (Classic Smoke, 700ml) on orders above ₹3,000.`
                    }
                  </p>
                </div>

                {/* Cart Items List */}
                <div className="cart-items-container">
                  {cartItems.length === 0 ? (
                    <div className="cart-empty">
                      <ShoppingBag size={48} className="cart-empty-icon" />
                      <h3>Your Cart is Empty</h3>
                      <p>Load up on premium fuel to launch your training!</p>
                    </div>
                  ) : (
                    <>
                      {cartItems.map((item) => {
                        const activePrice = item.product.salePrice ?? item.product.price;
                        return (
                          <div className="cart-item" key={item.id}>
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="cart-item-image animate-float"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/pre_workout.png';
                              }}
                            />
                            <div className="cart-item-info">
                              <h4 className="cart-item-title">{item.product.name}</h4>
                              <div className="cart-item-option">
                                {item.selectedFlavor} / {item.selectedSize}
                              </div>
                              <div className="cart-item-actions">
                                <div className="qty-control">
                                  <button
                                    className="qty-btn"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  >
                                    <Minus size={10} />
                                  </button>
                                  <span className="qty-number">{item.quantity}</span>
                                  <button
                                    className="qty-btn"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  >
                                    <Plus size={10} />
                                  </button>
                                </div>
                                <span className="cart-item-price">
                                  {formatPrice(activePrice * item.quantity)}
                                </span>
                              </div>
                            </div>
                            <button
                              className="cart-item-delete"
                              onClick={() => removeFromCart(item.id)}
                              title="Remove Item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        );
                      })}

                      {/* Display Gift Shaker Bottle if unlocked */}
                      {freeShakerEligible && (
                        <div className="cart-item freebie-unlocked-card">
                          <div className="freebie-gift-badge">GIFT</div>
                          <img src="/images/logo.png" alt="Free Shaker Bottle" className="cart-item-image" />
                          <div className="cart-item-info">
                            <h4 className="cart-item-title text-gold">POWER TANK SHAKER</h4>
                            <div className="cart-item-option">Classic Smoke / 700ml</div>
                            <div className="cart-item-actions">
                              <span className="qty-number">Qty: 1</span>
                              <span className="cart-item-price free-txt" style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>FREE</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Promo Code Coupon Area */}
                {cartItems.length > 0 && (
                  <div className="promo-code-container">
                    <span className="promo-label">APPLY PROMO CODE</span>
                    {!promoSuccess ? (
                      <div className="promo-form-row">
                        <input
                          type="text"
                          placeholder="e.g. UNLOCK200 or TANK15"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          className="promo-input-field"
                        />
                        <button className="promo-apply-btn" onClick={handleApplyPromo}>APPLY</button>
                      </div>
                    ) : (
                      <div className="promo-applied-badge">
                        <span>{promoSuccess}</span>
                        <button className="promo-remove-btn" onClick={handleRemovePromo}>Remove</button>
                      </div>
                    )}
                    {promoError && <p className="promo-error-text">{promoError}</p>}
                  </div>
                )}

                {/* Loyalty coins redemption */}
                {cartItems.length > 0 && customerUser && (
                  <div className="loyalty-redeem-container">
                    <div className="loyalty-redeem-header">
                      <span className="loyalty-coins-label">
                        <Coins size={14} className="text-gold" />
                        Loyalty Coins Balance: <strong>{coinsBalance}</strong>
                      </span>
                      {coinsBalance > 0 && (
                        <label className="toggle-switch-container loyalty-checkbox-toggle">
                          <input 
                            type="checkbox"
                            checked={redeemCoins}
                            onChange={(e) => setRedeemCoins(e.target.checked)}
                          />
                          <span className="toggle-label-inline">Redeem Coins</span>
                        </label>
                      )}
                    </div>
                    {redeemCoins && coinsBalance > 0 && (
                      <p className="loyalty-redeem-savings-tag">
                        Applying coin savings: <strong>-₹{Math.min(coinsBalance, totalAfterPromo)}</strong> discount.
                      </p>
                    )}
                  </div>
                )}

                {/* Step Footer Summary */}
                {cartItems.length > 0 && (
                  <div className="cart-footer">
                    <div className="cart-summary-line">
                      <span>Subtotal:</span>
                      <span>{formatPrice(totalRegularPrice)}</span>
                    </div>
                    <div className="cart-summary-line">
                      <span>Item Discounts:</span>
                      <span>-{formatPrice(totalRegularPrice - subtotal)}</span>
                    </div>
                    {promoDiscount > 0 && (
                      <div className="cart-summary-line promo-discount-line">
                        <span>Promo Code Discount:</span>
                        <span>-{formatPrice(promoDiscount)}</span>
                      </div>
                    )}
                    {coinsRedeemed > 0 && (
                      <div className="cart-summary-line coins-discount-line">
                        <span>Coins Redeemed:</span>
                        <span>-{formatPrice(coinsRedeemed)}</span>
                      </div>
                    )}
                    <div className="cart-summary-line cart-summary-total">
                      <span>Grand Total:</span>
                      <span>{formatPrice(finalTotal)}</span>
                    </div>
                    {customerUser && (
                      <div className="loyalty-coins-earned-notice">
                        ⚡ Earn <strong>+{coinsEarned}</strong> Loyalty Coins on this order!
                      </div>
                    )}

                    <button className="checkout-btn" onClick={goToShipping}>
                      Proceed to Shipping Address
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: SHIPPING ADDRESS */}
            {step === 2 && (
              <div className="checkout-step-content shipping-step">
                <form className="checkout-shipping-form" onSubmit={(e) => { e.preventDefault(); goToPayment(); }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={shipName}
                      onChange={(e) => setShipName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. customer@powertanknutrition.com"
                      value={shipEmail}
                      onChange={(e) => setShipEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number (10 digits)</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9350931316"
                      value={shipPhone}
                      onChange={(e) => setShipPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Delivery Address</label>
                    <input
                      type="text"
                      placeholder="Street name, floor, flat/apartment number"
                      value={shipAddress}
                      onChange={(e) => setShipAddress(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        placeholder="e.g. Delhi"
                        value={shipCity}
                        onChange={(e) => setShipCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        placeholder="e.g. NCR"
                        value={shipState}
                        onChange={(e) => setShipState(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Pincode (6 digits)</label>
                    <input
                      type="text"
                      placeholder="e.g. 110001"
                      value={shipPincode}
                      onChange={(e) => setShipPincode(e.target.value)}
                      required
                    />
                  </div>
                </form>

                {/* Footer buttons */}
                <div className="checkout-step-nav-footer">
                  <button className="back-btn" onClick={() => setStep(1)}>
                    <ChevronLeft size={16} />
                    Back to Bag
                  </button>
                  <button className="checkout-btn" onClick={goToPayment}>
                    Proceed to Payment Options
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT METHOD */}
            {step === 3 && (
              <div className="checkout-step-content payment-step">
                
                {/* Method                 {/* Method Toggles */}
                <div className="payment-method-selector" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <button 
                    className={`payment-selector-btn ${paymentMethod === 'COD' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('COD')}
                  >
                    <Truck size={18} />
                    Cash On Delivery
                  </button>
                  <button 
                    className={`payment-selector-btn ${paymentMethod === 'ONLINE' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('ONLINE')}
                  >
                    <CreditCard size={18} />
                    Pay Online
                  </button>
                </div>

                {/* COD Panel */}
                {paymentMethod === 'COD' && (
                  <div className="payment-panel cod-panel animate-fade-in">
                    <div className="panel-icon-center">🚚</div>
                    <h3>Simulated Cash on Delivery</h3>
                    <p>Place your order now and pay when it arrives at your doorstep. Standard shipping applies.</p>
                    <div className="invoice-details" style={{ marginTop: '1rem' }}>
                      <div className="invoice-row">
                        <span className="text-muted">Total Payable on Delivery:</span>
                        <span className="text-gold font-bold">{formatPrice(finalTotal)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ONLINE Panel */}
                {paymentMethod === 'ONLINE' && (
                  <div className="payment-panel online-panel animate-fade-in" style={{
                    textAlign: 'center',
                    padding: '24px',
                    backgroundColor: '#121212',
                    border: '1px solid #221c0e',
                    borderRadius: '8px',
                    fontFamily: "'Montserrat', sans-serif"
                  }}>
                    <div className="panel-icon-center" style={{ fontSize: '36px', marginBottom: '12px' }}>💳</div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                      Cashfree Payments Secure Gateway
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#aaaaaa', lineHeight: 1.5, marginBottom: '20px' }}>
                      Pay securely using Credit/Debit Card, UPI (Google Pay, PhonePe, Paytm), Net Banking, or popular Mobile Wallets.
                    </p>
                    <div className="invoice-details" style={{ borderTop: '1px solid #221c0e', paddingTop: '15px' }}>
                      <div className="invoice-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                        <span className="text-muted" style={{ color: '#888888' }}>Total Payable Now:</span>
                        <span className="text-gold font-bold" style={{ color: '#d4af37', fontWeight: 700 }}>{formatPrice(finalTotal)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="checkout-step-nav-footer">
                  <button className="back-btn" onClick={() => setStep(2)}>
                    <ChevronLeft size={16} />
                    Back to Address
                  </button>
                  <button 
                    className="checkout-btn" 
                    onClick={handlePlaceOrderSubmit}
                    disabled={placingOrder}
                    style={{ opacity: placingOrder ? 0.6 : 1, cursor: placingOrder ? 'not-allowed' : 'pointer' }}
                  >
                    {placingOrder ? 'Placing Order...' : `Confirm & Place Order ${formatPrice(finalTotal)}`}
                    {!placingOrder && <ChevronRight size={16} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Simulated Cashfree Gateway Overlay */}
      {simulatedPaymentOrder && (
        <div className="simulated-pg-overlay animate-fade-in" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="simulated-pg-card" style={{
            backgroundColor: '#0c0c0c',
            border: '2px solid #d4af37',
            borderRadius: '12px',
            maxWidth: '450px',
            width: '100%',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(212, 175, 55, 0.15)',
            textAlign: 'center',
            fontFamily: "'Montserrat', sans-serif",
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '150px',
              height: '150px',
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
              zIndex: 0
            }}></div>
            
            <div style={{ zIndex: 1, position: 'relative' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🛡️</div>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                letterSpacing: '2px',
                color: '#d4af37',
                textTransform: 'uppercase',
                margin: '0 0 10px 0'
              }}>
                CASHFREE SECURE SIMULATOR
              </h3>
              <p style={{
                fontSize: '0.85rem',
                color: '#888888',
                marginBottom: '25px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Simulation Sandbox Mode
              </p>

              <div style={{
                backgroundColor: '#121212',
                border: '1px solid #221c0e',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '30px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                  <span style={{ color: '#aaaaaa' }}>Order Ref:</span>
                  <span style={{ fontWeight: 600 }}>#{simulatedPaymentOrder.order.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                  <span style={{ color: '#aaaaaa' }}>Customer Name:</span>
                  <span style={{ fontWeight: 600 }}>{simulatedPaymentOrder.order.customerName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #221c0e', paddingTop: '10px', fontSize: '1.05rem' }}>
                  <span style={{ color: '#d4af37', fontWeight: 700 }}>Total Payable:</span>
                  <span style={{ color: '#d4af37', fontWeight: 800 }}>₹{Math.round(simulatedPaymentOrder.order.total).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={async () => {
                    setPlacingOrder(true);
                    try {
                      const verification = await verifyCashfreePayment(simulatedPaymentOrder.order.id);
                      if (verification && verification.success && verification.order) {
                        setCompletedOrder(verification.order);
                        clearCart();
                        setSimulatedPaymentOrder(null);
                        setIsOpen(false);
                        setStep(1);
                      } else {
                        alert('Simulated payment verification failed.');
                      }
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setPlacingOrder(false);
                    }
                  }}
                  className="checkout-btn"
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.2)',
                    cursor: 'pointer'
                  }}
                >
                  <Dumbbell size={16} className="animate-spin-slow" />
                  Simulate Success (Pay Now)
                </button>

                <button
                  onClick={() => {
                    setSimulatedPaymentOrder(null);
                    alert('Simulated payment cancelled.');
                  }}
                  className="back-btn"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'transparent',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
