import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import type { Product } from './context/StoreContext';
import { CartProvider, useCart } from './context/CartContext';
import { StoreHeader } from './components/StoreHeader';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { ProductDetailView } from './components/ProductDetailView';
import {
  Dumbbell,
  RotateCcw,
  ShieldCheck,
  Flame,
  Zap,
  Award,
  Layers,
  Check,
  TrendingUp,
  Volume2,
  VolumeX
} from 'lucide-react';

const TickerBanner: React.FC = () => {
  const { tankMode } = useStore();
  return (
    <div className={`announcement-ticker ${tankMode ? 'tank-mode-active' : ''}`}>
      <div className="ticker-wrap">
        <div className="ticker-item-list">
          <div className="ticker-item">{tankMode ? '🚨 WARNING: UNLEASHING TANK SPEED 🚨' : '⚡ LIFT HEAVY OR GO HOME 🏋️'}</div>
          <div className="ticker-item">🔬 <span>RAW TRANSPARENCY:</span> 100% ACCURATE LAB REPORTS</div>
          <div className="ticker-item">{tankMode ? '⚡ ANABOLIC VOLTAGE OVERLOAD ⚡' : '🔥 FUEL YOUR BODY: FREE SHIPPING ON ORDERS ABOVE ₹1,999'}</div>
          <div className="ticker-item">🛡️ NO BANNED SUBSTANCES - STEROID FREE CERTIFIED</div>
          <div className="ticker-item">⚡ BE TANK MODE: UNLEASH EXPLOSIVE POWER</div>
        </div>
      </div>
    </div>
  );
};

const GymTrustBadges: React.FC = () => {
  return (
    <section className="gym-trust-badges-container scroll-reveal">
      <div className="gym-trust-badge">
        <div className="gym-trust-icon-wrap">
          <ShieldCheck size={24} />
        </div>
        <h4>100% Transparency</h4>
        <p>No proprietary blends, full ingredient transparency listed.</p>
      </div>

      <div className="gym-trust-badge">
        <div className="gym-trust-icon-wrap">
          <Award size={24} />
        </div>
        <h4>Lab Tested & Certified</h4>
        <p>Every single batch tested for purity, heavy metals, and protein content.</p>
      </div>

      <div className="gym-trust-badge">
        <div className="gym-trust-icon-wrap">
          <Zap size={24} />
        </div>
        <h4>Zero Banned Fillers</h4>
        <p>Formulated without maltodextrin, aspartame, or unlisted stimulants.</p>
      </div>

      <div className="gym-trust-badge">
        <div className="gym-trust-icon-wrap">
          <Flame size={24} />
        </div>
        <h4>Athletic Grade Quality</h4>
        <p>Dosed with premium raw materials imported from USA & Europe.</p>
      </div>
    </section>
  );
};

const InteractiveStackBuilder: React.FC = () => {
  const { products } = useStore();
  const { addToCart } = useCart();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activePreset, setActivePreset] = useState<string>('bulking');

  // Filter out any "Coming Soon" products
  const stackableProducts = products.filter(
    p => p.category.toLowerCase() !== 'coming soon' && p.category.toLowerCase() !== 'coming-soon'
  );

  // Map presets to product categories
  const selectPreset = (preset: string) => {
    setActivePreset(preset);
    let targetCategories: string[] = [];
    if (preset === 'bulking') {
      targetCategories = ['pre-workout', 'whey protein', 'creatine'];
    } else if (preset === 'recovery') {
      targetCategories = ['whey protein', 'bcaa'];
    } else if (preset === 'shredding') {
      targetCategories = ['wellness', 'bcaa']; // shred burner is wellness
    } else if (preset === 'god') {
      targetCategories = ['pre-workout', 'whey protein', 'creatine', 'bcaa'];
    }

    const matchedIds = stackableProducts
      .filter(p => targetCategories.some(cat => p.category.toLowerCase().includes(cat)))
      .map(p => p.id);
    setSelectedIds(matchedIds);
  };

  // Pre-select Bulking Stack by default
  useEffect(() => {
    if (stackableProducts.length > 0 && selectedIds.length === 0) {
      selectPreset('bulking');
    }
  }, [products]);

  const toggleProductSelection = (id: string) => {
    setActivePreset(''); // Clear preset selection if user customizes
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectedProducts = stackableProducts.filter(p => selectedIds.includes(p.id));

  // Calculate stack metrics
  let muscleGain = 0;
  let energyBoost = 0;
  let recoveryRate = 0;

  selectedProducts.forEach(p => {
    const cat = p.category.toLowerCase();
    if (cat.includes('whey') || cat.includes('protein')) {
      muscleGain += 45;
      recoveryRate += 30;
      energyBoost += 5;
    } else if (cat.includes('pre-workout')) {
      energyBoost += 50;
      muscleGain += 10;
      recoveryRate += 10;
    } else if (cat.includes('creatine')) {
      muscleGain += 30;
      energyBoost += 25;
      recoveryRate += 10;
    } else if (cat.includes('bcaa')) {
      recoveryRate += 45;
      muscleGain += 10;
      energyBoost += 15;
    } else if (cat.includes('wellness') || cat.includes('weight')) {
      energyBoost += 20;
      recoveryRate += 15;
      muscleGain += 5;
    }
  });

  // Cap at 100
  muscleGain = Math.min(muscleGain, 100);
  energyBoost = Math.min(energyBoost, 100);
  recoveryRate = Math.min(recoveryRate, 100);

  // Stack Pricing Math
  const rawSubtotal = selectedProducts.reduce((acc, p) => acc + (p.salePrice ?? p.price), 0);
  // Stack Bonus: 15% discount if 3 or more products are in the stack!
  const hasStackDiscount = selectedProducts.length >= 3;
  const stackDiscountAmount = hasStackDiscount ? rawSubtotal * 0.15 : 0;
  const finalStackPrice = rawSubtotal - stackDiscountAmount;

  const handleAddStackToCart = () => {
    if (selectedProducts.length === 0) return alert('Please select at least one product for your stack.');
    selectedProducts.forEach(product => {
      // Default to first flavor and size option
      const flavor = product.flavors.split(',')[0]?.trim() || 'Default';
      const size = product.sizes.split(',')[0]?.trim() || 'Default';
      addToCart(product, flavor, size, 1);
    });
    alert('GYMMM TANK Stack successfully compiled and added to your Cart! Stack savings applied!');
  };

  const liquidHeightPercent = Math.min((selectedIds.length / 4) * 80 + 10, 85);

  return (
    <section className="stack-builder-panel scroll-reveal">
      <div className="stack-builder-header">
        <div>
          <h2>🏋️ Interactive Gym Stack Builder</h2>
          <p>Toggle supplements or choose presets to construct your workout stack and unlock bundle discounts.</p>
        </div>
        {selectedProducts.length > 0 && (
          <button className="admin-btn admin-btn-primary" onClick={handleAddStackToCart} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={14} />
            Add Compiled Stack to Cart
          </button>
        )}
      </div>

      {/* Preset Stack Buttons */}
      <div className="stack-presets-row">
        <button className={`stack-preset-btn ${activePreset === 'bulking' ? 'active' : ''}`} onClick={() => selectPreset('bulking')}>
          💪 Bulking Stack
        </button>
        <button className={`stack-preset-btn ${activePreset === 'recovery' ? 'active' : ''}`} onClick={() => selectPreset('recovery')}>
          ⚡ Recovery Stack
        </button>
        <button className={`stack-preset-btn ${activePreset === 'shredding' ? 'active' : ''}`} onClick={() => selectPreset('shredding')}>
          🔥 Shredding Stack
        </button>
        <button className={`stack-preset-btn ${activePreset === 'god' ? 'active' : ''}`} onClick={() => selectPreset('god')}>
          👑 God Mode Stack
        </button>
      </div>

      <div className="stack-builder-grid">
        {/* Selector List */}
        <div className="stack-selector-column">
          {stackableProducts.slice(0, 5).map(p => {
            const isSelected = selectedIds.includes(p.id);
            const activePrice = p.salePrice ?? p.price;
            return (
              <div
                key={p.id}
                className={`stack-select-card ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleProductSelection(p.id)}
              >
                <div className="stack-select-card-info">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="stack-select-card-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/pre_workout.png';
                    }}
                  />
                  <div>
                    <div className="stack-select-card-name">{p.name}</div>
                    <div className="stack-select-card-price">₹{Math.round(activePrice).toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <div className="stack-select-checkbox">
                  {isSelected && <Check size={14} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Visualizer & Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '1.5rem' }} className="stack-details-grid">
          {/* Shaker Liquid Visualizer */}
          <div className="stack-visualizer-container">
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>SHAKER LEVEL</span>
            <div className="shaker-bottle-graphic">
              <div className="shaker-cap"></div>
              <div className="shaker-neck"></div>
              <div
                className="shaker-liquid"
                style={{ height: selectedIds.length > 0 ? `${liquidHeightPercent}px` : '0px' }}
              >
                {selectedIds.length > 0 && (
                  <>
                    <div className="shaker-item-particle" style={{ left: '10px', animationDelay: '0.2s' }}></div>
                    <div className="shaker-item-particle" style={{ left: '25px', animationDelay: '0.8s' }}></div>
                    <div className="shaker-item-particle" style={{ left: '40px', animationDelay: '1.4s' }}></div>
                  </>
                )}
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gold-primary)' }}>
              {selectedProducts.length} Product{selectedProducts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Performance Metrics */}
          <div className="stack-metrics-column" style={{ padding: '1.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--gold-secondary)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.3rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <TrendingUp size={14} />
                STACK ANABOLIC INDEX
              </div>

              {/* Muscle Progress */}
              <div className="stack-metric-progress">
                <div className="stack-metric-label">
                  <span>Muscle Hypertrophy</span>
                  <span>{muscleGain}%</span>
                </div>
                <div className="stack-progress-bar">
                  <div className="stack-progress-fill" style={{ width: `${muscleGain}%` }}></div>
                </div>
              </div>

              {/* Energy Progress */}
              <div className="stack-metric-progress">
                <div className="stack-metric-label">
                  <span>Explosive Workout Energy</span>
                  <span>{energyBoost}%</span>
                </div>
                <div className="stack-progress-bar">
                  <div className="stack-progress-fill" style={{ width: `${energyBoost}%` }}></div>
                </div>
              </div>

              {/* Recovery Progress */}
              <div className="stack-metric-progress">
                <div className="stack-metric-label">
                  <span>Anabolic Recovery Rate</span>
                  <span>{recoveryRate}%</span>
                </div>
                <div className="stack-progress-bar">
                  <div className="stack-progress-fill" style={{ width: `${recoveryRate}%` }}></div>
                </div>
              </div>
            </div>

            {/* Pricing Section with Stack Discount Info */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.8rem' }}>
              {hasStackDiscount ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>Stack Subtotal:</span>
                    <span>₹{Math.round(rawSubtotal).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--gold-primary)', fontWeight: 600 }}>
                    <span>15% Stack Discount:</span>
                    <span>-₹{Math.round(stackDiscountAmount).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ) : (
                selectedProducts.length >= 1 && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textAlign: 'right' }}>
                    💡 Add 3+ items to unlock a 15% stack discount!
                  </div>
                )
              )}

              <div className="stack-builder-total-price" style={{ borderTop: 'none', paddingTop: 0 }}>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Final Stack Price:</span>
                <span className="stack-total-num">₹{Math.round(finalStackPrice).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface ComboItem {
  id: string;
  name: string;
  badge: string;
  description: string;
  productNames: string[];
  discountPercent: number;
}

const COMBOS: ComboItem[] = [
  {
    id: 'pump-combo',
    name: 'PUMP COMBO',
    badge: '💥 PUMP & VASCULARITY',
    description: 'Stack Pure Citrulline Malate with Double Shot Pre-Workout for maximum blood flow, skin-splitting pumps, and laser focus.',
    productNames: ['PURE CITRULLINE MALATE', 'DOUBLE SHOT PRE-WORKOUT'],
    discountPercent: 15
  },
  {
    id: 'gaining-combo',
    name: 'GAINING COMBO',
    badge: '💪 BULK & POWER',
    description: 'Pair Massive Mass Gainer with Double Shot Pre-Workout to fuel explosive heavy sessions and pack on serious size.',
    productNames: ['MASSIVE MASS GAINER', 'DOUBLE SHOT PRE-WORKOUT'],
    discountPercent: 15
  },
  {
    id: 'massive-gainer-combo',
    name: 'MASSIVE GAINER COMBO',
    badge: '👑 THE BEAST STACK',
    description: 'Double Shot Pre-Workout + EAA & BCAA Recovery Fuel + Massive Mass Gainer. The ultimate recovery and mass building pack.',
    productNames: ['DOUBLE SHOT PRE-WORKOUT', 'EAA + BCAA RECOVERY FUEL', 'MASSIVE MASS GAINER'],
    discountPercent: 20
  },
  {
    id: 'lean-gain-combo',
    name: 'LEAN GAIN COMBO',
    badge: '⚡ SHREDDED STRENGTH',
    description: 'Combine ultra-pure 100% ISO Whey Tank with Double Shot Pre-Workout for clean muscle gains and rapid recovery.',
    productNames: ['100% ISO WHEY TANK', 'DOUBLE SHOT PRE-WORKOUT'],
    discountPercent: 15
  }
];

const ComboImageHover: React.FC<{ resolvedProducts: Product[] }> = ({ resolvedProducts }) => {
  const [activeIndex, setActiveIndex] = useState(0); // 0 = combo stack, 1..N = solo product images
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      setActiveIndex(0);
      return;
    }

    // Immediately switch to the first solo product on hover
    setActiveIndex(1);

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev >= resolvedProducts.length) {
          return 1;
        }
        return prev + 1;
      });
    }, 1200); // Revolve every 1.2 seconds

    return () => clearInterval(interval);
  }, [isHovered, resolvedProducts.length]);

  return (
    <div 
      className="combo-image-hover-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Combo Stack View (visible when activeIndex === 0) */}
      <div className={`combo-stack-layout ${activeIndex === 0 ? 'active' : ''}`}>
        {resolvedProducts.map((p, idx) => {
          let positionStyle: React.CSSProperties = {};
          const total = resolvedProducts.length;
          
          if (total === 2) {
            if (idx === 0) {
              positionStyle = {
                transform: 'translateX(-35px) rotate(-6deg) scale(1)',
                zIndex: 1
              };
            } else {
              positionStyle = {
                transform: 'translateX(35px) rotate(6deg) scale(1)',
                zIndex: 2
              };
            }
          } else if (total === 3) {
            if (idx === 0) {
              positionStyle = {
                transform: 'translateX(-55px) translateY(10px) rotate(-10deg) scale(0.85)',
                zIndex: 1
              };
            } else if (idx === 1) {
              positionStyle = {
                transform: 'scale(1.05)',
                zIndex: 3
              };
            } else {
              positionStyle = {
                transform: 'translateX(55px) translateY(10px) rotate(10deg) scale(0.85)',
                zIndex: 2
              };
            }
          }
          
          return (
            <img
              key={`stack-${p.id}`}
              src={p.image}
              alt={p.name}
              style={positionStyle}
              className="combo-stack-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/pre_workout.png';
              }}
            />
          );
        })}
      </div>

      {/* Solo Product Images */}
      {resolvedProducts.map((p, idx) => {
        const itemIndex = idx + 1;
        return (
          <img
            key={`solo-${p.id}`}
            src={p.image}
            alt={p.name}
            className={`combo-display-img ${activeIndex === itemIndex ? 'active' : ''}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/pre_workout.png';
            }}
          />
        );
      })}

      {/* Floating Revolve Indicator */}
      {isHovered && resolvedProducts.length > 1 && (
        <div className="revolve-indicator">
          <span>REVOLVING PRODUCTS</span>
          <div className="revolve-dots">
            {resolvedProducts.map((_, idx) => (
              <span 
                key={idx} 
                className={`revolve-dot ${activeIndex === idx + 1 ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const FlashSaleBanner: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 14, seconds: 55 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              // Reset countdown loop
              hours = 2;
              minutes = 14;
              seconds = 55;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flash-sale-countdown-banner scroll-reveal">
      <div className="flash-sale-tag">🔥 FLASH SALE ACTIVATED</div>
      <div className="flash-sale-text-sweep">GET EXTRA 10% OFF COINS + FREE SHAKER ON ORDERS ABOVE ₹3,000!</div>
      <div className="flash-sale-timer-wrap">
        <span className="ends-in">ENDS IN:</span>
        <div className="timer-digits">
          <span className="digit-box">{timeLeft.hours.toString().padStart(2, '0')}h</span>
          <span className="timer-colon">:</span>
          <span className="digit-box">{timeLeft.minutes.toString().padStart(2, '0')}m</span>
          <span className="timer-colon">:</span>
          <span className="digit-box">{timeLeft.seconds.toString().padStart(2, '0')}s</span>
        </div>
      </div>
    </div>
  );
};

interface ProductCombosProps {
  onViewComboDetail: (id: string) => void;
}

const ProductCombos: React.FC<ProductCombosProps> = ({ onViewComboDetail }) => {
  const { products } = useStore();
  const { addToCart } = useCart();

  const handleAddCombo = (comboName: string, resolvedProducts: Product[]) => {
    if (resolvedProducts.length === 0) return;
    resolvedProducts.forEach(product => {
      // Default to first flavor and size option
      const flavor = product.flavors.split(',')[0]?.trim() || 'Default';
      const size = product.sizes.split(',')[0]?.trim() || 'Default';
      addToCart(product, flavor, size, 1);
    });
    alert(`🔥 ${comboName} successfully added to your cart with bundle savings!`);
  };

  return (
    <section className="combos-section">
      <div className="section-header-combos scroll-reveal">
        <h2 className="section-title-combos">
          <svg className="combos-bicep-icon" viewBox="0 0 24 24" width="40" height="40" stroke="url(#fire-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <defs>
              <linearGradient id="fire-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#d4af37" />
                <stop offset="70%" stopColor="#f9eeb9" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>
            <path d="M12.409 13.017A5 5 0 0 1 22 15c0 3.866-4 7-9 7-4.077 0-8.153-.82-10.371-2.462-.426-.316-.631-.832-.62-1.362C2.118 12.723 2.627 2 10 2a3 3 0 0 1 3 3 2 2 0 0 1-2 2c-1.105 0-1.64-.444-2-1" />
            <path d="M15 14a5 5 0 0 0-7.584 2" />
          </svg>
          EXCLUSIVE SUPPLE COMBOS
        </h2>
        <p className="section-subtitle-combos">Get massive bundle discounts on our elite performance stacks. Pre-packaged for maximum gains.</p>
      </div>

      <FlashSaleBanner />

      <div className="combos-grid">
        {COMBOS.map((combo) => {
          // Resolve actual products from the context
          const resolvedProducts = combo.productNames
            .map(pName => products.find(p => p.name.toUpperCase() === pName.toUpperCase()))
            .filter((p): p is Product => !!p);

          // If some product in the combo is not found, skip rendering
          if (resolvedProducts.length < combo.productNames.length) return null;

          // Calculate Pricing
          const regularTotal = resolvedProducts.reduce((sum, p) => sum + p.price, 0);
          const activeTotal = resolvedProducts.reduce((sum, p) => sum + (p.salePrice ?? p.price), 0);
          const comboPrice = Math.round(activeTotal * (1 - combo.discountPercent / 100));
          const totalSavings = regularTotal - comboPrice;

          return (
            <div key={combo.id} className="combo-card scroll-reveal">
              <div 
                style={{ cursor: 'pointer' }}
                onClick={() => onViewComboDetail(combo.id)}
              >
                <ComboImageHover
                  resolvedProducts={resolvedProducts}
                />
              </div>

              <div className="combo-card-badge-wrap" style={{ marginTop: '0.2rem' }}>
                <span className="combo-card-badge-inline">{combo.badge}</span>
              </div>
              
              <div className="combo-card-header">
                <h3 
                  className="combo-title"
                  onClick={() => onViewComboDetail(combo.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {combo.name}
                </h3>
                <p className="combo-desc" title={combo.description}>{combo.description}</p>
              </div>

              <div className="combo-products-included">
                <span className="included-label">PRODUCTS INCLUDED:</span>
                <div className="included-products-list">
                  {resolvedProducts.map((p) => (
                    <div key={p.id} className="included-product-item">
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        className="included-product-img" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/pre_workout.png';
                        }}
                      />
                      <div className="included-product-info">
                        <span className="included-product-name">{p.name}</span>
                        <span className="included-product-meta">
                          {p.flavors.split(',')[0]} | {p.sizes.split(',')[0]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="combo-pricing-footer">
                <div className="combo-price-details">
                  <div className="combo-price-row">
                    <span className="combo-original-price">₹{Math.round(regularTotal).toLocaleString('en-IN')}</span>
                    <span className="combo-discount-tag">{combo.discountPercent}% OFF BUNDLE</span>
                  </div>
                  <div className="combo-final-price">₹{Math.round(comboPrice).toLocaleString('en-IN')}</div>
                  <span className="combo-savings-text">SAVE ₹{Math.round(totalSavings).toLocaleString('en-IN')}</span>
                </div>

                <button 
                  className="add-combo-btn" 
                  onClick={() => handleAddCombo(combo.name, resolvedProducts)}
                >
                  <Layers size={16} />
                  ADD COMBO TO CART
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const StoreFAQs: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Open first FAQ by default

  const faqs = [
    {
      question: "Are All GYMMM TANK Supplements Genuine And Tested?",
      answer: "Yes! Every product we sell is 100% authentic and sourced directly from verified manufacturers. Each batch undergoes strict quality checks and lab testing to ensure purity, safety, and effectiveness."
    },
    {
      question: "How Do I Know Which Supplement Is Right For My Goal?",
      answer: "You can use our interactive Stack Builder to compile a personalized supplement bundle matching your targets, or check out our pre-packaged Combos for common fitness goals."
    },
    {
      question: "Can I Combine Multiple GYMMM TANK Products?",
      answer: "Yes! Combining products is highly common for building comprehensive stacks (e.g. Pre-workout + Creatine + Isolate Whey). We recommend checking our pre-packaged combos or utilizing the Stack Builder to design a synergistic routine."
    },
    {
      question: "When Will I Receive My Order?",
      answer: "Orders are processed within 24 hours. Transit times typically range between 3-5 business days depending on your location. You will receive an email tracking link as soon as your shipment is dispatched."
    },
    {
      question: "What Should I Do If I Receive A Damaged Or Incorrect Product?",
      answer: "Please contact our support team immediately at support@gymmmtank.com or call 9350931316 with your order number and photo evidence. We will arrange a replacement or refund within 24-48 hours."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="store-faqs-section scroll-reveal">
      <h2 className="faqs-title">FAQs</h2>
      <div className="faqs-list">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className={`faq-item ${isOpen ? 'open' : ''}`}>
              <button className="faq-question-btn" onClick={() => toggleFaq(idx)}>
                <span>{faq.question}</span>
                <span className="faq-toggle-icon">{isOpen ? '—' : '+'}</span>
              </button>
              <div className="faq-answer-wrapper">
                <div className="faq-answer-content">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const TestimonialsCarousel: React.FC = () => {
  const testimonials = [
    {
      name: "Rohan Sharma",
      role: "Competitive Powerlifter",
      quote: "GYMMM TANK Citrulline and Pre-workout are absolute game changers. The pumps are skin-splitting and my focus is dialed in. No crash at all!",
      rating: 5,
      goal: "Muscle Building",
      image: "/images/pre_workout.png"
    },
    {
      name: "Priya Patel",
      role: "Crossfit Athlete",
      quote: "The EAA + BCAA recovery fuel tastes incredible and keeps me hydrated during intense circuits. My recovery rate has cut in half!",
      rating: 5,
      goal: "Recovery",
      image: "/images/eaa_bcaa.png"
    },
    {
      name: "Vikram Malhotra",
      role: "Fitness Coach",
      quote: "I recommend 100% ISO Whey Tank to all my clients. Absolute raw transparency, zero fillers, and compiles cleanly with every mix. Highly recommended!",
      rating: 5,
      goal: "Muscle Building",
      image: "/images/whey_protein.png"
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [testimonials.length]);

  return (
    <section className="testimonials-section scroll-reveal">
      <h2 className="section-title-combos" style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '0.8rem' }}>
        ATHLETE TRANSFORMATION REVIEWS
      </h2>
      <p className="section-subtitle-combos" style={{ textAlign: 'center', marginBottom: '2.2rem' }}>
        See how elite builders and athletes fuel their training goals with GYMMM TANK.
      </p>

      <div className="testimonials-slider-container">
        {testimonials.map((t, idx) => (
          <div key={idx} className={`testimonial-slide-card ${activeIndex === idx ? 'active' : ''}`}>
            <div className="testimonial-decor-glow"></div>
            <div className="testimonial-avatar-wrap">
              <img src={t.image} alt={t.name} className="testimonial-avatar" />
              <div className="rating-stars">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="star">★</span>
                ))}
              </div>
            </div>
            
            <div className="testimonial-text-info">
              <span className="quote-mark">“</span>
              <p className="testimonial-quote">{t.quote}</p>
              <h4 className="testimonial-name">{t.name}</h4>
              <span className="testimonial-role">{t.role} | Goal: <strong className="text-gold">{t.goal}</strong></span>
            </div>
          </div>
        ))}
      </div>

      <div className="slider-dots-row">
        {testimonials.map((_, idx) => (
          <button 
            key={idx} 
            className={`slider-dot-btn ${activeIndex === idx ? 'active' : ''}`}
            onClick={() => setActiveIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

interface StorefrontViewProps {
  onViewProductDetail: (id: string) => void;
  onViewComboDetail: (id: string) => void;
}

const StorefrontView: React.FC<StorefrontViewProps> = ({ onViewProductDetail, onViewComboDetail }) => {
  const { products, loading, error, tankMode, setTankMode } = useStore();
  const [activeStat, setActiveStat] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    video.muted = newMuted;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Track intersection to pause/play video when in/out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause();
        } else {
          video.muted = isMuted;
          video.play().catch(() => {});
        }
      },
      { threshold: 0.1 }
    );

    const container = document.querySelector('.hero-video-container');
    if (container) observer.observe(container);

    return () => {
      if (container) observer.unobserve(container);
    };
  }, [isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Play muted by default on mount
    video.muted = true;
    video.play().catch((err) => {
      console.log("Muted autoplay failed or blocked: ", err);
    });

    return () => {
      if (video) {
        video.pause();
        video.muted = true;
      }
    };
  }, []);

  const getStatDetails = () => {
    switch (activeStat) {
      case 'athletes':
        return {
          title: 'Trusted By Athletes',
          icon: '🛡️',
          text: 'Powering elite bodybuilders, powerlifters, and athletes nationwide. Formulated with clinical doses to withstand intense training loads and meet competitive athletic standards.'
        };
      case 'trust':
        return {
          title: '10 Years of Trust',
          icon: '⏳',
          text: 'Over a decade of engineering premium sports nutrition. We formulate with pure, clinically researched ingredients to guarantee consistent results batch after batch.'
        };
      case 'fillers':
        return {
          title: 'Zero Banned Fillers',
          icon: '🔬',
          text: 'No aspartame, no maltodextrin, and no unlisted stimulants. What is printed on the label is exactly what is inside the tub. Pure power, zero garbage.'
        };
      case 'certified':
        return {
          title: 'Lab Certified Purity',
          icon: '🏆',
          text: 'Every single batch is third-party lab tested and certified for protein concentration and zero heavy metal contamination. 100% raw transparency.'
        };
      default:
        return null;
    }
  };

  const statDetails = getStatDetails();

  return (
    <>
      {/* Hero Text Block (Above Video) */}
      <div className="hero-text-block scroll-reveal">
        <div className="hero-tag-box">
          <span className="dot">•</span> ENGINEERED FOR MIND, MUSCLE, & PERFORMANCE <span className="dot">•</span>
        </div>
        <div className="hero-separator"></div>
        <h1 
          className={`hero-title-interactive ${tankMode ? 'tank-mode-active' : ''}`}
          onClick={() => {
            const nextMode = !tankMode;
            setTankMode(nextMode);
            if (navigator.vibrate) navigator.vibrate(100);
            if (nextMode) {
              setTimeout(() => {
                const el = document.querySelector('.stack-builder-panel');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 400);
            }
          }}
        >
          <span className="title-white">GYMMM TANK</span> <span className="title-gold">FORCES</span>
          <div className="tank-mode-badge-wrap">
            <span className="tank-mode-badge">{tankMode ? '🔥 TANK MODE ACTIVE 🔥' : '⚡ CLICK TO TRIGGER TANK MODE ⚡'}</span>
          </div>
        </h1>
        <p className="hero-subtitle">
          Premium high-grade supplements formulated to amplify <span className="text-gold-highlight">strength</span>, <span className="text-gold-highlight">maximum energy</span>, and <span className="text-gold-highlight">athletic recovery</span>.
        </p>

        {/* Action Buttons Row */}
        <div className="hero-actions-row">
          <button className="hero-btn-primary" onClick={() => {
            const el = document.querySelector('.products-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}>
            SHOP NOW <span className="arrow">↗</span>
          </button>
          <button className="hero-btn-secondary" onClick={() => {
            const el = document.querySelector('.stack-builder-panel');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}>
            OUR FORMULA
          </button>
        </div>

        {/* Stats Row with centered down arrow */}
        <div className="hero-stats-container">
          <div
            className={`hero-stat-col ${activeStat === 'athletes' ? 'active' : ''}`}
            onClick={() => setActiveStat(activeStat === 'athletes' ? null : 'athletes')}
          >
            <span className="stat-num">TRUSTED</span>
            <span className="stat-label">BY ATHLETES</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div
            className={`hero-stat-col ${activeStat === 'trust' ? 'active' : ''}`}
            onClick={() => setActiveStat(activeStat === 'trust' ? null : 'trust')}
          >
            <span className="stat-num">10 YEAR</span>
            <span className="stat-label">OF TRUST</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div
            className={`hero-stat-col ${activeStat === 'fillers' ? 'active' : ''}`}
            onClick={() => setActiveStat(activeStat === 'fillers' ? null : 'fillers')}
          >
            <span className="stat-num">ZERO</span>
            <span className="stat-label">FILLERS</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div
            className={`hero-stat-col ${activeStat === 'certified' ? 'active' : ''}`}
            onClick={() => setActiveStat(activeStat === 'certified' ? null : 'certified')}
          >
            <span className="stat-num">LAB</span>
            <span className="stat-label">CERTIFIED</span>
          </div>

          <div className="hero-scroll-indicator" onClick={() => {
            const el = document.querySelector('.products-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
          </div>
        </div>

        {/* Interactive Stats Details Panel */}
        {statDetails && (
          <div className="hero-stat-details-panel">
            <button className="panel-close-btn" onClick={() => setActiveStat(null)}>×</button>
            <div className="panel-content">
              <span className="panel-icon">{statDetails.icon}</span>
              <div>
                <h4>{statDetails.title}</h4>
                <p>{statDetails.text}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hero Video Slot (plays video cleanly below text) */}
      <section className="hero-video-container scroll-reveal">
        <video
          ref={videoRef}
          className="hero-video-element"
          src="/videos/hero-bg.mp4"
          autoPlay
          loop
          muted={isMuted}
          playsInline
        />
        <button 
          className="video-audio-toggle" 
          onClick={toggleMute}
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          <span>{isMuted ? "UNMUTE" : "MUTE"}</span>
        </button>
      </section>

      {/* Custom Barbell Decorator for Combos */}
      <div className="gym-title-barbell scroll-reveal">
        <div className="gym-barbell-line"></div>
        <Dumbbell className="gym-barbell-icon" size={46} />
        <div className="gym-barbell-line"></div>
      </div>

      {/* Product Combos Section */}
      <ProductCombos onViewComboDetail={onViewComboDetail} />

      {/* Trust Badges */}
      <GymTrustBadges />



      {/* Custom Barbell Decorator */}
      <div className="gym-title-barbell scroll-reveal products-section">
        <div className="gym-barbell-line"></div>
        <Dumbbell className="gym-barbell-icon" size={46} />
        <div className="gym-barbell-line"></div>
      </div>



      {/* Main Product Grid */}
      <section style={{ position: 'relative' }}>
        {loading ? (
          <div className="no-products" style={{ borderStyle: 'solid' }}>
            <RotateCcw className="no-products-icon" style={{ animation: 'spin 2s linear infinite' }} />
            <h3>Loading Supplements...</h3>
            <p>Accessing the GYMMM TANK vault...</p>
          </div>
        ) : error ? (
          <div className="no-products" style={{ borderColor: 'var(--accent-red)' }}>
            <h3>Error Loading Products</h3>
            <p>{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="no-products">
            <Dumbbell className="no-products-icon" size={48} />
            <h3>No Supplements Found</h3>
            <p>Try clearing your filters or search keywords to view the inventory.</p>
          </div>
        ) : (
          <div className="products-grid scroll-reveal">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onViewDetail={onViewProductDetail}
              />
            ))}
          </div>
        )}
      </section>

      {/* Stack Builder Panel */}
      {!loading && products.length > 0 && <InteractiveStackBuilder />}

      {/* Frequently Asked Questions */}
      <StoreFAQs />

      {/* Testimonials Review Slider */}
      <TestimonialsCarousel />
    </>
  );
};

const getSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-+$)/g, '');

const LayoutWrapper: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { products, tankMode, search } = useStore();

  // Sync state with browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // If search query is typed, reset view to home to show list
  useEffect(() => {
    if (search && window.location.pathname !== '/') {
      navigate('/');
    }
  }, [search]);

  // Determine active product / combo and current view based on URL route
  let detailProductId: string | null = null;
  let detailComboId: string | null = null;
  let currentView: 'store' | 'admin' = 'store';

  if (currentPath.startsWith('/products/')) {
    const slug = currentPath.substring('/products/'.length);
    const matchingProduct = products.find(p => getSlug(p.name) === slug || p.id === slug);
    if (matchingProduct) {
      detailProductId = matchingProduct.id;
    }
  } else if (currentPath.startsWith('/combos/')) {
    detailComboId = currentPath.substring('/combos/'.length);
  } else if (currentPath === '/admin') {
    currentView = 'admin';
  }

  const setView = (view: 'store' | 'admin') => {
    if (view === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  // Scroll Reveal hook using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [products, currentView, detailProductId, detailComboId]);

  return (
    <div className={`app-container ${tankMode ? 'global-tank-mode' : ''}`}>
      {/* Announcement Scrolling Ticker */}
      <TickerBanner />

      {/* Navigation Header */}
      <StoreHeader 
        currentView={currentView} 
        setView={setView} 
        onOpenAuthModal={() => setIsAuthModalOpen(true)} 
      />

      {/* Page Content */}
      {currentView === 'store' ? (
        <main className="storefront-main">
          {detailProductId || detailComboId ? (
            <ProductDetailView 
              productId={detailProductId}
              comboId={detailComboId}
              onBack={() => {
                navigate('/');
              }}
              onNavigateToProduct={(id) => {
                const p = products.find(prod => prod.id === id);
                if (p) {
                  navigate(`/products/${getSlug(p.name)}`);
                } else {
                  navigate(`/products/${id}`);
                }
              }}
            />
          ) : (
            <StorefrontView 
              onViewProductDetail={(id) => {
                const p = products.find(prod => prod.id === id);
                if (p) {
                  navigate(`/products/${getSlug(p.name)}`);
                } else {
                  navigate(`/products/${id}`);
                }
              }}
              onViewComboDetail={(id) => {
                navigate(`/combos/${id}`);
              }}
            />
          )}
        </main>
      ) : (
        <AdminPanel />
      )}

      {/* Sliding Cart Drawer Overlay */}
      <CartDrawer />

      {/* Customer Account Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        currentView={currentView} 
        setView={setView} 
      />

      {/* Global Brand Footer */}
      <footer className="store-footer-v2">
        {/* Top Info Bar */}
        <div className="footer-top-bar">
          <div className="footer-app-download">
            <span className="app-download-title">DOWNLOAD APP & USE CODE: <span className="highlight-code">UNLOCK200</span></span>
            <div className="app-badges-row">
              <a href="#" className="app-store-badge-btn" onClick={(e) => e.preventDefault()}>
                <svg className="badge-svg-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M5 3.012c-.224 0-.425.074-.582.203L13.256 12l-8.838 8.785c.157.129.358.203.582.203.188 0 .363-.051.516-.139l12.756-7.37c.563-.325.563-.854 0-1.179L6.516 3.15c-.153-.088-.328-.139-.516-.139z" />
                </svg>
                <div className="badge-text-wrap">
                  <span className="badge-sub">GET IT ON</span>
                  <span className="badge-main">Google Play</span>
                </div>
              </a>
              <a href="#" className="app-store-badge-btn" onClick={(e) => e.preventDefault()}>
                <svg className="badge-svg-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.84-.98 2.94 1.07.08 2.15-.52 2.81-1.33z" />
                </svg>
                <div className="badge-text-wrap">
                  <span className="badge-sub">DOWNLOAD ON THE</span>
                  <span className="badge-main">App Store</span>
                </div>
              </a>
            </div>
          </div>
          <div className="footer-vertical-divider"></div>
          <div className="footer-help-contact">
            <span className="help-contact-title">NEED HELP? CONTACT US.</span>
            <div className="help-links-row">
              <a href="mailto:support@gymmmtank.com" className="contact-link">support@gymmmtank.com</a>
              <span className="contact-divider">|</span>
              <a href="tel:9350931316" className="contact-link">9350931316</a>
            </div>
          </div>
        </div>

        {/* Ticker Bar (Backed by Science, 100% Transparency, No Secrets) */}
        <div className="footer-ticker-bar">
          <div className="footer-ticker-wrap">
            <div className="footer-ticker-list">
              <span className="ticker-txt">BACKED BY SCIENCE</span>
              <span className="ticker-txt">100% TRANSPARENCY</span>
              <span className="ticker-txt">NO SECRETS</span>
              <span className="ticker-txt">BACKED BY SCIENCE</span>
              <span className="ticker-txt">100% TRANSPARENCY</span>
              <span className="ticker-txt">NO SECRETS</span>
              <span className="ticker-txt">BACKED BY SCIENCE</span>
              <span className="ticker-txt">100% TRANSPARENCY</span>
              <span className="ticker-txt">NO SECRETS</span>
              <span className="ticker-txt">BACKED BY SCIENCE</span>
              <span className="ticker-txt">100% TRANSPARENCY</span>
              <span className="ticker-txt">NO SECRETS</span>
            </div>
          </div>
        </div>

        {/* Main Footer Block */}
        <div className="footer-main-content">
          {/* Left Block (Brand & Info) */}
          <div className="footer-brand-column">
            <div className="footer-logo-brand">
              <img src="/images/logo.png" alt="GYMMM TANK Logo" className="footer-v2-logo" onError={(e) => { (e.target as HTMLImageElement).src = '/images/logo.jpg' }} />
              <span className="footer-v2-brand-text">
                <span className="brand-white">GYMMM</span>
                <span className="brand-gold">TANK</span>
              </span>
            </div>
            <p className="footer-brand-description">
              We've put the raw, unfiltered power into engineering premium high-grade sports nutrition. 
              With absolute ingredient transparency and zero proprietary blends, our formulations are 
              proven to provide the clinical fuel you need to unleash your ultimate tank potential.
            </p>
          </div>

          {/* Right Block (Newsletter & Socials) */}
          <div className="footer-newsletter-column">
            <h4 className="newsletter-title">SIGN UP TO OUR NEWSLETTER AND GET 10% OFF YOUR FIRST ORDER</h4>
            <form className="footer-newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Subscribed to GYMMM TANK Newsletter!'); }}>
              <input type="email" placeholder="Email address" className="newsletter-input" required />
              <button type="submit" className="newsletter-submit-btn">
                SIGN UP <span className="arrow-icon">→</span>
              </button>
            </form>
            <div className="footer-social-icons">
              <a href="#" className="social-icon-link" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="social-icon-link" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="social-icon-link" aria-label="YouTube">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Links */}
        <div className="footer-bottom-links">
          <a href="#" className="bottom-link" onClick={(e) => e.preventDefault()}>Track Your Order</a>
          <a href="#" className="bottom-link" onClick={(e) => e.preventDefault()}>Return/Exchange</a>
          <a href="#" className="bottom-link" onClick={(e) => e.preventDefault()}>Verify Your Product</a>
          <a href="#" className="bottom-link" onClick={(e) => e.preventDefault()}>Become A Dealer</a>
          <a href="#" className="bottom-link" onClick={(e) => e.preventDefault()}>Terms Of Service</a>
          <a href="#" className="bottom-link" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
          <a href="#" className="bottom-link" onClick={(e) => e.preventDefault()}>Disclaimer</a>
          <a href="#" className="bottom-link" onClick={(e) => e.preventDefault()}>Contact Us</a>
          <a href="#" className="bottom-link" onClick={(e) => e.preventDefault()}>About Us</a>
        </div>

        {/* Copyright */}
        <div className="footer-v2-copyright">
          © {new Date().getFullYear()} GYMMM TANK Supplements Ltd. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <StoreProvider>
      <CartProvider>
        <LayoutWrapper />
      </CartProvider>
    </StoreProvider>
  );
}

export default App;
