import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import type { Order } from '../context/StoreContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  CheckCircle,
  Truck,
  CreditCard,
  QrCode,
  Gift,
  Coins,
  ChevronRight,
  ChevronLeft
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

  const { customerUser, placeOrder } = useStore();

  const formatPrice = (num: number) => {
    return '₹' + Math.round(num).toLocaleString('en-IN');
  };

  // Checkout Steps State: 1 = Review, 2 = Shipping, 3 = Payment, 4 = Receipt
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

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
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'CARD'>('COD');

  // Interactive Card States
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardFocused, setCardFocused] = useState<'front' | 'back'>('front');

  // Timed UPI States
  const [upiTimer, setUpiTimer] = useState(180); // 3 minutes

  // Completed Order State
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Reset steps & inputs when drawer opens/closes, and lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (completedOrder) {
        setStep(4);
      } else {
        setStep(1);
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, completedOrder]);

  // Prefill shipping details if customer is logged in
  useEffect(() => {
    if (customerUser) {
      setShipName(customerUser.name || '');
      setShipEmail(customerUser.email || '');
    }
  }, [customerUser]);

  // UPI Countdown Timer
  useEffect(() => {
    let interval: any;
    if (step === 3 && paymentMethod === 'UPI' && upiTimer > 0) {
      interval = setInterval(() => {
        setUpiTimer(prev => prev - 1);
      }, 1000);
    } else if (upiTimer === 0) {
      alert('UPI scan window expired. Please try again or select another payment method.');
      setPaymentMethod('COD');
      setUpiTimer(180);
    }
    return () => clearInterval(interval);
  }, [step, paymentMethod, upiTimer]);

  if (!isOpen && step !== 4) return null;

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

    // If credit card selected, validate digits
    if (paymentMethod === 'CARD') {
      if (cardNumber.replace(/\s+/g, '').length < 16 || cardExpiry.length < 5 || cardCvv.length < 3) {
        return alert('Please enter valid credit card details.');
      }
    }

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
        productName: 'GYMMM TANK SHAKER BOTTLE',
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
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
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
        setCompletedOrder(orderResult);
        clearCart();
        setStep(4);
      }
    } catch (err) {
      console.error('Error placing order:', err);
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleCloseCheckout = () => {
    setIsOpen(false);
    setCompletedOrder(null);
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
                      ? 'Congratulations! A custom GYMMM TANK Shaker Cup will be automatically packed with your shipment.' 
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
                            <h4 className="cart-item-title text-gold">GYMMM TANK SHAKER</h4>
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
                      placeholder="e.g. customer@gymmmtank.com"
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
                
                {/* Method Toggles */}
                <div className="payment-method-selector">
                  <button 
                    className={`payment-selector-btn ${paymentMethod === 'COD' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('COD')}
                  >
                    <Truck size={18} />
                    Cash On Delivery
                  </button>
                  <button 
                    className={`payment-selector-btn ${paymentMethod === 'UPI' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('UPI')}
                  >
                    <QrCode size={18} />
                    Scan UPI QR
                  </button>
                  <button 
                    className={`payment-selector-btn ${paymentMethod === 'CARD' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('CARD')}
                  >
                    <CreditCard size={18} />
                    Credit/Debit Card
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

                {/* UPI QR Panel */}
                {paymentMethod === 'UPI' && (
                  <div className="payment-panel upi-panel animate-fade-in">
                    <h3>Scan QR Code to Pay</h3>
                    <p className="upi-desc">Scan using Google Pay, PhonePe, Paytm or any banking app to trigger a secure simulation.</p>
                    
                    {/* Simulated QR Code SVG */}
                    <div className="upi-qr-wrapper">
                      <svg className="upi-qr-graphic animate-float" viewBox="0 0 100 100" width="160" height="160">
                        <rect width="100" height="100" fill="#ffffff" />
                        {/* QR Code Anchor Squares */}
                        <rect x="5" y="5" width="20" height="20" fill="var(--bg-black)" />
                        <rect x="9" y="9" width="12" height="12" fill="#ffffff" />
                        <rect x="11" y="11" width="8" height="8" fill="var(--bg-black)" />

                        <rect x="75" y="5" width="20" height="20" fill="var(--bg-black)" />
                        <rect x="79" y="9" width="12" height="12" fill="#ffffff" />
                        <rect x="81" y="81" width="8" height="8" fill="var(--bg-black)" />

                        <rect x="5" y="75" width="20" height="20" fill="var(--bg-black)" />
                        <rect x="9" y="79" width="12" height="12" fill="#ffffff" />
                        <rect x="11" y="81" width="8" height="8" fill="var(--bg-black)" />
                        
                        <rect x="75" y="75" width="20" height="20" fill="var(--bg-black)" />
                        <rect x="79" y="79" width="12" height="12" fill="#ffffff" />

                        {/* Random barcode grids to represent code data */}
                        <rect x="30" y="10" width="5" height="15" fill="var(--bg-black)" />
                        <rect x="40" y="5" width="10" height="5" fill="var(--bg-black)" />
                        <rect x="35" y="25" width="15" height="5" fill="var(--bg-black)" />
                        <rect x="60" y="15" width="5" height="20" fill="var(--bg-black)" />
                        
                        <rect x="15" y="35" width="25" height="5" fill="var(--bg-black)" />
                        <rect x="10" y="45" width="15" height="10" fill="var(--bg-black)" />
                        <rect x="40" y="40" width="5" height="20" fill="var(--bg-black)" />
                        <rect x="55" y="35" width="15" height="5" fill="var(--bg-black)" />
                        
                        <rect x="60" y="45" width="25" height="5" fill="var(--bg-black)" />
                        <rect x="70" y="55" width="10" height="15" fill="var(--bg-black)" />
                        <rect x="30" y="70" width="15" height="10" fill="var(--bg-black)" />
                        <rect x="50" y="75" width="15" height="5" fill="var(--bg-black)" />
                        
                        {/* Gym logo in center of QR */}
                        <circle cx="50" cy="50" r="10" fill="var(--gold-primary)" />
                        <path d="M47 50h6M50 47v6" stroke="#000000" strokeWidth="2" />
                      </svg>
                      
                      <div className="upi-timer-badge">
                        ⌛ {Math.floor(upiTimer / 60)}:{(upiTimer % 60).toString().padStart(2, '0')}
                      </div>
                    </div>

                    <div className="invoice-details" style={{ marginTop: '0.8rem' }}>
                      <div className="invoice-row">
                        <span className="text-muted">Total Payment Amount:</span>
                        <span className="text-gold font-bold">{formatPrice(finalTotal)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Credit Card Panel */}
                {paymentMethod === 'CARD' && (
                  <div className="payment-panel card-panel animate-fade-in">
                    
                    {/* Interactive 3D Card Graphic */}
                    <div className="credit-card-container-wrap">
                      <div className={`interactive-credit-card ${cardFocused === 'back' ? 'flipped' : ''}`}>
                        
                        {/* Front Side */}
                        <div className="card-face card-front">
                          <div className="card-gold-glow"></div>
                          <div className="card-header-logo-row">
                            <span className="card-brand-label">GYMMM TANK SECURE</span>
                            <div className="card-chip"></div>
                          </div>
                          <div className="card-number-display">
                            {cardNumber || '•••• •••• •••• ••••'}
                          </div>
                          <div className="card-footer-details">
                            <div className="card-holder-wrap">
                              <span className="card-label-sub">CARDHOLDER</span>
                              <span className="card-value-display">{cardHolder.toUpperCase() || 'YOUR NAME'}</span>
                            </div>
                            <div className="card-expiry-wrap">
                              <span className="card-label-sub">EXPIRES</span>
                              <span className="card-value-display">{cardExpiry || 'MM/YY'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Back Side */}
                        <div className="card-face card-back">
                          <div className="card-black-strip"></div>
                          <div className="card-signature-strip">
                            <span className="card-label-sub card-back-cvv-label">CVV</span>
                            <span className="card-cvv-display">{cardCvv || '•••'}</span>
                          </div>
                          <p className="card-back-text">This credit card simulator is encrypted. Authorization is fully simulated.</p>
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="card-input-form">
                      <div className="form-group">
                        <label>Card Number</label>
                        <input
                          type="text"
                          placeholder="e.g. 4321 5678 9012 3456"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            const formatted = val.replace(/(.{4})/g, '$1 ').trim();
                            setCardNumber(formatted);
                          }}
                          onFocus={() => setCardFocused('front')}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="e.g. JOHN DOE"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          onFocus={() => setCardFocused('front')}
                          required
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length > 2) {
                                val = val.substring(0, 2) + '/' + val.substring(2, 4);
                              }
                              setCardExpiry(val);
                            }}
                            onFocus={() => setCardFocused('front')}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>CVV Code</label>
                          <input
                            type="password"
                            placeholder="•••"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            onFocus={() => setCardFocused('back')}
                            onBlur={() => setCardFocused('front')}
                            required
                          />
                        </div>
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

      {/* STEP 4: ORDER INVOICE MODAL */}
      {step === 4 && completedOrder && (
        <div className="modal-overlay" onClick={handleCloseCheckout}>
          <div className="modal-content invoice-container scroll-reveal visible animate-scale-up" onClick={(e) => e.stopPropagation()}>
            
            {/* Header Stamp */}
            <div className="invoice-success-icon-wrap">
              <CheckCircle size={52} className="invoice-success-icon text-gold animate-pulse" />
            </div>
            
            <h2 className="invoice-title">GYMMM TANK RECEIPTS</h2>
            <p className="invoice-subtitle">DECLARED ANABOLIC TRANSACTION LOG</p>

            <div className="invoice-divider"></div>

            {/* Order Details Grid */}
            <div className="invoice-details-grid">
              <div className="invoice-row">
                <span className="text-muted">ORDER ID:</span>
                <span className="font-bold text-gold">{completedOrder.id}</span>
              </div>
              <div className="invoice-row">
                <span className="text-muted">DATE & TIME:</span>
                <span>{new Date(completedOrder.createdAt).toLocaleString()}</span>
              </div>
              <div className="invoice-row">
                <span className="text-muted">PAYMENT METHOD:</span>
                <span className="font-bold">{completedOrder.paymentMethod} ({completedOrder.paymentStatus})</span>
              </div>
              <div className="invoice-row">
                <span className="text-muted">FULFILLMENT STATUS:</span>
                <span className="admin-table-badge badge-new" style={{ textTransform: 'uppercase' }}>
                  {completedOrder.fulfillment}
                </span>
              </div>
            </div>

            <div className="invoice-divider"></div>

            {/* Delivery address details */}
            <div className="invoice-address-block">
              <h4>DELIVERY DESTINATION</h4>
              <div className="address-lines">
                <div><strong>{completedOrder.customerName}</strong></div>
                <div>{completedOrder.address}</div>
                <div>{completedOrder.city}, {completedOrder.state} - {completedOrder.pincode}</div>
                <div>Phone: {completedOrder.customerPhone}</div>
              </div>
            </div>

            <div className="invoice-divider"></div>

            {/* Items Summary Table */}
            <div className="invoice-items">
              <h4>CONSOLIDATED ORDER ITEMS</h4>
              <div className="invoice-items-list-wrap">
                {completedOrder.items.map((item) => (
                  <div className="invoice-item-row" key={item.id}>
                    <div className="invoice-item-left">
                      <span className="invoice-item-name">{item.productName}</span>
                      <span className="invoice-item-qty">x{item.quantity}</span>
                      <div className="text-muted invoice-item-flavor">
                        {item.flavor} | {item.size}
                      </div>
                    </div>
                    <span className="invoice-item-price-col">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="invoice-divider"></div>

            {/* Invoice Totals */}
            <div className="invoice-details">
              <div className="invoice-row">
                <span className="text-muted">Subtotal:</span>
                <span>{formatPrice(completedOrder.subtotal)}</span>
              </div>
              {completedOrder.savings > 0 && (
                <div className="invoice-row text-gold" style={{ color: 'var(--gold-primary)' }}>
                  <span>Total Savings Applied:</span>
                  <span>-{formatPrice(completedOrder.savings)}</span>
                </div>
              )}
              {completedOrder.coinsRedeemed > 0 && (
                <div className="invoice-row text-gold">
                  <span>Coins Redeemed:</span>
                  <span>-{completedOrder.coinsRedeemed} coins</span>
                </div>
              )}
              <div className="invoice-total-row">
                <span>Total Amount Charged:</span>
                <span className="text-gold font-bold">{formatPrice(completedOrder.total)}</span>
              </div>
              
              {completedOrder.coinsEarned > 0 && (
                <div className="invoice-coins-earned-box">
                  🔥 <strong>+{completedOrder.coinsEarned}</strong> Loyalty Coins accrued to your profile.
                </div>
              )}
            </div>

            <div className="invoice-divider"></div>

            {/* Print Barcode Simulation */}
            <div className="invoice-barcode-wrapper">
              <svg className="barcode-svg" viewBox="0 0 100 20" width="100%" height="40">
                <rect width="100" height="20" fill="none" />
                {/* Simulated Barcode Lines */}
                <rect x="2" y="2" width="2" height="16" fill="#ffffff" />
                <rect x="5" y="2" width="1" height="16" fill="#ffffff" />
                <rect x="7" y="2" width="3" height="16" fill="#ffffff" />
                <rect x="11" y="2" width="1" height="16" fill="#ffffff" />
                <rect x="13" y="2" width="4" height="16" fill="#ffffff" />
                <rect x="18" y="2" width="2" height="16" fill="#ffffff" />
                <rect x="21" y="2" width="1" height="16" fill="#ffffff" />
                <rect x="23" y="2" width="3" height="16" fill="#ffffff" />
                <rect x="27" y="2" width="2" height="16" fill="#ffffff" />
                <rect x="30" y="2" width="1" height="16" fill="#ffffff" />
                <rect x="32" y="2" width="4" height="16" fill="#ffffff" />
                <rect x="37" y="2" width="1" height="16" fill="#ffffff" />
                <rect x="39" y="2" width="2" height="16" fill="#ffffff" />
                <rect x="42" y="2" width="3" height="16" fill="#ffffff" />
                <rect x="46" y="2" width="1" height="16" fill="#ffffff" />
                <rect x="48" y="2" width="2" height="16" fill="#ffffff" />
                <rect x="51" y="2" width="4" height="16" fill="#ffffff" />
                <rect x="56" y="2" width="2" height="16" fill="#ffffff" />
                <rect x="59" y="2" width="1" height="16" fill="#ffffff" />
                <rect x="61" y="2" width="3" height="16" fill="#ffffff" />
                <rect x="65" y="2" width="2" height="16" fill="#ffffff" />
                <rect x="68" y="2" width="1" height="16" fill="#ffffff" />
                <rect x="70" y="2" width="4" height="16" fill="#ffffff" />
                <rect x="75" y="2" width="1" height="16" fill="#ffffff" />
                <rect x="77" y="2" width="2" height="16" fill="#ffffff" />
                <rect x="80" y="2" width="3" height="16" fill="#ffffff" />
                <rect x="84" y="2" width="1" height="16" fill="#ffffff" />
                <rect x="86" y="2" width="4" height="16" fill="#ffffff" />
                <rect x="91" y="2" width="2" height="16" fill="#ffffff" />
                <rect x="94" y="2" width="1" height="16" fill="#ffffff" />
                <rect x="96" y="2" width="3" height="16" fill="#ffffff" />
              </svg>
              <span className="barcode-number">GT-{completedOrder.id.substring(0, 8).toUpperCase()}</span>
            </div>

            <button className="invoice-close-btn" onClick={handleCloseCheckout}>
              Close & Print Invoice
            </button>
          </div>
        </div>
      )}
    </>
  );
};
